import React from 'react'
import './RecommendationReason.css'

// The "Why we recommend this" box on each food card.
// The text itself is generated in services/explanation.js.
export default function RecommendationReason({ reason }) {
  if (!reason) return null
  return (
    <div className="recommendation-reason">
      <p className="recommendation-reason__title">Why we recommend this:</p>
      <p>{reason}</p>
    </div>
  )
}
