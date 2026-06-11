import { buildFormData, hasFileValues, type FormDataValue } from "@/lib/formData"
import { http, type LaravelListPayload, type LaravelResourcePayload } from "@/lib/http"
import type { VehicleColor, VehicleColorPayload } from "./vehicle.type"

type VehicleColorWritePayload = VehicleColorPayload & {
  images?: Record<string, FormDataValue>
}

export class VehicleColorService {
  static async list(vehicleId: number) {
    return http.get<LaravelListPayload<VehicleColor>>(
      `/vehicles/${vehicleId}/colors`
    )
  }

  static async create(vehicleId: number, data: VehicleColorWritePayload) {
    if (hasFileValues(data as Record<string, FormDataValue>)) {
      return http.post<LaravelResourcePayload<VehicleColor>>(
        `/vehicles/${vehicleId}/colors`,
        buildFormData(data as Record<string, FormDataValue>)
      )
    }

    return http.post<LaravelResourcePayload<VehicleColor>>(
      `/vehicles/${vehicleId}/colors`,
      data
    )
  }

  static async update(id: number, data: Partial<VehicleColorWritePayload>) {
    if (hasFileValues(data as Record<string, FormDataValue>)) {
      return http.post<LaravelResourcePayload<VehicleColor>>(
        `/vehicle-colors/${id}`,
        buildFormData(data as Record<string, FormDataValue>, "PUT")
      )
    }

    return http.put<LaravelResourcePayload<VehicleColor>>(
      `/vehicle-colors/${id}`,
      data
    )
  }

  static async delete(id: number) {
    return http.delete(`/vehicle-colors/${id}`)
  }
}
