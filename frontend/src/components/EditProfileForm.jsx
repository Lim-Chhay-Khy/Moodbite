import React, { useState } from 'react'
import Button from './Button.jsx'
import FormField from './FormField.jsx'
import { updateProfile } from '../services/apiService.js'
import { friendlyError, validateProfile } from '../utils/validation.js'

// The small form on the Profile page for changing name and email.
//   user:     the current user ({ name, email })
//   onSaved:  called with the new profile data from Flask
//   onCancel: closes the form
export default function EditProfileForm({ user, onSaved, onCancel }) {
  const [form, setForm] = useState({ name: user.name, email: user.email })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const newErrors = validateProfile(form)
    setErrors(newErrors)
    setServerError('')
    if (Object.keys(newErrors).length > 0) return

    setSaving(true)
    try {
      onSaved(await updateProfile(form)) // PUT /api/profile
    } catch (error) {
      setServerError(friendlyError(error))
      setSaving(false)
    }
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit} noValidate>
      {serverError && (
        <p className="auth-card__error" role="alert">
          {serverError}
        </p>
      )}
      <FormField label="Full Name" name="name" autoComplete="name"
        value={form.name} onChange={handleChange} error={errors.name} />
      <FormField label="Email" name="email" type="email" autoComplete="email"
        value={form.email} onChange={handleChange} error={errors.email} />
      <div className="profile-form__actions">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
