import React from 'react'
import Button from './Button.jsx'
import EmptyState from './EmptyState.jsx'

// Friendly message shown when an API call fails, with a "Try Again" button.
//   title:   what failed, in plain words
//   error:   the Error thrown by apiService (its message explains why)
//   onRetry: usually the retry() function from useApi
export default function ErrorMessage({ title, error, onRetry }) {
  return (
    <EmptyState emoji="⚠️" title={title} message={error?.message}>
      {onRetry && <Button onClick={onRetry}>Try Again</Button>}
    </EmptyState>
  )
}
