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
    return <p className="text-center text-sm text-muted-foreground">Caricamento…</p>
  }

  if (trims.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Nessun allestimento disponibile.
      </p>
    )
  }

  return (
    <ul
      className="grid min-w-0 gap-2"
      role="radiogroup"
      aria-label="Seleziona allestimento"
    >
      {trims.map((trim) => {
        const isSelected = selectedId === trim.id

        return (
          <li key={trim.id} className="min-w-0">
            <button
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(trim.id)}
              className={cn(
                "configurator-choice flex w-full min-w-0 items-start gap-3 p-3 text-left",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
                isSelected
                  ? "border-foreground bg-card"
                  : "hover:border-foreground/30 hover:bg-card/80"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                  isSelected ? "border-foreground" : "border-muted-foreground/40"
                )}
                aria-hidden
              >
                {isSelected && (
                  <span className="size-2 rounded-full bg-foreground" />
                )}
              </span>

              <span className="min-w-0 flex-1 space-y-1">
                <span className="flex items-start justify-between gap-3">
                  <span className="font-medium leading-snug">{trim.name}</span>
                  <span className="shrink-0 text-sm font-medium">
                    {trim.price === 0 ? (
                      <span className="text-success">Incluso</span>
                    ) : (
                      `+ ${formatCurrency(trim.price)}`
                    )}
                  </span>
                </span>
                {trim.description && (
                  <span className="block text-sm leading-snug text-muted-foreground wrap-break-word">
                    {trim.description}
                  </span>
                )}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default ConfigurationTrim
