from flask import Blueprint, g, jsonify

from database import db, to_object_id
from models import history_to_dict
from services.auth_service import login_required

history_routes = Blueprint("history_routes", __name__)

MAX_HISTORY = 50  # only send the 50 most recent sessions


# GET /api/history  ->  the logged-in user's sessions, newest first
@history_routes.route("/api/history", methods=["GET"])
@login_required
def get_history():
    entries = db.history.find({"user_id": g.user["_id"]}).sort("created_at", -1).limit(MAX_HISTORY)
    return jsonify({"history": [history_to_dict(entry) for entry in entries]})


# DELETE /api/history/<id>  ->  delete one session
@history_routes.route("/api/history/<entry_id>", methods=["DELETE"])
@login_required
def delete_history_entry(entry_id):
    object_id = to_object_id(entry_id)
    result = db.history.delete_one({"_id": object_id, "user_id": g.user["_id"]}) if object_id else None
    if result is None or result.deleted_count == 0:
        return jsonify({"error": "History entry not found"}), 404
    return jsonify({"message": "History entry deleted."})


# DELETE /api/history  ->  clear all of this user's history
@history_routes.route("/api/history", methods=["DELETE"])
@login_required
def clear_history():
    result = db.history.delete_many({"user_id": g.user["_id"]})
    return jsonify({"message": "History cleared.", "deleted": result.deleted_count})
