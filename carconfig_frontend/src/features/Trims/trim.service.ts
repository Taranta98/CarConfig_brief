import { http } from "@/lib/http"
import { unwrapList, type LaravelListPayload } from "@/lib/api"
import type { Trim } from "./trim.type"

export class TrimService {
  static async list(vehicleId?: number) {
    const response = await http.get<LaravelListPayload<Trim>>("/trims", {
      params: vehicleId !== undefined ? { vehicle_id: vehicleId } : undefined,
    })
    return unwrapList(response)
  }

    static async find(id: number) {
        return http.get<Trim>(`/trims/${id}`);
    }

    static async create(data: Trim) {
        return http.post<Trim>('/trims', data);
    }

    static async update(id: number, data: Trim) {
        return http.put<Trim>(`/trims/${id}`, data);
    }
    static async delete(id: number) {
        return http.delete<Trim>(`/trims/${id}`);
    }
}