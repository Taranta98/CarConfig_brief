import AuthCard from "@/components/auth/AuthCard"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { AuthService } from "@/features/Auth/auth.service"
import { zodResolver } from "@hookform/resolvers/zod"
import { AxiosError } from "axios"
import { EyeClosed, EyeIcon, KeyRound, Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"
import { z } from "zod"

export const resetPasswordSchema = z
  .object({
    email: z.email({ message: "Email non valida" }),
    token: z.string().min(1, { message: "Token non valido" }),
    password: z
      .string()
      .min(8, { message: "La password deve essere lunga almeno 8 caratteri" }),
    password_confirmation: z
      .string()
      .min(8, { message: "La password deve essere lunga almeno 8 caratteri" }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Le password non coincidono",
    path: ["password_confirmation"],
  })

type ResetPasswordFormProps = {
  email: string
  token: string
}

const authLinkClass =
  "font-medium text-foreground underline-offset-4 transition-colors hover:underline"

const ResetPasswordForm = ({ email, token }: ResetPasswordFormProps) => {
  const navigate = useNavigate()
  const [showPsw, setShowPsw] = useState(false)
  const [showPswConfirmation, setShowPswConfirmation] = useState(false)

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email,
      token,
    },
  })

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    try {
      await AuthService.resetPassword(values)
      toast.success("Password aggiornata con successo")
      navigate("/", { replace: true })
    } catch (error) {
      toast.error(
        error instanceof AxiosError
          ? error.response?.data.message
          : "Errore del server, riprova!"
      )
    }
  }

  return (
    <AuthCard
      title="Nuova password"
      description="Scegli una password sicura per il tuo account."
      icon={
        <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <KeyRound className="size-6" />
        </div>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="gap-6">
          <input type="hidden" {...form.register("email")} />
          <input type="hidden" {...form.register("token")} />

          <div className="flex flex-col gap-4">
            <Field className="gap-1.5">
              <FieldLabel
                htmlFor="password"
                className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
              >
                Nuova password
              </FieldLabel>
              <InputGroup className="h-10 bg-background">
                <InputGroupInput
                  id="password"
                  placeholder="Minimo 8 caratteri"
                  autoComplete="new-password"
                  type={showPsw ? "text" : "password"}
                  {...form.register("password")}
                  required
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

            <Field className="gap-1.5">
              <FieldLabel
                htmlFor="password_confirmation"
                className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
              >
                Conferma password
              </FieldLabel>
              <InputGroup className="h-10 bg-background">
                <InputGroupInput
                  id="password_confirmation"
                  placeholder="Ripeti la password"
                  autoComplete="new-password"
                  type={showPswConfirmation ? "text" : "password"}
                  {...form.register("password_confirmation")}
                  required
                />
                <InputGroupAddon
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                  align="inline-end"
                  onClick={() =>
                    setShowPswConfirmation(!showPswConfirmation)
                  }
                >
                  {showPswConfirmation ? <EyeClosed /> : <EyeIcon />}
                </InputGroupAddon>
              </InputGroup>
              <FieldError>
                {form.formState.errors.password_confirmation?.message}
              </FieldError>
            </Field>
          </div>

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
                  Aggiornamento…
                </>
              ) : (
                "Aggiorna password"
              )}
            </Button>
            <FieldDescription className="text-center text-sm text-muted-foreground">
              <Link to="/auth/login" className={authLinkClass}>
                Torna al login
              </Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}

export default ResetPasswordForm
