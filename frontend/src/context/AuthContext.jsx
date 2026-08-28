/**
 * AuthContext.jsx — RuralCare Authentication Context
 * ──────────────────────────────────────────────────
 * Provides a demo localStorage-based auth session.
 *
 * To migrate to FastAPI + PostgreSQL + JWT later:
 *  1. Replace localLogin / localSignUp bodies with real API calls from api.js
 *  2. Store the JWT token returned by the backend instead of the user object
 *  3. Add an Authorization header helper and token refresh logic here
 *  4. Everything else (useAuth hook, ProtectedRoute, Navbar) stays the same
 * ──────────────────────────────────────────────────
 */

import { createContext, useContext, useState, useCallback } from 'react'

// Storage keys
const STORAGE_KEY = 'ruralcare_session'
const USERS_KEY = 'ruralcare_users'

// Helpers
function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeSession(user) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {}
}

function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  } catch {}
}

// Context
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession())

  /**
   * Sign up a new user.
   * FUTURE: replace body with real API call to POST /auth/signup
   */
  const signUp = useCallback(async ({ name, email, password, role }) => {
    await new Promise((r) => setTimeout(r, 500))
    const users = readUsers()
    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (exists) {
      throw new Error('An account with this email already exists.')
    }
    const newUser = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name,
      email,
      password,
      role,
      createdAt: new Date().toISOString(),
    }
    writeUsers([...users, newUser])
    const sessionUser = { id: newUser.id, name, email, role }
    writeSession(sessionUser)
    setUser(sessionUser)
    return { success: true }
  }, [])

  /**
   * Log in an existing user.
   * FUTURE: replace body with real API call to POST /auth/login
   */
  const logIn = useCallback(async ({ email, password }) => {
    await new Promise((r) => setTimeout(r, 500))
    const users = readUsers()
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!found) {
      throw new Error('Invalid email or password. Please try again.')
    }
    const sessionUser = { id: found.id, name: found.name, email: found.email, role: found.role }
    writeSession(sessionUser)
    setUser(sessionUser)
    return { success: true }
  }, [])

  /**
   * Log out the current user.
   * FUTURE: also call POST /auth/logout to invalidate server-side token.
   */
  const logOut = useCallback(() => {
    writeSession(null)
    setUser(null)
  }, [])

  const value = { user, signUp, logIn, logOut, isAuthenticated: !!user }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * useAuth hook — consume auth context in any component.
 * Usage: const { user, logIn, logOut, isAuthenticated } = useAuth()
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
