import React from 'react'
import PreferenceCard from './PreferenceCard.jsx'
import './PreferenceSelector.css'

// A titled group of pill buttons. Used for every question that is a list
// of options: cravings, dietary, time, and budget.
//
//   options:  [{ id, label }]
//   selected: array of selected ids (for single-choice questions, pass
//             [currentValue])
//   onToggle: called with the clicked option's id
export default function PreferenceSelector({ title, hint, options, selected, onToggle }) {
  return (
    <section className="preference-selector">
      <h2 className="preference-selector__title">{title}</h2>
      {hint && <p className="preference-selector__hint">{hint}</p>}
      <div className="preference-selector__options">
        {options.map((option) => (
          <PreferenceCard
            key={option.id}
            preference={option}
            selected={selected.includes(option.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </section>
  )
}
