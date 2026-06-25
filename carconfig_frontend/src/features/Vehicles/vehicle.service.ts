import type { Optional } from "@/features/Optionals/optional.type"
import type { Trim } from "@/features/Trims/trim.type"
import type { FormDataValue } from "@/lib/formData"
import { http, type LaravelListPayload, type LaravelResourcePayload } from "@/lib/http"
import { uploadImageToBlob } from "@/lib/blobUpload"
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
    const imageValue = data.image
    if (imageValue instanceof File) {
      data = { ...data, image: await uploadImageToBlob(imageValue, "vehicles") }
    }

    return http.post<Vehicle>("/vehicles", data)
  }

  static async update(id: number, data: VehicleWritePayload) {
    const imageValue = data.image
    if (imageValue instanceof File) {
      data = { ...data, image: await uploadImageToBlob(imageValue, "vehicles") }
    }

    return http.put<Vehicle>(`/vehicles/${id}`, data)
  }

  static async delete(id: number) {
    return http.delete<Vehicle>(`/vehicles/${id}`)
  }
}
