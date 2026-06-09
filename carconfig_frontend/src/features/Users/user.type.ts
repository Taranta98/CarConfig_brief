export type User = {
  id: number
  first_name: string
  last_name: string
  email: string
  password: string
  role: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export type UserPayload = {
  first_name: string
  last_name: string
  email: string
  password?: string
  password_confirmation?: string
  role?: string
}

export type UserListItem = Pick<
  User,
  "id" | "first_name" | "last_name" | "email" | "role"
>