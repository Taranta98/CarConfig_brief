import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import {
  formatCurrency,
  vehicleDisplayName,
} from "@/features/Vehicles/vehicle.utils"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, Download, Eye, Trash2 } from "lucide-react"
import type { SavedConfiguration } from "../configuration.type"

type ConfigurationListCardProps = {
  config: SavedConfiguration
  onDelete: (id: number) => void
  onDownload: (config: SavedConfiguration) => void
  isDeleting?: boolean
  isDownloading?: boolean
  canDownload?: boolean
}

export function ConfigurationListCard({
  config,
  onDelete,
  onDownload,
  isDeleting = false,
  isDownloading = false,
  canDownload = true,
}: ConfigurationListCardProps) {
  const [open, setOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const optionalExtras = config.optionals.filter((o) => !o.is_required)
  const requiredOptionals = config.optionals.filter((o) => o.is_required)

  const handleConfirmDelete = () => {
    onDelete(config.id)
  }

  return (
    <Card className="overflow-hidden py-0">
      <CardHeader className="px-6 py-5">
        <CardTitle>{vehicleDisplayName(config.vehicle)}</CardTitle>
        <CardDescription>
          {config.trim?.name ?? "Allestimento"}
          {config.vehicle_color ? ` · ${config.vehicle_color.name}` : ""} ·{" "}
          {new Date(config.created_at).toLocaleDateString("it-IT")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 px-6 pb-5">
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Optional: </span>
            {config.optionals.length}
          </p>
          <p className="text-lg font-semibold">
            {formatCurrency(config.total_price)}
          </p>
        </div>

        {showDeleteConfirm ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <p className="font-medium text-foreground">
              Eliminare questa configurazione?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Stai per eliminare{" "}
              <span className="font-medium text-foreground">
                {vehicleDisplayName(config.vehicle)}
              </span>
              . L&apos;operazione non può essere annullata.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Annulla
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
              >
                <Trash2 className="size-4" />
                {isDeleting ? "Eliminazione…" : "Elimina definitivamente"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setOpen((current) => !current)}
              >
                <Eye className="size-4" />
                {open ? "Nascondi" : "Visualizza"}
                <ChevronDownIcon
                  className={cn(
                    "size-4 transition-transform duration-200",
                    open && "rotate-180"
                  )}
                />
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                disabled={!canDownload || isDownloading}
                onClick={() => onDownload(config)}
              >
                <Download className="size-4" />
                {isDownloading ? "Generazione PDF…" : "Scarica PDF"}
              </Button>
            </div>
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={() => {
                setOpen(false)
                setShowDeleteConfirm(true)
              }}
            >
              <Trash2 className="size-4" />
              Elimina
            </Button>
          </div>
        )}

        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleContent className="overflow-hidden data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-top-2 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-top-2">
            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Specifiche
              </p>

              <ul className="mt-3 space-y-2">
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Modello</span>
                  <span className="text-right font-medium">
                    {config.vehicle.brand} {config.vehicle.model}
                  </span>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Anno</span>
                  <span className="font-medium">{config.vehicle.year}</span>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Alimentazione</span>
                  <span className="font-medium">{config.vehicle.fuel_type}</span>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Prezzo base</span>
                  <span className="font-medium">
                    {formatCurrency(config.vehicle.base_price)}
                  </span>
                </li>
                {config.vehicle_color && (
                  <li className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Colore</span>
                    <span className="flex items-center gap-2 font-medium">
                      <span
                        className="size-3 shrink-0 rounded-full border"
                        style={{ backgroundColor: config.vehicle_color.hex }}
                      />
                      {config.vehicle_color.name}
                    </span>
                  </li>
                )}
                {config.trim && (
                  <li className="space-y-1">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Allestimento</span>
                      <span className="text-right font-medium">
                        {config.trim.name}
                        {config.trim.price > 0 && (
                          <span className="block text-xs text-muted-foreground">
                            +{formatCurrency(config.trim.price)}
                          </span>
                        )}
                      </span>
                    </div>
                    {config.trim.description && (
                      <p className="text-xs text-muted-foreground">
                        {config.trim.description}
                      </p>
                    )}
                  </li>
                )}
              </ul>

              {optionalExtras.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Optional
                  </p>
                  <ul className="mt-2 space-y-1">
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
                </>
              )}

              {requiredOptionals.length > 0 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {requiredOptionals.length} optional inclusi
                  nell&apos;allestimento
                </p>
              )}

              <Separator className="my-3" />

              <div className="flex items-baseline justify-between">
                <span className="font-medium">Totale</span>
                <span className="text-lg font-semibold text-primary">
                  {formatCurrency(config.total_price)}
                </span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
