import { TIME_OPTIONS } from '../data/options.js'

// ---------------------------------------------------------------------
// Every call to the Flask backend lives in this file, so components never
// call fetch() themselves. If the API address or format changes, this is
// the only file to update.
//
// The address comes from frontend/.env (VITE_API_URL) if it exists,
// otherwise it defaults to the local Flask server.
// ---------------------------------------------------------------------
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Sends one request and returns the JSON body.
// If anything goes wrong it throws an Error with:
//   error.message  a friendly message we can show on the page
//   error.status   the HTTP status code (404, 500...), or 0 if the
//                  server couldn't be reached at all
async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, options)
  } catch {
    // fetch() only throws when there is no response at all
    // (Flask not running, wrong address, no internet...).
    const error = new Error("Can't reach the MoodBite server. Make sure the Flask backend is running.")
    error.status = 0
    throw error
  }

  // If the body isn't valid JSON, use an empty object instead of crashing.
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.message || data.error || 'Something went wrong on the server.')
    error.status = response.status
    throw error
  }
  return data
}

// GET /api/foods  ->  [food, food, ...]
export async function getFoods() {
  const data = await request('/foods')
  return data.foods
}

// GET /api/foods/:id  ->  food
export async function getFoodById(id) {
  const data = await request(`/foods/${id}`)
  return data.food
}

// GET /api/foods/:id/recipe  ->  { food, recipe }
export function getRecipe(id) {
  return request(`/foods/${id}/recipe`)
}

// GET /api/foods/:id/restaurants  ->  { food, restaurants }
export function getRestaurants(id) {
  return request(`/foods/${id}/restaurants`)
}

// GET /api/restaurants  ->  [restaurant, ...]   (used by Favorites)
export async function getAllRestaurants() {
  const data = await request('/restaurants')
  return data.restaurants
}

// POST /api/recommendations  ->  [food, food, food]
// Turns the answers stored in AppContext into the JSON body Flask expects.
export async function getRecommendations(answers) {
  const { mood, preferences, cookOrEat, timeLimit, budget, dietary, surpriseMe } = answers

  // "Surprise Me", or the user opened the page without answering.
  const body =
    surpriseMe || !mood
      ? { surprise: true }
      : {
          mood,
          preferences,
          choice: cookOrEat || 'either',
          // Send the number of minutes (e.g. 30), or null for "no limit".
          time: TIME_OPTIONS.find((option) => option.id === timeLimit)?.maxMinutes ?? null,
          budget: budget || 'any',
          dietary,
        }

  const data = await request('/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return data.recommendations
}
