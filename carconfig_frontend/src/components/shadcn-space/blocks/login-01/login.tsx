import AuthCard from "@/components/auth/AuthCard"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { AuthService } from "@/features/Auth/auth.service"
import { getAuthRedirectPath } from "@/lib/authRedirect"
import { zodResolver } from "@hookform/resolvers/zod"
import { AxiosError } from "axios"
import { EyeClosed, EyeIcon, Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useLocation, useNavigate } from "react-router"
import { toast } from "sonner"
import { z } from "zod"
import VerifyEmail from "../verify-email-01/verify-email"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email obbligatoria" })
    .email({ message: "Email non valida" }),
  password: z
    .string()
    .min(1, { message: "Password obbligatoria" })
    .min(8, { message: "La password deve essere lunga almeno 8 caratteri" }),
})

const authLinkClass =
  "font-medium text-foreground underline-offset-4 transition-colors hover:underline"

const LoginForm = () => {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  })

  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = getAuthRedirectPath(location.state)

  const [verifyEmail, setVerifyEmail] = useState("")
  const [showPsw, setShowPsw] = useState(false)

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      await AuthService.login(values)
      toast.success("Login effettuato con successo")
      navigate(redirectTo, { replace: true })
    } catch (error) {
      if (!(error instanceof AxiosError)) {
        toast.error("Errore del server, riprova!")
        return
      }

      const data = error.response?.data as {
        message?: string
        cause?: string
        errors?: Record<string, string[]>
      }

      if (data?.cause === "EMAIL_NOT_VERIFIED") {
        setVerifyEmail(values.email)
        toast.error(
          data.message ?? "Devi verificare la tua email prima di accedere"
        )
        return
      }

      if (data?.errors) {
        for (const [field, messages] of Object.entries(data.errors)) {
          if (field === "email" || field === "password") {
            form.setError(field, { message: messages[0] })
          }
        }
        return
      }

      const message =
        data?.message ??
        (error.response?.status === 401
          ? "Credenziali non valide"
          : "Errore del server, riprova!")

      toast.error(message)

      if (error.response?.status === 401) {
        form.setError("password", { message })
      }
    }
  }

  if (verifyEmail) {
    return <VerifyEmail email={verifyEmail} />
  }

  return (
    <AuthCard
      title="Bentornato"
      description="Accedi al tuo account per gestire le configurazioni salvate."
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="gap-6">
          <div className="flex flex-col gap-4">
            <Field className="gap-1.5">
              <FieldLabel
                htmlFor="email"
                className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
              >
                Email
              </FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nome@esempio.it"
                className="h-10 bg-background"
                {...form.register("email")}
              />
              <FieldError>{form.formState.errors.email?.message}</FieldError>
            </Field>

            <Field className="gap-1.5">
              <FieldLabel
                htmlFor="password"
                className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
              >
                Password
              </FieldLabel>
              <InputGroup className="h-10 bg-background">
                <InputGroupInput
                  id="password"
                  placeholder="La tua password"
                  autoComplete="current-password"
                  type={showPsw ? "text" : "password"}
                  {...form.register("password")}
                />
                <InputGroupAddon
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                  align="inline-end"
                  onClick={() => setShowPsw(!showPsw)}
                >
                  {showPsw ? <EyeClosed /> : <EyeIcon />}
                </InputGroupAddon>
              </InputGroup>
              <FieldError>
                {form.formState.errors.password?.message}
              </FieldError>
            </Field>
          </div>

          <Field orientation="horizontal" className="justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Checkbox id="remember" defaultChecked className="cursor-pointer" />
              <FieldLabel
                htmlFor="remember"
                className="cursor-pointer text-sm font-normal text-muted-foreground"
              >
                Ricordami
              </FieldLabel>
            </div>
            <Link to="/auth/forgot-password" className={authLinkClass}>
              Password dimenticata?
            </Link>
          </Field>

          <Field className="gap-4">
            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting}
              className="h-11 w-full rounded-full font-medium"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Accesso in corso…
                </>
              ) : (
                "Accedi"
              )}
            </Button>
            <FieldDescription className="text-center text-sm text-muted-foreground">
              Non hai un account?{" "}
              <Link to="/auth/register" className={authLinkClass}>
                Registrati
              </Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}

export default LoginForm
