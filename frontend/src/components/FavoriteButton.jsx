import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Button from './Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useFavorites } from '../context/FavoritesContext.jsx'
import './FavoriteButton.css'

// One button that saves / un-saves a food or restaurant for the
// logged-in user, with a short message underneath.
//   type: "food" | "restaurant"
//   id:   the food or restaurant id
export default function FavoriteButton({ type, id, label = 'Save' }) {
  const { isAuthenticated } = useAuth()
  const { findFavorite, saveFavorite, deleteFavorite } = useFavorites()
  const location = useLocation()
  const [message, setMessage] = useState(null) // { text, showLogin }
  const [busy, setBusy] = useState(false)

  const savedFavorite = findFavorite(type, id)

  // Hide the message after 3 seconds.
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [message])

  async function handleClick() {
    if (!isAuthenticated) {
      setMessage({ text: 'Please log in to save favorites.', showLogin: true })
      return
    }
    setBusy(true)
    try {
      const text = savedFavorite ? await deleteFavorite(savedFavorite.id) : await saveFavorite(type, id)
      setMessage({ text })
    } catch (error) {
      setMessage({ text: error.message }) // e.g. "Already in Favorites."
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="favorite-button">
      <Button
        variant={savedFavorite ? 'primary' : 'outline'}
        onClick={handleClick}
        disabled={busy}
        aria-pressed={Boolean(savedFavorite)}
      >
        {savedFavorite ? '♥ Saved' : `♡ ${label}`}
      </Button>
      {message && (
        <p className="favorite-button__message" role="status">
          {message.text}{' '}
          {message.showLogin && (
            <Link to="/login" state={{ from: location.pathname }}>
              Log in
            </Link>
          )}
        </p>
      )}
    </div>
  )
}
