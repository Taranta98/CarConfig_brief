import { useEffect, useState } from "react"
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import type { Vehicle } from "@/features/Vehicles/vehicle.type"
import {
  formatCurrency,
  vehicleDisplayName,
  vehicleImageUrl,
} from "@/features/Vehicles/vehicle.utils"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

const MODELS_PER_PAGE = 3

type VehicleModelSelectorProps = {
  vehicles: Vehicle[]
  selectedId: number | null
  onSelect: (id: number) => void
}

export function VehicleModelSelector({
  vehicles,
  selectedId,
  onSelect,
}: VehicleModelSelectorProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const pageCount = Math.max(1, Math.ceil(vehicles.length / MODELS_PER_PAGE))
  const currentPage = Math.min(
    pageCount - 1,
    Math.floor(selectedIndex / MODELS_PER_PAGE)
  )

  useEffect(() => {
    if (!api) return

    const syncCarousel = () => {
      setSelectedIndex(api.selectedScrollSnap())
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }

    syncCarousel()
    api.on("select", syncCarousel)
    api.on("reInit", syncCarousel)

    return () => {
      api.off("select", syncCarousel)
      api.off("reInit", syncCarousel)
    }
  }, [api])

  const scrollToPage = (page: number) => {
    const clampedPage = Math.max(0, Math.min(pageCount - 1, page))
    api?.scrollTo(clampedPage * MODELS_PER_PAGE)
  }

  return (
    <div className="relative mx-auto max-w-6xl px-10 sm:px-12">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          slidesToScroll: MODELS_PER_PAGE,
          containScroll: "trimSnaps",
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {vehicles.map((vehicle) => {
            const isSelected = selectedId === vehicle.id

            return (
              <CarouselItem
                key={vehicle.id}
                className="basis-full pl-4 sm:basis-1/2 lg:basis-1/3"
              >
                <button
                  type="button"
                  onClick={() => onSelect(vehicle.id)}
                  className={cn(
                    "surface-panel group flex h-full w-full flex-col overflow-hidden text-left transition-all duration-300",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isSelected
                      ? "border-foreground/40 shadow-sm"
                      : "hover:border-foreground/25"
                  )}
                  aria-pressed={isSelected}
                  aria-label={`Seleziona ${vehicleDisplayName(vehicle)}`}
                >
                  <div className="flex aspect-16/10 items-center justify-center bg-card/40 p-6">
                    <img
                      src={vehicleImageUrl(vehicle)}
                      alt={vehicleDisplayName(vehicle)}
                      className="max-h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-2 border-t border-border px-5 py-5">
                    <p className="text-lg font-medium text-foreground">
                      {vehicleDisplayName(vehicle)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.fuel_type} · {vehicle.year}
                    </p>
                    <p className="text-sm font-medium">
                      da {formatCurrency(vehicle.base_price)}
                    </p>
                    <span
                      className={cn(
                        "inline-flex text-xs font-medium tracking-wide uppercase",
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {isSelected ? "Selezionato" : "Configura"}
                    </span>
                  </div>
                </button>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="absolute top-1/2 left-0 size-10 -translate-y-1/2 rounded-full"
        disabled={!canScrollPrev}
        onClick={() => api?.scrollPrev()}
        aria-label="Modelli precedenti"
      >
        <ChevronLeft className="size-4" />
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="absolute top-1/2 right-0 size-10 -translate-y-1/2 rounded-full"
        disabled={!canScrollNext}
        onClick={() => api?.scrollNext()}
        aria-label="Modelli successivi"
      >
        <ChevronRight className="size-4" />
      </Button>

      {pageCount > 1 && (
        <div
          className="mt-8 flex items-center justify-center gap-2"
          role="tablist"
          aria-label="Pagine modelli"
        >
          {Array.from({ length: pageCount }).map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={currentPage === index}
              aria-label={`Pagina ${index + 1} di ${pageCount}`}
              onClick={() => scrollToPage(index)}
              className={cn(
                "h-1 rounded-full transition-all",
                currentPage === index
                  ? "w-8 bg-foreground"
                  : "w-4 bg-foreground/30 hover:bg-foreground/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
