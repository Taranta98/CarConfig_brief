import type { AdminField } from "@/features/Admin/admin.fields"
import { cn } from "@/lib/utils"

/** Griglia a due colonne per riempire lo spazio del pannello admin. */
export const adminFormGridClassName = "grid gap-4 sm:grid-cols-2"
export const adminFieldClassName = "w-full min-w-0"
export const adminFieldFullWidthClassName = "w-full min-w-0 sm:col-span-2"
export const adminInputClassName = "w-full min-w-0"
export const adminFilterClassName = "w-full max-w-sm"
export const adminSelectClassName =
  "flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"

export function adminFieldSpanClass(field: Pick<AdminField, "type">): string {
  if (field.type === "textarea" || field.type === "image") {
    return adminFieldFullWidthClassName
  }

  return adminFieldClassName
}

export function adminFormGridClass(...extra: Array<string | false | undefined>) {
  return cn(adminFormGridClassName, ...extra)
}
