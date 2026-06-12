import { useAuthStore } from '@/features/Auth/auth.store'
import { AdminDashboard } from '@/features/Admin/AdminDashboard'
import { Link, Navigate } from 'react-router'
import { Button } from '@/components/ui/button'

const AdminPage = () => {
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'admin'

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="w-full px-4 pt-17.5 pb-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Pannello admin</h1>
          <p className="mt-2 text-muted-foreground">
            Gestisci veicoli, colori con angolazioni, allestimenti, optional e
            utenti. Puoi aprire più sezioni contemporaneamente.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-full"
          render={<Link to="/" />}
          nativeButton={false}
        >
          Torna alla home
        </Button>
      </div>

      <AdminDashboard />
    </div>
  )
}

export default AdminPage
