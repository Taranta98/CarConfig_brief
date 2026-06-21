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
import { Input } from "@/components/ui/input"
import { AuthService } from "@/features/Auth/auth.service"
import { useState } from "react"
import { Link } from "react-router"
import { z } from "zod"
import { toast } from "sonner"
import { AxiosError } from "axios"
import VerifyEmail from "../verify-email-01/verify-email"
import { Checkbox } from "@/components/ui/checkbox"
import { EyeClosed, EyeIcon } from "lucide-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

export const registerSchema = z.object({
  first_name: z.string().min(1, { message: "Nome obbligatorio" }),
  last_name: z.string().min(1, { message: "Cognome obbligatorio" }),
  email: z
    .string()
    .min(1, { message: "Email obbligatoria" })
    .email({ message: "Email non valida" }),
  password: z
    .string()
    .min(8, { message: "La password deve essere lunga almeno 8 caratteri" }),
  password_confirmation: z
    .string()
    .min(8, { message: "La password deve essere lunga almeno 8 caratteri" }),
  termsAndConditions: z
    .boolean()
    .refine((data) => data, {
      message: "Devi accettare i termini per poter continuare",
    })
})
.refine((data) => data.password === data.password_confirmation, {
  message: "Le password non coincidono",
  path: ["password_confirmation"],
})

const RegisterForm = () => {
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      termsAndConditions: false,
    },
  })

  const [emailVerify, setEmailVerify] = useState("")
  const [showPsw, setShowPsw] = useState(false)
  const [showPswConfirmation, setShowPswConfirmation] = useState(false)

  const validatePasswordFields = () => {
    void form.trigger(["password", "password_confirmation"])
  }

  const registerFieldNames = [
    "first_name",
    "last_name",
    "email",
    "password",
    "password_confirmation",
  ] as const

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    try {
      await AuthService.register(values)
      setEmailVerify(values.email)
    } catch (error) {
      if (!(error instanceof AxiosError)) {
        toast.error("Errore del server, riprova!")
        return
      }

      const data = error.response?.data as {
        message?: string
        errors?: Record<string, string[]>
      }

      if (data?.errors) {
        for (const [field, messages] of Object.entries(data.errors)) {
          const message = messages[0]
          if (!message) continue

          if (field === "password_confirmation") {
            form.setError("password_confirmation", { message })
            continue
          }

          if (
            registerFieldNames.includes(
              field as (typeof registerFieldNames)[number]
            )
          ) {
            form.setError(field as (typeof registerFieldNames)[number], {
              message,
            })
          }
        }

        if (data.errors.email?.[0]) {
          toast.error(data.errors.email[0])
        }

        return
      }

      toast.error(
        data?.message ?? "Errore durante la registrazione dell'utente"
      )
    }
  }

  if (emailVerify) {
    return <VerifyEmail email={emailVerify} />
  }

  return (
    <Card className="relative w-full gap-6 border border-border/60 bg-card px-6 py-8 shadow-lg sm:p-10">
      <CardHeader className="gap-2 p-0 text-center">
        <CardTitle className="text-2xl font-medium text-card-foreground">
          Iscriviti a Car Config
        </CardTitle>
        <CardDescription className="text-sm font-normal text-muted-foreground">
          Crea un account per iniziare a configurare il tuo veicolo
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-6">
                <div className="flex flex-col gap-4">
                  <Field className="gap-1.5">
                    <FieldLabel
                      htmlFor="name"
                      className="text-sm font-normal text-muted-foreground"
                    >
                      Nome*
                    </FieldLabel>
                    <Input
                      id="first_name"
                      type="text"
                      placeholder="inserisci il tuo nome"
                      {...form.register("first_name")}
                      className="h-9 bg-white shadow-xs"
                    />
                    <FieldError>
                      {form.formState.errors.first_name?.message}
                    </FieldError>
                  </Field>
                  <Field className="gap-1.5">
                    <FieldLabel
                      htmlFor="last_name"
                      className="text-sm font-normal text-muted-foreground"
                    >
                      Cognome*
                    </FieldLabel>
                    <Input
                      id="last_name"
                      type="text"
                      placeholder="inserisci il tuo cognome"
                      className="h-9 bg-white shadow-xs"
                      {...form.register("last_name")}
                    />
                    <FieldError>
                      {form.formState.errors.last_name?.message}
                    </FieldError>
                  </Field>
                  <Field className="gap-1.5">
                    <FieldLabel
                      htmlFor="email"
                      className="text-sm font-normal text-muted-foreground"
                    >
                      Email*
                    </FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@shadcnspace.com"
                      className="h-9 bg-white shadow-xs"
                      {...form.register("email")}
                    />
                    <FieldError>
                      {form.formState.errors.email?.message}
                    </FieldError>
                  </Field>
                  <Field className="gap-1.5">
                    <FieldLabel
                      htmlFor="password"
                      className="text-sm font-normal text-muted-foreground"
                    >
                      Password*
                    </FieldLabel>
                    <InputGroup className="bg-white">
                      <InputGroupInput
                        id="password"
                        placeholder="********"
                        type={showPsw ? "text" : "password"}
                        {...form.register("password", {
                          onBlur: validatePasswordFields,
                        })}
                        required
                      />

                      <InputGroupAddon
                        className="cursor-pointer"
                        align={"inline-end"}
                        onClick={() => setShowPsw(!showPsw)}
                      >
                        {showPsw ? <EyeClosed /> : <EyeIcon />}
                      </InputGroupAddon>
                    </InputGroup>

                    <FieldError>
                      {form.formState.errors.password?.message}
                    </FieldError>
                  </Field>
                  <Field>
          <FieldLabel htmlFor="password_confirmation" className="text-sm font-normal text-muted-foreground">
          Conferma password
        </FieldLabel>
        <InputGroup className="bg-white">
          <InputGroupInput
              id="password_confirmation"
            placeholder="********"
            type={showPswConfirmation ? "text" : "password"}
            {...form.register("password_confirmation", {
              onBlur: validatePasswordFields,
            })}
            required
          />

          <InputGroupAddon
            className="cursor-pointer"
            align={"inline-end"}
            onClick={() => setShowPswConfirmation(!showPswConfirmation)}
          >
            {showPswConfirmation ? <EyeClosed /> : <EyeIcon />}
          </InputGroupAddon>
        </InputGroup>

        <FieldError>
          {(form.formState.touchedFields.password_confirmation ||
            form.formState.isSubmitted) &&
            form.formState.errors.password_confirmation?.message}
        </FieldError>
      </Field>
                  <Field className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                    <Checkbox
                      id="termsAndConditions"
                      className={"w-4!"}
                      {...form.register("termsAndConditions")}
                      checked={form.watch("termsAndConditions")}
                      onCheckedChange={(value) =>
                        form.setValue("termsAndConditions", value === true, {
                          shouldValidate: true,
                        })
                      }
                    />
                    <div className="space-y-1 leading-none">
                      <FieldLabel htmlFor="termsAndConditions">
                        Termini e condizioni
                      </FieldLabel>
                      <FieldDescription>
                        Attivando la checkbox accetti i termini e le condizioni
                      </FieldDescription>
                      <FieldError>
                        {(form.formState.touchedFields.termsAndConditions ||
                          form.formState.isSubmitted) &&
                          form.formState.errors.termsAndConditions?.message}
                      </FieldError>
                    </div>
                  </Field>
                </div>

                <Field className="gap-4">
                  <Button
                    type="submit"
                    size={"lg"}
                    disabled={form.formState.isSubmitting}
                    className="h-10 cursor-pointer rounded-lg hover:bg-primary/80"
                  >
                    {form.formState.isSubmitting
                      ? "Registrazione in corso…"
                      : "Registrati"}
                  </Button>
                  <FieldDescription className="text-center text-sm font-normal text-muted-foreground">
                    Hai già un account?{" "}
                    <Link
                      to="/auth/login"
                      className="font-medium text-card-foreground no-underline!"
                    >
                      Accedi
                    </Link>
                  </FieldDescription>
                </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

export default RegisterForm
