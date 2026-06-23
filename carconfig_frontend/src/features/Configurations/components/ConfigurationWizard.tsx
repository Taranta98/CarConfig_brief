import ConfigurationColor from "@/components/ConfigurationColor"
import ConfigurationOptionals from "@/components/ConfigurationOptionals"
import ConfigurationTrim from "@/components/ConfigurationTrim"
import { Button } from "@/components/ui/button"
import type { Optional } from "@/features/Optionals/optional.type"
import type { Trim } from "@/features/Trims/trim.type"
import type { VehicleColor } from "@/features/Vehicles/vehicle.type"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type WizardStep = "color" | "trim" | "optionals"

type ConfigurationWizardProps = {
  step: WizardStep
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
}

const steps: { id: WizardStep; label: string }[] = [
  { id: "color", label: "Colore" },
  { id: "trim", label: "Allestimento" },
  { id: "optionals", label: "Optional" },
]

const ConfigurationWizard = ({
  step,
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
}: ConfigurationWizardProps) => {
  const currentIndex = steps.findIndex((item) => item.id === step)
  const hasColors = colors.length > 0
  const colorStepComplete = !hasColors || selectedColorId !== null
  const canGoNext =
    (step === "color" && colorStepComplete) ||
    (step === "trim" && selectedTrimId !== null)
  const canGoPrev = step !== "color"

  const canOpenStep = (targetStep: WizardStep, index: number) => {
    if (index <= currentIndex) return true
    if (targetStep === "trim") return colorStepComplete
    if (targetStep === "optionals") {
      return colorStepComplete && selectedTrimId !== null
    }
    return true
  }

  const goNext = () => {
    if (step === "color") {
      onStepChange("trim")
      return
    }

    if (step === "trim") {
      onStepChange("optionals")
    }
  }

  const goPrev = () => {
    if (step === "optionals") {
      onStepChange("trim")
      return
    }

    if (step === "trim") {
      onStepChange("color")
    }
  }

  return (
    <div className="min-w-0 space-y-6">
      <nav aria-label="Passaggi configurazione">
        <ol className="flex border-b border-border">
          {steps.map((wizardStep, index) => {
            const isActive = wizardStep.id === step
            const isDisabled = !canOpenStep(wizardStep.id, index)

            return (
              <li key={wizardStep.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => {
                    if (!isDisabled) {
                      onStepChange(wizardStep.id)
                    }
                  }}
                  disabled={isDisabled}
                  className={cn(
                    "relative flex w-full flex-col items-center gap-1 px-1 py-3 text-center transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isDisabled && "cursor-not-allowed opacity-40"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {wizardStep.label}
                  </span>
                  <span
                    className={cn(
                      "absolute inset-x-0 bottom-0 h-0.5 transition-colors",
                      isActive ? "bg-foreground" : "bg-transparent"
                    )}
                  />
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="min-w-0">
        {step === "color" && (
          <ConfigurationColor
            colors={colors}
            isLoading={colorsLoading}
            selectedId={selectedColorId}
            onChange={onColorChange}
          />
        )}

        {step === "trim" && (
          <ConfigurationTrim
            trims={trims}
            isLoading={trimsLoading}
            selectedId={selectedTrimId}
            onChange={onTrimChange}
          />
        )}

        {step === "optionals" && (
          <ConfigurationOptionals
            optionals={optionals}
            isLoading={optionalsLoading}
            selectedIds={selectedOptionalIds}
            onChange={onOptionalsChange}
          />
        )}
      </div>

      <div className="flex justify-between gap-3 border-t border-border pt-6">
        <Button
          type="button"
          variant="ghost"
          className="rounded-full"
          disabled={!canGoPrev}
          onClick={goPrev}
        >
          <ChevronLeft className="size-4" />
          Indietro
        </Button>
        {step !== "optionals" && (
          <Button
            type="button"
            className="rounded-full"
            disabled={!canGoNext}
            onClick={goNext}
          >
            Continua
            <ChevronRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default ConfigurationWizard
