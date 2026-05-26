import type { User } from "../Users/user.type"
import { create } from "zustand"
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

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== "authStore" || !event.newValue) return

    try {
      const { state } = JSON.parse(event.newValue) as {
        state: Pick<AuthStore, "user" | "token">
      }
      useAuthStore.setState(state)
    } catch {
      // ignore malformed storage payload
    }
  })
}