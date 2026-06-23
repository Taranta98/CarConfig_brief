import { Button } from "@/components/ui/button"
import type { VehicleViewAngle } from "@/features/Vehicles/vehicle.type"
import { vehicleViewAngleLabels } from "@/features/Vehicles/vehicle.utils"
import { cn } from "@/lib/utils"
import { RotateCw } from "lucide-react"

export const CONFIGURATOR_BACKGROUND_SRC = "/back_auto.png"

type VehicleImageViewerProps = {
  imageUrl: string
  alt: string
  angles: VehicleViewAngle[]
  selectedAngle: VehicleViewAngle
  onAngleChange: (angle: VehicleViewAngle) => void
  className?: string
}

const VehicleImageViewer = ({
  imageUrl,
  alt,
  angles,
  selectedAngle,
  onAngleChange,
  className,
}: VehicleImageViewerProps) => {
  const rotateNext = () => {
    if (angles.length === 0) return

    const currentIndex = angles.indexOf(selectedAngle)
    const nextIndex =
      currentIndex === -1 ? 0 : (currentIndex + 1) % angles.length

    onAngleChange(angles[nextIndex]!)
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      <div className="relative overflow-hidden rounded-2xl border border-border">
        <img
          src={CONFIGURATOR_BACKGROUND_SRC}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-110 object-cover object-center"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-black/5"
          aria-hidden
        />
        <img
          key={imageUrl}
          src={imageUrl}
          alt={alt}
          className="relative z-10 mx-auto h-56 w-full max-w-4xl object-contain px-4 pt-8 pb-4 transition-opacity duration-300 sm:h-72 sm:px-8 sm:pt-12 lg:h-80 xl:h-96"
        />
      </div>

      {angles.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div
            className="inline-flex flex-wrap justify-center gap-1 rounded-full border border-border bg-card p-1"
            role="radiogroup"
            aria-label="Seleziona angolazione"
          >
            {angles.map((angle) => {
              const isSelected = selectedAngle === angle

              return (
                <button
                  key={angle}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onAngleChange(angle)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {vehicleViewAngleLabels[angle]}
                </button>
              )
            })}
          </div>

          {angles.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={rotateNext}
            >
              <RotateCw className="size-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default VehicleImageViewer
