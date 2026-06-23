import { useState } from "react"
import { CONFIGURATOR_BACKGROUND_SRC } from "@/components/VehicleImageViewer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  formatCurrency,
  savedConfigurationPreviewImage,
  vehicleDisplayName,
} from "@/features/Vehicles/vehicle.utils"
import { Download, Trash2 } from "lucide-react"
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const imageUrl = savedConfigurationPreviewImage(config)
  const subtitle = [config.trim?.name, config.vehicle_color?.name]
    .filter(Boolean)
    .join(" · ")

  const handleConfirmDelete = () => {
    onDelete(config.id)
  }

  return (
    <Card className="overflow-hidden border-border/60 py-0 shadow-none transition-shadow hover:shadow-sm">
      <div className="relative aspect-16/10 overflow-hidden bg-muted/20">
        <img
          src={CONFIGURATOR_BACKGROUND_SRC}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-110 object-cover object-center"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-black/5"
          aria-hidden
        />
        <img
          src={imageUrl}
          alt={vehicleDisplayName(config.vehicle)}
          className="relative z-10 mx-auto h-full w-full object-contain px-6 py-4"
        />
      </div>

      <div className="px-5 py-5 text-center">
        <h3 className="font-heading text-lg font-semibold tracking-tight">
          {vehicleDisplayName(config.vehicle)}
        </h3>

        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}

        <p className="mt-3 text-xl font-semibold tracking-tight text-foreground">
          {formatCurrency(config.total_price)}
        </p>

        {showDeleteConfirm ? (
          <div className="mt-5 space-y-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-4">
            <p className="text-sm font-medium">Eliminare questa configurazione?</p>
            <div className="flex justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Annulla
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
              >
                <Trash2 className="size-4" />
                {isDeleting ? "Eliminazione…" : "Elimina"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canDownload || isDownloading}
              onClick={() => onDownload(config)}
            >
              <Download className="size-4" />
              {isDownloading ? "PDF…" : "PDF"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="size-4" />
              Elimina
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
