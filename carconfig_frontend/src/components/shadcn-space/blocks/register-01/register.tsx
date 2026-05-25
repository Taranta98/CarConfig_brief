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
import { AuthService } from "@/features/Auth/AuthService"
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
  firstName: z.string().min(1, { message: "Nome obbligatorio" }),
  lastName: z.string().min(1, { message: "Cognome obbligatorio" }),
  age: z.number().min(1, { message: "Età obbligatoria" }),
  email: z.email({ message: "Email non valida" }),
  password: z
    .string()
    .min(8, { message: "La password deve essere lunga almeno 8 caratteri" }),
  passwordConfirmation: z
    .string()
    .min(8, { message: "La password deve essere lunga almeno 8 caratteri" }),
  termsAndConditions: z
    .boolean()
    .refine((data) => data, {
      message: "Devi accettare i termini e le condizioni",
    }),
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
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="relative flex min-h-screen items-center justify-center bg-foreground dark:bg-background"
    >
      <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-0 md:py-20">
        <Card className="relative max-w-lg px-6 py-8 sm:p-12">
          <CardHeader className="gap-6 p-0 text-center">
            <div className="mx-auto">
              <Link to="/">
                <img
                  src="/Logo.png"
                  alt="shadcnspace"
                  className="h-10 w-10 dark:hidden"
                />
                <img
                  src="/Logo.png"
                  alt="shadcnspace"
                  className="hidden h-10 w-10 dark:block"
                />
              </Link>
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-2xl font-medium text-card-foreground">
                Iscriviti a Car Config
              </CardTitle>
              <CardDescription className="text-sm font-normal text-muted-foreground">
                Iscriviti ad Car Config per iniziare a configurare il tuo
                veicolo
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <form>
              <FieldGroup className="gap-6">
                <Field className="grid gap-3 md:grid-cols-2 md:gap-6">
                  <Button
                    variant="outline"
                    type="button"
                    className="text-medium h-9 cursor-pointer gap-2 rounded-lg text-sm text-card-foreground shadow-xs dark:bg-background"
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
                    className="text-medium h-9 cursor-pointer gap-2 rounded-lg text-sm text-card-foreground shadow-xs dark:bg-background"
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
                      id="text"
                      type="text"
                      placeholder="inserisci il tuo nome"
                      required
                      className="h-9 shadow-xs dark:bg-background"
                    />
                  </Field>
                  <Field className="gap-1.5">
                    <FieldLabel
                      htmlFor="name"
                      className="text-sm font-normal text-muted-foreground"
                    >
                      Cognome*
                    </FieldLabel>
                    <Input
                      id="text"
                      type="text"
                      placeholder="inserisci il tuo cognome"
                      required
                      className="h-9 shadow-xs dark:bg-background"
                    />
                  </Field>
                  <Field className="gap-1.5">
                    <FieldLabel
                      htmlFor="name"
                      className="text-sm font-normal text-muted-foreground"
                    >
                      Età*
                    </FieldLabel>
                    <Input
                      id="number"
                      type="number"
                      placeholder="inserisci la tua età"
                      required
                      className="h-9 shadow-xs dark:bg-background"
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
                      className="h-9 shadow-xs dark:bg-background"
                    />
                  </Field>
                  <Field className="gap-1.5">
                    <InputGroup>
                      <InputGroupInput
                        id="password"
                        placeholder="********"
                        type={showPsw ? "text" : "password"}
                        {...form.register("password")}
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
        <FieldLabel htmlFor="passwordConfirmation">
          Conferma password
        </FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="passwordConfirmation"
            placeholder="********"
            type={showPswConfirmation ? "text" : "password"}
            {...form.register("passwordConfirmation")}
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
          {form.formState.errors.passwordConfirmation?.message}
        </FieldError>
      </Field>
                  <Field className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                    <Checkbox
                      id="termsAndConditions"
                      className={"w-4!"}
                      // {...form.register("termsAndConditions")}
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
                    Sign up
                  </Button>
                  <FieldDescription className="text-center text-sm font-normal text-muted-foreground">
                    Already have an account?{" "}
                    <a
                      href="#"
                      className="font-medium text-card-foreground no-underline!"
                    >
                      Sign in
                    </a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}

export default RegisterForm
