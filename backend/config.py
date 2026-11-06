import os

from dotenv import load_dotenv

# Read the values from the .env file into environment variables.
# This keeps connection details (and any passwords) out of the code.
load_dotenv()


def _get_mongo_uri():
    """Use a local MongoDB by default so the server can still start
    when the sample .env file still has the placeholder Atlas string.
    """
    mongo_uri = os.getenv("MONGODB_URI", "").strip()
    placeholder_markers = ("<username>", "<password>", "cluster0.xxxxx.mongodb.net", "xxxxx.mongodb.net")

    if not mongo_uri or any(marker in mongo_uri for marker in placeholder_markers):
        return "mongodb://localhost:27017"

    return mongo_uri


class Config:
    # Where MongoDB is running. A local install listens on port 27017.
    MONGODB_URI = _get_mongo_uri()
    # The database name. MongoDB creates it automatically the first time
    # seed.py saves data into it — no "CREATE DATABASE" needed.
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "Moodbite").strip() or "Moodbite"

    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    PORT = int(os.getenv("PORT", "5000"))

    # ----- Stage 4: login -----
    # Flask's own secret key (Flask uses it to sign cookies/sessions).
    SECRET_KEY = os.getenv("SECRET_KEY", "").strip()
    # The secret used to sign login tokens (JWTs). Anyone who knows it could
    # create fake tokens, so it lives only in .env, never in GitHub.
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "").strip()
    # How long a login lasts before the user must log in again.
    JWT_EXPIRES_DAYS = int(os.getenv("JWT_EXPIRES_DAYS", "7"))
