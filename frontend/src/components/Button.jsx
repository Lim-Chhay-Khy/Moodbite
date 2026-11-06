import React from 'react'
import './Button.css'

// variant: "primary" | "secondary" | "outline"
// Any extra props (title, aria-pressed, aria-label...) are passed straight
// through to the <button> via ...rest.
export default function Button({
  children,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = false,
  ...rest
}) {
  return (
    <button
      type={type}
      className={`btn btn--${variant}${fullWidth ? ' btn--full' : ''}`}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}
