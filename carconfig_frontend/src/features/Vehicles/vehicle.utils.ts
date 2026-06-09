import type { Optional } from "@/features/Optionals/optional.type"
import type { Trim } from "@/features/Trims/trim.type"
import { resolveStorageUrl } from "@/lib/api"
import type { Vehicle } from "./vehicle.type"

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
  return fromApi || fallbackImages[vehicle.id] || "/Logo.svg"
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
