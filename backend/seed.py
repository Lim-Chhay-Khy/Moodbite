"""
Fills MongoDB with the sample data from seed_data.py.

    python seed.py

WARNING: it DELETES the existing foods and restaurants first, so running
it again always gives you a fresh copy of the sample data.
"""

import sys

from pymongo.errors import OperationFailure, ServerSelectionTimeoutError

from config import Config
from database import client, db
from seed_data import FOODS, RECIPES, RESTAURANTS


def build_foods():
    """Gives each food a number as its _id (1, 2, 3...) and puts its
    recipe inside it."""
    recipes_by_food_name = {}
    for recipe in RECIPES:
        recipe = dict(recipe)
        food_name = recipe.pop("food")
        recipes_by_food_name[food_name] = recipe

    foods = []
    for number, data in enumerate(FOODS, start=1):
        food = {"_id": number, **data, "image_url": None}
        food["recipe"] = recipes_by_food_name.get(food["name"])  # None if restaurant-only
        foods.append(food)
    return foods


def build_restaurants(foods):
    """Turns the food NAMES in seed_data.py into food ids."""
    food_id_by_name = {food["name"]: food["_id"] for food in foods}

    restaurants = []
    for number, data in enumerate(RESTAURANTS, start=1):
        restaurant = dict(data)
        food_names = restaurant.pop("foods")
        restaurant["_id"] = number
        restaurant["image_url"] = None
        restaurant["food_ids"] = [food_id_by_name[name] for name in food_names]
        restaurants.append(restaurant)
    return restaurants


def check_connection():
    """Stops with a short, clear message if MongoDB isn't reachable.
    (We don't print MONGODB_URI because it may contain your password.)"""
    try:
        client.admin.command("ping")
    except ServerSelectionTimeoutError:
        print("Could not connect to MongoDB.")
        print("- Atlas: add your IP address under Network Access.")
        print("- Local: make sure the MongoDB service is running.")
        sys.exit(1)
    except OperationFailure as error:
        print(f"MongoDB refused the login: {error}")
        print("Check the username and password in MONGODB_URI in backend/.env.")
        sys.exit(1)


def seed():
    check_connection()

    foods = build_foods()
    restaurants = build_restaurants(foods)

    print("Deleting old data...")
    db.foods.drop()
    db.restaurants.drop()

    print("Adding sample data...")
    db.foods.insert_many(foods)
    db.restaurants.insert_many(restaurants)

    # An index makes "find restaurants serving food X" fast, like the
    # index at the back of a book.
    db.restaurants.create_index("food_ids")

    with_recipe = db.foods.count_documents({"recipe": {"$ne": None}})
    print(
        f"Done! Added {db.foods.count_documents({})} foods ({with_recipe} with recipes) "
        f"and {db.restaurants.count_documents({})} restaurants to the "
        f"'{Config.MONGO_DB_NAME}' database."
    )


if __name__ == "__main__":
    seed()
