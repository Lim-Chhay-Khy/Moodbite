# MongoDB doesn't need table definitions, so these "model" files do two jobs:
#   1. Document what each kind of document looks like (in the comments).
#   2. Turn a MongoDB document into the JSON shape React expects.
from models.food import food_to_dict
from models.recipe import recipe_to_dict
from models.restaurant import restaurant_to_dict
