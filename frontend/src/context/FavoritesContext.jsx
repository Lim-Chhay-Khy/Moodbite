import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import {
  addFavorite as apiAddFavorite,
  getFavorites as apiGetFavorites,
  removeFavorite as apiRemoveFavorite,
} from '../services/apiService.js'

// ---------------------------------------------------------------------
// The logged-in user's favorites, loaded once from Flask and shared, so
// every Save button on the page knows whether its item is already saved.
//
// Stage 2-3 saved favorites in localStorage (only on one browser).
// Now they're saved in MongoDB under the user's id, so they follow the
// user to any device.
//
//   type is "food" or "restaurant"
// ---------------------------------------------------------------------
const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadFavorites = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setFavorites(await apiGetFavorites())
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load when someone logs in; clear when they log out.
  useEffect(() => {
    if (user) {
      loadFavorites()
    } else {
      setFavorites([])
    }
  }, [user?.id, loadFavorites])

  // Returns the saved favorite for this food/restaurant, or undefined.
  function findFavorite(type, id) {
    return favorites.find((favorite) =>
      type === 'food' ? favorite.foodId === id : favorite.restaurantId === id,
    )
  }

  // Returns the server's message ("Saved to Favorites!") or throws.
  async function saveFavorite(type, id) {
    try {
      const data = await apiAddFavorite(type === 'food' ? { foodId: id } : { restaurantId: id })
      return data.message
    } finally {
      await loadFavorites() // refresh the list, even after "Already in Favorites."
    }
  }

  // Returns the server's message ("Removed from Favorites.") or throws.
  async function deleteFavorite(favoriteId) {
    const data = await apiRemoveFavorite(favoriteId)
    setFavorites((list) => list.filter((favorite) => favorite.id !== favoriteId))
    return data.message
  }

  const value = { favorites, loading, error, loadFavorites, findFavorite, saveFavorite, deleteFavorite }
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used inside a <FavoritesProvider>')
  }
  return context
}
