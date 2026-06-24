import AuthSplitLayout from "@/components/auth/AuthSplitLayout"
import AuthCard from "@/components/auth/AuthCard"
import ResetPasswordForm from "@/components/shadcn-space/blocks/reset-password-01/reset-password"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Link, useSearchParams } from "react-router"

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const token = searchParams.get("token") ?? ""

  if (!email || !token) {
    return (
      <AuthSplitLayout>
        <AuthCard
          title="Link non valido"
          description="Il link per reimpostare la password non è valido o è scaduto. Richiedine uno nuovo dalla pagina di recupero."
          icon={
            <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-6" />
            </div>
          }
        >
          <Button
            size="lg"
            className="h-11 w-full rounded-full font-medium"
            render={<Link to="/auth/forgot-password" />}
            nativeButton={false}
          >
            Richiedi nuovo link
          </Button>
        </AuthCard>
      </AuthSplitLayout>
    )
  }

  return (
    <AuthSplitLayout>
      <ResetPasswordForm email={email} token={token} />
    </AuthSplitLayout>
  )
}

export default ResetPasswordPage
