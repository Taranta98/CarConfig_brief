import { http } from "@/lib/http"
import { unwrapList, type LaravelListPayload } from "@/lib/api"
import type { Optional } from "@/features/Optionals/optional.type"
import type { Trim } from "@/features/Trims/trim.type"
import type { Vehicle } from "./vehicle.type"

export class VehicleService {
  static async list() {
    const response = await http.get<LaravelListPayload<Vehicle>>("/vehicles")
    return unwrapList(response)
  }

  static async find(id: number) {
    const response = await http.get<{ data: Vehicle }>(`/vehicles/${id}`)
    return response.data.data
  }

  static async listTrims(vehicleId: number) {
    const response = await http.get<LaravelListPayload<Trim>>(
      `/vehicles/${vehicleId}/trims`
    )
    return unwrapList(response)
  }

  static async listOptionals(vehicleId: number) {
    const response = await http.get<LaravelListPayload<Optional>>(
      `/vehicles/${vehicleId}/optionals`
    )
    return unwrapList(response)
  }

  static async create(data: Vehicle) {
    return http.post<Vehicle>("/vehicles", data)
  }

  static async update(id: number, data: Vehicle) {
    return http.put<Vehicle>(`/vehicles/${id}`, data)
  }

  static async delete(id: number) {
    return http.delete<Vehicle>(`/vehicles/${id}`)
  }
}
