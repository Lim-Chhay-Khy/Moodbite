import React from 'react'
import { useNavigate } from 'react-router-dom'
import MoodCard from '../components/MoodCard.jsx'
import Button from '../components/Button.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { MOODS } from '../data/options.js'
import './MoodSelect.css'

export default function MoodSelect() {
  const navigate = useNavigate()
  const { mood, setMood } = useAppContext()

  return (
    <div className="page fade-in">
      <div className="page-header">
        <span className="step-label">Step 1 of 3</span>
        <h1>How are you feeling today?</h1>
        <p>Pick the mood that's closest to how you feel right now.</p>
      </div>

      <div className="mood-grid">
        {MOODS.map((item) => (
          <MoodCard key={item.id} mood={item} selected={mood === item.id} onSelect={setMood} />
        ))}
      </div>

      <div className="continue-row">
        <Button disabled={!mood} onClick={() => navigate('/preferences')}>
          Continue
        </Button>
      </div>
    </div>
  )
}
