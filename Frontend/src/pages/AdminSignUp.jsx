import { useState } from 'react'
import '../styles/admin.css'
import signupImage from '../assets/signup.jpeg'

const API_URL = 'http://localhost:5046'

export default function AdminSignUp({ onGoToSignIn }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  async function handleSignUp(e) {
    e.preventDefault()
    setStatus({ type: '', text: '' })

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match.'
      setStatus({ type: 'error', text: msg })
      alert(msg)
      return
    }

    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters.'
      setStatus({ type: 'error', text: msg })
      alert(msg)
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        const msg = data.message || 'Account created successfully. You can sign in now.'
        setStatus({ type: 'success', text: msg })
        alert(msg)
        onGoToSignIn()
      } else {
        const msg = data.message || 'Could not create account.'
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

  return (
    <main className="login-page">
      <div className="login-atmosphere" aria-hidden="true" />

      <div className="login-shell">
        <section className="login-panel">
          <header className="login-brand">
            <p className="brand-name">K &amp; Z Patisserie</p>
            <p className="subtitle">Create an admin account. It will be saved to your database.</p>
          </header>

          <form className="login-form" onSubmit={handleSignUp}>
            <label>
              Full name
              <input
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                required
              />
            </label>

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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </label>

            <label>
              Confirm password
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </label>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? 'Creating…' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <button type="button" className="auth-link" onClick={onGoToSignIn}>
              Sign in
            </button>
          </p>

          {status.text ? (
            <p className={`login-message ${status.type}`} role="status">
              {status.text}
            </p>
          ) : null}
        </section>

        <aside className="login-visual" aria-hidden="true">
          <img src={signupImage} alt="" className="login-cake" />
        </aside>
      </div>
    </main>
  )
}
