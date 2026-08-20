import { useState } from 'react'
import AdminLogin from './pages/AdminLogin'
import AdminSignUp from './pages/AdminSignUp'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  const [page, setPage] = useState('signin')
  const [admin, setAdmin] = useState(null)

  if (page === 'dashboard') {
    return (
      <AdminDashboard
        admin={admin}
        onLogout={() => {
          setAdmin(null)
          setPage('signin')
        }}
      />
    )
  }

  if (page === 'signup') {
    return <AdminSignUp onGoToSignIn={() => setPage('signin')} />
  }

  return (
    <AdminLogin
      onGoToSignUp={() => setPage('signup')}
      onLoginSuccess={(user) => {
        setAdmin(user)
        setPage('dashboard')
      }}
    />
  )
}
