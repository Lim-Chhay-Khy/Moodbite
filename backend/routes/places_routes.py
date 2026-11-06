from flask import Blueprint, current_app, jsonify, request

from database import db
from models import food_to_dict, restaurant_to_dict
from services.places_service import PlacesError, is_configured, search_restaurants

places_routes = Blueprint("places_routes", __name__)

MAX_PLACE_TEXT = 100


def read_location(args):
    """Reads ?lat=43.65&lng=-79.38 or ?near=Toronto from the URL.
    Returns (lat, lng, near, error_message)."""
    near = (args.get("near") or "").strip()[:MAX_PLACE_TEXT] or None
    lat_text, lng_text = args.get("lat"), args.get("lng")

    if lat_text is None and lng_text is None:
        return None, None, near, None
    if lat_text is None or lng_text is None:
        return None, None, near, "Send both lat and lng."
    try:
        lat, lng = float(lat_text), float(lng_text)
    except ValueError:
        return None, None, near, "lat and lng must be numbers."
    if not (-90 <= lat <= 90 and -180 <= lng <= 180):
        return None, None, near, "lat must be -90 to 90 and lng -180 to 180."
    return lat, lng, near, None


def sample_response(food, message):
    """Stage 3's sample restaurants from MongoDB, used when Google can't be."""
    restaurants = db.restaurants.find({"food_ids": food["_id"]}).sort("distance", 1)
    return jsonify({
        "food": food_to_dict(food),
        "source": "sample",
        "message": message,
        "center": None,
        "restaurants": [restaurant_to_dict(restaurant) for restaurant in restaurants],
    })


# GET /api/foods/1/nearby?lat=43.65&lng=-79.38   (near the user)
# GET /api/foods/1/nearby?near=Toronto            (in a city they typed)
@places_routes.route("/api/foods/<int:food_id>/nearby", methods=["GET"])
def nearby_restaurants(food_id):
    food = db.foods.find_one({"_id": food_id}, {"recipe": 0})
    if food is None:
        return jsonify({"error": "Food not found"}), 404

    lat, lng, near, error = read_location(request.args)
    if error:
        return jsonify({"error": error}), 400

    # No Google key yet? Keep the app working with sample data.
    if not is_configured():
        return sample_response(food, "Real restaurants are turned off (no Google API key). Showing sample restaurants.")
    if lat is None and not near:
        return sample_response(food, "Share your location or type a city to see real restaurants. Showing samples for now.")

    try:
        restaurants = search_restaurants(food["name"], lat, lng, near)
    except PlacesError as error:
        current_app.logger.warning("%s", error)  # the details go to the terminal, not the user
        return sample_response(food, "We couldn't reach Google right now, so these are sample restaurants.")

    # Where the map should start: the user, or the first result for a city.
    if lat is not None:
        center = {"lat": lat, "lng": lng}
    else:
        center = next((r["location"] for r in restaurants if r["location"]), None)

    return jsonify({
        "food": food_to_dict(food),
        "source": "google",
        "message": None if restaurants else "No restaurants found. Try a different city.",
        "center": center,
        "restaurants": restaurants,
    })
