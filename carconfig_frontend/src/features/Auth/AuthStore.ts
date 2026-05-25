import type { User } from "../Users/user.type"
import { createJSONStorage, persist } from "zustand/middleware"

export type AuthStore = {
    user: User | undefined,
    token: string,
    login: (user: User, token: string) => void,
    logout: () => void,
}
export const useAuthStore = create<AuthStore>()(
    persist(
      (set) => ({
        user: undefined,
        token: "",
        login(user, token) {
          set({ user, token })
        },
        logout() {
          set({ user: undefined, token: "" })
        },
      }),
      {
        name: "authStore",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )