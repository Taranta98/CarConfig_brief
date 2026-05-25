import { Check } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getOptionalsForVehicle, optionalCategories } from '@/data/optionals'
import type { Optional } from '@/types/optional'

const formatPrice = (price: number) =>
  price.toLocaleString('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  })

type ConfigurationOptionalsProps = {
  vehicleId: number
  selectedIds: number[]
  onChange: (selectedIds: number[]) => void
}

const ConfigurationOptionals = ({
  vehicleId,
  selectedIds,
  onChange
}: ConfigurationOptionalsProps) => {
  const optionals = getOptionalsForVehicle(vehicleId)

  if (optionals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Optional</CardTitle>
          <CardDescription>
            Nessun optional disponibile per questo modello.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const toggleOptional = (optional: Optional) => {
    if (optional.is_required) return

    const next = selectedIds.includes(optional.id)
      ? selectedIds.filter((id) => id !== optional.id)
      : [...selectedIds, optional.id]

    onChange(next)
  }

  const grouped = optionalCategories
    .map((category) => ({
      category,
      items: optionals.filter((o) => o.category === category)
    }))
    .filter((group) => group.items.length > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Optional</CardTitle>
        <CardDescription>
          Aggiungi equipaggiamenti al modello base. Gli optional contrassegnati come
          inclusi sono già presenti nell&apos;allestimento.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {grouped.map(({ category, items }) => (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">{category}</h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {items.map((optional) => {
                const isSelected = selectedIds.includes(optional.id)

                return (
                  <li key={optional.id}>
                    <button
                      type="button"
                      onClick={() => toggleOptional(optional)}
                      disabled={optional.is_required}
                      aria-pressed={isSelected}
                      aria-label={`${isSelected ? 'Rimuovi' : 'Aggiungi'} ${optional.name}`}
                      className={cn(
                        'group flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40 hover:bg-muted/50',
                        optional.is_required && 'cursor-default opacity-90'
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border transition-colors',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground/30 bg-background group-hover:border-primary/50'
                        )}
                        aria-hidden
                      >
                        {isSelected && <Check className="size-3.5" />}
                      </span>
                      <span className="min-w-0 flex-1 space-y-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-medium leading-tight">{optional.name}</span>
                          {optional.is_required && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                              Incluso
                            </span>
                          )}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          {optional.description}
                        </span>
                        <span className="block text-sm font-medium">
                          {optional.price === 0
                            ? 'Incluso nel prezzo'
                            : `+ ${formatPrice(optional.price)}`}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default ConfigurationOptionals
