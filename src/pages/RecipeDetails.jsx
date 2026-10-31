import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BackButton from '../components/BackButton.jsx'
import Button from '../components/Button.jsx'
import DietaryTags from '../components/DietaryTags.jsx'
import EmptyState from '../components/EmptyState.jsx'
import FavoriteButton from '../components/FavoriteButton.jsx'
import FoodImage from '../components/FoodImage.jsx'
import RecipeStats from '../components/RecipeStats.jsx'
import { getFoodById } from '../data/foods.js'
import { getRecipeById } from '../data/recipes.js'
import './RecipeDetails.css'

// Route: /recipe/:id   (id is the food id, e.g. /recipe/chicken-fried-rice)
export default function RecipeDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const food = getFoodById(id)
  const recipe = getRecipeById(id)

  if (!food || !recipe) {
    return (
      <div className="page">
        <EmptyState
          emoji="🔍"
          title="Recipe not found."
          message={
            food
              ? `${food.name} is a restaurant-only dish, so we don't have a recipe for it.`
              : "We couldn't find a recipe with that link."
          }
        >
          {food?.availableAtRestaurant && (
            <Button onClick={() => navigate(`/restaurants/${food.id}`)}>Find a Restaurant</Button>
          )}
          <Button variant="outline" onClick={() => navigate('/recommendations')}>
            Back to Recommendations
          </Button>
        </EmptyState>
      </div>
    )
  }

  return (
    <div className="page fade-in recipe-page">
      <BackButton to="/recommendations" label="Back to Recommendations" />
      <FoodImage src={food.image} emoji={food.emoji} alt={food.name} size="large" />

      <header className="recipe-page__header">
        <div>
          <h1>{food.name}</h1>
          <p className="recipe-page__description">{food.description}</p>
        </div>
        <FavoriteButton type="recipes" id={food.id} label="Save to Favorites" />
      </header>

      <RecipeStats food={food} recipe={recipe} />

      <section className="recipe-page__section">
        <h2>Dietary information</h2>
        <DietaryTags tags={food.dietary} />
      </section>

      <div className="recipe-page__columns">
        <section className="recipe-page__section">
          <h2>Ingredients</h2>
          <ul className="recipe-page__ingredients">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
        </section>

        <section className="recipe-page__section">
          <h2>Instructions</h2>
          <ol className="recipe-page__steps">
            {recipe.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}
