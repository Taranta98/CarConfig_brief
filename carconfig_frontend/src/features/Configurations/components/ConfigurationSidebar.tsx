import { Button } from "@/components/ui/button"
import type { Optional } from "@/features/Optionals/optional.type"
import type { Trim } from "@/features/Trims/trim.type"
import type { Vehicle, VehicleColor } from "@/features/Vehicles/vehicle.type"
import { formatCurrency } from "@/features/Vehicles/vehicle.utils"
import { cn } from "@/lib/utils"
import { Download, Mail, Save } from "lucide-react"

type ConfigurationSidebarProps = {
  vehicle: Vehicle
  selectedColor: VehicleColor | null
  trim: Trim | null
  selectedOptionals: Optional[]
  basePrice: number
  trimTotal: number
  optionalsTotal: number
  total: number
  canDownload: boolean
  canSaveAndEmail: boolean
  isSaving?: boolean
  isEmailing?: boolean
  isDownloading?: boolean
  onSave: () => void
  onEmail: () => void
  onDownload: () => void
}

const ConfigurationSidebar = ({
  selectedColor,
  trim,
  selectedOptionals,
  basePrice,
  trimTotal,
  total,
  canDownload,
  canSaveAndEmail,
  isSaving = false,
  isEmailing = false,
  isDownloading = false,
  onSave,
  onEmail,
  onDownload,
}: ConfigurationSidebarProps) => {
  const optionalExtras = selectedOptionals.filter((optional) => !optional.is_required)

  return (
    <aside className="space-y-6 border-t border-border pt-8">
      <div className="space-y-3 text-sm">
        <p className="text-center text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Riepilogo
        </p>

        <ul className="space-y-2.5">
          <li className="flex items-start justify-between gap-3">
            <span className="text-muted-foreground">Prezzo base</span>
            <span className="shrink-0 font-medium">{formatCurrency(basePrice)}</span>
          </li>

          {selectedColor && (
            <li className="flex items-start justify-between gap-3">
              <span className="min-w-0 text-muted-foreground">Colore</span>
              <span className="shrink-0 text-right font-medium">
                {selectedColor.name}
              </span>
            </li>
          )}

          {trim && (
            <li className="flex items-start justify-between gap-3">
              <span className="min-w-0 text-muted-foreground">Allestimento</span>
              <span className="shrink-0 text-right font-medium">
                {trim.name}
                {trimTotal > 0 && (
                  <span className="block text-xs text-muted-foreground">
                    +{formatCurrency(trimTotal)}
                  </span>
                )}
              </span>
            </li>
          )}

          {optionalExtras.map((optional) => (
            <li
              key={optional.id}
              className="flex items-start justify-between gap-3"
            >
              <span className="min-w-0 text-muted-foreground wrap-break-word">
                {optional.name}
              </span>
              <span
                className={cn(
                  "shrink-0 font-medium",
                  optional.price === 0 && "text-success"
                )}
              >
                {optional.price > 0
                  ? `+${formatCurrency(optional.price)}`
                  : "Incluso"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-border pt-6 text-center">
        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Totale
        </p>
        <p className="mt-2 font-heading text-3xl font-semibold tracking-tight">
          {formatCurrency(total)}
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        <Button
          type="button"
          size="lg"
          className="w-full rounded-full"
          disabled={!canSaveAndEmail || isSaving}
          onClick={onSave}
        >
          <Save className="size-4" />
          {isSaving ? "Salvataggio…" : "Salva"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full rounded-full"
          disabled={!canSaveAndEmail || isEmailing}
          onClick={onEmail}
        >
          <Mail className="size-4" />
          {isEmailing ? "Invio…" : "Email"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="w-full rounded-full"
          disabled={!canDownload || isDownloading}
          onClick={onDownload}
        >
          <Download className="size-4" />
          {isDownloading ? "PDF…" : "PDF"}
        </Button>
      </div>
    </aside>
  )
}

export default ConfigurationSidebar
