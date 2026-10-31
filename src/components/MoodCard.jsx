import React from 'react'
import './MoodCard.css'

export default function MoodCard({ mood, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`mood-card${selected ? ' mood-card--selected' : ''}`}
      onClick={() => onSelect(mood.id)}
      aria-pressed={selected}
    >
      <span className="mood-card__emoji" aria-hidden="true">
        {mood.emoji}
      </span>
      <span className="mood-card__label">{mood.label}</span>
    </button>
  )
}
