import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import EmptyState from '../components/EmptyState.jsx'
import FoodCard from '../components/FoodCard.jsx'
import RecipeCard from '../components/RecipeCard.jsx'
import RestaurantCard from '../components/RestaurantCard.jsx'
import { getFoodById } from '../data/foods.js'
import { getRecipeById } from '../data/recipes.js'
import { getRestaurantById } from '../data/restaurants.js'
import { getFavorites, removeFavorite } from '../services/favoriteService.js'
import './Favorites.css'

// Route: /favorites
// favoriteService gives us saved ids; we look each id up in the data
// files. `.filter(Boolean)` skips any id that no longer exists in the data.
export default function Favorites() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState(getFavorites)

  function handleRemove(type, id) {
    removeFavorite(type, id)
    setFavorites(getFavorites()) // re-read so the page updates right away
  }

  const savedFoods = favorites.foods.map(getFoodById).filter(Boolean)
  const savedRecipes = favorites.recipes.filter((id) => getFoodById(id) && getRecipeById(id))
  const savedRestaurants = favorites.restaurants.map(getRestaurantById).filter(Boolean)

  const isEmpty = savedFoods.length + savedRecipes.length + savedRestaurants.length === 0

  if (isEmpty) {
    return (
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
  }

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
        {savedRecipes.map((id) => (
          <RecipeCard
            key={id}
            food={getFoodById(id)}
            recipe={getRecipeById(id)}
            onRemove={() => handleRemove('recipes', id)}
          />
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
