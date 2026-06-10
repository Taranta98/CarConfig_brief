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

const steps: { id: WizardStep; label: string; description: string }[] = [
  {
    id: "color",
    label: "Colore",
    description: "Scegli la verniciatura del veicolo",
  },
  {
    id: "trim",
    label: "Allestimento",
    description: "Scegli il livello di equipaggiamento",
  },
  {
    id: "optionals",
    label: "Optional",
    description: "Personalizza con accessori e pacchetti",
  },
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
  const colorStepComplete =
    !hasColors || selectedColorId !== null
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
    <div className="space-y-6">
      <nav aria-label="Passaggi configurazione">
        <ol className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4">
          {steps.map((wizardStep, index) => {
            const isActive = wizardStep.id === step
            const isDone = index < currentIndex
            const isDisabled = !canOpenStep(wizardStep.id, index)

            return (
              <li key={wizardStep.id} className="flex flex-1 items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!isDisabled) {
                      onStepChange(wizardStep.id)
                    }
                  }}
                  disabled={isDisabled}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive && "border-primary bg-primary/5 ring-1 ring-primary",
                    isDone && !isActive && "border-primary/30 bg-muted/30",
                    !isActive && !isDone && "border-border hover:bg-muted/40",
                    isDisabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                      isActive || isDone
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </span>
                  <span>
                    <span className="block font-medium">{wizardStep.label}</span>
                    <span className="block text-sm text-muted-foreground">
                      {wizardStep.description}
                    </span>
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <ChevronRight
                    className="hidden size-5 shrink-0 text-muted-foreground sm:block"
                    aria-hidden
                  />
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      <div
        className={cn(
          "transition-opacity duration-300",
          step === "color" ? "opacity-100" : "hidden opacity-0"
        )}
        aria-hidden={step !== "color"}
      >
        <ConfigurationColor
          colors={colors}
          isLoading={colorsLoading}
          selectedId={selectedColorId}
          onChange={onColorChange}
        />
      </div>

      <div
        className={cn(
          "transition-opacity duration-300",
          step === "trim" ? "opacity-100" : "hidden opacity-0"
        )}
        aria-hidden={step !== "trim"}
      >
        <ConfigurationTrim
          trims={trims}
          isLoading={trimsLoading}
          selectedId={selectedTrimId}
          onChange={onTrimChange}
        />
      </div>

      <div
        className={cn(
          "transition-opacity duration-300",
          step === "optionals" ? "opacity-100" : "hidden opacity-0"
        )}
        aria-hidden={step !== "optionals"}
      >
        <ConfigurationOptionals
          optionals={optionals}
          isLoading={optionalsLoading}
          selectedIds={selectedOptionalIds}
          onChange={onOptionalsChange}
        />
      </div>

      <div className="flex justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          disabled={!canGoPrev}
          onClick={goPrev}
        >
          <ChevronLeft className="size-4" />
          Indietro
        </Button>
        {step !== "optionals" ? (
          <Button type="button" disabled={!canGoNext} onClick={goNext}>
            {step === "color" ? "Avanti: allestimento" : "Avanti: optional"}
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button type="button" variant="secondary" onClick={() => onStepChange("trim")}>
            Modifica allestimento
          </Button>
        )}
      </div>
    </div>
  )
}

export default ConfigurationWizard
