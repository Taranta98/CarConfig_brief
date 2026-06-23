import { Button } from "@/components/ui/button";
import { Card,CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { EyeClosed, EyeIcon } from "lucide-react";
import { z } from 'zod';
import { Link, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { AuthService } from "@/features/Auth/auth.service"
import { getAuthRedirectPath } from "@/lib/authRedirect"
import { toast } from "sonner";
import { AxiosError } from "axios";
import VerifyEmail from "../verify-email-01/verify-email";

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

const LoginForm = () => {


  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  })

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = getAuthRedirectPath(location.state);

  const [verifyEmail, setVerifyEmail] = useState("");
  const [showPsw, setShowPsw] = useState(false);

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
    <Card className="relative w-full gap-6 border border-border/60 bg-card px-6 py-8 shadow-lg sm:p-10">
          <CardHeader className="gap-2 p-0 text-center">
            <CardTitle className="text-2xl font-medium text-card-foreground">
              Benvenuto su Car Config
            </CardTitle>
            <CardDescription className="text-sm font-normal text-muted-foreground">
              Accedi al tuo account
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup className="gap-6">
                <div className="flex flex-col gap-4">
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
                      className="text-sm text-muted-foreground font-normal"
                    >
                      Password*
                    </FieldLabel>

                    <InputGroup className="bg-white">
                      <InputGroupInput
                        id="password"
                        placeholder="Enter your password"
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
                </div>

                <Field orientation="horizontal" className="justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="terms"
                      defaultChecked
                      className="cursor-pointer"
                    />
                    <FieldLabel
                      htmlFor="terms"
                      className="text-sm text-primary font-normal cursor-pointer"
                    >
                      Ricordami su questo dispositivo
                    </FieldLabel>
                  </div>
                  <Link
                    to="/auth/forgot-password"
                    className="text-sm text-card-foreground font-medium text-end"
                  >
                    Password dimenticata?
                  </Link>
                </Field>

                <Field className="gap-4">
                  <Button type="submit" size={"lg"} className="rounded-lg h-10 hover:bg-primary/80 cursor-pointer">
                    Accedi
                  </Button>
                  <FieldDescription className="text-center text-sm font-normal text-muted-foreground">
                    Non hai un account?{" "}
                    <Link
                      to="/auth/register"
                      className="font-medium text-card-foreground no-underline!"
                    >
                      Crea un account
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
    </Card>
  );
};

export default LoginForm;
