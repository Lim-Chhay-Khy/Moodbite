"""
A document in the "restaurants" collection looks like this:

{
    "_id": 1,
    "name": "Golden Wok",
    "emoji": "🥡",
    "cuisine": "Chinese",
    "rating": 4.5,
    "price_level": "$$",
    "address": "123 Example Street, Toronto",
    "distance": 2.1,                  # kilometres
    "opening_hours": "11:00 AM - 10:00 PM",
    "image_url": None,
    "dine_in": True,
    "takeout": True,
    "delivery": True,
    "food_ids": [1, 14, 19]           # the foods this restaurant serves
}

The link between restaurants and foods (many-to-many) is the "food_ids"
list. To find every restaurant serving food 1, we ask MongoDB for
restaurants whose food_ids list contains 1:

    db.restaurants.find({"food_ids": 1})

(In SQL this needed a separate linking table.)

Not used yet: a "favorites" collection, planned for Stage 4 (login), with
documents like {"user_id": ..., "food_id": 1, "restaurant_id": None,
"created_at": ...}. MongoDB creates a collection automatically the first
time something is saved into it.
"""


def restaurant_to_dict(restaurant):
    return {
        "id": restaurant["_id"],
        "name": restaurant["name"],
        "emoji": restaurant.get("emoji"),
        "cuisine": restaurant["cuisine"],
        "rating": restaurant["rating"],
        "priceLevel": restaurant["price_level"],
        "address": restaurant["address"],
        "distance": restaurant["distance"],
        "openingHours": restaurant["opening_hours"],
        "imageUrl": restaurant.get("image_url"),
        "dineIn": restaurant["dine_in"],
        "takeout": restaurant["takeout"],
        "delivery": restaurant["delivery"],
    }
