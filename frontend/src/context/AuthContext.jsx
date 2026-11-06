import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  SESSION_ENDED_EVENT,
  getCurrentUser,
  getToken,
  loginUser,
  registerUser,
  removeToken,
  saveToken,
} from '../services/apiService.js'

// ---------------------------------------------------------------------
// Who is logged in, shared with every component.
//
//   const { user, isAuthenticated, loading, login, logout } = useAuth()
//
// user             { id, name, email, createdAt } or null
// isAuthenticated  true when someone is logged in
// loading          true while we check a saved token after a refresh
// ---------------------------------------------------------------------
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // If a token was saved, we must ask Flask if it's still valid before we
  // know whether the user is logged in.
  const [loading, setLoading] = useState(() => Boolean(getToken()))

  // On page load / refresh: restore the login from the saved token.
  useEffect(() => {
    if (!getToken()) return
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null)) // a bad token is already removed by apiService
      .finally(() => setLoading(false))
  }, [])

  // If any request finds the token has expired, log out here too.
  useEffect(() => {
    const handleSessionEnded = () => setUser(null)
    window.addEventListener(SESSION_ENDED_EVENT, handleSessionEnded)
    return () => window.removeEventListener(SESSION_ENDED_EVENT, handleSessionEnded)
  }, [])

  async function login(email, password) {
    const data = await loginUser({ email, password }) // throws if wrong
    saveToken(data.token)
    setUser(data.user)
    return data.user
  }

  // Create the account, then log straight in so the user doesn't have to
  // type everything again.
  async function register(name, email, password) {
    await registerUser({ name, email, password })
    return login(email, password)
  }

  function logout() {
    removeToken()
    setUser(null)
  }

  const value = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    login,
    register,
    logout,
    updateUser: setUser, // used by the Profile page after editing
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>')
  }
  return context
}
