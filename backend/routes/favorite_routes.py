from datetime import datetime, timezone

from flask import Blueprint, g, jsonify, request
from pymongo.errors import DuplicateKeyError

from database import db, to_object_id
from models import favorite_to_dict
from services.auth_service import login_required

favorite_routes = Blueprint("favorite_routes", __name__)


def is_whole_number(value):
    # bool is a kind of int in Python, so rule it out on purpose.
    return isinstance(value, int) and not isinstance(value, bool)


# GET /api/favorites  ->  the logged-in user's favorites, newest first
@favorite_routes.route("/api/favorites", methods=["GET"])
@login_required
def get_favorites():
    # {"user_id": g.user["_id"]} is the important part: only THIS user's rows.
    favorites = list(db.favorites.find({"user_id": g.user["_id"]}).sort("created_at", -1))

    # Load all the foods and restaurants they point to in two queries.
    # "$in" means "whose _id is in this list".
    food_ids = [f["food_id"] for f in favorites if f.get("food_id") is not None]
    restaurant_ids = [f["restaurant_id"] for f in favorites if f.get("restaurant_id") is not None]
    foods = {food["_id"]: food for food in db.foods.find({"_id": {"$in": food_ids}}, {"recipe": 0})}
    restaurants = {r["_id"]: r for r in db.restaurants.find({"_id": {"$in": restaurant_ids}})}

    results = []
    for favorite in favorites:
        food = foods.get(favorite.get("food_id"))
        restaurant = restaurants.get(favorite.get("restaurant_id"))
        if food or restaurant:  # skip favorites whose food/restaurant was removed
            results.append(favorite_to_dict(favorite, food, restaurant))
    return jsonify({"favorites": results})


# POST /api/favorites
# Body: {"food_id": 4}  or  {"restaurant_id": 2}
@favorite_routes.route("/api/favorites", methods=["POST"])
@login_required
def add_favorite():
    data = request.get_json(silent=True) or {}
    food_id = data.get("food_id")
    restaurant_id = data.get("restaurant_id")

    # Exactly one of the two must be given, as a whole number.
    if (food_id is None) == (restaurant_id is None):
        return jsonify({"error": "Send either food_id or restaurant_id."}), 400
    if not is_whole_number(food_id if food_id is not None else restaurant_id):
        return jsonify({"error": "The id must be a whole number."}), 400

    # Make sure the thing being saved really exists.
    if food_id is not None and not db.foods.find_one({"_id": food_id}, {"_id": 1}):
        return jsonify({"error": "Food not found"}), 404
    if restaurant_id is not None and not db.restaurants.find_one({"_id": restaurant_id}, {"_id": 1}):
        return jsonify({"error": "Restaurant not found"}), 404

    favorite = {
        "user_id": g.user["_id"],
        "food_id": food_id,
        "restaurant_id": restaurant_id,
        "created_at": datetime.now(timezone.utc),
    }
    try:
        result = db.favorites.insert_one(favorite)
    except DuplicateKeyError:
        # The unique index says this user already saved it.
        return jsonify({"error": "Already in Favorites."}), 409

    favorite["_id"] = result.inserted_id
    return jsonify({"message": "Saved to Favorites!", "favorite": favorite_to_dict(favorite)}), 201


# DELETE /api/favorites/<id>
@favorite_routes.route("/api/favorites/<favorite_id>", methods=["DELETE"])
@login_required
def remove_favorite(favorite_id):
    object_id = to_object_id(favorite_id)
    # Match BOTH the favorite id AND this user's id, so nobody can delete
    # someone else's favorite even if they guess its id.
    result = db.favorites.delete_one({"_id": object_id, "user_id": g.user["_id"]}) if object_id else None
    if result is None or result.deleted_count == 0:
        return jsonify({"error": "Favorite not found"}), 404
    return jsonify({"message": "Removed from Favorites."})
