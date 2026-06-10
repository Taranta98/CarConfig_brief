import { http, type LaravelListPayload, type LaravelResourcePayload } from "@/lib/http"
import type { VehicleColor, VehicleColorPayload } from "./vehicle.type"

export class VehicleColorService {
  static async list(vehicleId: number) {
    return http.get<LaravelListPayload<VehicleColor>>(
      `/vehicles/${vehicleId}/colors`
    )
  }

  static async create(vehicleId: number, data: VehicleColorPayload) {
    return http.post<LaravelResourcePayload<VehicleColor>>(
      `/vehicles/${vehicleId}/colors`,
      data
    )
  }

  static async update(id: number, data: Partial<VehicleColorPayload>) {
    return http.put<LaravelResourcePayload<VehicleColor>>(
      `/vehicle-colors/${id}`,
      data
    )
  }

  static async delete(id: number) {
    return http.delete(`/vehicle-colors/${id}`)
  }
}
