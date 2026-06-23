import { http, type LaravelResourcePayload } from "@/lib/http"

export type ConfiguredVehicleStat = {
  vehicle_id: number
  label: string
  count: number
}

export type UsersByRoleStat = {
  role: string
  count: number
}

export type AdminStats = {
  configured_vehicles: ConfiguredVehicleStat[]
  users: {
    total: number
    by_role: UsersByRoleStat[]
  }
}

export class AdminStatsService {
  static async get() {
    return http.get<LaravelResourcePayload<AdminStats>>("/admin/stats")
  }
}
