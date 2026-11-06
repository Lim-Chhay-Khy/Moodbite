"""
Real restaurants from the Google Places API (New).

Flask calls Google (not React) so the API key stays secret on the server.

Two Google endpoints are used:
  - Text Search:   "ramen restaurant" near a location  -> a list of places
  - Place Details: one place by its id                 -> used for favorites

Google charges per request (with a free amount each month), and the price
depends on which FIELDS we ask for. We list exactly the fields we need in
the "X-Goog-FieldMask" header, so we never pay for data we don't show.
"""

import math
from urllib.parse import quote

import requests

from config import Config

SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"
DETAILS_URL = "https://places.googleapis.com/v1/places/{place_id}"

# The fields we ask Google for (and pay for).
FIELDS = [
    "id",
    "displayName",
    "formattedAddress",
    "location",
    "googleMapsUri",
    "primaryTypeDisplayName",
    "rating",
    "userRatingCount",
    "priceLevel",
    "currentOpeningHours.openNow",
    "dineIn",
    "takeout",
    "delivery",
]

# Google's price words -> our "$" style.
PRICE_LEVELS = {
    "PRICE_LEVEL_FREE": "Free",
    "PRICE_LEVEL_INEXPENSIVE": "$",
    "PRICE_LEVEL_MODERATE": "$$",
    "PRICE_LEVEL_EXPENSIVE": "$$$",
    "PRICE_LEVEL_VERY_EXPENSIVE": "$$$$",
}

MAX_RESULTS = 10
TIMEOUT_SECONDS = 8  # don't let a slow Google answer freeze our API


class PlacesError(Exception):
    """Something went wrong talking to Google (no internet, bad key,
    quota used up...). The routes catch it and fall back to sample data."""


def is_configured():
    return bool(Config.GOOGLE_PLACES_API_KEY)


def call_google(method, url, field_mask, body=None):
    headers = {
        "X-Goog-Api-Key": Config.GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": field_mask,
    }
    try:
        response = requests.request(method, url, json=body, headers=headers, timeout=TIMEOUT_SECONDS)
    except requests.RequestException as error:
        raise PlacesError(f"Couldn't reach Google Places: {error}") from error

    if response.status_code != 200:
        # Google explains problems like "API key not valid" in the body.
        try:
            reason = response.json().get("error", {}).get("message", "")
        except ValueError:
            reason = response.text[:200]
        raise PlacesError(f"Google Places error {response.status_code}: {reason}")
    return response.json()


def distance_km(lat1, lng1, lat2, lng2):
    """Straight-line distance between two points on Earth (the
    "haversine formula"). Good enough for "1.4 km away"."""
    earth_radius_km = 6371
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lng / 2) ** 2
    )
    return earth_radius_km * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def place_to_restaurant(place, origin=None):
    """Turns one Google place into the same JSON shape as our sample
    restaurants, so React's RestaurantCard can show either kind.
    origin: (lat, lng) of the user, to work out the distance."""
    location = place.get("location") or {}
    lat, lng = location.get("latitude"), location.get("longitude")

    distance = None
    if origin and lat is not None and lng is not None:
        distance = round(distance_km(origin[0], origin[1], lat, lng), 1)

    return {
        "id": place["id"],
        "placeId": place["id"],
        "source": "google",
        "name": (place.get("displayName") or {}).get("text", "Unnamed place"),
        "emoji": "🍽",
        "cuisine": (place.get("primaryTypeDisplayName") or {}).get("text", "Restaurant"),
        "rating": place.get("rating"),
        "ratingCount": place.get("userRatingCount"),
        "priceLevel": PRICE_LEVELS.get(place.get("priceLevel")),
        "address": place.get("formattedAddress", ""),
        "distance": distance,
        "openNow": (place.get("currentOpeningHours") or {}).get("openNow"),
        "openingHours": None,
        "imageUrl": None,
        # None = Google doesn't know, so the card doesn't show it.
        "dineIn": place.get("dineIn"),
        "takeout": place.get("takeout"),
        "delivery": place.get("delivery"),
        "location": {"lat": lat, "lng": lng} if lat is not None and lng is not None else None,
        "googleMapsUrl": place.get("googleMapsUri"),
    }


def search_restaurants(food_name, lat=None, lng=None, near=None):
    """Finds restaurants for a dish.
    Either near the user (lat + lng), or in a place they typed (near)."""
    if near:
        body = {"textQuery": f"{food_name} restaurant in {near}", "maxResultCount": MAX_RESULTS}
        origin = None
    else:
        body = {
            "textQuery": f"{food_name} restaurant",
            "maxResultCount": MAX_RESULTS,
            # Prefer places inside this circle around the user.
            "locationBias": {
                "circle": {
                    "center": {"latitude": lat, "longitude": lng},
                    "radius": float(Config.PLACES_SEARCH_RADIUS_M),
                }
            },
        }
        origin = (lat, lng)

    field_mask = ",".join(f"places.{field}" for field in FIELDS)
    data = call_google("POST", SEARCH_URL, field_mask, body)
    restaurants = [place_to_restaurant(place, origin) for place in data.get("places", [])]

    if origin:  # closest first
        restaurants.sort(key=lambda r: r["distance"] if r["distance"] is not None else float("inf"))
    return restaurants


def get_place(place_id):
    """Details for one place (used to show saved Google restaurants)."""
    url = DETAILS_URL.format(place_id=quote(place_id, safe=""))
    return place_to_restaurant(call_google("GET", url, ",".join(FIELDS)))
