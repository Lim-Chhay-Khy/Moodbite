import React from 'react'
import { DIETARY_OPTIONS } from '../data/options.js'
import './DietaryTags.css'

// Turns ids like ["vegan", "dairy-free"] into small labelled chips.
export default function DietaryTags({ tags = [] }) {
  const labels = tags
    .map((tag) => DIETARY_OPTIONS.find((option) => option.id === tag)?.label)
    .filter(Boolean)

  if (labels.length === 0) {
    return <p className="dietary-tags__none">No special dietary tags.</p>
  }

  return (
    <ul className="dietary-tags">
      {labels.map((label) => (
        <li key={label} className="dietary-tags__tag">
          {label}
        </li>
      ))}
    </ul>
  )
}
