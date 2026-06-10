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
import { EyeClosed, EyeIcon } from "lucide-react"
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
    <Card className="relative w-full gap-6 border border-border/60 bg-card px-6 py-8 shadow-lg sm:p-10">
      <CardHeader className="gap-2 p-0 text-center">
        <CardTitle className="text-2xl font-medium text-card-foreground">
          Reimposta la password
        </CardTitle>
        <CardDescription className="text-sm font-normal text-muted-foreground">
          Scegli una nuova password per il tuo account.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-6">
            <input type="hidden" {...form.register("email")} />
            <input type="hidden" {...form.register("token")} />

            <div className="flex flex-col gap-4">
              <Field className="gap-1.5">
                <FieldLabel
                  htmlFor="password"
                  className="text-sm font-normal text-muted-foreground"
                >
                  Nuova password*
                </FieldLabel>
                <InputGroup className="bg-white">
                  <InputGroupInput
                    id="password"
                    placeholder="********"
                    type={showPsw ? "text" : "password"}
                    {...form.register("password")}
                    required
                  />
                  <InputGroupAddon
                    className="cursor-pointer"
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
                  className="text-sm font-normal text-muted-foreground"
                >
                  Conferma password*
                </FieldLabel>
                <InputGroup className="bg-white">
                  <InputGroupInput
                    id="password_confirmation"
                    placeholder="********"
                    type={showPswConfirmation ? "text" : "password"}
                    {...form.register("password_confirmation")}
                    required
                  />
                  <InputGroupAddon
                    className="cursor-pointer"
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
                className="rounded-lg h-10 hover:bg-primary/80 cursor-pointer"
              >
                Aggiorna password
              </Button>
              <FieldDescription className="text-center text-sm font-normal text-muted-foreground">
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

export default ResetPasswordForm
