import React from 'react'
import './EmptyState.css'

// A friendly message box for "nothing here" and "not found" situations.
// Anything passed as children (usually buttons) is shown underneath.
export default function EmptyState({ emoji = '🍽', title, message, children }) {
  return (
    <div className="empty-state fade-in">
      <span className="empty-state__emoji" aria-hidden="true">
        {emoji}
      </span>
      <h2>{title}</h2>
      {message && <p>{message}</p>}
      {children && <div className="empty-state__actions">{children}</div>}
    </div>
  )
}
