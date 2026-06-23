import { useAuthStore } from '@/features/Auth/auth.store'
import { AdminDashboard } from '@/features/Admin/AdminDashboard'
import { Navigate } from 'react-router'

const AdminPage = () => {
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'admin'

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="w-full px-4 pt-17.5 pb-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
            Gestione
          </p>
          <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Pannello admin
          </h1>
        </div>

        <div className="mt-12">
          <AdminDashboard />
        </div>
      </div>
    </div>
  )
}

export default AdminPage
