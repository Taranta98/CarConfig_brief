import { useEffect, useMemo, useState } from "react"
import Paginator from "@/components/Paginator"
import { VehicleModelFilterBar } from "@/features/Configurations/components/VehicleModelFilterBar"
import { useClientPagination } from "@/hooks/useClientPagination"
import {
  EMPTY_VEHICLE_MODEL_FILTERS,
  filterVehicles,
  type VehicleModelFilters,
} from "@/features/Vehicles/vehicle.filters"
import type { Vehicle } from "@/features/Vehicles/vehicle.type"
import {
  formatCurrency,
  vehicleDisplayName,
  vehicleImageUrl,
} from "@/features/Vehicles/vehicle.utils"
import { cn } from "@/lib/utils"

const VEHICLES_PAGE_SIZE = 9

type VehicleModelSelectorProps = {
  vehicles: Vehicle[]
  onSelect: (id: number) => void
  pageSize?: number
}

export function VehicleModelSelector({
  vehicles,
  onSelect,
  pageSize = VEHICLES_PAGE_SIZE,
}: VehicleModelSelectorProps) {
  const [filters, setFilters] = useState<VehicleModelFilters>(
    EMPTY_VEHICLE_MODEL_FILTERS
  )

  const filteredVehicles = useMemo(
    () => filterVehicles(vehicles, filters),
    [vehicles, filters]
  )

  const { metadata, paginatedItems, setPage } = useClientPagination(
    filteredVehicles,
    pageSize
  )

  useEffect(() => {
    setPage(1)
  }, [filters, setPage])

  return (
    <div className="space-y-10">
      <VehicleModelFilterBar
        vehicles={vehicles}
        filters={filters}
        onChange={setFilters}
      />

      {filteredVehicles.length === 0 ? (
        <p className="text-center text-muted-foreground">
          Nessun modello corrisponde ai filtri selezionati.
        </p>
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedItems.map((vehicle) => (
              <li key={vehicle.id}>
                <button
                  type="button"
                  onClick={() => onSelect(vehicle.id)}
                  className={cn(
                    "surface-panel group flex h-full w-full flex-col overflow-hidden text-center transition-all duration-300",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "hover:border-foreground/25"
                  )}
                  aria-label={`Configura ${vehicleDisplayName(vehicle)}`}
                >
                  <div className="flex aspect-16/10 items-center justify-center bg-card/40 p-6">
                    <img
                      src={vehicleImageUrl(vehicle)}
                      alt={vehicleDisplayName(vehicle)}
                      className="max-h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-1 border-t border-border px-5 py-5">
                    <p className="text-lg font-medium text-foreground">
                      {vehicleDisplayName(vehicle)}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                      {formatCurrency(vehicle.base_price)}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <div className="flex justify-center">
            <Paginator metadata={metadata} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  )
}
