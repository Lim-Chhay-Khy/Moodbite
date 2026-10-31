import React from 'react'
import './PreferenceCard.css'

export default function PreferenceCard({ preference, selected, onToggle }) {
  return (
    <button
      type="button"
      className={`preference-card${selected ? ' preference-card--selected' : ''}`}
      onClick={() => onToggle(preference.id)}
      aria-pressed={selected}
    >
      {preference.label}
    </button>
  )
}
