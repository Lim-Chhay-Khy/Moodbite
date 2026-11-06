import React, { useState } from 'react'
import Button from './Button.jsx'
import './LocationBar.css'

// Shows where we're searching, and lets the user type a city instead.
//   statusText:     e.g. "Showing restaurants near you"
//   onSearchCity:   called with the city the user typed
//   onUseLocation:  asks the browser for the user's location again
//   busy:           true while a search is running
export default function LocationBar({ statusText, onSearchCity, onUseLocation, busy }) {
  const [city, setCity] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (city.trim()) onSearchCity(city.trim())
  }

  return (
    <div className="location-bar">
      <p className="location-bar__status">📍 {statusText}</p>
      <form className="location-bar__form" onSubmit={handleSubmit}>
        <label htmlFor="city" className="location-bar__label">
          Search a city or area
        </label>
        <input
          id="city"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="e.g. Toronto, ON"
          maxLength={100}
        />
        <Button type="submit" variant="secondary" disabled={busy || !city.trim()}>
          Search
        </Button>
        <Button variant="outline" onClick={onUseLocation} disabled={busy}>
          Use My Location
        </Button>
      </form>
    </div>
  )
}
