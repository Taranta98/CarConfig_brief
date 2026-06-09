import { http, type LaravelListPayload } from "@/lib/http"
import type { Trim } from "./trim.type"

export class TrimService {
  static async list(vehicleId?: number) {
    return http.get<LaravelListPayload<Trim>>("/trims", {
      params: vehicleId !== undefined ? { vehicle_id: vehicleId } : undefined,
    })
  }

  static async find(id: number) {
    return http.get<Trim>(`/trims/${id}`)
  }

  static async create(data: Trim) {
    return http.post<Trim>("/trims", data)
  }

  static async update(id: number, data: Trim) {
    return http.put<Trim>(`/trims/${id}`, data)
  }

  static async delete(id: number) {
    return http.delete<Trim>(`/trims/${id}`)
  }
}
