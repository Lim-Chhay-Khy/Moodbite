import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()
  const { resetSelections, setSurpriseMe } = useAppContext()

  function handleFindMyFood() {
    resetSelections()
    navigate('/mood')
  }

  function handleSurpriseMe() {
    resetSelections()
    setSurpriseMe(true)
    navigate('/recommendations')
  }

  return (
    <div className="home">
      <div className="home__hero fade-in">
        <span className="home__eyebrow">🍲</span>
        <h1 className="home__heading">What do you feel like eating today?</h1>
        <p className="home__subtitle">
          Tell us how you feel and MoodBite will help you decide.
        </p>
        <div className="home__actions">
          <Button onClick={handleFindMyFood}>Find My Food</Button>
          <Button variant="outline" onClick={handleSurpriseMe}>
            Surprise Me
          </Button>
        </div>
      </div>
    </div>
  )
}
