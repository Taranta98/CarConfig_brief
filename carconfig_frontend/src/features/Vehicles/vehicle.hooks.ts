import { useQuery } from "@tanstack/react-query"
import { VehicleService } from "./vehicle.service"

export const vehicleKeys = {
  all: ["vehicles"] as const,
  trims: (vehicleId: number) => ["vehicles", vehicleId, "trims"] as const,
  optionals: (vehicleId: number) =>
    ["vehicles", vehicleId, "optionals"] as const,
}

export function useVehicles() {
  return useQuery({
    queryKey: vehicleKeys.all,
    queryFn: () => VehicleService.list(),
  })
}

export function useVehicleTrims(vehicleId: number | null) {
  return useQuery({
    queryKey: vehicleKeys.trims(vehicleId ?? 0),
    queryFn: () => VehicleService.listTrims(vehicleId!),
    enabled: vehicleId !== null,
  })
}

export function useVehicleOptionals(vehicleId: number | null) {
  return useQuery({
    queryKey: vehicleKeys.optionals(vehicleId ?? 0),
    queryFn: () => VehicleService.listOptionals(vehicleId!),
    enabled: vehicleId !== null,
  })
}
