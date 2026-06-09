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
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AuthService } from "@/features/Auth/auth.service"
import { useState } from "react"
import { Link } from "react-router"
import { z } from "zod"
import { toast } from "sonner"
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
  email: z.email({ message: "Email non valida" }),
  password: z
    .string()
    .min(8, { message: "La password deve essere lunga almeno 8 caratteri" }),
  password_confirmation: z
    .string()
    .min(8, { message: "La password deve essere lunga almeno 8 caratteri" }),
  termsAndConditions: z
    .boolean()
    .refine((data) => data, {
      message: "Devi accettare i termini e le condizioni",
    })
})
.refine((data) => data.password === data.password_confirmation, {
  message: "Le password non coincidono",
  path: ["password_confirmation"],
})

const RegisterForm = () => {
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  })

  const [emailVerify, setEmailVerify] = useState("")
  const [showPsw, setShowPsw] = useState(false)
  const [showPswConfirmation, setShowPswConfirmation] = useState(false)

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    try {
      console.log(values)
      await AuthService.register(values)
      setEmailVerify(values.email)
    } catch (error) {
      console.error("Errore durante la registrazione dell'utente", error)
      toast.error("Errore durante la registrazione dell'utente")
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
                <Field className="grid gap-3 md:grid-cols-2 md:gap-6">
                  <Button
                    variant="outline"
                    type="button"
                    className="text-medium h-9 cursor-pointer gap-2 rounded-lg bg-white text-sm text-card-foreground shadow-xs"
                  >
                    <img
                      src="https://images.shadcnspace.com/assets/svgs/icon-google.svg"
                      alt="google icon"
                      className="h-4 w-4"
                    />
                    Entra con Google
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    className="text-medium h-9 cursor-pointer gap-2 rounded-lg bg-white text-sm text-card-foreground shadow-xs"
                  >
                    <img
                      src="https://images.shadcnspace.com/assets/svgs/icon-facebook.svg"
                      alt="facebook icon"
                      className="h-4 w-4 dark:hidden"
                    />
                    <img
                      src="https://images.shadcnspace.com/assets/svgs/icon-facebook.svg"
                      alt="facebook icon"
                      className="hidden h-4 w-4 dark:block"
                    />
                    Entra con Facebook
                  </Button>
                </Field>
                <FieldSeparator className="bg-transparent text-sm text-muted-foreground *:data-[slot=field-separator-content]:bg-card">
                  <span className="px-4">o iscriviti con </span>
                </FieldSeparator>

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
                      required
                      {...form.register("first_name")}
                      className="h-9 bg-white shadow-xs"
                    />
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
                      required
                      className="h-9 bg-white shadow-xs"
                      {...form.register("last_name")}
                    />
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
                      required
                      className="h-9 bg-white shadow-xs"
                      {...form.register("email")}
                    />
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
                        {...form.register("password")}
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
            {...form.register("password_confirmation")}
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
          {form.formState.errors.password_confirmation?.message}
        </FieldError>
      </Field>
                  <Field className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                    <Checkbox
                      id="termsAndConditions"
                      className={"w-4!"}
                      required
                      {...form.register("termsAndConditions")}
                      checked={form.watch("termsAndConditions")}
                      onCheckedChange={(value) =>
                        form.setValue("termsAndConditions", value)
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
                        {form.formState.errors.termsAndConditions?.message}
                      </FieldError>
                    </div>
                  </Field>
                </div>

                <Field className="gap-4">
                  <Button
                    type="submit"
                    size={"lg"}
                    className="h-10 cursor-pointer rounded-lg hover:bg-primary/80"
                  >
                    Registrati
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
