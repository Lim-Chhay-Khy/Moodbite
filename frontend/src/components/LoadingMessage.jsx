import React from 'react'
import './LoadingMessage.css'

// Simple text shown while waiting for the Flask API.
export default function LoadingMessage({ text = 'Loading...' }) {
  return (
    <p className="loading-message" role="status">
      {text}
    </p>
  )
}
