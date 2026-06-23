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
    return (
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Colore</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Caricamento palette colori…
          </p>
        </div>
      </section>
    )
  }

  if (colors.length === 0) {
    return (
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Colore</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Nessun colore disponibile per questo modello.
          </p>
        </div>
      </section>
    )
  }

  const selectedColor = colors.find((color) => color.id === selectedId)

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Esterni
        </p>
        <h3 className="mt-2 text-xl font-medium">Scegli il colore</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          La vista 3D si aggiorna in tempo reale con la tonalità selezionata.
        </p>
        {selectedColor && (
          <p className="mt-3 text-sm font-medium">{selectedColor.name}</p>
        )}
      </div>

      <ul
        className="flex flex-wrap gap-5"
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
                  "group flex flex-col items-center gap-3 rounded-xl p-2 transition-colors",
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
                    "max-w-28 text-center text-xs leading-tight",
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
