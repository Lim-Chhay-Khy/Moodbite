"""
A document in the "favorites" collection looks like this:

{
    "_id": ObjectId("..."),
    "user_id": ObjectId("..."),   # WHO saved it (links to users._id)
    "food_id": 4,                 # WHAT was saved: a food id...
    "restaurant_id": None,        # ...OR a sample restaurant id...
    "place_id": None,             # ...OR a Google place id (Stage 5)
                                  # (only one of the three is set)
    "created_at": datetime(...)
}

One user can have many favorites (one-to-many). Every query for favorites
includes "user_id", so a user can only ever see or delete their own.
"""

from database import to_iso


def favorite_type(favorite):
    if favorite.get("food_id") is not None:
        return "food"
    if favorite.get("place_id"):
        return "place"  # a real restaurant from Google
    return "restaurant"  # a sample restaurant


def favorite_to_dict(favorite, food=None, restaurant=None):
    """food / restaurant: the item it points to, ALREADY turned into JSON
    (food_to_dict / restaurant_to_dict / place_to_restaurant), so React can
    show a card without making another request.

    Google's rules only let us keep a place's id, not its details, so we
    save just place_id and ask Google for the details when needed."""
    return {
        "id": str(favorite["_id"]),
        "type": favorite_type(favorite),
        "foodId": favorite.get("food_id"),
        "restaurantId": favorite.get("restaurant_id"),
        "placeId": favorite.get("place_id"),
        "createdAt": to_iso(favorite.get("created_at")),
        "food": food,
        "restaurant": restaurant,
    }
