import { useState } from 'react'
import AdminLogin from './pages/AdminLogin'
import AdminSignUp from './pages/AdminSignUp'

export default function App() {
  const [page, setPage] = useState('signin')

  if (page === 'signup') {
    return <AdminSignUp onGoToSignIn={() => setPage('signin')} />
  }

  return <AdminLogin onGoToSignUp={() => setPage('signup')} />
}
