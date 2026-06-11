import { buildFormData, hasFileValues, type FormDataValue } from "@/lib/formData"
import { http, type LaravelListPayload } from "@/lib/http"
import type { Trim } from "./trim.type"

type TrimWritePayload = Record<string, FormDataValue>

export class TrimService {
  static async list(vehicleId?: number) {
    return http.get<LaravelListPayload<Trim>>("/trims", {
      params: vehicleId !== undefined ? { vehicle_id: vehicleId } : undefined,
    })
  }

  static async find(id: number) {
    return http.get<Trim>(`/trims/${id}`)
  }

  static async create(data: TrimWritePayload) {
    if (hasFileValues(data)) {
      return http.post<Trim>("/trims", buildFormData(data))
    }

    return http.post<Trim>("/trims", data)
  }

  static async update(id: number, data: TrimWritePayload) {
    if (hasFileValues(data)) {
      return http.post<Trim>(`/trims/${id}`, buildFormData(data, "PUT"))
    }

    return http.put<Trim>(`/trims/${id}`, data)
  }

  static async delete(id: number) {
    return http.delete<Trim>(`/trims/${id}`)
  }
}
