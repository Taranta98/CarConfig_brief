import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { User } from "../Users/user.type"

export type AuthStore = {
  user: User | undefined
  token: string
  login: (user: User, token: string) => void
  logout: () => void
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
        useAuthStore.persist.clearStorage()
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
    if (event.key !== "authStore") {
      return
    }

    if (!event.newValue) {
      useAuthStore.setState({ user: undefined, token: "" })
      return
    }

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
