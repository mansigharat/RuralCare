/**
 * ProtectedRoute.jsx — Redirects unauthenticated users to /login
 * Usage: <Route path="/protected" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
 */
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    // Pass the attempted route so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
