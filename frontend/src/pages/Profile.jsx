import React, { useState } from 'react'
import Button from '../components/Button.jsx'
import EditProfileForm from '../components/EditProfileForm.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import LoadingMessage from '../components/LoadingMessage.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import useApi from '../hooks/useApi.js'
import { getProfile } from '../services/apiService.js'
import './Auth.css'
import './Profile.css'

// Route: /profile  (login required)
// Data comes from GET /api/profile.
export default function Profile() {
  const { updateUser } = useAuth()
  const { data, loading, error, retry } = useApi(getProfile, [])
  const [updated, setUpdated] = useState(null) // profile after an edit
  const [editing, setEditing] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

  if (loading) return <LoadingMessage text="Loading your profile..." />
  if (error) {
    return (
      <div className="page">
        <ErrorMessage title="Sorry, we couldn't load your profile." error={error} onRetry={retry} />
      </div>
    )
  }

  const profile = updated || data
  const { user, favoritesCount, historyCount } = profile
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  function handleSaved(newProfile) {
    setUpdated(newProfile)
    updateUser(newProfile.user) // so the rest of the app sees the new name
    setEditing(false)
    setSavedMessage('Profile updated.')
  }

  return (
    <div className="page fade-in profile-page">
      <div className="auth-card">
        <div className="profile-page__avatar" aria-hidden="true">
          {user.name.charAt(0).toUpperCase()}
        </div>

        {editing ? (
          <EditProfileForm user={user} onSaved={handleSaved} onCancel={() => setEditing(false)} />
        ) : (
          <>
            <div>
              <h1>{user.name}</h1>
              <p className="profile-page__email">{user.email}</p>
              <p className="profile-page__since">Member since: {memberSince}</p>
            </div>
            {savedMessage && <p className="auth-card__success">{savedMessage}</p>}
            <Button variant="outline" onClick={() => { setEditing(true); setSavedMessage('') }}>
              Edit Profile
            </Button>
          </>
        )}

        <dl className="profile-page__stats">
          <div>
            <dt>Favorites</dt>
            <dd>{favoritesCount}</dd>
          </div>
          <div>
            <dt>Recommendation Sessions</dt>
            <dd>{historyCount}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
