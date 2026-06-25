import type { FormDataValue } from "@/lib/formData"
import { http, type LaravelListPayload, type LaravelResourcePayload } from "@/lib/http"
import { uploadImageToBlob } from "@/lib/blobUpload"
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
    if (data.images) {
      const images: Record<string, FormDataValue> = { ...data.images }
      for (const [angle, value] of Object.entries(images)) {
        if (value instanceof File) {
          images[angle] = await uploadImageToBlob(
            value,
            `vehicle-colors/${vehicleId}`
          )
        }
      }
      data = { ...data, images }
    }

    return http.post<LaravelResourcePayload<VehicleColor>>(
      `/vehicles/${vehicleId}/colors`,
      data
    )
  }

  static async update(id: number, data: Partial<VehicleColorWritePayload>) {
    if (data.images) {
      const images: Record<string, FormDataValue> = { ...data.images }
      for (const [angle, value] of Object.entries(images)) {
        if (value instanceof File) {
          images[angle] = await uploadImageToBlob(value, `vehicle-colors/${id}`)
        }
      }
      data = { ...data, images }
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
