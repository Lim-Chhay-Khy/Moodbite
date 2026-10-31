import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './Button.jsx'
import FoodImage from './FoodImage.jsx'
import FavoriteButton from './FavoriteButton.jsx'
import './RecipeCard.css'

// A compact recipe preview, used in the "Favorite Recipes" section.
//   food + recipe: matching objects from data/foods.js and data/recipes.js
//   onRemove:      optional — shows "Remove from Favorites" when given
export default function RecipeCard({ food, recipe, onRemove }) {
  const navigate = useNavigate()
  const totalTime = recipe.prepTime + recipe.cookTime

  return (
    <article className="card recipe-card">
      <FoodImage src={food.image} emoji={food.emoji} alt={food.name} />
      <div className="card__body">
        <h3 className="recipe-card__name">{food.name}</h3>
        <p className="recipe-card__meta">
          {totalTime} min · {food.difficulty} · {recipe.ingredients.length} ingredients
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
