import { useEffect, useState } from 'react'
import '../styles/admin.css'
import '../styles/admin-header.css'
import logo from '../assets/logo.png'

const API_URL = 'http://localhost:5046'

function formatNow(date) {
  const datePart = date.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  const timePart = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  return { datePart, timePart }
}

export default function AdminHeader({ admin: initialAdmin, onLogout }) {
  const [admin, setAdmin] = useState(initialAdmin)
  const [now, setNow] = useState(() => formatNow(new Date()))
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(formatNow(new Date()))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (initialAdmin?.fullName) {
      setAdmin(initialAdmin)
      return
    }

    let cancelled = false

    async function loadMe() {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          credentials: 'include',
        })
        const data = await res.json().catch(() => ({}))
        if (!cancelled && res.ok) {
          setAdmin({
            fullName: data.fullName || 'Admin',
            email: data.email || '',
            role: data.role || 'Admin',
          })
        }
      } catch {
        // keep whatever we already have
      }
    }

    loadMe()
    return () => {
      cancelled = true
    }
  }, [initialAdmin])

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // still leave the page
    } finally {
      setLoggingOut(false)
      onLogout()
    }
  }

  const displayName = admin?.fullName || 'Admin'
  const role = admin?.role || 'Admin'
  const email = admin?.email || ''

  return (
    <header className="admin-header">
      <div className="admin-header-brand">
        <img src={logo} alt="K & Z Patisserie" className="admin-header-logo" />
        <div className="admin-header-brand-text">
          <p className="admin-header-brand-name">K &amp; Z Patisserie</p>
          <p className="admin-header-brand-tag">Admin panel</p>
        </div>
      </div>

      <div className="admin-header-welcome">
        <p className="admin-header-welcome-label">Welcome</p>
        <p className="admin-header-welcome-name">{displayName}</p>
        {email ? <p className="admin-header-welcome-email">{email}</p> : null}
      </div>

      <div className="admin-header-meta">
        <div className="admin-header-clock" aria-live="polite">
          <span className="admin-header-clock-date">{now.datePart}</span>
          <span className="admin-header-clock-time">{now.timePart}</span>
        </div>
        <span className="admin-header-role">{role}</span>
        <button
          type="button"
          className="admin-header-logout-btn"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? 'Logging out…' : 'Logout'}
        </button>
      </div>
    </header>
  )
}
