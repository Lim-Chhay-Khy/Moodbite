import certifi
from pymongo import MongoClient
from pymongo.errors import ConfigurationError

from config import Config

# One shared connection to MongoDB for the whole app.
#
# serverSelectionTimeoutMS=10000: if MongoDB can't be reached, give up
# after 10 seconds with an error instead of waiting 30 seconds.
# (A cloud database like MongoDB Atlas needs a bit longer than a local one.)
connection_options = {"serverSelectionTimeoutMS": 10000}

# MongoDB Atlas (a "mongodb+srv://" address) uses an encrypted TLS
# connection. certifi gives Python an up-to-date list of trusted
# certificates, which avoids "CERTIFICATE_VERIFY_FAILED" errors on Windows.
if Config.MONGODB_URI.startswith("mongodb+srv://"):
    connection_options["tlsCAFile"] = certifi.where()

# MongoClient doesn't connect right away — it connects the first time we
# actually read or write data. But for a "mongodb+srv://" address it looks
# up the cluster name immediately, so a typo in MONGODB_URI (or no internet)
# fails here. We stop with a short message instead of a long traceback.
try:
    client = MongoClient(Config.MONGODB_URI, **connection_options)
except ConfigurationError as error:
    raise SystemExit(
        f"\nCan't use the MONGODB_URI in backend/.env: {error}\n"
        "Check the address for typos and make sure you're connected to the internet.\n"
    )

# The "moodbite" database. Its collections (like tables in SQL) are used as:
#   db.foods        -> each food, with its recipe stored inside it
#   db.restaurants  -> each restaurant, with a list of the food ids it serves
db = client[Config.MONGO_DB_NAME]
