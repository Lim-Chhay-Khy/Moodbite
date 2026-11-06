"""
MoodBite Flask API.  Start it with:  python app.py
Then open http://localhost:5000/api/foods in your browser.
"""

from flask import Flask, jsonify
from flask_cors import CORS
from pymongo.errors import PyMongoError

from config import Config
from routes.food_routes import food_routes
from routes.recommendation_routes import recommendation_routes
from routes.restaurant_routes import restaurant_routes

app = Flask(__name__)
app.config.from_object(Config)

# Make JSON easier to read when testing in the browser:
# keep keys in the order we wrote them, and show emoji as emoji.
app.json.sort_keys = False
app.json.ensure_ascii = False

# CORS: the browser blocks a page on localhost:5173 (React) from reading
# responses from localhost:5000 (Flask) unless Flask says it's allowed.
# This allows ONLY our React app to call /api/... routes.
CORS(app, resources={r"/api/*": {"origins": Config.FRONTEND_URL}})

# Add the routes from each routes/ file.
app.register_blueprint(food_routes)
app.register_blueprint(restaurant_routes)
app.register_blueprint(recommendation_routes)


# A quick "is the server up?" check: GET /api/health
@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


# ----- Error handlers: always answer with JSON, never an HTML error page -----

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Route not found"}), 404


@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({"error": "This route doesn't accept that HTTP method"}), 405


@app.errorhandler(PyMongoError)
def database_error(error):
    # Happens when MongoDB isn't running or can't be reached.
    app.logger.error("Database error: %s", error)
    return jsonify({"error": "Could not connect to the database. Is MongoDB running?"}), 500


@app.errorhandler(500)
def server_error(error):
    return jsonify({"error": "Something went wrong on the server"}), 500


if __name__ == "__main__":
    # debug=True restarts the server when you save a file and shows
    # detailed errors. Turn it off before deploying.
    app.run(port=Config.PORT, debug=True)
