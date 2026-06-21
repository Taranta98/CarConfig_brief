import { SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { adminInputClassName } from "@/features/Admin/admin.form"
import type { Vehicle } from "@/features/Vehicles/vehicle.type"
import { cn } from "@/lib/utils"

type AdminVehicleFilterBarProps = {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function AdminVehicleFilterBar({
  id,
  value,
  onChange,
  placeholder = "Filtra per modello…",
}: AdminVehicleFilterBarProps) {
  return (
    <div className="relative">
      <SearchIcon
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn("pl-8", adminInputClassName)}
        aria-label={placeholder}
      />
    </div>
  )
}

export function filterItemsByVehicleLabel<T extends { vehicle_id: number }>(
  items: T[],
  vehicles: Vehicle[],
  query: string,
  getVehicleLabel: (vehicle: Vehicle) => string
): T[] {
  const normalized = query.trim().toLowerCase()

  if (normalized === "") {
    return items
  }

  return items.filter((item) => {
    const vehicle = vehicles.find((candidate) => candidate.id === item.vehicle_id)

    if (!vehicle) {
      return false
    }

    return getVehicleLabel(vehicle).toLowerCase().includes(normalized)
  })
}
