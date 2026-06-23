import { Check } from "lucide-react"
import {
  optionalCategories,
  type Optional,
  type OptionalCategory,
} from "@/features/Optionals/optional.type"
import { formatCurrency } from "@/lib/formatPrice"
import { cn } from "@/lib/utils"

type ConfigurationOptionalsProps = {
  optionals: Optional[]
  isLoading?: boolean
  selectedIds: number[]
  onChange: (selectedIds: number[]) => void
}

const ConfigurationOptionals = ({
  optionals,
  isLoading = false,
  selectedIds,
  onChange,
}: ConfigurationOptionalsProps) => {
  if (isLoading) {
    return (
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Optional</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Caricamento pacchetti e accessori…
          </p>
        </div>
      </section>
    )
  }

  if (optionals.length === 0) {
    return (
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Optional</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Nessun optional disponibile per questo modello.
          </p>
        </div>
      </section>
    )
  }

  const toggleOptional = (optional: Optional) => {
    if (optional.is_required) return

    const next = selectedIds.includes(optional.id)
      ? selectedIds.filter((id) => id !== optional.id)
      : [...selectedIds, optional.id]

    onChange(next)
  }

  const grouped: { category: string; items: Optional[] }[] = optionalCategories
    .map((category) => ({
      category,
      items: optionals.filter((o) => o.category === category),
    }))
    .filter((group) => group.items.length > 0)

  const uncategorized = optionals.filter(
    (o) => !optionalCategories.includes(o.category as OptionalCategory)
  )
  if (uncategorized.length > 0) {
    grouped.push({ category: "Altri", items: uncategorized })
  }

  return (
    <section className="space-y-8">
      <div>
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Personalizzazione
        </p>
        <h3 className="mt-2 text-xl font-medium">Optional e pacchetti</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Aggiungi equipaggiamenti al modello base. Gli elementi inclusi
          nell&apos;allestimento sono già selezionati.
        </p>
      </div>

      {grouped.map(({ category, items }) => (
        <div key={category} className="space-y-4">
          <h4 className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            {category}
          </h4>
          <ul className="grid gap-3">
            {items.map((optional) => {
              const isSelected = selectedIds.includes(optional.id)

              return (
                <li key={optional.id}>
                  <button
                    type="button"
                    onClick={() => toggleOptional(optional)}
                    disabled={optional.is_required}
                    aria-pressed={isSelected}
                    aria-label={`${isSelected ? "Rimuovi" : "Aggiungi"} ${optional.name}`}
                    className={cn(
                      "configurator-choice group flex w-full items-start gap-4 p-4 text-left",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isSelected
                        ? "border-foreground bg-card"
                        : "hover:border-foreground/30 hover:bg-card/80",
                      optional.is_required && "cursor-default"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
                        isSelected
                          ? "border-foreground bg-foreground text-background"
                          : "border-muted-foreground/30 bg-background group-hover:border-foreground/50"
                      )}
                      aria-hidden
                    >
                      {isSelected && <Check className="size-3.5" />}
                    </span>
                    <span className="min-w-0 flex-1 space-y-2">
                      <span className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium leading-tight">
                          {optional.name}
                        </span>
                        <span className="text-sm font-medium">
                          {optional.price === 0 ? (
                            <span className="text-success">Incluso</span>
                          ) : (
                            `+ ${formatCurrency(optional.price)}`
                          )}
                        </span>
                      </span>
                      <span className="block text-sm leading-relaxed text-muted-foreground">
                        {optional.description}
                      </span>
                      {optional.is_required && (
                        <span className="badge-success">
                          Incluso nell&apos;allestimento
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </section>
  )
}

export default ConfigurationOptionals
