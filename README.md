# MoodBite

Smart food recommendation web application. Tell MoodBite how you feel, what
you're craving, your dietary needs, and how much time and money you have,
and it recommends three meals and explains why.

## Technologies

- React (Vite, React Router)
- JavaScript, HTML, CSS
- Python
- Flask (+ Flask-CORS)
- JWT login tokens (PyJWT) + Werkzeug password hashing
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
- User accounts: register, log in, log out
- Favorites saved to each user's account
- Recommendation history per user, with "View Again"
- Profile page with editable name and email
- Protected pages that require login

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
│       ├── services/apiService.js     every call to Flask + token storage
│       ├── context/AuthContext.jsx    who is logged in (login, logout...)
│       ├── context/FavoritesContext.jsx  the user's favorites
│       ├── components/ProtectedRoute.jsx sends visitors to /login
│       ├── hooks/useApi.js            loading / error / data for API calls
│       ├── utils/validation.js        form checks (email, password...)
│       ├── pages/  components/  context/AppContext.jsx  data/options.js
│
└── backend/                   Flask API
    ├── app.py                 creates the app, CORS, error handlers
    ├── config.py              reads .env (MongoDB address, port...)
    ├── database.py            the shared MongoDB connection (`db`)
    ├── models/                document shapes + functions that turn them into JSON
    ├── routes/                food, restaurant, recommendation, auth,
    │                          favorite, history, profile routes
    ├── services/              recommendation, explanation, auth (JWT +
    │                          @login_required), history, validation
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

**3b. Add login secrets to `.env`** (Stage 4). Run this twice and paste
one result into each line:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

```text
SECRET_KEY=<first value>
JWT_SECRET_KEY=<second value>
```

Flask won't start without `JWT_SECRET_KEY` and tells you so. Keep these
secret: anyone who knows `JWT_SECRET_KEY` could create fake logins.

**4. Run the seed script.** It adds 22 foods (20 with recipes) and 14
restaurants, and creates the database indexes. Running it again resets the
foods and restaurants. Users, favorites and history are not touched.

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
| `users` | `name`, `email` (unique), `password_hash` (never the password), `created_at` | — |
| `favorites` | `user_id`, `food_id` **or** `restaurant_id`, `created_at` | User → Favorites is one-to-many; each favorite also points to one food or restaurant |
| `history` | `user_id`, the answers (`mood`, `preferences`, `choice`, `time`, `budget`, `dietary`), a copy of `recommended_foods`, `created_at` | User → History is one-to-many |

```
users ──< favorites >── foods / restaurants
users ──< history
foods ── recipe (inside the food)      restaurants >──< foods (food_ids list)
```

Foods and restaurants use simple numbers as their `_id` (instead of
MongoDB's long ObjectIds) so URLs stay short, e.g. `/recipe/1`. Users,
favorites and history use MongoDB's own ObjectIds.

**Indexes** (created by `seed.py` and when Flask starts): `users.email` is
unique, so no two accounts share an email. `(user_id, food_id,
restaurant_id)` in `favorites` is unique, so nobody can save the same thing
twice. `history.session_key` is unique, so the same session isn't saved
twice when two identical requests arrive at the same moment.

## API Routes

| Method | Route | Returns | Errors |
|---|---|---|---|
| GET | `/api/health` | `{"status": "ok"}` | — |
| GET | `/api/foods` | `{"foods": [...]}` | 500 |
| GET | `/api/foods/<id>` | `{"food": {...}}` | 404 `Food not found` |
| GET | `/api/foods/<id>/recipe` | `{"food": {...}, "recipe": {...}}` | 404 `Food not found` / `Recipe not found` |
| GET | `/api/foods/<id>/restaurants` | `{"food": {...}, "restaurants": [...]}` (may be empty) | 404 `Food not found` |
| GET | `/api/restaurants` | `{"restaurants": [...]}` | 500 |
| POST | `/api/recommendations` | `{"recommendations": [...], "savedToHistory": true/false}` (top 3) | 400 bad request |

**Stage 4 routes.** 🔒 = needs `Authorization: Bearer <token>`, otherwise
**401** `{"error": "Authentication required"}`.

| Method | Route | Body | Returns | Errors |
|---|---|---|---|---|
| POST | `/api/auth/register` | `{"name", "email", "password"}` | 201 `{"message": "Account created successfully"}` | 400 invalid input, 409 email taken |
| POST | `/api/auth/login` | `{"email", "password"}` | `{"message", "user", "token"}` | 401 `Incorrect email or password.` |
| GET 🔒 | `/api/auth/me` | — | `{"user"}` | 401 |
| GET 🔒 | `/api/profile` | — | `{"user", "favoritesCount", "historyCount"}` | 401 |
| PUT 🔒 | `/api/profile` | `{"name", "email"}` | same as GET | 400, 409 email taken |
| GET 🔒 | `/api/favorites` | — | `{"favorites": [...]}` newest first | 401 |
| POST 🔒 | `/api/favorites` | `{"food_id": 4}` or `{"restaurant_id": 2}` | 201 `{"message": "Saved to Favorites!", "favorite"}` | 400, 404, 409 `Already in Favorites.` |
| DELETE 🔒 | `/api/favorites/<id>` | — | `{"message": "Removed from Favorites."}` | 404 (also if it's someone else's) |
| GET 🔒 | `/api/history` | — | `{"history": [...]}` newest first (max 50) | 401 |
| DELETE 🔒 | `/api/history/<id>` | — | `{"message"}` | 404 |
| DELETE 🔒 | `/api/history` | — | `{"message", "deleted"}` | 401 |

To test a 🔒 route in Thunder Client or Postman: log in first, copy the
`token` from the response, then add a header `Authorization` with the
value `Bearer <token>`.

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

## How Login Works

1. **Register.** Flask checks the name, email and password, then saves
   `generate_password_hash(password)`, a one-way scrambled version of the
   password, never the password itself.
2. **Log in.** Flask finds the user by email and checks the password with
   `check_password_hash()`. If it matches, Flask returns a **JWT**: a token
   signed with `JWT_SECRET_KEY` that says "this is user X, valid for 7 days".
3. **Later requests.** React saves the token in localStorage
   (`moodbite_token`) and sends it as `Authorization: Bearer <token>`. The
   `@login_required` decorator checks the signature and expiry before the
   route runs.
4. **Refresh.** `AuthContext` calls `GET /api/auth/me` with the saved token
   to restore the login.
5. **Log out.** React deletes the token.

> **Learning-project note:** storing the token in localStorage is simple,
> but any JavaScript running on the page can read it. Production apps often
> put it in an **HTTP-only cookie**, which JavaScript can't read.

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
| 201 Created | A new record was saved | Registering, saving a favorite |
| 401 Unauthorized | Not logged in, or the token is invalid | Any 🔒 route without a valid token; wrong login |
| 400 Bad Request | The client sent something wrong | Missing mood, wrong data types, body isn't JSON |
| 404 Not Found | That thing doesn't exist | Unknown food id, no recipe, unknown route, someone else's favorite |
| 409 Conflict | Clashes with existing data | Email already registered, favorite already saved |
| 405 Method Not Allowed | Wrong HTTP method | e.g. GET on `/api/recommendations` |
| 500 Internal Server Error | The server failed | MongoDB can't be reached, or a bug |

## What's Next

- **Stage 5:** Real restaurant data via an API such as Google Places, plus a map.
- **Stage 6:** Free-text mood input ("I'm tired and only have $15") parsed
  by an NLP model.
