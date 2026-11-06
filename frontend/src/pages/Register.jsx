import React, { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import FormField from '../components/FormField.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { friendlyError, validateRegister } from '../utils/validation.js'
import './Auth.css'

// Route: /register
export default function Register() {
  const { register, isAuthenticated } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // After a successful sign-up we're logged in, so go to Home.
  if (isAuthenticated) return <Navigate to="/" replace />

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const newErrors = validateRegister(form)
    setErrors(newErrors)
    setServerError('')
    if (Object.keys(newErrors).length > 0) return

    setSubmitting(true)
    try {
      await register(form.name, form.email, form.password)
    } catch (error) {
      // e.g. 409 "An account with this email already exists"
      setServerError(friendlyError(error))
      setSubmitting(false)
    }
  }

  return (
    <div className="page fade-in auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Create your account</h1>
        <p className="auth-card__subtitle">Save favorites and keep a history of your recommendations.</p>

        {serverError && (
          <p className="auth-card__error" role="alert">
            {serverError}
          </p>
        )}

        <FormField label="Full Name" name="name" autoComplete="name"
          value={form.name} onChange={handleChange} error={errors.name} />
        <FormField label="Email" name="email" type="email" autoComplete="email"
          value={form.email} onChange={handleChange} error={errors.email} />
        <FormField label="Password" name="password" type="password" autoComplete="new-password"
          value={form.password} onChange={handleChange} error={errors.password} />
        <FormField label="Confirm Password" name="confirmPassword" type="password" autoComplete="new-password"
          value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />

        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Creating your account...' : 'Create Account'}
        </Button>

        <p className="auth-card__switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  )
}
