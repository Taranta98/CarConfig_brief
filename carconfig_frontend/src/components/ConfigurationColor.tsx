import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
      <Card>
        <CardHeader>
          <CardTitle>Colore</CardTitle>
          <CardDescription>Caricamento colori…</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (colors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Colore</CardTitle>
          <CardDescription>
            Nessun colore disponibile per questo modello.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Colore</CardTitle>
        <CardDescription>
          Scegli la verniciatura. L&apos;anteprima si aggiorna subito.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul
          className="flex flex-wrap gap-4"
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
                    "group flex flex-col items-center gap-2 rounded-lg p-2 transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected && "bg-primary/5"
                  )}
                >
                  <span
                    className={cn(
                      "size-10 rounded-full border-2 shadow-sm transition-all",
                      isSelected
                        ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "border-border group-hover:border-primary/40"
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
      </CardContent>
    </Card>
  )
}

export default ConfigurationColor
