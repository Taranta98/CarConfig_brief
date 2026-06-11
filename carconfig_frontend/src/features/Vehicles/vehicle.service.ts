import type { Optional } from "@/features/Optionals/optional.type"
import type { Trim } from "@/features/Trims/trim.type"
import { buildFormData, hasFileValues, type FormDataValue } from "@/lib/formData"
import { http, type LaravelListPayload, type LaravelResourcePayload } from "@/lib/http"
import type { Vehicle, VehicleConfigurator } from "./vehicle.type"

type VehicleWritePayload = Record<string, FormDataValue>

export class VehicleService {
  static async list() {
    return http.get<LaravelListPayload<Vehicle>>("/vehicles")
  }

  static async find(id: number) {
    return http.get<LaravelResourcePayload<Vehicle>>(`/vehicles/${id}`)
  }

  static async listTrims(vehicleId: number) {
    return http.get<LaravelListPayload<Trim>>(`/vehicles/${vehicleId}/trims`)
  }

  static async listOptionals(vehicleId: number) {
    return http.get<LaravelListPayload<Optional>>(
      `/vehicles/${vehicleId}/optionals`
    )
  }

  static async getConfigurator(vehicleId: number) {
    return http.get<LaravelResourcePayload<VehicleConfigurator>>(
      `/vehicles/${vehicleId}/configurator`
    )
  }

  static async create(data: VehicleWritePayload) {
    if (hasFileValues(data)) {
      return http.post<Vehicle>("/vehicles", buildFormData(data))
    }

    return http.post<Vehicle>("/vehicles", data)
  }

  static async update(id: number, data: VehicleWritePayload) {
    if (hasFileValues(data)) {
      return http.post<Vehicle>(
        `/vehicles/${id}`,
        buildFormData(data, "PUT")
      )
    }

    return http.put<Vehicle>(`/vehicles/${id}`, data)
  }

  static async delete(id: number) {
    return http.delete<Vehicle>(`/vehicles/${id}`)
  }
}
