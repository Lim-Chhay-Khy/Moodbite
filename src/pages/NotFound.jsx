import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import EmptyState from '../components/EmptyState.jsx'

// Shown for any URL that doesn't match a route, instead of a blank page.
export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="page">
      <EmptyState emoji="🧭" title="Page not found" message="That page doesn't exist.">
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </EmptyState>
    </div>
  )
}
