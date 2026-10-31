# MoodBite 

A food recommendation web app that answers "What should I eat today?" based
on your mood, cravings, dietary needs, whether you want to cook or eat out,
and how much time and money you have.

**Stage 2** makes the results useful: recipe pages, restaurant suggestions,
a working Favorites system, natural-language explanations, and extra
questions (time, budget, dietary). It is still a React-only app — sample
data + `localStorage`. No backend, login, AI, or external APIs yet.

## How to run it

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).
`npm run build` checks that everything compiles.

## App flow and routes

```
/  (Home)
 ├─ "Find My Food" → /mood → /preferences → /choice → /recommendations
 └─ "Surprise Me"  ───────────────────────────────→ /recommendations

/recommendations
 ├─ Cook            → /recipe/:id            (e.g. /recipe/chicken-fried-rice)
 ├─ Find Restaurant → /restaurants/:foodId   (e.g. /restaurants/ramen)
 └─ Save            → stored in localStorage → /favorites

/favorites   /about   * (Page not found)
```

| Page file | Route | Asks / shows |
|---|---|---|
| `MoodSelect.jsx` | `/mood` | Mood |
| `PreferenceSelect.jsx` | `/preferences` | Cravings + dietary preferences |
| `CookOrRestaurant.jsx` | `/choice` | Cook / restaurant / either + time + budget |
| `Results.jsx` | `/recommendations` | Top 3 foods with "Why we recommend this" |
| `RecipeDetails.jsx` | `/recipe/:id` | Full recipe |
| `Restaurants.jsx` | `/restaurants/:foodId` | Restaurant cards |
| `Favorites.jsx` | `/favorites` | Saved foods, recipes, restaurants |
| `About.jsx` | `/about` | About the app |

The Stage 1 URLs `/cook-or-restaurant` and `/results` redirect to the new ones.

## Folder structure

```
src/
├── main.jsx, App.jsx, index.css     # entry, routes, shared styles (.card, .card-grid)
├── context/AppContext.jsx           # all of the user's answers
├── data/
│   ├── options.js                   # question options (moods, cravings, time, budget, dietary)
│   ├── foods.js                     # 22 foods + getFoodById()
│   ├── recipes.js                   # 20 recipes + getRecipeById()
│   └── restaurants.js               # 14 sample restaurants + getRestaurantsForFood()
├── services/
│   ├── recommend.js                 # filtering + scoring → top 3 foods
│   ├── explanation.js               # builds the "Why we recommend this" text
│   └── favoriteService.js           # addFavorite / removeFavorite / isFavorite / getFavorites
├── components/
│   ├── Navbar, Button, MoodCard, PreferenceCard        (Stage 1)
│   ├── FoodCard                                        (Stage 1, upgraded)
│   ├── RecipeCard, RestaurantCard, FavoriteButton,
│   │   PreferenceSelector, RecommendationReason,
│   │   BackButton, FoodImage, DietaryTags,
│   │   RecipeStats, EmptyState                         (Stage 2)
└── pages/  (see table above)
```

Each component/page keeps its own `.css` file next to it.

## How recommendations work (`services/recommend.js`)

**Step 1 — remove foods that can't work (hard filters):**

- A food must be safe for **every** dietary restriction picked.
  `food.dietary` lists what a dish is safe for, e.g. `['vegan', 'dairy-free']`,
  so the check is `restrictions.every(r => food.dietary.includes(r))`.
- Cook at Home → remove foods with `canCook: false` (restaurant-only).
- Find a Restaurant → remove foods with `availableAtRestaurant: false`.

**Step 2 — score what's left:**

| Rule | Points |
|---|---|
| Mood matches | +3 |
| Each matching craving | +3 |
| Fits cook / restaurant choice ("Either" rewards foods offering both) | +2 |
| Fits time limit (total cooking time ≤ limit; eating out always fits) | +2 |
| Fits budget (`"$".length <= "$$".length`) | +1 |
| Fits dietary preferences (always true after Step 1) | +3 |

**Step 3 —** sort highest first and return the top 3. If none of them is a
"perfect match" (right mood + a matching craving + within time + within
budget), the page says these are the *closest* matches. If Step 1 removed
every food, the page explains why and links back to change answers.

"Surprise Me" (or opening `/recommendations` without answering) shows
popular picks instead.

## How Favorites work (`services/favoriteService.js`)

Everything is stored under one `localStorage` key, as id lists:

```json
"moodbite-favorites": { "foods": ["ramen"], "recipes": ["ramen"], "restaurants": [2] }
```

- Components only ever call `addFavorite(type, id)`, `removeFavorite(type, id)`,
  `isFavorite(type, id)`, and `getFavorites()`.
- `FavoriteButton` asks `isFavorite()` when it first renders, which is why
  it still shows "♥ Saved" after a refresh.
- The Favorites page looks ids up in the data files, so saved items always
  show the latest data. Broken or missing storage falls back to an empty list.

## Images

Every food and restaurant has an `image` field (currently `null`). The
`FoodImage` component shows the photo when there is one and falls back to
the emoji if it's missing or fails to load. To add photos, put files in
`public/images/` and set e.g. `image: '/images/ramen.jpg'`.

## What's next

- **Stage 3:** Python Flask backend + REST API; move foods, recipes, and
  restaurants into a database (Users, Foods, Recipes, Restaurants, Favorites).
- **Stage 4:** Registration/login, per-user favorites and history.
- **Stage 5:** Real restaurant data via an API such as Google Places, plus a map.
- **Stage 6:** Free-text mood input ("I'm tired and only have $15") parsed
  by an NLP model, feeding the same `getRecommendations()` input shape.
