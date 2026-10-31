import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BackButton from '../components/BackButton.jsx'
import Button from '../components/Button.jsx'
import EmptyState from '../components/EmptyState.jsx'
import RestaurantCard from '../components/RestaurantCard.jsx'
import { getFoodById } from '../data/foods.js'
import { getRestaurantsForFood } from '../data/restaurants.js'

// Route: /restaurants/:foodId
// Stage 2 uses sample data from data/restaurants.js.
// Stage 5 will swap in a real restaurant API.
export default function Restaurants() {
  const { foodId } = useParams()
  const navigate = useNavigate()
  const food = getFoodById(foodId)

  if (!food) {
    return (
      <div className="page">
        <EmptyState emoji="🔍" title="Food not found." message="We couldn't find that dish.">
          <Button onClick={() => navigate('/recommendations')}>Back to Recommendations</Button>
        </EmptyState>
      </div>
    )
  }

  const restaurants = getRestaurantsForFood(food.id)

  return (
    <div className="page fade-in">
      <BackButton to="/recommendations" label="Back to Recommendations" />
      <div className="page-header">
        <h1>Restaurants that serve {food.name}</h1>
        <p>Sample restaurants for now — real nearby places are coming in a later version.</p>
      </div>

      {restaurants.length === 0 ? (
        <EmptyState emoji="🍽" title="No restaurant suggestions are available yet for this food.">
          {food.canCook && (
            <Button variant="secondary" onClick={() => navigate(`/recipe/${food.id}`)}>
              Cook It Instead
            </Button>
          )}
        </EmptyState>
      ) : (
        <div className="card-grid">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  )
}
