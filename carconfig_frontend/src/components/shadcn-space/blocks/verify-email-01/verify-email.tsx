import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { useAuthStore } from "@/features/Auth/auth.store"
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from 'zod';

export const verifyEmailSchema = z.object({
  email: z.email({message: 'Email non valida'}),
  code: z.string().min(6, {message: 'Il codice è obbligatorio'}),
})

type VerifyEmailProps = {
  email: string
}

const VerifyEmail = ({ email }: VerifyEmailProps) => {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (!token || !user?.email_verified_at) return

    toast.success("Email verificata! Sei connesso.")
    navigate("/", { replace: true })
  }, [navigate, token, user?.email_verified_at])

  return (
    <section className="bg-foreground dark:bg-background min-h-screen flex items-center relative">
      <div className="pointer-events-none absolute inset-0 right-0 overflow-hidden md:block hidden">
        <div className="absolute left-1/1 top-0 h-650 w-650 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10" />
        <div className="absolute left-1/1 top-0 h-175 w-175 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground dark:bg-background" />
      </div>
      <div className="py-10 md:py-20 max-w-lg px-4 sm:px-0 mx-auto w-full">
        <Card className="px-6 py-8 sm:p-12 relative">
          <CardHeader className="text-center gap-6 p-0">
            <div className="mx-auto">
              <img
                src="/Logo.png"
                alt="Car Config"
                className="h-10 w-10"
              />
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-2xl font-medium text-card-foreground">
                Verifica la tua email
              </CardTitle>
              <CardDescription className="text-sm font-normal text-muted-foreground">
                Abbiamo inviato un link di attivazione a{" "}
                <span className="font-medium text-card-foreground">{email}</span>.
                Apri la mail e clicca sul link: questa pagina si aggiornerà
                automaticamente e sarai connesso.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <FieldGroup>
              <Field className="gap-4">
                <p className="text-center text-sm text-muted-foreground">
                  In attesa di verifica…
                </p>
                <FieldDescription className="text-center text-sm font-normal text-muted-foreground">
                  Non hai ricevuto l&apos;email? Controlla lo spam o riprova
                  tra qualche minuto.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default VerifyEmail;
