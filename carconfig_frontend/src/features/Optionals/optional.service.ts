import { http } from "@/lib/http"
import { unwrapList, type LaravelListPayload } from "@/lib/api"
import type { Optional } from "./optional.type"

export class OptionalService {
  static async list(vehicleId?: number) {
    const response = await http.get<LaravelListPayload<Optional>>("/optionals", {
      params: vehicleId !== undefined ? { vehicle_id: vehicleId } : undefined,
    })
    return unwrapList(response)
  }
    static async find(id: number) {
        return http.get<Optional>(`/optionals/${id}`);
    }

    static async create(data: Optional) {
        return http.post<Optional>('/optionals', data);
    }

    static async update(id: number, data: Optional) {
        return http.put<Optional>(`/optionals/${id}`, data);
    }
    static async delete(id: number) {
        return http.delete<Optional>(`/optionals/${id}`);
    }
}