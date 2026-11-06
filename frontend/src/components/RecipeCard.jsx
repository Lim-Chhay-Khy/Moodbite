import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './Button.jsx'
import FoodImage from './FoodImage.jsx'
import FavoriteButton from './FavoriteButton.jsx'
import './RecipeCard.css'

// A compact recipe preview, used in the "Favorite Recipes" section.
// The full recipe loads when the user opens /recipe/:id.
//   food:     a food object from the API
//   onRemove: optional — shows "Remove from Favorites" when given
export default function RecipeCard({ food, onRemove }) {
  const navigate = useNavigate()

  return (
    <article className="card recipe-card">
      <FoodImage src={food.imageUrl} emoji={food.emoji} alt={food.name} />
      <div className="card__body">
        <h3 className="recipe-card__name">{food.name}</h3>
        <p className="recipe-card__meta">
          {food.cookingTime} min · {food.difficulty} · {food.cuisine}
        </p>
        <div className="card__actions">
          <Button variant="secondary" onClick={() => navigate(`/recipe/${food.id}`)}>
            View Recipe
          </Button>
          {onRemove ? (
            <Button variant="outline" onClick={onRemove}>
              Remove from Favorites
            </Button>
          ) : (
            <FavoriteButton type="recipes" id={food.id} />
          )}
        </div>
      </div>
    </article>
  )
}
