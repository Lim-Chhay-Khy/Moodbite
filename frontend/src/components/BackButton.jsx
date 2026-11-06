import React from 'react'
import { useNavigate } from 'react-router-dom'
import './BackButton.css'

// Goes to `to` if given, otherwise back one page in browser history.
export default function BackButton({ to, label = 'Back' }) {
  const navigate = useNavigate()

  return (
    <button type="button" className="back-button" onClick={() => (to ? navigate(to) : navigate(-1))}>
      ← {label}
    </button>
  )
}
