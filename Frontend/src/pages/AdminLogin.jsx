import { useState } from 'react'
import '../styles/admin.css'
import cakeImage from '../assets/cakeloginpage1.jpg'

const API_URL = 'http://localhost:5046'

export default function AdminLogin({ onGoToSignUp }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setStatus({ type: '', text: '' })
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        const msg = data.message || 'Login successful'
        setStatus({ type: 'success', text: msg })
        alert(msg)
      } else {
        const msg = data.message || 'Invalid email or password.'
        setStatus({ type: 'error', text: msg })
        alert(msg)
      }
    } catch {
      const msg = 'Cannot reach the server. Is the backend running?'
      setStatus({ type: 'error', text: msg })
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    try {
      const res = await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      const msg = data.message || 'Logged out.'
      setStatus({ type: 'success', text: msg })
      alert(msg)
    } catch {
      alert('Logout failed.')
    }
  }

  async function handleCheckMe() {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        const msg = `Logged in as ${data.fullName || data.email}`
        setStatus({ type: 'success', text: msg })
        alert(msg)
      } else {
        const msg = 'Not logged in (no valid cookie/JWT).'
        setStatus({ type: 'error', text: msg })
        alert(msg)
      }
    } catch {
      alert('Cannot reach the server.')
    }
  }

  return (
    <main className="login-page">
      <div className="login-atmosphere" aria-hidden="true" />

      <div className="login-shell">
        <section className="login-panel">
          <header className="login-brand">
            <p className="brand-name">K &amp; Z Patisserie</p>
            <p className="subtitle">Welcome back. Manage your patisserie with care.</p>
          </header>

          <form className="login-form" onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </label>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account?{' '}
            <button type="button" className="auth-link" onClick={onGoToSignUp}>
              Sign up
            </button>
          </p>

          <div className="login-extra-actions">
            <button type="button" className="secondary-btn" onClick={handleCheckMe}>
              Check session
            </button>
            <button type="button" className="secondary-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>

          {status.text ? (
            <p className={`login-message ${status.type}`} role="status">
              {status.text}
            </p>
          ) : null}
        </section>

        <aside className="login-visual" aria-hidden="true">
          <img src={cakeImage} alt="" className="login-cake" />
        </aside>
      </div>
    </main>
  )
}
