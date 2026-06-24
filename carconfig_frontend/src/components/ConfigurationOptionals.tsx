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

const categoryLabels: Record<string, string> = {
  Comfort: "Comfort",
  Technology: "Tecnologia",
  Safety: "Sicurezza",
  Exterior: "Esterni",
  Altri: "Altri",
}

function groupOptionalsByCategory(optionals: Optional[]) {
  type GroupedOptional = {
    category: OptionalCategory | "Altri"
    label: string
    items: Optional[]
  }

  const grouped: GroupedOptional[] = optionalCategories
    .map((category) => ({
      category,
      label: categoryLabels[category] ?? category,
      items: optionals.filter((optional) => optional.category === category),
    }))
    .filter((group) => group.items.length > 0)

  const uncategorized = optionals.filter(
    (optional) =>
      !optionalCategories.includes(optional.category as OptionalCategory)
  )

  if (uncategorized.length > 0) {
    grouped.push({
      category: "Altri",
      label: categoryLabels.Altri,
      items: uncategorized,
    })
  }

  return grouped
}

type OptionalItemProps = {
  optional: Optional
  isSelected: boolean
  onToggle: (optional: Optional) => void
}

function OptionalItem({ optional, isSelected, onToggle }: OptionalItemProps) {
  return (
    <li className="min-w-0">
      <button
        type="button"
        onClick={() => onToggle(optional)}
        disabled={optional.is_required}
        aria-pressed={isSelected}
        aria-label={`${isSelected ? "Rimuovi" : "Aggiungi"} ${optional.name}`}
        className={cn(
          "configurator-choice group flex h-full w-full min-w-0 flex-col gap-2 p-2.5 text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
          isSelected
            ? "border-foreground bg-card"
            : "hover:border-foreground/30 hover:bg-card/80",
          optional.is_required && "cursor-default"
        )}
      >
        <span className="flex items-start gap-2">
          <span
            className={cn(
              "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
              isSelected
                ? "border-foreground bg-foreground text-background"
                : "border-muted-foreground/30 bg-background group-hover:border-foreground/50"
            )}
            aria-hidden
          >
            {isSelected && <Check className="size-3" />}
          </span>
          <span className="min-w-0 flex-1 text-sm font-medium leading-snug wrap-break-word">
            {optional.name}
          </span>
        </span>
        <span className="pl-6 text-xs font-medium text-muted-foreground">
          {optional.price === 0 ? (
            <span className="text-success">Incluso</span>
          ) : (
            `+ ${formatCurrency(optional.price)}`
          )}
        </span>
      </button>
    </li>
  )
}

const ConfigurationOptionals = ({
  optionals,
  isLoading = false,
  selectedIds,
  onChange,
}: ConfigurationOptionalsProps) => {
  if (isLoading) {
    return <p className="text-center text-sm text-muted-foreground">Caricamento…</p>
  }

  if (optionals.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Nessun optional disponibile.
      </p>
    )
  }

  const toggleOptional = (optional: Optional) => {
    if (optional.is_required) return

    const next = selectedIds.includes(optional.id)
      ? selectedIds.filter((id) => id !== optional.id)
      : [...selectedIds, optional.id]

    onChange(next)
  }

  const groups = groupOptionalsByCategory(optionals)

  return (
    <div className="min-w-0 space-y-6">
      {groups.map((group) => (
        <section key={group.category} className="min-w-0 space-y-3">
          <h4 className="text-center text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            {group.label}
          </h4>
          <ul className="grid min-w-0 grid-cols-2 gap-2">
            {group.items.map((optional) => (
              <OptionalItem
                key={optional.id}
                optional={optional}
                isSelected={selectedIds.includes(optional.id)}
                onToggle={toggleOptional}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export default ConfigurationOptionals
