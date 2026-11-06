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

// "Open now" / "Closed now" for Google restaurants, or the hours text for samples.
function hoursText(restaurant) {
  if (restaurant.openNow === true) return 'Open now'
  if (restaurant.openNow === false) return 'Closed now'
  return restaurant.openingHours
}

// One restaurant from the Flask API: a sample one, or a real one from
// Google (source: "google"). Both come in the same shape, but Google may
// not know every detail, so anything missing (null) is simply not shown.
//   number:   optional — matches the pin number on the map
//   onRemove: optional — shows "Remove Favorite" when given
export default function RestaurantCard({ restaurant, number, onRemove }) {
  const isGoogle = Boolean(restaurant.placeId)
  const subtitle = [
    restaurant.cuisine,
    restaurant.priceLevel,
    restaurant.distance != null ? `${restaurant.distance} km away` : null,
  ].filter(Boolean)
  const services = SERVICES.filter((service) => typeof restaurant[service.key] === 'boolean')
  const hours = hoursText(restaurant)

  return (
    <article className="card restaurant-card">
      <FoodImage src={restaurant.imageUrl} emoji={restaurant.emoji} alt={restaurant.name} />
      <div className="card__body">
        <div className="restaurant-card__top">
          <h3 className="restaurant-card__name">
            {number && <span className="restaurant-card__number">{number}</span>}
            {restaurant.name}
          </h3>
          {restaurant.rating != null && (
            <span className="restaurant-card__rating" aria-label={`Rated ${restaurant.rating} out of 5`}>
              ★ {restaurant.rating}
              {restaurant.ratingCount != null && (
                <span className="restaurant-card__count"> ({restaurant.ratingCount.toLocaleString()})</span>
              )}
            </span>
          )}
        </div>
        {subtitle.length > 0 && <p className="restaurant-card__subtitle">{subtitle.join(' · ')}</p>}

        <ul className="restaurant-card__details">
          {restaurant.address && <li>📍 {restaurant.address}</li>}
          {hours && (
            <li className={restaurant.openNow === false ? 'is-closed' : undefined}>🕒 {hours}</li>
          )}
        </ul>

        {services.length > 0 && (
          <ul className="restaurant-card__services">
            {services.map((service) => (
              <li key={service.key} className={restaurant[service.key] ? 'is-available' : 'is-unavailable'}>
                {restaurant[service.key] ? '✓' : '✕'} {service.label}
              </li>
            ))}
          </ul>
        )}

        <div className="card__actions">
          {restaurant.googleMapsUrl && (
            <a className="btn btn--secondary" href={restaurant.googleMapsUrl} target="_blank" rel="noopener noreferrer">
              View on Google Maps
            </a>
          )}
          {onRemove ? (
            <Button variant="outline" onClick={onRemove}>
              Remove Favorite
            </Button>
          ) : (
            <FavoriteButton
              type={isGoogle ? 'place' : 'restaurant'}
              id={isGoogle ? restaurant.placeId : restaurant.id}
              label="Save Favorite"
            />
          )}
        </div>
      </div>
    </article>
  )
}
