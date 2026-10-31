import React from 'react'
import './RecipeStats.css'

// The row of quick facts at the top of the recipe page.
export default function RecipeStats({ food, recipe }) {
  const stats = [
    { label: 'Cuisine', value: food.cuisine },
    { label: 'Prep Time', value: `${recipe.prepTime} min` },
    { label: 'Cooking Time', value: recipe.cookTime === 0 ? 'No cooking' : `${recipe.cookTime} min` },
    { label: 'Total Time', value: `${recipe.prepTime + recipe.cookTime} min` },
    { label: 'Difficulty', value: food.difficulty },
    { label: 'Estimated Cost', value: food.priceLevel },
    { label: 'Servings', value: recipe.servings },
  ]

  return (
    <dl className="recipe-stats">
      {stats.map((stat) => (
        <div key={stat.label} className="recipe-stats__item">
          <dt>{stat.label}</dt>
          <dd>{stat.value}</dd>
        </div>
      ))}
    </dl>
  )
}
