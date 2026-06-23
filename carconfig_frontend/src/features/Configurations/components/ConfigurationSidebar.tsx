import { Button } from "@/components/ui/button"
import type { Optional } from "@/features/Optionals/optional.type"
import type { Trim } from "@/features/Trims/trim.type"
import type { Vehicle, VehicleColor } from "@/features/Vehicles/vehicle.type"
import {
  formatCurrency,
  vehicleDisplayName,
} from "@/features/Vehicles/vehicle.utils"
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
  vehicle,
  selectedColor,
  trim,
  selectedOptionals,
  basePrice,
  trimTotal,
  optionalsTotal,
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
  const optionalExtras = selectedOptionals.filter((o) => !o.is_required)

  return (
    <aside className="space-y-6 border-t border-border pt-8">
      <div>
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Il tuo veicolo
        </p>
        <h3 className="mt-2 text-lg font-medium">
          {vehicleDisplayName(vehicle)}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {vehicle.model} · {vehicle.fuel_type} · {vehicle.year}
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Riepilogo prezzo
        </p>
        <ul className="space-y-3 text-sm">
          <li className="flex justify-between gap-3">
            <span className="text-muted-foreground">Prezzo base</span>
            <span className="font-medium">{formatCurrency(basePrice)}</span>
          </li>
          {selectedColor && (
            <li className="flex justify-between gap-3">
              <span className="text-muted-foreground">Colore</span>
              <span className="text-right font-medium">{selectedColor.name}</span>
            </li>
          )}
          {trim && (
            <li className="flex justify-between gap-3">
              <span className="text-muted-foreground">Allestimento</span>
              <span className="text-right font-medium">
                {trim.name}
                {trimTotal > 0 && (
                  <span className="block text-xs text-muted-foreground">
                    +{formatCurrency(trimTotal)}
                  </span>
                )}
              </span>
            </li>
          )}
          {optionalExtras.length > 0 && (
            <li className="space-y-2">
              <span className="text-muted-foreground">Optional</span>
              <ul className="space-y-1.5">
                {optionalExtras.map((optional) => (
                  <li
                    key={optional.id}
                    className="flex justify-between gap-3 text-xs"
                  >
                    <span>{optional.name}</span>
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
            </li>
          )}
        </ul>
      </div>

      <div className="surface-panel p-5">
        <div className="flex items-end justify-between gap-4">
          <span className="text-sm font-medium text-muted-foreground">
            Prezzo totale
          </span>
          <span className="font-heading text-3xl font-semibold tracking-tight">
            {formatCurrency(total)}
          </span>
        </div>
        {(trimTotal > 0 || optionalsTotal > 0) && (
          <p className="mt-2 text-xs text-muted-foreground">
            {trimTotal > 0 && `Allestimento ${formatCurrency(trimTotal)}`}
            {trimTotal > 0 && optionalsTotal > 0 && " · "}
            {optionalsTotal > 0 && `Optional ${formatCurrency(optionalsTotal)}`}
          </p>
        )}
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
          {isSaving ? "Salvataggio…" : "Salva configurazione"}
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
          {isEmailing ? "Invio in corso…" : "Invia PDF via email"}
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
          {isDownloading ? "Generazione PDF…" : "Scarica PDF"}
        </Button>
        {!canSaveAndEmail && (
          <p className="text-center text-xs text-muted-foreground">
            Completa tutti i passaggi per salvare o inviare il preventivo
          </p>
        )}
      </div>
    </aside>
  )
}

export default ConfigurationSidebar
