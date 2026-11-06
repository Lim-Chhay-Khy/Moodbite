import React from 'react'
import './FormField.css'

// A labelled input with an error message underneath.
// Used by the Login, Register and Edit Profile forms.
export default function FormField({ label, name, type = 'text', value, onChange, error, autoComplete }) {
  const errorId = `${name}-error`
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} className="form-field__error">
          {error}
        </p>
      )}
    </div>
  )
}
