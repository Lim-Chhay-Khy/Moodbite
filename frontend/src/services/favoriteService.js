// ---------------------------------------------------------------------
// Favorites, saved in the browser's localStorage.
//
// Everything is stored under ONE key as a small object of id lists:
//
//   "moodbite-favorites" -> {
//     "foods":       ["chicken-fried-rice", "ramen"],
//     "recipes":     ["chicken-fried-rice"],
//     "restaurants": [1, 5]
//   }
//
// We only store ids, not whole objects. The Favorites page looks each id
// up in the data files, so if a food's description changes, saved
// favorites show the new version automatically.
//
// localStorage only holds strings, so we JSON.stringify when saving and
// JSON.parse when reading. Every component goes through these four
// functions — none of them touch localStorage directly.
//
// In Stage 4 (login), these functions can call the Flask API instead,
// and the components won't need to change.
// ---------------------------------------------------------------------

const STORAGE_KEY = 'moodbite-favorites'

export const FAVORITE_TYPES = ['foods', 'recipes', 'restaurants']

function emptyFavorites() {
  return { foods: [], recipes: [], restaurants: [] }
}

// Returns { foods: [...], recipes: [...], restaurants: [...] }.
// If nothing is saved yet, or the saved data is broken, start fresh
// instead of crashing the app.
export function getFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    const favorites = emptyFavorites()
    for (const type of FAVORITE_TYPES) {
      if (saved && Array.isArray(saved[type])) {
        favorites[type] = saved[type]
      }
    }
    return favorites
  } catch (error) {
    console.warn('Could not read favorites, starting with an empty list.', error)
    return emptyFavorites()
  }
}

function saveFavorites(favorites) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  } catch (error) {
    // e.g. storage is full or blocked in a private window
    console.warn('Could not save favorites.', error)
  }
}

function checkType(type) {
  if (!FAVORITE_TYPES.includes(type)) {
    throw new Error(`Unknown favorite type "${type}". Use one of: ${FAVORITE_TYPES.join(', ')}`)
  }
}

export function isFavorite(type, id) {
  checkType(type)
  return getFavorites()[type].includes(id)
}

export function addFavorite(type, id) {
  checkType(type)
  const favorites = getFavorites()
  if (!favorites[type].includes(id)) {
    favorites[type].push(id)
    saveFavorites(favorites)
  }
}

export function removeFavorite(type, id) {
  checkType(type)
  const favorites = getFavorites()
  favorites[type] = favorites[type].filter((savedId) => savedId !== id)
  saveFavorites(favorites)
}
