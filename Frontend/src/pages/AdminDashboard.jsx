import AdminHeader from '../components/AdminHeader'
import '../styles/admin.css'
import '../styles/dashboard.css'

export default function AdminDashboard({ admin, onLogout }) {
  return (
    <div className="dashboard-page admin-page-with-header">
      <AdminHeader admin={admin} onLogout={onLogout} />

      <main className="dashboard-main">
        <p className="dashboard-placeholder">
          Your cake management tools will appear here next.
        </p>
      </main>
    </div>
  )
}
