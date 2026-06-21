import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Trim } from "@/features/Trims/trim.type"
import { formatCurrency } from "@/lib/formatPrice"
import { cn } from "@/lib/utils"

type ConfigurationTrimProps = {
  trims: Trim[]
  isLoading?: boolean
  selectedId: number | null
  onChange: (trimId: number) => void
}

const ConfigurationTrim = ({
  trims,
  isLoading = false,
  selectedId,
  onChange,
}: ConfigurationTrimProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Allestimento</CardTitle>
          <CardDescription>Caricamento allestimenti…</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (trims.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Allestimento</CardTitle>
          <CardDescription>
            Nessun allestimento disponibile per questo modello.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allestimento</CardTitle>
        <CardDescription>
          Scegli il livello di equipaggiamento (trim). Il supplemento si aggiunge
          al prezzo base del veicolo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul
          className="grid gap-3"
          role="radiogroup"
          aria-label="Seleziona allestimento"
        >
          {trims.map((trim) => {
            const isSelected = selectedId === trim.id

            return (
              <li key={trim.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onChange(trim.id)}
                  className={cn(
                    "flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      isSelected
                        ? "border-primary"
                        : "border-muted-foreground/40"
                    )}
                    aria-hidden
                  >
                    {isSelected && (
                      <span className="size-2.5 rounded-full bg-primary" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 space-y-1">
                    <span className="font-medium leading-tight">{trim.name}</span>
                    <span className="block text-sm text-muted-foreground">
                      {trim.description}
                    </span>
                    <span className="block text-sm font-medium">
                      {trim.price === 0
                        ? "Incluso nel prezzo base"
                        : `+ ${formatCurrency(trim.price)}`}
                    </span>
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

export default ConfigurationTrim
