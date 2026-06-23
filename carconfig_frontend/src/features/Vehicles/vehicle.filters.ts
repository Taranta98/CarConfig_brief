import type { Vehicle } from "./vehicle.type"

export type VehicleModelFilters = {
  search: string
  brand: string
  year: string
  priceMax: number | null
}

export const EMPTY_VEHICLE_MODEL_FILTERS: VehicleModelFilters = {
  search: "",
  brand: "",
  year: "",
  priceMax: null,
}

export function vehicleSearchLabel(vehicle: Vehicle): string {
  return `${vehicle.brand} ${vehicle.model}`
}

export function getVehiclePriceBounds(vehicles: Vehicle[]): {
  min: number
  max: number
} {
  if (vehicles.length === 0) {
    return { min: 0, max: 100_000 }
  }

  const prices = vehicles.map((vehicle) => Number(vehicle.base_price) || 0)
  const min = Math.min(...prices)
  const max = Math.max(...prices)

  return {
    min: Math.max(0, Math.floor(min / 1000) * 1000),
    max: Math.max(0, Math.ceil(max / 1000) * 1000),
  }
}

export function filterVehicles(
  vehicles: Vehicle[],
  filters: VehicleModelFilters
): Vehicle[] {
  const query = filters.search.trim().toLowerCase()

  return vehicles.filter((vehicle) => {
    if (query) {
      const label = vehicleSearchLabel(vehicle).toLowerCase()
      if (!label.includes(query)) {
        return false
      }
    }

    if (filters.brand && vehicle.brand !== filters.brand) {
      return false
    }

    if (filters.year && vehicle.year !== Number(filters.year)) {
      return false
    }

    if (filters.priceMax !== null) {
      const price = Number(vehicle.base_price) || 0
      if (price > filters.priceMax) {
        return false
      }
    }

    return true
  })
}

export function getVehicleFilterOptions(vehicles: Vehicle[]) {
  const brands = [...new Set(vehicles.map((vehicle) => vehicle.brand))].sort(
    (a, b) => a.localeCompare(b, "it")
  )

  const years = [...new Set(vehicles.map((vehicle) => vehicle.year))].sort(
    (a, b) => b - a
  )

  return { brands, years }
}

export function hasActiveVehicleFilters(filters: VehicleModelFilters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.brand !== "" ||
    filters.year !== "" ||
    filters.priceMax !== null
  )
}
