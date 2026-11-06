"""
A document in the "users" collection looks like this:

{
    "_id": ObjectId("6721f0c2a1b2c3d4e5f60718"),   # MongoDB makes this for us
    "name": "Jackie",
    "email": "jackie@example.com",                 # unique (see create_indexes)
    "password_hash": "scrypt:32768:8:1$...",       # NEVER the real password
    "created_at": datetime(2026, 11, 4, 19, 6)
}

The real password is never saved. Werkzeug's generate_password_hash()
turns it into a one-way "hash"; at login, check_password_hash() hashes
what the user typed and compares the two.
"""

from database import to_iso


def user_to_dict(user):
    """The JSON we send to React. It leaves out password_hash ON PURPOSE —
    the hash must never leave the server."""
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "createdAt": to_iso(user.get("created_at")),
    }
