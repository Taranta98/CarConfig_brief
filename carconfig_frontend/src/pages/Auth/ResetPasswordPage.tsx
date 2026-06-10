import AuthSplitLayout from "@/components/auth/AuthSplitLayout"
import ResetPasswordForm from "@/components/shadcn-space/blocks/reset-password-01/reset-password"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Link, useSearchParams } from "react-router"

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const token = searchParams.get("token") ?? ""

  if (!email || !token) {
    return (
      <AuthSplitLayout>
        <Card className="relative w-full gap-6 border border-border/60 bg-card px-6 py-8 shadow-lg sm:p-10">
          <CardHeader className="gap-2 p-0 text-center">
            <CardTitle className="text-2xl font-medium text-card-foreground">
              Link non valido
            </CardTitle>
            <CardDescription className="text-sm font-normal text-muted-foreground">
              Il link per reimpostare la password non è valido o è scaduto.
              Richiedine uno nuovo.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Button
              size="lg"
              className="w-full rounded-lg h-10"
              render={<Link to="/auth/forgot-password" />}
              nativeButton={false}
            >
              Richiedi nuovo link
            </Button>
          </CardContent>
        </Card>
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
