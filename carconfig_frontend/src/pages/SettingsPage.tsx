import { Button } from "@/components/ui/button"
import { ChangePasswordForm } from "@/features/Profile/ChangePasswordForm"
import { ProfileForm } from "@/features/Profile/ProfileForm"
import { useAuthStore } from "@/features/Auth/auth.store"
import { useNavigate } from "react-router"

const SettingsPage = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)

  if (!token || !user) {
    return (
      <main className="w-full px-4 py-24 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-foreground">Impostazioni</h1>
        <p className="mt-4 text-muted-foreground">
          Accedi per gestire il tuo profilo e la password.
        </p>
        <Button className="mt-6" onClick={() => navigate("/auth/login")}>
          Accedi
        </Button>
      </main>
    )
  }

  return (
    <main className="w-full px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Impostazioni
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gestisci il tuo profilo e la password.
          </p>
        </div>

        <ProfileForm user={user} />
        <ChangePasswordForm />
      </div>
    </main>
  )
}

export default SettingsPage
