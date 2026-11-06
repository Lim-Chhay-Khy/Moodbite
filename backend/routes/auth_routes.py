from datetime import datetime, timezone

from flask import Blueprint, g, jsonify, request
from pymongo.errors import DuplicateKeyError
from werkzeug.security import check_password_hash, generate_password_hash

from database import db
from models import user_to_dict
from services.auth_service import create_token, login_required
from services.validation_service import (
    clean_email,
    find_email_error,
    find_name_error,
    find_password_error,
)

auth_routes = Blueprint("auth_routes", __name__)

DUPLICATE_EMAIL = "An account with this email already exists"
# Same message for "no such email" and "wrong password", so nobody can use
# the login form to find out which emails have accounts.
BAD_LOGIN = "Incorrect email or password."


# POST /api/auth/register
# Body: {"name": "Jackie", "email": "jackie@example.com", "password": "examplePassword"}
@auth_routes.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    error = find_name_error(name) or find_email_error(email) or find_password_error(password)
    if error:
        return jsonify({"error": error}), 400

    email = clean_email(email)
    if db.users.find_one({"email": email}):
        return jsonify({"error": DUPLICATE_EMAIL}), 409

    try:
        db.users.insert_one({
            "name": name.strip(),
            "email": email,
            # Save only the HASH. Werkzeug adds a random "salt", so two users
            # with the same password still get different hashes.
            "password_hash": generate_password_hash(password),
            "created_at": datetime.now(timezone.utc),
        })
    except DuplicateKeyError:
        # Two sign-ups with the same email at the same moment: the unique
        # index stops the second one.
        return jsonify({"error": DUPLICATE_EMAIL}), 409

    return jsonify({"message": "Account created successfully"}), 201


# POST /api/auth/login
# Body: {"email": "jackie@example.com", "password": "examplePassword"}
@auth_routes.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")
    if not isinstance(email, str) or not isinstance(password, str) or not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    # 1. Find the user by email.
    user = db.users.find_one({"email": clean_email(email)})

    # 2. Check the password against the saved hash.
    if user is None or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": BAD_LOGIN}), 401

    # 3. Correct: give React a token that proves who this user is.
    return jsonify({
        "message": "Login successful",
        "user": user_to_dict(user),
        "token": create_token(user["_id"]),
    })


# GET /api/auth/me  ->  who am I? React calls this after a page refresh to
# check the saved token is still valid.
@auth_routes.route("/api/auth/me", methods=["GET"])
@login_required
def me():
    return jsonify({"user": user_to_dict(g.user)})
