import { useState } from 'react'
import { Link } from 'react-router-dom'
import { login } from '../services/api'

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [loggedIn, setLoggedIn] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    try {
      await login(formData.email, formData.password)
      setLoggedIn(true)
    } catch (err) {
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-success-50 border border-success-200 rounded-2xl p-10 text-center max-w-sm w-full">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-success-700 mb-2">Logged In</h2>
          <p className="text-slate-600 text-sm mb-6">
            Welcome back! JWT authentication will be integrated by the backend developer.
          </p>
          <Link
            to="/"
            className="bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors text-sm inline-block"
          >
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome to RuralCare</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-7">
          {/* Info note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-5 text-xs text-blue-800">
            <strong>Note:</strong> Full JWT authentication will be integrated with the FastAPI backend. This is a placeholder UI.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-700"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white font-semibold py-3.5 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60 text-sm mt-2"
            >
              {loading ? 'Signing In...' : 'Login'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-xs text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <Link
            to="/facilities"
            className="block w-full text-center border-2 border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:border-primary-300 hover:text-primary-600 transition-colors text-sm"
          >
            Continue as Citizen (no login required)
          </Link>
        </div>

        <p className="text-center text-xs text-slate-500 mt-5">
          Are you a healthcare worker?{' '}
          <span className="text-primary-600 font-medium cursor-pointer hover:underline">
            Healthcare Worker Portal (coming soon)
          </span>
        </p>
      </div>
    </div>
  )
}
