"""
Login tokens (JWT) and the @login_required check.

How it works:
  1. At login, create_token() makes a JWT: a small signed piece of text
     that says "this is user 6721f0c2..., valid until <date>".
  2. React saves the token and sends it with every request in a header:
         Authorization: Bearer <token>
  3. get_current_user() reads that header, checks the signature with our
     JWT_SECRET_KEY, and finds the user in the database.

Because the token is SIGNED with a secret only the server knows, nobody
can change the user id inside it or make a fake one.
"""

from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import g, jsonify, request

from config import Config
from database import db, to_object_id


def create_token(user_id):
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),  # "subject" = which user this token is for
        "iat": now,  # issued at
        "exp": now + timedelta(days=Config.JWT_EXPIRES_DAYS),  # expires at
    }
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm="HS256")


def get_token_from_request():
    """Reads "Authorization: Bearer <token>" and returns just the token."""
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    return header[len("Bearer "):].strip() or None


def get_current_user():
    """Returns the logged-in user's document, or None if there is no valid
    token (missing, expired, tampered with, or the user was deleted)."""
    token = get_token_from_request()
    if token is None:
        return None
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
    except jwt.InvalidTokenError:  # also covers expired tokens
        return None

    user_id = to_object_id(payload.get("sub"))
    if user_id is None:
        return None
    return db.users.find_one({"_id": user_id})


def login_required(route_function):
    """Put @login_required above a route to make it members-only.

    If there's no valid token, the route doesn't run at all and React gets
    401 Unauthorized. Otherwise the user is stored in g.user so the route
    can use it. (g is Flask's place for data about the current request.)
    """
    @wraps(route_function)  # keeps the route's original name for Flask
    def check_login(*args, **kwargs):
        user = get_current_user()
        if user is None:
            return jsonify({"error": "Authentication required"}), 401
        g.user = user
        return route_function(*args, **kwargs)

    return check_login
