import React from 'react'
import Button from './Button.jsx'
import FoodImage from './FoodImage.jsx'
import FavoriteButton from './FavoriteButton.jsx'
import './RestaurantCard.css'

const SERVICES = [
  { key: 'dineIn', label: 'Dine-in' },
  { key: 'takeout', label: 'Takeout' },
  { key: 'delivery', label: 'Delivery' },
]

// One restaurant object from the Flask API.
//   onRemove: optional — shows "Remove from Favorites" when given
export default function RestaurantCard({ restaurant, onRemove }) {
  return (
    <article className="card restaurant-card">
      <FoodImage src={restaurant.imageUrl} emoji={restaurant.emoji} alt={restaurant.name} />
      <div className="card__body">
        <div className="restaurant-card__top">
          <h3 className="restaurant-card__name">{restaurant.name}</h3>
          <span className="restaurant-card__rating" aria-label={`Rated ${restaurant.rating} out of 5`}>
            ★ {restaurant.rating}
          </span>
        </div>
        <p className="restaurant-card__subtitle">
          {restaurant.cuisine} · {restaurant.priceLevel} · {restaurant.distance} km away
        </p>

        <ul className="restaurant-card__details">
          <li>📍 {restaurant.address}</li>
          <li>🕒 {restaurant.openingHours}</li>
        </ul>

        <ul className="restaurant-card__services">
          {SERVICES.map((service) => (
            <li
              key={service.key}
              className={restaurant[service.key] ? 'is-available' : 'is-unavailable'}
            >
              {restaurant[service.key] ? '✓' : '✕'} {service.label}
            </li>
          ))}
        </ul>

        <div className="card__actions">
          {onRemove ? (
            <Button variant="outline" onClick={onRemove}>
              Remove from Favorites
            </Button>
          ) : (
            <FavoriteButton type="restaurants" id={restaurant.id} label="Save Favorite" />
          )}
        </div>
      </div>
    </article>
  )
}
