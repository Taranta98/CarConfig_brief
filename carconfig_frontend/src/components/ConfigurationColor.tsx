import type { VehicleColor } from "@/features/Vehicles/vehicle.type"
import { cn } from "@/lib/utils"

type ConfigurationColorProps = {
  colors: VehicleColor[]
  isLoading?: boolean
  selectedId: number | null
  onChange: (colorId: number) => void
}

const ConfigurationColor = ({
  colors,
  isLoading = false,
  selectedId,
  onChange,
}: ConfigurationColorProps) => {
  if (isLoading) {
    return <p className="text-center text-sm text-muted-foreground">Caricamento…</p>
  }

  if (colors.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Nessun colore disponibile.
      </p>
    )
  }

  const selectedColor = colors.find((color) => color.id === selectedId)

  return (
    <section className="space-y-6 text-center">
      {selectedColor && (
        <p className="text-sm font-medium">{selectedColor.name}</p>
      )}

      <ul
        className="flex flex-wrap justify-center gap-5"
        role="radiogroup"
        aria-label="Seleziona colore"
      >
        {colors.map((color) => {
          const isSelected = selectedId === color.id

          return (
            <li key={color.id}>
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={color.name}
                title={color.name}
                onClick={() => onChange(color.id)}
                className={cn(
                  "group flex flex-col items-center gap-2 rounded-xl p-2 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                <span
                  className={cn(
                    "size-12 rounded-full border shadow-sm transition-all",
                    isSelected
                      ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background"
                      : "border-border group-hover:scale-105 group-hover:border-foreground/40"
                  )}
                  style={{ backgroundColor: color.hex }}
                />
                <span
                  className={cn(
                    "max-w-24 text-center text-xs leading-tight",
                    isSelected
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {color.name}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default ConfigurationColor
