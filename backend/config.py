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
