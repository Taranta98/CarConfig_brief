import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Optional } from "@/features/Optionals/optional.type"
import type { Trim } from "@/features/Trims/trim.type"
import type { Vehicle, VehicleColor } from "@/features/Vehicles/vehicle.type"
import {
  formatCurrency,
  vehicleDisplayName,
} from "@/features/Vehicles/vehicle.utils"
import { Download, Mail, Save } from "lucide-react"

type ConfigurationSidebarProps = {
  vehicle: Vehicle
  selectedColor: VehicleColor | null
  previewImageUrl: string
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
  previewImageUrl,
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
    <aside className="sticky top-24 flex h-fit w-full flex-col rounded-xl border bg-card shadow-sm lg:w-96 xl:w-104">
      <div className="flex flex-col items-center gap-4 p-6">
        <img
          key={previewImageUrl}
          src={previewImageUrl}
          alt={vehicleDisplayName(vehicle)}
          className="h-44 w-full object-contain transition-opacity duration-200 sm:h-48"
        />
        <div className="text-center">
          <h3 className="font-heading text-xl font-semibold">
            {vehicleDisplayName(vehicle)}
          </h3>
          <p className="text-sm text-muted-foreground sm:text-base">
            {vehicle.model} · {vehicle.fuel_type} · {vehicle.year}
          </p>
          {selectedColor && (
            <p className="mt-1 text-sm text-foreground">
              Colore: {selectedColor.name}
            </p>
          )}
        </div>
      </div>

      <Separator />

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Riepilogo
          </p>
          <ul className="mt-3 space-y-2.5 text-sm sm:text-base">
            <li className="flex justify-between gap-2">
              <span className="text-muted-foreground">Prezzo base</span>
              <span className="font-medium">{formatCurrency(basePrice)}</span>
            </li>
            {selectedColor && (
              <li className="flex justify-between gap-2">
                <span className="text-muted-foreground">Colore</span>
                <span className="text-right font-medium">{selectedColor.name}</span>
              </li>
            )}
            {trim && (
              <li className="flex justify-between gap-2">
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
              <li className="space-y-1">
                <span className="text-muted-foreground">Optional</span>
                <ul className="space-y-1 pl-0">
                  {optionalExtras.map((optional) => (
                    <li
                      key={optional.id}
                      className="flex justify-between gap-2 text-xs"
                    >
                      <span>{optional.name}</span>
                      <span className="shrink-0 font-medium">
                        {optional.price > 0
                          ? `+${formatCurrency(optional.price)}`
                          : "Incluso"}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            )}
            {selectedOptionals.some((o) => o.is_required) && (
              <li className="text-xs text-muted-foreground">
                {selectedOptionals.filter((o) => o.is_required).length} optional
                inclusi nell&apos;allestimento
              </li>
            )}
          </ul>
        </div>

        <Separator />

        <div className="flex items-baseline justify-between">
          <span className="text-base font-medium">Totale</span>
          <span className="font-heading text-3xl font-semibold text-primary">
            {formatCurrency(total)}
          </span>
        </div>

        {(trimTotal > 0 || optionalsTotal > 0) && (
          <p className="text-xs text-muted-foreground">
            {trimTotal > 0 && `Allestimento ${formatCurrency(trimTotal)}`}
            {trimTotal > 0 && optionalsTotal > 0 && " · "}
            {optionalsTotal > 0 && `Optional ${formatCurrency(optionalsTotal)}`}
          </p>
        )}
      </div>

      <Separator />

      <div className="flex flex-col gap-2.5 p-6">
        <Button
          type="button"
          size="lg"
          className="w-full"
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
          className="w-full"
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
          className="w-full"
          disabled={!canDownload || isDownloading}
          onClick={onDownload}
        >
          <Download className="size-4" />
          {isDownloading ? "Generazione PDF…" : "Scarica PDF"}
        </Button>
        {!canSaveAndEmail && (
          <p className="text-center text-xs text-muted-foreground">
            Vai al passaggio optional per salvare o inviare via email
          </p>
        )}
      </div>
    </aside>
  )
}

export default ConfigurationSidebar
