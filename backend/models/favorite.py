"""
A document in the "favorites" collection looks like this:

{
    "_id": ObjectId("..."),
    "user_id": ObjectId("..."),   # WHO saved it (links to users._id)
    "food_id": 4,                 # WHAT was saved: a food id...
    "restaurant_id": None,        # ...OR a restaurant id (the other is None)
    "created_at": datetime(...)
}

One user can have many favorites (one-to-many). Every query for favorites
includes "user_id", so a user can only ever see or delete their own.
"""

from database import to_iso
from models.food import food_to_dict
from models.restaurant import restaurant_to_dict


def favorite_to_dict(favorite, food=None, restaurant=None):
    """food / restaurant: the full document it points to, so React can
    show a card without making another request."""
    return {
        "id": str(favorite["_id"]),
        "type": "food" if favorite.get("food_id") is not None else "restaurant",
        "foodId": favorite.get("food_id"),
        "restaurantId": favorite.get("restaurant_id"),
        "createdAt": to_iso(favorite.get("created_at")),
        "food": food_to_dict(food) if food else None,
        "restaurant": restaurant_to_dict(restaurant) if restaurant else None,
    }
