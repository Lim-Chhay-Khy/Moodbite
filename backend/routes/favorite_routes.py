import re
from datetime import datetime, timezone

from flask import Blueprint, g, jsonify, request
from pymongo.errors import DuplicateKeyError

from database import db, to_object_id
from models import favorite_to_dict, food_to_dict, restaurant_to_dict
from services.auth_service import login_required
from services.places_service import PlacesError, get_place, is_configured

favorite_routes = Blueprint("favorite_routes", __name__)

# Google place ids look like "ChIJN1t_tDeuEmsRUsoyG83frY4".
PLACE_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{10,300}$")


def is_whole_number(value):
    # bool is a kind of int in Python, so rule it out on purpose.
    return isinstance(value, int) and not isinstance(value, bool)


def unavailable_place(place_id):
    """Shown when we can't get a saved place's details from Google."""
    return {
        "id": place_id, "placeId": place_id, "source": "google", "unavailable": True,
        "name": "Saved restaurant", "emoji": "🍽", "cuisine": "Restaurant",
        "address": "Details are unavailable right now.", "location": None,
        "googleMapsUrl": f"https://www.google.com/maps/place/?q=place_id:{place_id}",
    }


def load_place(place_id):
    if not is_configured():
        return unavailable_place(place_id)
    try:
        return get_place(place_id)
    except PlacesError:
        return unavailable_place(place_id)


# GET /api/favorites  ->  the logged-in user's favorites, newest first
@favorite_routes.route("/api/favorites", methods=["GET"])
@login_required
def get_favorites():
    # {"user_id": g.user["_id"]} is the important part: only THIS user's rows.
    favorites = list(db.favorites.find({"user_id": g.user["_id"]}).sort("created_at", -1))

    # Load the foods and sample restaurants they point to in two queries.
    # "$in" means "whose _id is in this list".
    food_ids = [f["food_id"] for f in favorites if f.get("food_id") is not None]
    restaurant_ids = [f["restaurant_id"] for f in favorites if f.get("restaurant_id") is not None]
    foods = {food["_id"]: food for food in db.foods.find({"_id": {"$in": food_ids}}, {"recipe": 0})}
    restaurants = {r["_id"]: r for r in db.restaurants.find({"_id": {"$in": restaurant_ids}})}

    results = []
    for favorite in favorites:
        if favorite.get("place_id"):  # a real Google restaurant
            results.append(favorite_to_dict(favorite, restaurant=load_place(favorite["place_id"])))
        elif favorite.get("food_id") in foods:
            results.append(favorite_to_dict(favorite, food=food_to_dict(foods[favorite["food_id"]])))
        elif favorite.get("restaurant_id") in restaurants:
            restaurant = restaurant_to_dict(restaurants[favorite["restaurant_id"]])
            results.append(favorite_to_dict(favorite, restaurant=restaurant))
        # anything else points to data that was removed, so skip it
    return jsonify({"favorites": results})


def read_favorite_target(data):
    """Returns (food_id, restaurant_id, place_id, error). Exactly one of
    the three must be given."""
    food_id = data.get("food_id")
    restaurant_id = data.get("restaurant_id")
    place_id = data.get("place_id")

    given = [value for value in (food_id, restaurant_id, place_id) if value is not None]
    if len(given) != 1:
        return None, None, None, "Send exactly one of food_id, restaurant_id or place_id."
    if place_id is not None:
        if not isinstance(place_id, str) or not PLACE_ID_PATTERN.match(place_id):
            return None, None, None, "place_id doesn't look like a Google place id."
    elif not is_whole_number(given[0]):
        return None, None, None, "The id must be a whole number."
    return food_id, restaurant_id, place_id, None


# POST /api/favorites
# Body: {"food_id": 4}  or  {"restaurant_id": 2}  or  {"place_id": "ChIJ..."}
@favorite_routes.route("/api/favorites", methods=["POST"])
@login_required
def add_favorite():
    food_id, restaurant_id, place_id, error = read_favorite_target(request.get_json(silent=True) or {})
    if error:
        return jsonify({"error": error}), 400

    # Make sure our own foods / sample restaurants really exist.
    if food_id is not None and not db.foods.find_one({"_id": food_id}, {"_id": 1}):
        return jsonify({"error": "Food not found"}), 404
    if restaurant_id is not None and not db.restaurants.find_one({"_id": restaurant_id}, {"_id": 1}):
        return jsonify({"error": "Restaurant not found"}), 404

    favorite = {
        "user_id": g.user["_id"],
        "food_id": food_id,
        "restaurant_id": restaurant_id,
        "place_id": place_id,
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
