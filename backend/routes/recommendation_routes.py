from flask import Blueprint, jsonify, request

from database import db
from services.recommendation_service import find_request_error, get_recommendations

recommendation_routes = Blueprint("recommendation_routes", __name__)


# POST /api/recommendations
# Body example:
#   {"mood": "tired", "preferences": ["comfort"], "choice": "cook",
#    "time": 30, "budget": "$", "dietary": ["halal"]}
# Or, for "Surprise Me":  {"surprise": true}
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

    # Finding nothing is a valid answer to a valid question, so it is
    # still 200 OK — the message tells React what happened.
    if not recommendations:
        return jsonify({
            "recommendations": [],
            "message": "No foods match your dietary preferences and cook / restaurant choice.",
        })

    return jsonify({"recommendations": recommendations})
