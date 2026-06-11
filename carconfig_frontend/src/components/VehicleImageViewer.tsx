import { Button } from "@/components/ui/button"
import type { VehicleViewAngle } from "@/features/Vehicles/vehicle.type"
import { vehicleViewAngleLabels } from "@/features/Vehicles/vehicle.utils"
import { cn } from "@/lib/utils"
import { RotateCw } from "lucide-react"

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
    <div className={cn("mx-auto w-full max-w-md space-y-4 sm:max-w-lg lg:max-w-xl", className)}>
      <img
        key={imageUrl}
        src={imageUrl}
        alt={alt}
        className="mx-auto h-52 w-full object-contain transition-opacity duration-200 sm:h-60 lg:h-72"
      />

      {angles.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">Angolazione</p>
            {angles.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={rotateNext}
              >
                <RotateCw className="size-4" />
                Ruota
              </Button>
            )}
          </div>

          <div
            className="flex flex-wrap gap-2"
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
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {vehicleViewAngleLabels[angle]}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default VehicleImageViewer
