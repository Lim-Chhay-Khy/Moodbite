import React, { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import Button from '../components/Button.jsx'
import FormField from '../components/FormField.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { friendlyError, validateLogin } from '../utils/validation.js'
import './Auth.css'

// Route: /login
export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const location = useLocation()
  // If ProtectedRoute sent us here, go back to that page after login.
  const redirectTo = location.state?.from || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Already logged in (or just logged in)? Move on.
  if (isAuthenticated) return <Navigate to={redirectTo} replace />

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    const newErrors = validateLogin(form)
    setErrors(newErrors)
    setServerError('')
    if (Object.keys(newErrors).length > 0) return

    setSubmitting(true)
    try {
      await login(form.email, form.password)
    } catch (error) {
      // 401 = wrong email or password. We don't say which, on purpose.
      setServerError(error.status === 401 ? 'Incorrect email or password.' : friendlyError(error))
      setSubmitting(false)
    }
  }

  return (
    <div className="page fade-in auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Welcome back</h1>
        <p className="auth-card__subtitle">Log in to see your favorites and history.</p>

        {serverError && (
          <p className="auth-card__error" role="alert">
            {serverError}
          </p>
        )}

        <FormField label="Email" name="email" type="email" autoComplete="email"
          value={form.email} onChange={handleChange} error={errors.email} />
        <FormField label="Password" name="password" type="password" autoComplete="current-password"
          value={form.password} onChange={handleChange} error={errors.password} />

        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Logging in...' : 'Log In'}
        </Button>

        <p className="auth-card__switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </div>
  )
}
