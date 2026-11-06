"""
Builds the "Why we recommend this" text on each food card, e.g.

  "You said you are feeling tired and want comfort food.
   Chicken Fried Rice is comforting, filling, and easy to prepare.
   It takes about 25 minutes to make. It fits your $ budget."

It is made of three short sentences:
  1. what the user told us   (mood + matching cravings)
  2. why this food fits      (words based on the food's tags)
  3. the practical part      (cook / restaurant, time, budget)
"""

MOOD_WORDS = {
    "happy": "happy",
    "tired": "tired",
    "sad": "a little down",
    "stressed": "stressed",
    "excited": "excited",
}

# How each craving reads inside a sentence ("...and want comfort food").
PREFERENCE_PHRASES = {
    "spicy": "something spicy",
    "sweet": "something sweet",
    "healthy": "something healthy",
    "comfort": "comfort food",
    "fast": "something fast",
    "protein": "something high in protein",
    "vegetarian": "vegetarian food",
    "asian": "Asian food",
    "western": "Western food",
    "light": "something light",
    "filling": "something filling",
}

# How each food tag is described in sentence 2.
TRAIT_WORDS = {
    "comfort": "comforting",
    "filling": "filling",
    "light": "light",
    "healthy": "balanced",
    "protein": "high in protein",
    "spicy": "spicy",
    "sweet": "sweet",
    "fast": "quick",
}


def join_words(words):
    """["a"] -> "a",  ["a","b"] -> "a and b",  ["a","b","c"] -> "a, b, and c" """
    if len(words) <= 1:
        return "".join(words)
    if len(words) == 2:
        return f"{words[0]} and {words[1]}"
    return ", ".join(words[:-1]) + f", and {words[-1]}"


def describe_user(mood, matched_preferences, mood_matched):
    cravings = [PREFERENCE_PHRASES[p] for p in matched_preferences if p in PREFERENCE_PHRASES]

    if mood == "unsure":
        if cravings:
            return f"You weren't sure how you feel, but you want {join_words(cravings)}."
        return "You weren't sure how you feel, so we picked something easy to enjoy."
    if mood_matched:
        wants = f" and want {join_words(cravings)}" if cravings else ""
        return f"You said you are feeling {MOOD_WORDS[mood]}{wants}."
    if cravings:
        return f"You said you want {join_words(cravings)}."
    return "This was the closest match to your answers."


def describe_food(food, choice):
    traits = [TRAIT_WORDS[tag] for tag in food["preferences"] if tag in TRAIT_WORDS][:2]
    if food["difficulty"] == "Easy" and food["can_cook"] and choice != "restaurant":
        traits.append("easy to prepare")
    if not traits:
        return f"{food['name']} is a {food['cuisine']} favorite."
    return f"{food['name']} is {join_words(traits)}."


def describe_practical(food, answers, checks):
    choice = answers["choice"]
    budget = answers["budget"]

    if choice == "restaurant" or not food["can_cook"]:
        sentence = "You can find it at restaurants nearby"
    elif food["cooking_time"] <= 15:
        sentence = f"It only takes about {food['cooking_time']} minutes to make"
    else:
        sentence = f"It takes about {food['cooking_time']} minutes to make"

    sentence += "." if checks["time"] else ", which is a bit longer than you wanted."

    if budget:
        if checks["budget"]:
            sentence += f" It fits your {budget} budget."
        else:
            sentence += f" It costs a little more than your {budget} budget."
    return sentence


def build_explanation(food, answers, result):
    """food: a food document from MongoDB, answers: cleaned user answers,
    result: the dictionary returned by score_food()."""
    return " ".join([
        describe_user(answers["mood"], result["matched_preferences"], result["checks"]["mood"]),
        describe_food(food, answers["choice"]),
        describe_practical(food, answers, result["checks"]),
    ])


def build_popular_explanation(food):
    return f"A popular pick for any mood. {describe_food(food, None)}"
