import { http, type LaravelListPayload } from "@/lib/http"
import type { UserListItem, UserPayload } from "./user.type"

export class UserService {
  static async list() {
    return http.get<LaravelListPayload<UserListItem>>("/users")
  }

  static async create(data: UserPayload) {
    return http.post("/users", data)
  }

  static async update(id: number, data: Partial<UserPayload>) {
    return http.put(`/users/${id}`, data)
  }

  static async delete(id: number) {
    return http.delete(`/users/${id}`)
  }
}
