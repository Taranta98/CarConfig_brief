import type { User } from "@/features/Users/user.type"

export function getUserInitials(user: User | undefined): string {
  if (!user) return "?"

  const first = user.first_name?.trim().charAt(0) ?? ""
  const last = user.last_name?.trim().charAt(0) ?? ""

  return (first + last).toUpperCase() || "?"
}
