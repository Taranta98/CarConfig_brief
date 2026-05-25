import { http } from "@/lib/http"
import type { Vehicle } from "./vehicle.type";

export class VehicleService {

    static async list() {
        return http.get<Vehicle[]>('/vehicles');
    }

    static async find(id: number) {
        return http.get<Vehicle>(`/vehicles/${id}`);
    }

    static async create(data: Vehicle) {
        return http.post<Vehicle>('/vehicles', data);
    }

    static async update(id: number, data: Vehicle) {
        return http.put<Vehicle>(`/vehicles/${id}`, data);
    }

    static async delete(id: number) {
        return http.delete<Vehicle>(`/vehicles/${id}`);
    }


}