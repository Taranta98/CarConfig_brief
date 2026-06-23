import ConfigurationSidebar from "@/features/Configurations/components/ConfigurationSidebar"
import ConfigurationWizard, {
  type WizardStep,
} from "@/features/Configurations/components/ConfigurationWizard"
import type { Optional } from "@/features/Optionals/optional.type"
import type { Trim } from "@/features/Trims/trim.type"
import type { Vehicle, VehicleColor, VehicleViewAngle } from "@/features/Vehicles/vehicle.type"
import {
  formatCurrency,
  vehicleDisplayName,
} from "@/features/Vehicles/vehicle.utils"
import VehicleImageViewer from "@/components/VehicleImageViewer"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

type VehicleConfigurationViewProps = {
  vehicle: Vehicle
  previewImageUrl: string
  angles: VehicleViewAngle[]
  selectedAngle: VehicleViewAngle
  onAngleChange: (angle: VehicleViewAngle) => void
  wizardStep: WizardStep
  onStepChange: (step: WizardStep) => void
  colors: VehicleColor[]
  colorsLoading: boolean
  selectedColorId: number | null
  onColorChange: (id: number) => void
  trims: Trim[]
  trimsLoading: boolean
  selectedTrimId: number | null
  onTrimChange: (id: number) => void
  optionals: Optional[]
  optionalsLoading: boolean
  selectedOptionalIds: number[]
  onOptionalsChange: (ids: number[]) => void
  selectedColor: VehicleColor | null
  selectedTrim: Trim | null
  selectedOptionals: Optional[]
  basePrice: number
  trimTotal: number
  optionalsTotal: number
  configurationTotal: number
  canDownload: boolean
  canSaveAndEmail: boolean
  isSaving: boolean
  isEmailing: boolean
  isDownloading: boolean
  onBack: () => void
  onSave: () => void
  onEmail: () => void
  onDownload: () => void
}

export function VehicleConfigurationView({
  vehicle,
  previewImageUrl,
  angles,
  selectedAngle,
  onAngleChange,
  wizardStep,
  onStepChange,
  colors,
  colorsLoading,
  selectedColorId,
  onColorChange,
  trims,
  trimsLoading,
  selectedTrimId,
  onTrimChange,
  optionals,
  optionalsLoading,
  selectedOptionalIds,
  onOptionalsChange,
  selectedColor,
  selectedTrim,
  selectedOptionals,
  basePrice,
  trimTotal,
  optionalsTotal,
  configurationTotal,
  canDownload,
  canSaveAndEmail,
  isSaving,
  isEmailing,
  isDownloading,
  onBack,
  onSave,
  onEmail,
  onDownload,
}: VehicleConfigurationViewProps) {
  return (
    <>
      <div className="sticky top-17.5 z-30 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/90">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[auto_1fr] items-center gap-3 px-4 py-4 sm:grid-cols-[auto_1fr_auto] sm:gap-4 sm:px-6 lg:px-8">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 rounded-full"
            onClick={onBack}
          >
            <ChevronLeft className="size-4" />
            <span className="hidden sm:inline">Tutti i modelli</span>
            <span className="sm:hidden">Indietro</span>
          </Button>

          <h2 className="text-center font-heading text-lg font-semibold tracking-tight sm:text-2xl">
            {vehicleDisplayName(vehicle)}
          </h2>

          <p className="hidden text-right font-heading text-lg font-semibold tracking-tight sm:block sm:text-2xl">
            {formatCurrency(configurationTotal)}
          </p>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl lg:grid-cols-[minmax(0,1.15fr)_minmax(0,440px)] lg:gap-0">
        <div className="min-w-0 border-b border-border px-4 py-8 sm:px-6 lg:sticky lg:top-40 lg:self-start lg:border-b-0 lg:border-r lg:px-8 lg:py-10">
          <VehicleImageViewer
            imageUrl={previewImageUrl}
            alt={vehicleDisplayName(vehicle)}
            angles={angles}
            selectedAngle={selectedAngle}
            onAngleChange={onAngleChange}
          />
        </div>

        <div className="min-w-0 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="surface-panel min-w-0 overflow-hidden p-5 sm:p-6 lg:p-8">
            <ConfigurationWizard
              step={wizardStep}
              onStepChange={onStepChange}
              colors={colors}
              colorsLoading={colorsLoading}
              selectedColorId={selectedColorId}
              onColorChange={onColorChange}
              trims={trims}
              trimsLoading={trimsLoading}
              selectedTrimId={selectedTrimId}
              onTrimChange={onTrimChange}
              optionals={optionals}
              optionalsLoading={optionalsLoading}
              selectedOptionalIds={selectedOptionalIds}
              onOptionalsChange={onOptionalsChange}
            />

            <ConfigurationSidebar
              vehicle={vehicle}
              selectedColor={selectedColor}
              trim={selectedTrim}
              selectedOptionals={selectedOptionals}
              basePrice={basePrice}
              trimTotal={trimTotal}
              optionalsTotal={optionalsTotal}
              total={configurationTotal}
              canDownload={canDownload}
              canSaveAndEmail={canSaveAndEmail}
              isSaving={isSaving}
              isEmailing={isEmailing}
              isDownloading={isDownloading}
              onSave={onSave}
              onEmail={onEmail}
              onDownload={onDownload}
            />
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-4 text-center backdrop-blur supports-backdrop-filter:bg-background/90 lg:hidden">
        <p className="text-xl font-semibold">
          {formatCurrency(configurationTotal)}
        </p>
      </div>
    </>
  )
}
