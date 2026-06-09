import { http, type LaravelListPayload } from "@/lib/http"
import type { Optional } from "./optional.type"

export class OptionalService {
  static async list(vehicleId?: number) {
    return http.get<LaravelListPayload<Optional>>("/optionals", {
      params: vehicleId !== undefined ? { vehicle_id: vehicleId } : undefined,
    })
  }

  static async find(id: number) {
    return http.get<Optional>(`/optionals/${id}`)
  }

  static async create(data: Optional) {
    return http.post<Optional>("/optionals", data)
  }

  static async update(id: number, data: Optional) {
    return http.put<Optional>(`/optionals/${id}`, data)
  }

  static async delete(id: number) {
    return http.delete<Optional>(`/optionals/${id}`)
  }
}
