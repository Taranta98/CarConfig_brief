import { Filter, SearchIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  EMPTY_VEHICLE_MODEL_FILTERS,
  getVehiclePriceBounds,
  getVehicleFilterOptions,
  hasActiveVehicleFilters,
  type VehicleModelFilters,
} from "@/features/Vehicles/vehicle.filters"
import type { Vehicle } from "@/features/Vehicles/vehicle.type"
import { formatCurrency } from "@/features/Vehicles/vehicle.utils"
import { cn } from "@/lib/utils"

const selectClassName = cn(
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
)

type VehicleModelFilterBarProps = {
  vehicles: Vehicle[]
  filters: VehicleModelFilters
  onChange: (filters: VehicleModelFilters) => void
}

export function VehicleModelFilterBar({
  vehicles,
  filters,
  onChange,
}: VehicleModelFilterBarProps) {
  const { brands, years } = getVehicleFilterOptions(vehicles)
  const priceBounds = getVehiclePriceBounds(vehicles)
  const showReset = hasActiveVehicleFilters(filters)
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const sliderValue = filters.priceMax ?? priceBounds.max

  const update = (patch: Partial<VehicleModelFilters>) => {
    onChange({ ...filters, ...patch })
  }

  const handlePriceChange = (rawValue: number) => {
    update({
      priceMax: rawValue >= priceBounds.max ? null : rawValue,
    })
  }

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (panelRef.current?.contains(target)) return
      setOpen(false)
    }

    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [open])

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center justify-start gap-2">
        <div className="relative min-w-0 w-full max-w-88 sm:max-w-104">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={filters.search}
            onChange={(event) => update({ search: event.target.value })}
            placeholder="Cerca per nome modello…"
            className="h-9 pl-9 text-sm"
            aria-label="Cerca per nome modello"
          />
        </div>

        <div className="relative shrink-0" ref={panelRef}>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label="Filtri"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
          >
            <Filter className="size-4" />
          </Button>

          {open && (
            <div
              className="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-[min(42rem,calc(100vw-2rem))] rounded-xl border border-border/60 bg-card p-4 shadow-lg"
              role="dialog"
              aria-label="Filtri modelli"
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <select
                  value={filters.brand}
                  onChange={(event) => update({ brand: event.target.value })}
                  className={selectClassName}
                  aria-label="Filtra per marca"
                >
                  <option value="">Tutte le marche</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.year}
                  onChange={(event) => update({ year: event.target.value })}
                  className={selectClassName}
                  aria-label="Filtra per anno"
                >
                  <option value="">Tutti gli anni</option>
                  {years.map((year) => (
                    <option key={year} value={String(year)}>
                      {year}
                    </option>
                  ))}
                </select>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Prezzo max</span>
                    <span className="font-medium">
                      {filters.priceMax === null
                        ? "Tutti"
                        : formatCurrency(filters.priceMax)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    step={1000}
                    value={sliderValue}
                    onInput={(event) =>
                      handlePriceChange(Number(event.currentTarget.value))
                    }
                    onChange={(event) =>
                      handlePriceChange(Number(event.target.value))
                    }
                    className="h-2 w-full cursor-pointer accent-foreground"
                    aria-label="Prezzo massimo"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(priceBounds.min)}</span>
                    <button
                      type="button"
                      className="underline decoration-border underline-offset-4 hover:text-foreground"
                      onClick={() => update({ priceMax: null })}
                    >
                      Reset
                    </button>
                    <span>{formatCurrency(priceBounds.max)}</span>
                  </div>
                </div>
              </div>

              {showReset && (
                <div className="mt-4 flex justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-muted-foreground"
                    onClick={() => onChange(EMPTY_VEHICLE_MODEL_FILTERS)}
                  >
                    Azzera filtri
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
