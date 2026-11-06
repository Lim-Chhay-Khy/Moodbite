from flask import Blueprint, g, jsonify, request
from pymongo.errors import DuplicateKeyError

from database import db
from models import user_to_dict
from services.auth_service import login_required
from services.validation_service import clean_email, find_email_error, find_name_error

profile_routes = Blueprint("profile_routes", __name__)


def profile_response(user):
    return jsonify({
        "user": user_to_dict(user),
        "favoritesCount": db.favorites.count_documents({"user_id": user["_id"]}),
        "historyCount": db.history.count_documents({"user_id": user["_id"]}),
    })


# GET /api/profile  ->  account info + counts
@profile_routes.route("/api/profile", methods=["GET"])
@login_required
def get_profile():
    return profile_response(g.user)


# PUT /api/profile
# Body: {"name": "Jackie Lim", "email": "jackie@example.com"}
@profile_routes.route("/api/profile", methods=["PUT"])
@login_required
def update_profile():
    data = request.get_json(silent=True) or {}
    name = data.get("name")
    email = data.get("email")

    error = find_name_error(name) or find_email_error(email)
    if error:
        return jsonify({"error": error}), 400

    email = clean_email(email)
    # Someone ELSE already using this email? ("$ne" means "not equal")
    if db.users.find_one({"email": email, "_id": {"$ne": g.user["_id"]}}):
        return jsonify({"error": "An account with this email already exists"}), 409

    try:
        # "$set" changes only these two fields and leaves the rest alone.
        db.users.update_one({"_id": g.user["_id"]}, {"$set": {"name": name.strip(), "email": email}})
    except DuplicateKeyError:
        return jsonify({"error": "An account with this email already exists"}), 409

    return profile_response(db.users.find_one({"_id": g.user["_id"]}))
