import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import './About.css'

export default function About() {
  const navigate = useNavigate()

  return (
    <div className="page fade-in about-page">
      <div className="page-header">
        <h1>About MoodBite</h1>
        <p>A small app that helps you answer “What should I eat today?”</p>
      </div>

      <section>
        <h2>How it works</h2>
        <p>
          You tell MoodBite how you feel, what you are craving, any dietary needs, whether you want
          to cook or eat out, and how much time and money you have. A rule-based scoring system then
          picks the three foods that fit you best and explains why.
        </p>
      </section>

      <section>
        <h2>What you can do</h2>
        <ul>
          <li>Open a step-by-step recipe for any dish you can cook at home.</li>
          <li>See sample restaurants that serve a dish.</li>
          <li>Create an account to save foods and restaurants to your Favorites.</li>
          <li>See your past recommendation sessions in your History.</li>
        </ul>
      </section>

      <section>
        <h2>Coming next</h2>
        <p>
          Real restaurant data with a map, and a free-text mood input.
        </p>
      </section>

      <div className="continue-row">
        <Button onClick={() => navigate('/mood')}>Find My Food</Button>
      </div>
    </div>
  )
}
