import axios from "axios"
import { useAuthStore } from "@/features/Auth/auth.store"
import { myEnv } from "./env"

export const http = axios.create({
  baseURL: myEnv.backendApiUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (config.data instanceof FormData && config.headers) {
    if (typeof config.headers.delete === "function") {
      config.headers.delete("Content-Type")
    } else {
      delete config.headers["Content-Type"]
    }
  }
  return config
})

export type LaravelListPayload<T> = {
  data: T[]
}

export type LaravelResourcePayload<T> = {
  data: T
}
