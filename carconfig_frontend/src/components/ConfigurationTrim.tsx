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
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Allestimento</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Caricamento versioni disponibili…
          </p>
        </div>
      </section>
    )
  }

  if (trims.length === 0) {
    return (
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Allestimento</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Nessun allestimento disponibile per questo modello.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Versioni
        </p>
        <h3 className="mt-2 text-xl font-medium">Scegli l&apos;allestimento</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Confronta i livelli di equipaggiamento e il relativo supplemento.
        </p>
      </div>

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
                  "flex w-full items-start gap-4 rounded-xl border p-5 text-left transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isSelected
                    ? "border-foreground bg-muted/40 shadow-sm"
                    : "border-border hover:border-foreground/30 hover:bg-muted/20"
                )}
              >
                <span
                  className={cn(
                    "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    isSelected ? "border-foreground" : "border-muted-foreground/40"
                  )}
                  aria-hidden
                >
                  {isSelected && (
                    <span className="size-2.5 rounded-full bg-foreground" />
                  )}
                </span>
                <span className="min-w-0 flex-1 space-y-2">
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-base font-medium leading-tight">
                      {trim.name}
                    </span>
                    <span className="text-sm font-medium">
                      {trim.price === 0
                        ? "Incluso"
                        : `+ ${formatCurrency(trim.price)}`}
                    </span>
                  </span>
                  <span className="block text-sm leading-relaxed text-muted-foreground">
                    {trim.description}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default ConfigurationTrim
