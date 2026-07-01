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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getApiErrorMessage } from "@/features/Admin/admin.errors"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod"
import { profileSchema } from "./profile.schemas"
import { ProfileService } from "./profile.service"
import type { User } from "../Users/user.type"

type ProfileFormProps = {
  user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
    },
  })

  useEffect(() => {
    form.reset({
      first_name: user.first_name,
      last_name: user.last_name,
    })
  }, [form, user])

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    try {
      const res = await ProfileService.update(values)
      toast.success(res.data.message)
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Impossibile aggiornare il profilo")
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profilo</CardTitle>
        <CardDescription>
          Aggiorna nome e cognome del tuo account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field className="gap-1.5">
                <FieldLabel htmlFor="first_name">Nome</FieldLabel>
                <Input id="first_name" {...form.register("first_name")} />
                <FieldError errors={[form.formState.errors.first_name]} />
              </Field>
              <Field className="gap-1.5">
                <FieldLabel htmlFor="last_name">Cognome</FieldLabel>
                <Input id="last_name" {...form.register("last_name")} />
                <FieldError errors={[form.formState.errors.last_name]} />
              </Field>
            </div>
            <Field className="gap-1.5">
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                value={user.email}
                readOnly
                disabled
              />
              {/* Email verification warning — re-enable when SMTP/domain is configured.
              {!user.email_verified_at && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  La tua email non è ancora verificata. Controlla la posta in
                  arrivo.
                </p>
              )}
              */}
            </Field>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-fit"
            >
              {form.formState.isSubmitting ? "Salvataggio…" : "Salva profilo"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
