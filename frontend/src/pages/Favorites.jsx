import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import FoodCard from '../components/FoodCard.jsx'
import LoadingMessage from '../components/LoadingMessage.jsx'
import RecipeCard from '../components/RecipeCard.jsx'
import RestaurantCard from '../components/RestaurantCard.jsx'
import useApi from '../hooks/useApi.js'
import { getAllRestaurants, getFoods } from '../services/apiService.js'
import { getFavorites, removeFavorite } from '../services/favoriteService.js'
import './Favorites.css'

// Route: /favorites
// Saved ids still live in localStorage (until login in Stage 4).
// The food and restaurant details come from the Flask API.
export default function Favorites() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState(getFavorites)
  const { data, loading, error, retry } = useApi(
    () => Promise.all([getFoods(), getAllRestaurants()]), // two requests at once
    [],
  )

  function handleRemove(type, id) {
    removeFavorite(type, id)
    setFavorites(getFavorites()) // re-read so the page updates right away
  }

  const emptyMessage = (
    <div className="page">
      <EmptyState
        emoji="♡"
        title="No favorites yet"
        message="Save foods, recipes, or restaurants and they will appear here."
      >
        <Button onClick={() => navigate('/mood')}>Discover Food</Button>
      </EmptyState>
    </div>
  )

  const nothingSaved =
    favorites.foods.length + favorites.recipes.length + favorites.restaurants.length === 0
  if (nothingSaved) return emptyMessage
  if (loading) return <LoadingMessage text="Loading your favorites..." />
  if (error) {
    return (
      <div className="page">
        <ErrorMessage title="Sorry, we couldn't load your favorites." error={error} onRetry={retry} />
      </div>
    )
  }

  // Turn saved ids into full objects. `.filter(Boolean)` skips ids that
  // don't exist in the database (for example, old Stage 2 ids).
  const [foods, restaurants] = data
  const findFood = (id) => foods.find((food) => food.id === id)
  const findRestaurant = (id) => restaurants.find((restaurant) => restaurant.id === id)

  const savedFoods = favorites.foods.map(findFood).filter(Boolean)
  const savedRecipes = favorites.recipes.map(findFood).filter((food) => food && food.canCook)
  const savedRestaurants = favorites.restaurants.map(findRestaurant).filter(Boolean)

  if (savedFoods.length + savedRecipes.length + savedRestaurants.length === 0) return emptyMessage

  return (
    <div className="page fade-in">
      <div className="page-header">
        <h1>Your Favorites</h1>
        <p>Saved on this device, so they stay after you refresh.</p>
      </div>

      <FavoriteSection title="Favorite Foods" count={savedFoods.length}>
        {savedFoods.map((food) => (
          <FoodCard key={food.id} food={food} onRemove={() => handleRemove('foods', food.id)} />
        ))}
      </FavoriteSection>

      <FavoriteSection title="Favorite Recipes" count={savedRecipes.length}>
        {savedRecipes.map((food) => (
          <RecipeCard key={food.id} food={food} onRemove={() => handleRemove('recipes', food.id)} />
        ))}
      </FavoriteSection>

      <FavoriteSection title="Favorite Restaurants" count={savedRestaurants.length}>
        {savedRestaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onRemove={() => handleRemove('restaurants', restaurant.id)}
          />
        ))}
      </FavoriteSection>
    </div>
  )
}

// Small helper used only on this page: a heading + a grid of cards,
// or a short message when that section is empty.
function FavoriteSection({ title, count, children }) {
  return (
    <section className="favorites-section">
      <h2>
        {title} <span className="favorites-section__count">({count})</span>
      </h2>
      {count === 0 ? (
        <p className="favorites-section__empty">Nothing saved here yet.</p>
      ) : (
        <div className="card-grid">{children}</div>
      )}
    </section>
  )
}
