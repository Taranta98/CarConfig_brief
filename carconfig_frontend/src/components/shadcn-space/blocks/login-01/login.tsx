import { Button } from "@/components/ui/button";
import { Card,CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from 'zod';
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { AuthService } from "@/features/Auth/auth.service"
import { toast } from "sonner";
import { AxiosError } from "axios";
import VerifyEmail from "../verify-email-01/verify-email";

export const loginSchema = z.object({
  email: z.email({message: 'Email non valida'}),
  password: z.string().min(8, {message: 'La password deve essere lunga almeno 8 caratteri'}),
})

const LoginForm = () => {


  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  })

  const navigate = useNavigate();

  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyEmailError, setVerifyEmailError] = useState(false);

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      console.log(values)
      await AuthService.login(values)
      toast.success('Login effettuato con successo')
      navigate('/');
    } catch (error) {
      console.error("Form submission error", error)
      console.dir(error)
      toast.error(
        error instanceof AxiosError
          ? error.response?.data.message
          : "Errore del server, riprova!"
      )
      if (
        error instanceof AxiosError &&
        error.response?.data.cause === "EMAIL_NOT_VERIFIED"
      ) {
        setVerifyEmailError(true)
      }
    }
  }

  if (verifyEmail) {
    return <VerifyEmail email={verifyEmail} />
  }

  return (
    <Card className="relative w-full gap-6 border-0 bg-[var(--auth-panel-bg)] px-6 py-8 shadow-none ring-0 sm:p-12">
          <CardHeader className="text-center gap-6 p-0">
            <div className="mx-auto">
              <Link to="/">
                <img
                  src="/Logo.png"
                  alt="car config"
                  className="dark:hidden h-10 w-10"
                />
                <img
                  src="/Logo.png"
                  alt="car config"
                  className="hidden dark:block h-10 w-10"
                />
              </Link>
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-2xl font-medium text-card-foreground">
                Benvenuto su Car Config
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground font-normal">
               Accedi al tuo account
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup className="gap-6">
                <Field className="grid md:grid-cols-2 md:gap-6 gap-3">
                  <Button
                    variant="outline"
                    type="button"
                    className="text-sm text-medium text-card-foreground gap-2 rounded-lg h-9 bg-white shadow-xs cursor-pointer"
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
                    className="text-sm text-medium text-card-foreground gap-2 rounded-lg h-9 bg-white shadow-xs cursor-pointer"
                  >
                    <img
                      src="https://images.shadcnspace.com/assets/svgs/icon-facebook.svg"
                      alt="facebook icon"
                      className="dark:hidden  h-4 w-4"
                    />
                    <img
                      src="https://images.shadcnspace.com/assets/svgs/icon-facebook.svg"
                      alt="facebook icon"
                      className="hidden dark:block  h-4 w-4"
                    />
                  Entra con Facebook
                  </Button>
                </Field>
                <FieldSeparator className="bg-transparent text-sm text-muted-foreground *:data-[slot=field-separator-content]:bg-[var(--auth-panel-bg)]">
                  <span className="px-4">o accedi con</span>
                </FieldSeparator>

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
                      required
                      className="h-9 bg-white shadow-xs"
                      {...form.register("email")}
                    />
                  </Field>
                  <Field className="gap-1.5">
                    <FieldLabel
                      htmlFor="password"
                      className="text-sm text-muted-foreground font-normal"
                    >
                      Password*
                    </FieldLabel>

                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      className="h-9 bg-white shadow-xs"
                      {...form.register("password")}
                    />
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
