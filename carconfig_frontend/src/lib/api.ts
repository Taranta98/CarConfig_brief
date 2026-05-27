import type { AxiosResponse } from "axios"
import { myEnv } from "./env"

export type LaravelListPayload<T> = {
  data: T[]
}

export function unwrapList<T>(response: AxiosResponse<LaravelListPayload<T>>): T[] {
  return response.data.data
}

export function resolveStorageUrl(path: string | null | undefined): string {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  const normalized = path.replace(/^\//, "")
  if (normalized.startsWith("storage/")) {
    return `${myEnv.backendUrl}/${normalized}`
  }
  return `${myEnv.backendUrl}/storage/${normalized}`
}
