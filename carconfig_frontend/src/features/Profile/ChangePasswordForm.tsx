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
import { getApiErrorMessage } from "@/features/Admin/admin.errors"
import { zodResolver } from "@hookform/resolvers/zod"
import { EyeClosed, EyeIcon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router"
import { toast } from "sonner"
import type z from "zod"
import { changePasswordSchema } from "./profile.schemas"
import { ProfileService } from "./profile.service"

export function ChangePasswordForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)

  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  })

  async function onSubmit(values: z.infer<typeof changePasswordSchema>) {
    try {
      const res = await ProfileService.updatePassword(values)
      toast.success(res.data.message)
      form.reset()
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Impossibile aggiornare la password")
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          Cambia la password del tuo account. Se non ricordi quella attuale,
          puoi richiedere un link di recupero.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <Field className="gap-1.5">
              <FieldLabel htmlFor="current_password">
                Password attuale
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="current_password"
                  type={showCurrentPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...form.register("current_password")}
                />
                <InputGroupAddon align="inline-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowCurrentPassword((value) => !value)}
                    aria-label={
                      showCurrentPassword
                        ? "Nascondi password"
                        : "Mostra password"
                    }
                  >
                    {showCurrentPassword ? <EyeClosed /> : <EyeIcon />}
                  </Button>
                </InputGroupAddon>
              </InputGroup>
              <FieldError errors={[form.formState.errors.current_password]} />
            </Field>

            <Field className="gap-1.5">
              <FieldLabel htmlFor="password">Nuova password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...form.register("password")}
                />
                <InputGroupAddon align="inline-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Nascondi password" : "Mostra password"
                    }
                  >
                    {showPassword ? <EyeClosed /> : <EyeIcon />}
                  </Button>
                </InputGroupAddon>
              </InputGroup>
              <FieldError errors={[form.formState.errors.password]} />
            </Field>

            <Field className="gap-1.5">
              <FieldLabel htmlFor="password_confirmation">
                Conferma nuova password
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="password_confirmation"
                  type={showPasswordConfirmation ? "text" : "password"}
                  autoComplete="new-password"
                  {...form.register("password_confirmation")}
                />
                <InputGroupAddon align="inline-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      setShowPasswordConfirmation((value) => !value)
                    }
                    aria-label={
                      showPasswordConfirmation
                        ? "Nascondi password"
                        : "Mostra password"
                    }
                  >
                    {showPasswordConfirmation ? <EyeClosed /> : <EyeIcon />}
                  </Button>
                </InputGroupAddon>
              </InputGroup>
              <FieldError
                errors={[form.formState.errors.password_confirmation]}
              />
            </Field>

            <FieldDescription>
              <Link
                to="/auth/forgot-password"
                className="text-primary underline-offset-4 hover:underline"
              >
                Hai dimenticato la password attuale?
              </Link>
            </FieldDescription>

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-fit"
            >
              {form.formState.isSubmitting
                ? "Aggiornamento…"
                : "Aggiorna password"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
