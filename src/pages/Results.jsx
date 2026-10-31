import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import FoodCard from '../components/FoodCard.jsx'
import Button from '../components/Button.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { getRecommendations } from '../services/recommend.js'
import './Results.css'

// Route: /recommendations
export default function Results() {
  const navigate = useNavigate()
  const { mood, preferences, cookOrEat, timeLimit, budget, dietary, surpriseMe, resetSelections } =
    useAppContext()

  // useMemo so we only recompute when the user's answers actually change.
  const recommendations = useMemo(
    () => getRecommendations({ mood, preferences, cookOrEat, timeLimit, budget, dietary, surpriseMe }),
    [mood, preferences, cookOrEat, timeLimit, budget, dietary, surpriseMe],
  )

  const answeredQuestions = Boolean(mood) && !surpriseMe
  const hasPerfectMatch = recommendations.some((food) => food.isPerfectMatch)

  function handleStartOver() {
    resetSelections()
    navigate('/')
  }

  return (
    <div className="page fade-in">
      <div className="page-header">
        <h1>{answeredQuestions ? 'Here is what MoodBite recommends' : 'Here are a few ideas'}</h1>
        <p>
          {answeredQuestions
            ? 'Based on how you feel, what you are craving, and your time and budget.'
            : 'A mix of popular picks since you skipped the questions.'}
        </p>
      </div>

      {answeredQuestions && recommendations.length > 0 && !hasPerfectMatch && (
        <p className="notice">
          Nothing matched every answer perfectly, so here are the closest matches.
        </p>
      )}

      {recommendations.length === 0 ? (
        <EmptyState
          emoji="🥲"
          title="No foods fit all of your choices"
          message="Your dietary preferences and cook / restaurant choice removed every food. Try changing one of them."
        >
          <Button onClick={() => navigate('/preferences')}>Change Preferences</Button>
          <Button variant="outline" onClick={() => navigate('/choice')}>
            Change Cook / Restaurant
          </Button>
        </EmptyState>
      ) : (
        <div className="card-grid">
          {recommendations.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      )}

      <div className="continue-row">
        <Button variant="outline" onClick={handleStartOver}>
          Start Over
        </Button>
      </div>
    </div>
  )
}
