import type { Optional } from "@/features/Optionals/optional.type"
import type { Trim } from "@/features/Trims/trim.type"
import { resolveStorageUrl } from "@/lib/api"
import type {
  Vehicle,
  VehicleColor,
  VehicleConfigurator,
  VehicleViewAngle,
} from "./vehicle.type"

const fallbackImages: Record<number, string> = {
  1: "/qashqai-lato.png",
  2: "/juke-lato.png",
  3: "/kona-lato.png",
  4: "/tucson-lato.png",
}

export function vehicleDisplayName(vehicle: Pick<Vehicle, "brand" | "model">): string {
  const shortModel = vehicle.model.split(" ")[0]
  return `${vehicle.brand} ${shortModel}`
}

export function vehicleImageUrl(vehicle: Vehicle): string {
  const fromApi = resolveStorageUrl(vehicle.image)
  return fromApi || fallbackImages[vehicle.id] || "/Logo-removebg-preview.png"
}

export const DEFAULT_VEHICLE_VIEW_ANGLE: VehicleViewAngle = "front"

export const vehicleViewAngleLabels: Record<VehicleViewAngle, string> = {
  front: "Anteriore",
  rear: "Posteriore",
}

export function getDefaultColorId(
  colors: VehicleColor[]
): number | null {
  if (colors.length === 0) return null
  const sorted = [...colors].sort((a, b) => a.sort_order - b.sort_order)
  return sorted[0]?.id ?? null
}

export function findVehicleColor(
  colors: VehicleColor[],
  colorId: number | null
): VehicleColor | null {
  if (colorId === null) return null
  return colors.find((color) => color.id === colorId) ?? null
}

export function vehicleColorImageUrl(
  color: VehicleColor | null,
  angle: VehicleViewAngle,
  angles: VehicleViewAngle[],
  fallbackVehicle?: Vehicle
): string {
  if (color) {
    const direct = color.images[angle]
    if (direct) return direct

    const front = color.images.front
    if (front) return front

    const firstAvailable = angles
      .map((item) => color.images[item])
      .find((url) => Boolean(url))

    if (firstAvailable) return firstAvailable
  }

  if (fallbackVehicle) {
    return vehicleImageUrl(fallbackVehicle)
  }

  return "/Logo-removebg-preview.png"
}

export function configuratorPreviewImage(
  configurator: VehicleConfigurator | undefined,
  colorId: number | null,
  angle: VehicleViewAngle
): string {
  if (!configurator) return "/Logo-removebg-preview.png"

  const color = findVehicleColor(configurator.colors, colorId)

  return vehicleColorImageUrl(
    color,
    angle,
    configurator.angles,
    configurator.vehicle
  )
}

export function vehicleBasePrice(vehicle: Vehicle): number {
  return Number(vehicle.base_price)
}

export function getDefaultTrimId(trims: Trim[]): number | null {
  return trims[0]?.id ?? null
}

export function getTrimPrice(trims: Trim[], trimId: number | null): number {
  if (trimId === null) return 0
  return trims.find((t) => t.id === trimId)?.price ?? 0
}

export function getRequiredOptionalIds(optionals: Optional[]): number[] {
  return optionals.filter((o) => o.is_required).map((o) => o.id)
}

export function calculateOptionalsTotal(
  optionals: Optional[],
  selectedIds: number[]
): number {
  return optionals
    .filter((o) => selectedIds.includes(o.id))
    .reduce((sum, o) => sum + o.price, 0)
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  })
}
