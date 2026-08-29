
import { createContext, useContext, useState, useCallback } from 'react'

const STORAGE_KEY = 'ruralcare_session'
const USERS_KEY = 'ruralcare_users'

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

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession())

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
