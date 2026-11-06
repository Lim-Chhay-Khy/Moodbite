import React from 'react'
import { useNavigate } from 'react-router-dom'
import PreferenceSelector from '../components/PreferenceSelector.jsx'
import Button from '../components/Button.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { BUDGET_OPTIONS, COOK_OR_RESTAURANT, TIME_OPTIONS } from '../data/options.js'
import './CookOrRestaurant.css'

// Route: /choice
// Stage 2: picking a card no longer jumps straight to results — the user
// also answers time and budget, then presses "Show My Food".
export default function CookOrRestaurant() {
  const navigate = useNavigate()
  const { cookOrEat, setCookOrEat, timeLimit, setTimeLimit, budget, setBudget } = useAppContext()

  return (
    <div className="page fade-in">
      <div className="page-header">
        <span className="step-label">Step 3 of 3</span>
        <h1>What would you like to do?</h1>
      </div>

      <div className="cook-or-restaurant-grid">
        {COOK_OR_RESTAURANT.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={cookOrEat === option.id}
            className={`cook-or-restaurant-card${cookOrEat === option.id ? ' cook-or-restaurant-card--selected' : ''}`}
            onClick={() => setCookOrEat(option.id)}
          >
            <span className="cook-or-restaurant-card__emoji" aria-hidden="true">
              {option.emoji}
            </span>
            <span className="cook-or-restaurant-card__label">{option.label}</span>
            <span className="cook-or-restaurant-card__description">{option.description}</span>
          </button>
        ))}
      </div>

      <div className="choice-extra-questions">
        <PreferenceSelector
          title="How much time do you have?"
          options={TIME_OPTIONS}
          selected={timeLimit ? [timeLimit] : []}
          onToggle={setTimeLimit}
        />
        <PreferenceSelector
          title="What is your budget?"
          options={BUDGET_OPTIONS}
          selected={budget ? [budget] : []}
          onToggle={setBudget}
        />
      </div>

      <div className="continue-row">
        <Button disabled={!cookOrEat} onClick={() => navigate('/recommendations')}>
          Show My Food
        </Button>
      </div>
    </div>
  )
}
