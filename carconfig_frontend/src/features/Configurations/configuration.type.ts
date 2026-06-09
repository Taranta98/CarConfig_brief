import type { Optional } from "@/features/Optionals/optional.type"
import type { Trim } from "@/features/Trims/trim.type"
import type { Vehicle } from "@/features/Vehicles/vehicle.type"

export type SavedConfiguration = {
  id: number
  user_id: number
  vehicle: Pick<
    Vehicle,
    "id" | "brand" | "model" | "year" | "fuel_type" | "base_price"
  >
  trim: Pick<Trim, "id" | "name" | "price" | "description"> | null
  optionals: Optional[]
  total_price: number
  status: string
  created_at: string
}

export type SaveConfigurationPayload = {
  vehicle_id: number
  trim_id: number
  optionals: number[]
}

export type QuotePdfData = {
  vehicleLabel: string
  vehicleDetails: string
  trimName: string | null
  trimPrice: number
  basePrice: number
  optionals: { name: string; price: number }[]
  optionalsTotal: number
  total: number
  generatedAt: string
}
