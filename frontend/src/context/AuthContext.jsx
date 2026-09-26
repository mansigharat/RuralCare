 import { createContext, useContext, useState, useCallback } from 'react'
import { login, register } from '../services/api'

const STORAGE_KEY = 'ruralcare_session'

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

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession())

  const signUp = useCallback(async ({ name, email, phone, password, role }) => {
    let backendRole = 'citizen'
    if (role === 'healthcare_worker' || role === 'staff') backendRole = 'staff'
    if (role === 'government' || role === 'admin') backendRole = 'admin'

    const userIdentifier = phone || email

    const res = await register({
      name: name?.trim() || 'User',
      phone: userIdentifier,
      email: email && email.includes('@') ? email : null,
      password,
      role: backendRole,
    })
    
    if (res.success) {
      const sessionUser = { token: res.token, phone: userIdentifier, role: res.role, name: name?.trim() }
      writeSession(sessionUser)
      setUser(sessionUser)
      return { success: true }
    }
    throw new Error('Registration failed')
  }, [])

  const logIn = useCallback(async ({ email, password }) => {
    // The UI uses 'email' field, but the backend expects 'phone'
    const res = await login(email, password)
    if (res.success) {
      const sessionUser = { token: res.token, phone: email, role: res.role }
      writeSession(sessionUser)
      setUser(sessionUser)
      return { success: true }
    }
    throw new Error('Login failed')
  }, [])

  const logOut = useCallback(() => {
    writeSession(null)
    setUser(null)
  }, [])

  const value = { user, signUp, logIn, logOut, isAuthenticated: !!user }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
