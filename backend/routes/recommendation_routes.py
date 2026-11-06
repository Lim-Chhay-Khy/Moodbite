from flask import Blueprint, jsonify, request

from database import db
from services.auth_service import get_current_user
from services.history_service import save_history
from services.recommendation_service import clean_answers, find_request_error, get_recommendations

recommendation_routes = Blueprint("recommendation_routes", __name__)


# POST /api/recommendations
# Body example:
#   {"mood": "tired", "preferences": ["comfort"], "choice": "cook",
#    "time": 30, "budget": "$", "dietary": ["halal"]}
# Or, for "Surprise Me":  {"surprise": true}
#
# Anyone can use this route. If a valid login token is sent too, the
# session is also saved to that user's History (Stage 4).
@recommendation_routes.route("/api/recommendations", methods=["POST"])
def recommend():
    # silent=True returns None instead of crashing if the body isn't JSON.
    data = request.get_json(silent=True)

    error = find_request_error(data)
    if error:
        return jsonify({"error": error}), 400

    # All foods (without the big recipe field), in _id order.
    foods = list(db.foods.find({}, {"recipe": 0}).sort("_id", 1))
    recommendations = get_recommendations(foods, data)

    # Logged in, and answered the questions (not "Surprise Me")? Save it.
    user = get_current_user()
    saved_to_history = False
    if user and not data.get("surprise") and recommendations:
        save_history(user, clean_answers(data), recommendations)
        saved_to_history = True

    # Finding nothing is a valid answer to a valid question, so it is
    # still 200 OK — the message tells React what happened.
    if not recommendations:
        return jsonify({
            "recommendations": [],
            "message": "No foods match your dietary preferences and cook / restaurant choice.",
        })

    return jsonify({"recommendations": recommendations, "savedToHistory": saved_to_history})
