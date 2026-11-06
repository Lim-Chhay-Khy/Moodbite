"""
A recipe is EMBEDDED inside its food document (food["recipe"]):

{
    "ingredients": ["2 cups cooked rice", "1 chicken breast", ...],
    "instructions": ["Cut the chicken into small pieces.", ...],
    "preparation_time": 10,    # minutes
    "cooking_time": 15,        # minutes on the stove/oven only
    "servings": 2
}

Why embed instead of using a separate "recipes" collection?
Each food has at most ONE recipe and we always load them together, so
keeping them in one document means one database read instead of two.
Restaurant-only foods have "recipe": None.
"""


def recipe_to_dict(food):
    """Takes the whole food document and returns its recipe as JSON."""
    recipe = food["recipe"]
    return {
        "foodId": food["_id"],
        "ingredients": recipe["ingredients"],
        "instructions": recipe["instructions"],
        "prepTime": recipe["preparation_time"],
        "cookTime": recipe["cooking_time"],
        "totalTime": recipe["preparation_time"] + recipe["cooking_time"],
        "servings": recipe["servings"],
    }
