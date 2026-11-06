import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import LoadingMessage from './LoadingMessage.jsx'

// Wrap any page that needs a login:
//   <ProtectedRoute><Favorites /></ProtectedRoute>
//
// - Still checking a saved login?  Show a short loading message.
// - Not logged in?                 Send the user to /login, and remember
//                                  this page so login can bring them back.
// - Logged in?                     Show the page.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingMessage text="Checking your account..." />
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}
