import { http } from "@/lib/http"
import type { User } from "../Users/user.type"
import { useAuthStore } from "../Auth/auth.store"
import type { changePasswordSchema, profileSchema } from "./profile.schemas"
import type z from "zod"

export class ProfileService {
  static async me() {
    return http.get<{ user: User }>("/auth/me")
  }

  static async update(data: z.infer<typeof profileSchema>) {
    const res = await http.put<{ message: string; user: User }>("/profile", data)
    const token = useAuthStore.getState().token

    if (token) {
      useAuthStore.getState().login(res.data.user, token)
    }

    return res
  }

  static async updatePassword(data: z.infer<typeof changePasswordSchema>) {
    return http.put<{ message: string }>("/profile/password", data)
  }
}
