import React from 'react'
import { useNavigate } from 'react-router-dom'
import PreferenceSelector from '../components/PreferenceSelector.jsx'
import Button from '../components/Button.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { DIETARY_OPTIONS, PREFERENCES } from '../data/options.js'
import './PreferenceSelect.css'

export default function PreferenceSelect() {
  const navigate = useNavigate()
  const { preferences, togglePreference, dietary, toggleDietary } = useAppContext()

  return (
    <div className="page fade-in">
      <div className="page-header">
        <span className="step-label">Step 2 of 3</span>
        <h1>What are you craving?</h1>
        <p>Pick as many as you like.</p>
      </div>

      <PreferenceSelector
        title="Cravings"
        options={PREFERENCES}
        selected={preferences}
        onToggle={togglePreference}
      />

      <PreferenceSelector
        title="Do you have any dietary preferences?"
        hint="Foods that don't fit these are removed completely. Pick one or more."
        options={DIETARY_OPTIONS}
        selected={dietary}
        onToggle={toggleDietary}
      />

      <div className="continue-row">
        <Button onClick={() => navigate('/choice')}>Continue</Button>
      </div>
    </div>
  )
}
