import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router"
import { toast } from "sonner"
import { z } from "zod"

export const forgotPasswordSchema = z.object({
  email: z.email({ message: "Email non valida" }),
})

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
      <Card className="relative w-full gap-6 border border-border/60 bg-card px-6 py-8 shadow-lg sm:p-10">
        <CardHeader className="gap-2 p-0 text-center">
          <CardTitle className="text-2xl font-medium text-card-foreground">
            Controlla la tua email
          </CardTitle>
          <CardDescription className="text-sm font-normal text-muted-foreground">
            Se esiste un account con{" "}
            <span className="font-medium text-card-foreground">
              {submittedEmail}
            </span>
            , ti abbiamo inviato un link per reimpostare la password.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <FieldGroup className="gap-4">
            <FieldDescription className="text-center text-sm font-normal text-muted-foreground">
              Non hai ricevuto l&apos;email? Controlla lo spam o riprova tra
              qualche minuto.
            </FieldDescription>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="rounded-lg h-10"
              render={<Link to="/auth/login" />}
              nativeButton={false}
            >
              Torna al login
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative w-full gap-6 border border-border/60 bg-card px-6 py-8 shadow-lg sm:p-10">
      <CardHeader className="gap-2 p-0 text-center">
        <CardTitle className="text-2xl font-medium text-card-foreground">
          Password dimenticata?
        </CardTitle>
        <CardDescription className="text-sm font-normal text-muted-foreground">
          Inserisci l&apos;email associata al tuo account e ti invieremo un
          link per reimpostare la password.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-6">
            <Field className="gap-1.5">
              <FieldLabel
                htmlFor="email"
                className="text-sm text-muted-foreground font-normal"
              >
                Email*
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="example@shadcnspace.com"
                required
                className="h-9 bg-white shadow-xs"
                {...form.register("email")}
              />
            </Field>

            <Field className="gap-4">
              <Button
                type="submit"
                size="lg"
                className="rounded-lg h-10 hover:bg-primary/80 cursor-pointer"
              >
                Invia link di recupero
              </Button>
              <FieldDescription className="text-center text-sm font-normal text-muted-foreground">
                Ricordi la password?{" "}
                <Link
                  to="/auth/login"
                  className="font-medium text-card-foreground no-underline!"
                >
                  Torna al login
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

export default ForgotPasswordForm
