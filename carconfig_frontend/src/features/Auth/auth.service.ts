import type { loginSchema } from "@/components/shadcn-space/blocks/login-01/login"
import type { registerSchema } from "@/components/shadcn-space/blocks/register-01/register"
import type { verifyEmailSchema } from "@/components/shadcn-space/blocks/verify-email-01/verify-email"
import { http } from "@/lib/http"
import type z from "zod"
import type { User } from "../Users/user.type"
import { useAuthStore } from "./auth.store"

export class AuthService {
  static async register(data: z.infer<typeof registerSchema>) {
    return http.post("/register", data)
  }

  static async login(data: z.infer<typeof loginSchema>) {
    const res = await http.post("/login", data)
    const { token, user } = res.data

    if (!token) {
      throw new Error("Token non trovato")
    }

    useAuthStore.getState().login(user, token)
    return res
  }

  static async verifyEmail(data: z.infer<typeof verifyEmailSchema>) {
    const res = await http.post<{ token: string; user: User }>(
      "/auth/email-verify",
      data
    )

    if (res.data.token) {
      useAuthStore.getState().login(res.data.user, res.data.token)
    }

    return res
  }

  static async verifyEmailFromLink(
    id: string,
    hash: string,
    params: { expires: string; signature: string }
  ) {
    const res = await http.get<{
      success: boolean
      message: string
      user: User
      token: string
    }>(`/email/verify/${id}/${hash}`, { params })

    if (res.data.token) {
      useAuthStore.getState().login(res.data.user, res.data.token)
    }

    return res
  }

  static async me() {
    const token = useAuthStore.getState().token
    return http.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  static async resendEmailVerify(email: string) {
    return http.post("/auth/resend-email-verify", { email })
  }

  static async logout() {
    const token = useAuthStore.getState().token

    if (token) {
      try {
        await http.post("/logout")
      } catch {
        // clear local session even if API call fails
      }
    }

    useAuthStore.getState().logout()
  }
}
