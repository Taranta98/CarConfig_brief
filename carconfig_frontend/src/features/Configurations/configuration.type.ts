import type { Optional } from "@/features/Optionals/optional.type"
import type { Trim } from "@/features/Trims/trim.type"
import type {
  Vehicle,
  VehicleColor,
  VehicleColorImages,
} from "@/features/Vehicles/vehicle.type"

export type SavedConfiguration = {
  id: number
  user_id: number
  vehicle: Pick<
    Vehicle,
    "id" | "brand" | "model" | "year" | "fuel_type" | "base_price" | "image"
  >
  trim: Pick<Trim, "id" | "name" | "price" | "description"> | null
  vehicle_color:
    | (Pick<VehicleColor, "id" | "code" | "name" | "hex"> & {
        images?: VehicleColorImages
      })
    | null
  optionals: Optional[]
  total_price: number
  status: string
  created_at: string
}

export type SaveConfigurationPayload = {
  vehicle_id: number
  trim_id: number
  vehicle_color_id?: number | null
  optionals: number[]
}

export function savedConfigurationToPayload(
  config: SavedConfiguration
): SaveConfigurationPayload | null {
  if (!config.trim) {
    return null
  }

  return {
    vehicle_id: config.vehicle.id,
    trim_id: config.trim.id,
    vehicle_color_id: config.vehicle_color?.id ?? null,
    optionals: config.optionals.map((optional) => optional.id),
  }
}

export type QuotePdfData = {
  vehicleLabel: string
  vehicleDetails: string
  colorName: string | null
  trimName: string | null
  trimPrice: number
  basePrice: number
  optionals: { name: string; price: number }[]
  optionalsTotal: number
  total: number
  generatedAt: string
}
