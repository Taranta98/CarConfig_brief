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
import { Label } from "@/components/ui/label"
import { AuthService } from "@/features/Auth/auth.service"
import { zodResolver } from "@hookform/resolvers/zod"
import { AxiosError } from "axios"
import { EyeClosed, EyeIcon, Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router"
import { toast } from "sonner"
import { z } from "zod"
import VerifyEmail from "../verify-email-01/verify-email"

export const registerSchema = z
  .object({
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
    termsAndConditions: z.boolean().refine((data) => data, {
      message: "Devi accettare i termini per poter continuare",
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Le password non coincidono",
    path: ["password_confirmation"],
  })

const authLinkClass =
  "font-medium text-foreground underline-offset-4 transition-colors hover:underline"

const fieldLabelClass =
  "text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"

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
          if (!message) {
            continue
          }

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
    <AuthCard
      title="Crea il tuo account"
      description="Registrati per salvare e condividere le tue configurazioni."
      className="gap-6 py-6 sm:gap-6 sm:py-8"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <FieldGroup className="gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field className="gap-1.5">
              <FieldLabel htmlFor="first_name" className={fieldLabelClass}>
                Nome
              </FieldLabel>
              <Input
                id="first_name"
                type="text"
                autoComplete="given-name"
                placeholder="Mario"
                className="h-10 w-full bg-background"
                {...form.register("first_name")}
              />
              <FieldError>
                {form.formState.errors.first_name?.message}
              </FieldError>
            </Field>

            <Field className="gap-1.5">
              <FieldLabel htmlFor="last_name" className={fieldLabelClass}>
                Cognome
              </FieldLabel>
              <Input
                id="last_name"
                type="text"
                autoComplete="family-name"
                placeholder="Rossi"
                className="h-10 w-full bg-background"
                {...form.register("last_name")}
              />
              <FieldError>
                {form.formState.errors.last_name?.message}
              </FieldError>
            </Field>
          </div>

          <Field className="gap-1.5">
            <FieldLabel htmlFor="email" className={fieldLabelClass}>
              Email
            </FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="nome@esempio.it"
              className="h-10 w-full bg-background"
              {...form.register("email")}
            />
            <FieldError>{form.formState.errors.email?.message}</FieldError>
          </Field>

          <div className="grid grid-cols-1 gap-4">
            <Field className="gap-1.5">
              <FieldLabel htmlFor="password" className={fieldLabelClass}>
                Password
              </FieldLabel>
              <InputGroup className="h-10 w-full bg-background">
                <InputGroupInput
                  id="password"
                  placeholder="Minimo 8 caratteri"
                  autoComplete="new-password"
                  type={showPsw ? "text" : "password"}
                  className="h-full"
                  {...form.register("password", {
                    onBlur: validatePasswordFields,
                  })}
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
                className={fieldLabelClass}
              >
                Conferma password
              </FieldLabel>
              <InputGroup className="h-10 w-full bg-background">
                <InputGroupInput
                  id="password_confirmation"
                  placeholder="Ripeti la password"
                  autoComplete="new-password"
                  type={showPswConfirmation ? "text" : "password"}
                  className="h-full"
                  {...form.register("password_confirmation", {
                    onBlur: validatePasswordFields,
                  })}
                  required
                />
                <InputGroupAddon
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                  align="inline-end"
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
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/30 p-4">
            <Checkbox
              id="termsAndConditions"
              className="mt-0.5 shrink-0"
              {...form.register("termsAndConditions")}
              checked={form.watch("termsAndConditions")}
              onCheckedChange={(value) =>
                form.setValue("termsAndConditions", value === true, {
                  shouldValidate: true,
                })
              }
            />
            <div className="min-w-0 flex-1 space-y-1">
              <Label
                htmlFor="termsAndConditions"
                className="cursor-pointer text-sm font-medium leading-snug text-foreground"
              >
                Termini e condizioni
              </Label>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Accetto i termini di servizio e l&apos;informativa sulla
                privacy.
              </p>
              <FieldError>
                {(form.formState.touchedFields.termsAndConditions ||
                  form.formState.isSubmitted) &&
                  form.formState.errors.termsAndConditions?.message}
              </FieldError>
            </div>
          </div>

          <Field className="gap-3 pt-1">
            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting}
              className="h-11 w-full rounded-full font-medium"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Registrazione in corso…
                </>
              ) : (
                "Crea account"
              )}
            </Button>
            <FieldDescription className="text-center text-sm text-muted-foreground">
              Hai già un account?{" "}
              <Link to="/auth/login" className={authLinkClass}>
                Accedi
              </Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}

export default RegisterForm
