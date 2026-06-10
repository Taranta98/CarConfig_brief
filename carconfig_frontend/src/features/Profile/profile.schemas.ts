import { z } from "zod"

export const profileSchema = z.object({
  first_name: z.string().min(1, { message: "Nome obbligatorio" }),
  last_name: z.string().min(1, { message: "Cognome obbligatorio" }),
})

export const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, { message: "Inserisci la password attuale" }),
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
