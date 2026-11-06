from flask import Blueprint, jsonify

from database import db
from models import restaurant_to_dict

restaurant_routes = Blueprint("restaurant_routes", __name__)


# GET /api/restaurants  ->  every restaurant
# Used by the Favorites page to show saved restaurants.
@restaurant_routes.route("/api/restaurants", methods=["GET"])
def get_restaurants():
    restaurants = db.restaurants.find().sort("_id", 1)
    return jsonify({"restaurants": [restaurant_to_dict(restaurant) for restaurant in restaurants]})
