from flask import Blueprint, jsonify

from database import db
from models import food_to_dict, recipe_to_dict, restaurant_to_dict

# A Blueprint is a group of related routes. app.py registers it.
food_routes = Blueprint("food_routes", __name__)

# A "projection" tells MongoDB which fields to leave out.
# {"recipe": 0} = send the food without its (big) embedded recipe.
WITHOUT_RECIPE = {"recipe": 0}


def food_not_found():
    return jsonify({"error": "Food not found"}), 404


# GET /api/foods  ->  every food
@food_routes.route("/api/foods", methods=["GET"])
def get_foods():
    foods = db.foods.find({}, WITHOUT_RECIPE).sort("_id", 1)
    return jsonify({"foods": [food_to_dict(food) for food in foods]})


# GET /api/foods/1  ->  one food
# <int:food_id> means Flask only matches whole numbers, so /api/foods/abc
# gets a 404 automatically.
@food_routes.route("/api/foods/<int:food_id>", methods=["GET"])
def get_food(food_id):
    food = db.foods.find_one({"_id": food_id}, WITHOUT_RECIPE)
    if food is None:
        return food_not_found()
    return jsonify({"food": food_to_dict(food)})


# GET /api/foods/1/recipe  ->  the food + its recipe
@food_routes.route("/api/foods/<int:food_id>/recipe", methods=["GET"])
def get_food_recipe(food_id):
    food = db.foods.find_one({"_id": food_id})  # this time WITH the recipe
    if food is None:
        return food_not_found()
    if food.get("recipe") is None:
        message = f"{food['name']} is a restaurant-only dish, so there is no recipe for it."
        return jsonify({"error": "Recipe not found", "message": message}), 404
    return jsonify({"food": food_to_dict(food), "recipe": recipe_to_dict(food)})


# GET /api/foods/1/restaurants  ->  the food + restaurants serving it
# An empty list is a normal answer (200), not an error.
@food_routes.route("/api/foods/<int:food_id>/restaurants", methods=["GET"])
def get_food_restaurants(food_id):
    food = db.foods.find_one({"_id": food_id}, WITHOUT_RECIPE)
    if food is None:
        return food_not_found()

    # {"food_ids": food_id} matches restaurants whose food_ids LIST
    # contains this id. .sort("distance", 1) = closest first.
    restaurants = db.restaurants.find({"food_ids": food_id}).sort("distance", 1)
    return jsonify({
        "food": food_to_dict(food),
        "restaurants": [restaurant_to_dict(restaurant) for restaurant in restaurants],
    })
