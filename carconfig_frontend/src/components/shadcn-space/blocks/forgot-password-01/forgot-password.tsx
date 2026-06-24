import AuthCard from "@/components/auth/AuthCard"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AuthService } from "@/features/Auth/auth.service"
import { zodResolver } from "@hookform/resolvers/zod"
import { AxiosError } from "axios"
import { CheckCircle2, Loader2, Mail } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router"
import { toast } from "sonner"
import { z } from "zod"

export const forgotPasswordSchema = z.object({
  email: z.email({ message: "Email non valida" }),
})

const authLinkClass =
  "font-medium text-foreground underline-offset-4 transition-colors hover:underline"

const ForgotPasswordForm = () => {
  const [submittedEmail, setSubmittedEmail] = useState("")

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    try {
      await AuthService.forgotPassword(values.email)
      setSubmittedEmail(values.email)
      toast.success("Controlla la tua casella email")
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data.message
          : "Errore del server, riprova!"

      toast.error(message)

      if (error instanceof AxiosError && error.response?.status === 429) {
        return
      }
    }
  }

  if (submittedEmail) {
    return (
      <AuthCard
        title="Controlla la tua email"
        description={
          <>
            Se esiste un account con{" "}
            <span className="font-medium text-foreground">{submittedEmail}</span>
            , ti abbiamo inviato un link per reimpostare la password.
          </>
        }
        icon={
          <div className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-7" />
          </div>
        }
      >
        <FieldGroup className="gap-4">
          <p className="text-center text-sm leading-relaxed text-muted-foreground">
            Non hai ricevuto l&apos;email? Controlla la cartella spam o riprova
            tra qualche minuto.
          </p>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-11 w-full rounded-full"
            render={<Link to="/auth/login" />}
            nativeButton={false}
          >
            Torna al login
          </Button>
        </FieldGroup>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Password dimenticata?"
      description="Inserisci l'email del tuo account. Ti invieremo un link per scegliere una nuova password."
      icon={
        <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Mail className="size-6" />
        </div>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="gap-6">
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
              required
              className="h-10 bg-background"
              {...form.register("email")}
            />
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
                  Invio in corso…
                </>
              ) : (
                "Invia link di recupero"
              )}
            </Button>
            <FieldDescription className="text-center text-sm text-muted-foreground">
              Ricordi la password?{" "}
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

export default ForgotPasswordForm
