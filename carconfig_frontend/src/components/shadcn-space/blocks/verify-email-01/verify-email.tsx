import AuthCard from "@/components/auth/AuthCard"
import { Button } from "@/components/ui/button"
import { FieldDescription, FieldGroup } from "@/components/ui/field"
// import { AuthService } from "@/features/Auth/auth.service"
import { useAuthStore } from "@/features/Auth/auth.store"
// import { isAxiosError } from "axios"
import { Loader2, Mail } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { z } from "zod"

export const verifyEmailSchema = z.object({
  email: z.email({ message: "Email non valida" }),
  code: z.string().min(6, { message: "Il codice è obbligatorio" }),
})

type VerifyEmailProps = {
  email: string
}

const VerifyEmail = ({ email }: VerifyEmailProps) => {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (!token || !user?.email_verified_at) {
      return
    }

    toast.success("Email verificata! Sei connesso.")
    navigate("/", { replace: true })
  }, [navigate, token, user?.email_verified_at])

  async function handleResend() {
    setIsResending(true)
    try {
      // Re-enable when SMTP/domain is configured.
      // const res = await AuthService.resendEmailVerify(email)
      // toast.success(res.data.message)
      toast.error("Verifica email temporaneamente disabilitata.")
    } catch {
      toast.error("Impossibile reinviare il link")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthCard
      title="Verifica la tua email"
      description={
        <>
          Abbiamo inviato un link di attivazione a{" "}
          <span className="font-medium text-foreground">{email}</span>. Apri la
          mail e clicca sul link: questa pagina si aggiornerà automaticamente.
        </>
      }
      icon={
        <div className="relative flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Mail className="size-6" />
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary">
            <span className="size-2 animate-pulse rounded-full bg-primary-foreground" />
          </span>
        </div>
      }
    >
      <FieldGroup className="gap-4">
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">In attesa di verifica…</p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-full"
          disabled={isResending}
          onClick={handleResend}
        >
          {isResending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Invio in corso…
            </>
          ) : (
            "Reinvia link di verifica"
          )}
        </Button>

        <FieldDescription className="text-center text-sm leading-relaxed text-muted-foreground">
          Non hai ricevuto l&apos;email? Controlla la cartella spam o usa il
          pulsante qui sopra per ricevere un nuovo link.
        </FieldDescription>
      </FieldGroup>
    </AuthCard>
  )
}

export default VerifyEmail
