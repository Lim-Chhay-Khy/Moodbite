# MoodBite

Smart food recommendation web application. Tell MoodBite how you feel, what
you're craving, your dietary needs, and how much time and money you have,
and it recommends three meals and explains why.

## Technologies

- React (Vite, React Router)
- JavaScript, HTML, CSS
- Python
- Flask (+ Flask-CORS)
- MongoDB (with PyMongo)
- REST API (JSON)

## Features

- Mood-based meal recommendations
- Food preference filtering
- Budget filtering
- Time filtering
- Dietary filtering (vegetarian, vegan, halal, no seafood, dairy-free)
- Recipe instructions
- Restaurant suggestions (sample data)
- Favorites (saved in the browser)

## Project Architecture

```
React (localhost:5173)  →  Flask REST API (localhost:5000)  →  MongoDB (Atlas or local)
       frontend/                      backend/                  moodbite database
```

1. React shows the pages and collects the user's answers.
2. React calls the Flask API with `fetch()` (all calls are in
   `frontend/src/services/apiService.js`).
3. Flask runs the recommendation logic and reads MongoDB through PyMongo.
4. Flask sends JSON back, and React displays it.

```
MoodBite/
├── frontend/                  React app
│   └── src/
│       ├── services/apiService.js     every call to Flask
│       ├── services/favoriteService.js favorites in localStorage
│       ├── hooks/useApi.js            loading / error / data for API calls
│       ├── pages/  components/  context/  data/options.js
│
└── backend/                   Flask API
    ├── app.py                 creates the app, CORS, error handlers
    ├── config.py              reads .env (MongoDB address, port...)
    ├── database.py            the shared MongoDB connection (`db`)
    ├── models/                document shapes + functions that turn them into JSON
    ├── routes/                food_routes, restaurant_routes, recommendation_routes
    ├── services/              recommendation_service, explanation_service
    ├── seed.py + seed_data.py fills the database with sample data
    ├── requirements.txt
    └── .env.example           copy to .env
```

## Database Setup

You can use **MongoDB Atlas** (free cloud database, nothing to install) or
MongoDB installed on your own computer.

**1a. Option A: MongoDB Atlas (cloud)**

1. Sign in at cloud.mongodb.com and create a free cluster (if you don't have one).
2. **Database Access** → add a database user with a password.
3. **Network Access** → **Add IP Address** → **Add Current IP Address**.
4. **Database** → **Connect** → **Drivers** → copy the connection string.

**1b. Option B: MongoDB on your computer**

Download **MongoDB Community Server** (Windows `.msi`) from
mongodb.com/try/download/community. Choose **Complete**, and keep
**"Install MongoD as a Service"** and **"Install MongoDB Compass"** checked.
Check it's running in PowerShell with `Get-Service MongoDB` (Status: `Running`).

You do **not** need to create the database yourself. MongoDB creates
`moodbite` automatically the first time `seed.py` saves data.

**2. Configure `.env`.** In the `backend` folder, copy `.env.example` to a new
file called `.env` and set `MONGODB_URI`:

```text
# Atlas:
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
# or local:
MONGODB_URI=mongodb://localhost:27017

MONGO_DB_NAME=moodbite
```

`.env` is in `.gitignore`, so your password never goes to GitHub.

**3. Install Python dependencies** (inside `backend/`):

```bash
python -m venv venv
venv\Scripts\activate          # Windows (PowerShell / cmd)
source venv/bin/activate       # Mac / Linux
pip install -r requirements.txt
```

**4. Run the seed script.** It adds 22 foods (20 with recipes) and 14
restaurants. Running it again resets the data.

```bash
python seed.py
```

**5. Start the Flask server:**

```bash
python app.py
```

Check it works: open http://localhost:5000/api/foods in your browser.

To see the data: in Atlas, open **Database → Browse Collections**; or open
**MongoDB Compass**, paste your `MONGODB_URI`, and open the `moodbite` database.

## Running the Backend (after the first setup)

```bash
cd backend
venv\Scripts\activate      # or: source venv/bin/activate
python app.py
```

## Running the Frontend

In a **second** terminal (Flask keeps running in the first one):

```bash
cd frontend
npm install        # first time only
npm run dev
```

Open http://localhost:5173.

## Database Collections

MongoDB stores **documents** (like JSON objects) in **collections** (like
tables). There is no fixed schema; the shape of each document is written
in the comments of `backend/models/`.

| Collection | What each document holds | How it links |
|---|---|---|
| `foods` | One dish + recommendation data (`moods`, `preferences`, `dietary_tags` lists) **and its recipe embedded inside** (`recipe`, or `null` if restaurant-only) | Food → Recipe is one-to-one, so the recipe lives *inside* the food document |
| `restaurants` | One sample restaurant + a `food_ids` list, e.g. `[1, 14, 19]` | Restaurant ↔ Food is many-to-many: `find({"food_ids": 1})` finds every restaurant serving food 1 |
| `favorites` | Not created yet; planned for Stage 4 (login) | Will hold `user_id`, `food_id`, `restaurant_id`, `created_at` |

Foods and restaurants use simple numbers as their `_id` (instead of
MongoDB's long ObjectIds) so URLs stay short, e.g. `/recipe/1`.

## API Routes

| Method | Route | Returns | Errors |
|---|---|---|---|
| GET | `/api/health` | `{"status": "ok"}` | — |
| GET | `/api/foods` | `{"foods": [...]}` | 500 |
| GET | `/api/foods/<id>` | `{"food": {...}}` | 404 `Food not found` |
| GET | `/api/foods/<id>/recipe` | `{"food": {...}, "recipe": {...}}` | 404 `Food not found` / `Recipe not found` |
| GET | `/api/foods/<id>/restaurants` | `{"food": {...}, "restaurants": [...]}` (may be empty) | 404 `Food not found` |
| GET | `/api/restaurants` | `{"restaurants": [...]}` | 500 |
| POST | `/api/recommendations` | `{"recommendations": [...]}` (top 3) | 400 bad request |

### Common MongoDB connection errors

| Error | Fix |
|---|---|
| `Could not connect to MongoDB` / timeout | Atlas: add your IP under **Network Access**. Local: start the MongoDB service. |
| `bad auth : authentication failed` | Wrong username/password in `.env`, or the password has special characters that need encoding. |
| `CERTIFICATE_VERIFY_FAILED` | Run `pip install -r requirements.txt` again (it installs `certifi`). |
| DNS error with `mongodb+srv` | Check your internet; some school/work Wi-Fi blocks it. |

### Testing POST /api/recommendations

Use Postman or Thunder Client: method **POST**, URL
`http://localhost:5000/api/recommendations`, Body → **JSON**:

```json
{
  "mood": "tired",
  "preferences": ["comfort", "asian"],
  "choice": "cook",
  "time": 30,
  "budget": "$",
  "dietary": ["halal"]
}
```

More bodies to try:

```json
{ "mood": "sad", "preferences": [], "choice": "restaurant", "dietary": ["vegan", "no-seafood"] }
```
```json
{ "surprise": true }
```
```json
{ "preferences": ["comfort"] }
```
(The last one has no mood, so it should return **400** with an error.)

| Field | Values |
|---|---|
| `mood` | `happy`, `tired`, `sad`, `stressed`, `excited`, `unsure` (required unless `surprise` is true) |
| `preferences` | list: `spicy`, `sweet`, `healthy`, `comfort`, `fast`, `protein`, `vegetarian`, `asian`, `western`, `light`, `filling` |
| `choice` | `cook`, `restaurant`, `either` |
| `time` | max minutes (e.g. `30`), or `null` for no limit |
| `budget` | `$`, `$$`, `$$$`, `any` |
| `dietary` | list: `vegetarian`, `vegan`, `halal`, `no-seafood`, `dairy-free` |

## How Recommendations Work

`backend/services/recommendation_service.py`:

1. **Filter.** Remove foods that break a dietary restriction, plus
   restaurant-only foods (if cooking) or home-only foods (if eating out).
2. **Score.** Mood +3, each matching craving +3, cook/restaurant fit +2,
   time fit +2, budget fit +1, dietary fit +3.
3. **Sort and return the top 3**, each with a `reason` sentence written by
   `explanation_service.py`.

## HTTP Status Codes Used

| Code | Meaning | When MoodBite uses it |
|---|---|---|
| 200 OK | Success | Normal answers, including empty lists |
| 201 Created | A new record was saved | Not used yet; saving favorites in Stage 4 will use it |
| 400 Bad Request | The client sent something wrong | Missing mood, wrong data types, body isn't JSON |
| 404 Not Found | That thing doesn't exist | Unknown food id, no recipe, unknown route |
| 405 Method Not Allowed | Wrong HTTP method | e.g. GET on `/api/recommendations` |
| 500 Internal Server Error | The server failed | MongoDB can't be reached, or a bug |

## What's Next

- **Stage 4:** Registration/login, per-user favorites saved in MongoDB.
- **Stage 5:** Real restaurant data via an API such as Google Places, plus a map.
- **Stage 6:** Free-text mood input ("I'm tired and only have $15") parsed
  by an NLP model.
