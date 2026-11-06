"""
Saves recommendation sessions for logged-in users.
Called from routes/recommendation_routes.py.

Avoiding duplicate sessions
---------------------------
If the same user gets results for the SAME answers again within 30
minutes (for example, by opening a recipe and pressing "Back to
Recommendations"), we treat it as the same session instead of filling
the history with copies.

Two requests can also arrive at the exact same moment (React's
StrictMode does this on purpose in development). Both would check "is
this a repeat?" before either has saved — a RACE CONDITION — and both
would save. To stop that, each entry gets a "session_key" (user +
answers + 30-minute time slot), and a UNIQUE index on it makes MongoDB
itself refuse the second copy.
"""

import time
from datetime import datetime, timedelta, timezone

from pymongo.errors import DuplicateKeyError

from database import db

SAME_SESSION_MINUTES = 30

ANSWER_FIELDS = ["mood", "preferences", "choice", "time", "budget", "dietary"]


def answers_text(answers):
    """The answers as one piece of text, e.g. "tired|comfort|cook|30|$|".
    Lists are sorted, so the order of clicks doesn't matter."""
    parts = []
    for field in ANSWER_FIELDS:
        value = answers.get(field)
        parts.append(",".join(sorted(value)) if isinstance(value, list) else str(value))
    return "|".join(parts)


def make_session_key(user_id, answers):
    # Which 30-minute slot of time we're in (a whole number that goes up
    # by 1 every 30 minutes).
    time_slot = int(time.time() // (SAME_SESSION_MINUTES * 60))
    return f"{user_id}|{answers_text(answers)}|{time_slot}"


def is_repeat_of_last_session(user_id, answers):
    """Same answers as this user's most recent session, less than 30
    minutes ago? (Covers the moment a new time slot starts.)"""
    last = db.history.find_one({"user_id": user_id}, sort=[("created_at", -1)])
    if last is None or answers_text(last) != answers_text(answers):
        return False
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=SAME_SESSION_MINUTES)
    # MongoDB gives dates back without a time zone, so compare as UTC.
    return last["created_at"].replace(tzinfo=timezone.utc) > cutoff


def save_history(user, answers, recommendations):
    """user: the user document. answers: the cleaned answers from
    clean_answers(). recommendations: the list returned to React."""
    if not recommendations or is_repeat_of_last_session(user["_id"], answers):
        return

    try:
        db.history.insert_one({
            "user_id": user["_id"],
            **{field: answers[field] for field in ANSWER_FIELDS},
            "recommended_foods": [
                {"id": food["id"], "name": food["name"], "emoji": food["emoji"], "score": food["score"]}
                for food in recommendations
            ],
            "session_key": make_session_key(user["_id"], answers),
            "created_at": datetime.now(timezone.utc),
        })
    except DuplicateKeyError:
        pass  # an identical request already saved this session
