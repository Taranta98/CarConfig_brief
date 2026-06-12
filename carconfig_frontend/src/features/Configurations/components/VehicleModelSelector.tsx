import { useEffect, useState } from "react"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import type { Vehicle } from "@/features/Vehicles/vehicle.type"
import {
  vehicleDisplayName,
  vehicleImageUrl,
} from "@/features/Vehicles/vehicle.utils"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

const MODELS_PER_PAGE = 4

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
    <div className="relative px-10 sm:px-12">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          slidesToScroll: MODELS_PER_PAGE,
          containScroll: "trimSnaps",
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {vehicles.map((vehicle) => {
            const isSelected = selectedId === vehicle.id

            return (
              <CarouselItem
                key={vehicle.id}
                className="basis-full pl-3 sm:basis-1/2 lg:basis-1/4"
              >
                <button
                  type="button"
                  onClick={() => onSelect(vehicle.id)}
                  className={cn(
                    "group h-full w-full rounded-xl text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isSelected &&
                      "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                  aria-pressed={isSelected}
                  aria-label={`Seleziona ${vehicleDisplayName(vehicle)}`}
                >
                  <Card
                    className={cn(
                      "h-full cursor-pointer overflow-hidden py-0 transition-shadow hover:shadow-md",
                      isSelected && "shadow-md"
                    )}
                  >
                    <div className="flex aspect-4/3 items-center justify-center bg-muted/40 p-4">
                      <img
                        src={vehicleImageUrl(vehicle)}
                        alt={vehicleDisplayName(vehicle)}
                        className="max-h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base">
                        {vehicleDisplayName(vehicle)}
                      </CardTitle>
                      <CardDescription>
                        {vehicle.model} · {vehicle.fuel_type} · {vehicle.year}
                      </CardDescription>
                    </CardHeader>
                  </Card>
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
        className="absolute top-1/2 left-0 size-9 -translate-y-1/2 rounded-full shadow-sm"
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
        className="absolute top-1/2 right-0 size-9 -translate-y-1/2 rounded-full shadow-sm"
        disabled={!canScrollNext}
        onClick={() => api?.scrollNext()}
        aria-label="Modelli successivi"
      >
        <ChevronRight className="size-4" />
      </Button>

      {pageCount > 1 && (
        <div
          className="mt-6 flex items-center justify-center gap-2"
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
                "h-2 rounded-full transition-all",
                currentPage === index
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>
      )}

      {vehicles.length > 0 && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Pagina {currentPage + 1} di {pageCount} · {vehicles.length} modelli
        </p>
      )}
    </div>
  )
}
