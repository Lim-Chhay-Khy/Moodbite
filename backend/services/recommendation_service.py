"""
MoodBite recommendation logic (rule-based, no AI). Moved here from the
React frontend in Stage 3.

Step 1 - REMOVE foods that can't work at all (hard filters):
    - foods that break a dietary restriction the user picked
    - restaurant-only foods if the user wants to cook at home
    - home-only foods if the user wants a restaurant

Step 2 - SCORE every food that is left:
    Mood matches ............................ +3
    Each craving (preference) that matches .. +3
    Fits the cook / restaurant choice ........ +2
    Fits the time limit ...................... +2
    Fits the budget .......................... +1
    Fits the dietary preferences ............. +3

Step 3 - sort by score (highest first) and return the top 3.
Because we sort instead of demanding a perfect match, the user always
gets the CLOSEST foods, even if nothing ticks every box.
"""

from models import food_to_dict
from services.explanation_service import build_explanation, build_popular_explanation

POINTS = {
    "mood": 3,
    "preference": 3,
    "choice": 2,
    "time": 2,
    "budget": 1,
    "dietary": 3,
}

VALID_MOODS = ["happy", "tired", "sad", "stressed", "excited", "unsure"]
VALID_CHOICES = ["cook", "restaurant", "either"]
VALID_BUDGETS = ["$", "$$", "$$$"]

POPULAR_FOOD_NAMES = [
    "Chicken Fried Rice",
    "Margherita Pizza",
    "Shrimp Pad Thai",
    "Grilled Chicken Bowl",
    "Fish Amok",
]


# ----- Checking the request -----

def is_list_of_text(value):
    return isinstance(value, list) and all(isinstance(item, str) for item in value)


def find_request_error(data):
    """Returns an error message if the request is invalid, otherwise None."""
    if not isinstance(data, dict):
        return "Request body must be a JSON object."

    if data.get("surprise"):
        return None  # "Surprise Me" needs no other answers

    mood = data.get("mood")
    if not mood:
        return "Missing required field: mood."
    if mood not in VALID_MOODS:
        return f"Unknown mood '{mood}'. Use one of: {', '.join(VALID_MOODS)}."
    if not is_list_of_text(data.get("preferences", [])):
        return "preferences must be a list of text values."
    if not is_list_of_text(data.get("dietary", [])):
        return "dietary must be a list of text values."
    if data.get("choice") not in VALID_CHOICES + [None]:
        return f"choice must be one of: {', '.join(VALID_CHOICES)}."

    time = data.get("time")
    # bool is a kind of int in Python, so rule it out on purpose.
    if time is not None and (isinstance(time, bool) or not isinstance(time, int) or time <= 0):
        return "time must be a positive number of minutes, or null for no limit."

    if data.get("budget") not in VALID_BUDGETS + ["any", None]:
        return "budget must be '$', '$$', '$$$', 'any', or null."
    return None


def clean_answers(data):
    """Fills in defaults and removes 'I don't know' / 'none' answers."""
    budget = data.get("budget")
    return {
        "mood": data.get("mood"),
        "preferences": [p for p in data.get("preferences", []) if p != "unsure"],
        "choice": data.get("choice") or "either",
        "time": data.get("time"),  # max minutes, or None = no limit
        "budget": None if budget == "any" else budget,
        "dietary": [d for d in data.get("dietary", []) if d != "none"],
    }


# ----- Step 1: hard filters (True = keep the food) -----

def follows_dietary(food, dietary):
    # The food must be safe for EVERY restriction the user picked.
    return all(restriction in food["dietary_tags"] for restriction in dietary)


def is_possible_for_choice(food, choice):
    if choice == "cook":
        return food["can_cook"]
    if choice == "restaurant":
        return food["available_at_restaurant"]
    return True  # "either"


# ----- Step 2: soft checks (used for points) -----

def fits_choice(food, choice):
    if choice in ("cook", "restaurant"):
        return is_possible_for_choice(food, choice)
    # "Either one": reward foods that really do offer both options.
    return food["can_cook"] and food["available_at_restaurant"]


def fits_time(food, max_minutes, choice):
    if max_minutes is None:
        return True  # no time limit
    # Eating out (or a restaurant-only dish) means no cooking time.
    if choice == "restaurant" or food["cooking_time"] is None:
        return True
    return food["cooking_time"] <= max_minutes


def fits_budget(food, budget):
    if budget is None:
        return True
    # "$" has 1 character, "$$" has 2... so compare the lengths.
    return len(food["price_level"]) <= len(budget)


def score_food(food, answers):
    matched_preferences = [p for p in answers["preferences"] if p in food["preferences"]]
    checks = {
        "mood": answers["mood"] in food["moods"],
        "time": fits_time(food, answers["time"], answers["choice"]),
        "budget": fits_budget(food, answers["budget"]),
    }

    score = 0
    if checks["mood"]:
        score += POINTS["mood"]
    score += len(matched_preferences) * POINTS["preference"]
    if fits_choice(food, answers["choice"]):
        score += POINTS["choice"]
    if checks["time"]:
        score += POINTS["time"]
    if checks["budget"]:
        score += POINTS["budget"]
    if follows_dietary(food, answers["dietary"]):
        score += POINTS["dietary"]  # always true here, because of Step 1

    # "Perfect match" = right mood, at least one craving (if any were
    # picked), and within time and budget.
    is_perfect_match = (
        checks["mood"]
        and (not answers["preferences"] or len(matched_preferences) > 0)
        and checks["time"]
        and checks["budget"]
    )
    return {
        "score": score,
        "matched_preferences": matched_preferences,
        "checks": checks,
        "is_perfect_match": is_perfect_match,
    }


# ----- Putting it together -----

def get_popular_picks(foods, limit):
    foods_by_name = {food["name"]: food for food in foods}
    popular = [foods_by_name[name] for name in POPULAR_FOOD_NAMES if name in foods_by_name]
    return [
        {**food_to_dict(food), "score": 0, "isPerfectMatch": False, "reason": build_popular_explanation(food)}
        for food in popular[:limit]
    ]


def get_recommendations(foods, data, limit=3):
    """foods: list of food documents (dictionaries) from MongoDB.
    data:  the JSON body sent by React (already checked by find_request_error).
    Returns a list of up to `limit` food dictionaries, each with
    score, isPerfectMatch, and reason added."""
    if data.get("surprise"):
        return get_popular_picks(foods, limit)

    answers = clean_answers(data)

    # Step 1: remove foods that can't work
    allowed = [
        food for food in foods
        if follows_dietary(food, answers["dietary"])
        and is_possible_for_choice(food, answers["choice"])
    ]

    # Step 2: score the rest
    scored = [(food, score_food(food, answers)) for food in allowed]

    # Step 3: highest score first. Python's sort is "stable", so foods with
    # the same score keep their database order.
    scored.sort(key=lambda pair: pair[1]["score"], reverse=True)

    return [
        {
            **food_to_dict(food),
            "score": result["score"],
            "isPerfectMatch": result["is_perfect_match"],
            "reason": build_explanation(food, answers, result),
        }
        for food, result in scored[:limit]
    ]
