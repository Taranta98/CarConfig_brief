export type Vehicle = {
  id: number
  brand: string
  model: string
  year: number
  fuel_type: string
  image: string
  co2_emissions: string
  base_price: number
}

export type VehicleViewAngle = "front" | "rear" | "side"

export const VEHICLE_VIEW_ANGLES: VehicleViewAngle[] = ["front", "rear", "side"]

export type VehicleColorImages = Partial<Record<VehicleViewAngle, string>>

export type VehicleColor = {
  id: number
  code: string
  name: string
  hex: string
  sort_order: number
  images: VehicleColorImages
}

export type VehicleColorPayload = {
  code: string
  name: string
  hex: string
  sort_order: number
  images: VehicleColorImages
}

export type VehicleConfigurator = {
  vehicle: Vehicle
  angles: VehicleViewAngle[]
  colors: VehicleColor[]
}
