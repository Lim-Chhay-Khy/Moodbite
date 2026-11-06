import React, { useState } from 'react'
import Button from './Button.jsx'
import { addFavorite, isFavorite, removeFavorite } from '../services/favoriteService.js'

// One button that saves / un-saves anything.
//   type: "foods" | "recipes" | "restaurants"
//   id:   the item's id
// It starts by asking favoriteService whether the item is already saved,
// so the button shows the right state even after a page refresh.
export default function FavoriteButton({ type, id, label = 'Save' }) {
  const [saved, setSaved] = useState(() => isFavorite(type, id))

  function handleClick() {
    if (saved) {
      removeFavorite(type, id)
    } else {
      addFavorite(type, id)
    }
    setSaved(!saved)
  }

  return (
    <Button variant={saved ? 'primary' : 'outline'} onClick={handleClick} aria-pressed={saved}>
      {saved ? '♥ Saved' : `♡ ${label}`}
    </Button>
  )
}
