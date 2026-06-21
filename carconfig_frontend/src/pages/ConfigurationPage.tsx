import { useEffect, useMemo, useRef, useState } from "react"
import ConfigurationSidebar from "@/features/Configurations/components/ConfigurationSidebar"
import { VehicleModelSelector } from "@/features/Configurations/components/VehicleModelSelector"
import ConfigurationWizard, {
  type WizardStep,
} from "@/features/Configurations/components/ConfigurationWizard"
import { ConfigurationService } from "@/features/Configurations/configuration.service"
import { downloadPdfFile, fetchQuotePdf } from "@/features/Configurations/quotePdf"
import { useAuthStore } from "@/features/Auth/auth.store"
import { VehicleService } from "@/features/Vehicles/vehicle.service"
import type { VehicleViewAngle } from "@/features/Vehicles/vehicle.type"
import {
  calculateOptionalsTotal,
  configuratorPreviewImage,
  DEFAULT_VEHICLE_VIEW_ANGLE,
  findVehicleColor,
  getDefaultColorId,
  getDefaultTrimId,
  getRequiredOptionalIds,
  getTrimPrice,
  vehicleBasePrice,
  vehicleDisplayName,
} from "@/features/Vehicles/vehicle.utils"
import VehicleImageViewer from "@/components/VehicleImageViewer"
import { Separator } from "@/components/ui/separator"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { useNavigate } from "react-router"
import { toast } from "sonner"

const ConfigurationPage = () => {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null)
  const [selectedAngle, setSelectedAngle] = useState<VehicleViewAngle>(
    DEFAULT_VEHICLE_VIEW_ANGLE
  )
  const [selectedTrimId, setSelectedTrimId] = useState<number | null>(null)
  const [selectedOptionalIds, setSelectedOptionalIds] = useState<number[]>([])
  const [wizardStep, setWizardStep] = useState<WizardStep>("color")
  const configSectionRef = useRef<HTMLElement>(null)
  const queryClient = useQueryClient()

  const {
    data: vehiclesResponse,
    isLoading: vehiclesLoading,
    isError: vehiclesError,
  } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => VehicleService.list(),
  })
  const vehicles = vehiclesResponse?.data.data ?? []

  const { data: configuratorResponse, isLoading: configuratorLoading } =
    useQuery({
      queryKey: ["vehicles", selectedId, "configurator"],
      queryFn: () => VehicleService.getConfigurator(selectedId!),
      enabled: selectedId !== null,
    })
  const configurator = configuratorResponse?.data.data
  const colors = configurator?.colors ?? []
  const angles = configurator?.angles ?? []

  const { data: trimsResponse, isLoading: trimsLoading } = useQuery({
    queryKey: ["vehicles", selectedId, "trims"],
    queryFn: () => VehicleService.listTrims(selectedId!),
    enabled: selectedId !== null,
  })
  const trims = trimsResponse?.data.data ?? []

  const { data: optionalsResponse, isLoading: optionalsLoading } = useQuery({
    queryKey: ["vehicles", selectedId, "optionals"],
    queryFn: () => VehicleService.listOptionals(selectedId!),
    enabled: selectedId !== null,
  })
  const optionals = optionalsResponse?.data.data ?? []

  const saveMutation = useMutation({
    mutationFn: ConfigurationService.save,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configurations"] })
    },
  })

  const emailMutation = useMutation({
    mutationFn: ConfigurationService.emailQuote,
  })

  const downloadMutation = useMutation({
    mutationFn: fetchQuotePdf,
  })

  const selectedVehicle = vehicles.find((v) => v.id === selectedId)
  const selectedColor = findVehicleColor(colors, selectedColorId)
  const selectedTrim = trims.find((t) => t.id === selectedTrimId) ?? null
  const selectedOptionals = optionals.filter((o) =>
    selectedOptionalIds.includes(o.id)
  )

  const previewImageUrl = useMemo(
    () =>
      configuratorPreviewImage(configurator, selectedColorId, selectedAngle),
    [configurator, selectedColorId, selectedAngle]
  )

  const trimTotal = getTrimPrice(trims, selectedTrimId)
  const optionalsTotal = calculateOptionalsTotal(optionals, selectedOptionalIds)
  const configurationTotal =
    selectedVehicle !== undefined
      ? vehicleBasePrice(selectedVehicle) + trimTotal + optionalsTotal
      : 0

  const hasColors = colors.length > 0
  const colorStepComplete = !hasColors || selectedColorId !== null
  const canDownload = selectedTrimId !== null && colorStepComplete
  const canSaveAndEmail =
    selectedTrimId !== null &&
    colorStepComplete &&
    wizardStep === "optionals" &&
    !optionalsLoading

  const savePayload = useMemo(() => {
    if (selectedId === null || selectedTrimId === null) return null

    return {
      vehicle_id: selectedId,
      trim_id: selectedTrimId,
      vehicle_color_id: selectedColorId,
      optionals: selectedOptionalIds,
    }
  }, [selectedId, selectedTrimId, selectedColorId, selectedOptionalIds])

  useEffect(() => {
    if (selectedId === null || configuratorLoading) return

    setSelectedColorId((current) => {
      if (current !== null && colors.some((color) => color.id === current)) {
        return current
      }

      return getDefaultColorId(colors)
    })
  }, [selectedId, colors, configuratorLoading])

  useEffect(() => {
    if (angles.length === 0) return

    setSelectedAngle((current) =>
      angles.includes(current) ? current : DEFAULT_VEHICLE_VIEW_ANGLE
    )
  }, [angles, selectedId])

  useEffect(() => {
    if (selectedId === null || trimsLoading || trims.length === 0) return

    setSelectedTrimId((current) => {
      if (current !== null && trims.some((t) => t.id === current)) {
        return current
      }
      return getDefaultTrimId(trims)
    })
  }, [selectedId, trims, trimsLoading])

  useEffect(() => {
    if (selectedId === null || optionalsLoading) return

    const required = getRequiredOptionalIds(optionals)
    setSelectedOptionalIds((current) => {
      const kept = current.filter((id) => optionals.some((o) => o.id === id))
      return [...new Set([...required, ...kept])]
    })
  }, [selectedId, optionals, optionalsLoading])

  const requireAuth = (): boolean => {
    if (token) return true
    toast.error("Accedi per salvare o inviare il preventivo")
    navigate("/auth/login")
    return false
  }

  const handleModelSelect = (id: number) => {
    setSelectedId(id)
    setSelectedColorId(null)
    setSelectedAngle(DEFAULT_VEHICLE_VIEW_ANGLE)
    setSelectedTrimId(null)
    setSelectedOptionalIds([])
    setWizardStep("color")
    requestAnimationFrame(() => {
      configSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    })
  }

  const handleSave = async () => {
    if (!requireAuth() || !savePayload) return

    try {
      await saveMutation.mutateAsync(savePayload)
      toast.success("Configurazione salvata", {
        description: "La trovi in Le tue configurazioni",
      })
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? (error.response?.data?.message ?? "Salvataggio non riuscito")
          : "Salvataggio non riuscito"
      )
    }
  }

  const handleDownload = async () => {
    if (!savePayload || !selectedVehicle) return

    const filename = `preventivo-${selectedVehicle.brand}-${selectedVehicle.model}.pdf`
      .replace(/\s+/g, "-")
      .toLowerCase()

    try {
      const blob = await downloadMutation.mutateAsync(savePayload)
      downloadPdfFile(blob, filename)
      toast.success("PDF scaricato")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isAxiosError(error)
            ? (error.response?.data?.message ?? "Download PDF non riuscito")
            : "Download PDF non riuscito"
      )
    }
  }

  const handleEmail = async () => {
    if (!requireAuth() || !savePayload) return

    try {
      await emailMutation.mutateAsync(savePayload)
      toast.success("Preventivo inviato", {
        description: "Controlla la tua casella email",
      })
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? (error.response?.data?.message ?? "Invio email non riuscito")
          : "Invio email non riuscito"
      )
    }
  }

  return (
    <div className="flex flex-col pt-17.5">
      <section className="w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Scegli il tuo modello
          </h1>
          <p className="mt-3 text-muted-foreground">
            Seleziona un veicolo per iniziare la configurazione
          </p>
        </div>

        {vehiclesLoading && (
          <p className="text-center text-muted-foreground">
            Caricamento veicoli…
          </p>
        )}

        {vehiclesError && (
          <p className="text-center text-destructive">
            Impossibile caricare i veicoli. Riprova più tardi.
          </p>
        )}

        {!vehiclesLoading && !vehiclesError && vehicles.length === 0 && (
          <p className="text-center text-muted-foreground">
            Nessun veicolo disponibile al momento.
          </p>
        )}

        {vehicles.length > 0 && (
          <VehicleModelSelector
            vehicles={vehicles}
            selectedId={selectedId}
            onSelect={handleModelSelect}
          />
        )}
      </section>

      <Separator />

      <section
        ref={configSectionRef}
        id="vehicle-configuration"
        className="scroll-mt-24 min-h-[60vh] bg-muted/20"
      >
        <div className="w-full px-4 py-16 sm:px-6 lg:px-8">
          {selectedVehicle ? (
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1 space-y-6">
                <div>
                  <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
                    Configura la tua {vehicleDisplayName(selectedVehicle)}
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Segui i passaggi del wizard. Il riepilogo a destra si
                    aggiorna in tempo reale.
                  </p>
                </div>

                <VehicleImageViewer
                  imageUrl={previewImageUrl}
                  alt={vehicleDisplayName(selectedVehicle)}
                  angles={angles}
                  selectedAngle={selectedAngle}
                  onAngleChange={setSelectedAngle}
                />

                <ConfigurationWizard
                  step={wizardStep}
                  onStepChange={setWizardStep}
                  colors={colors}
                  colorsLoading={configuratorLoading}
                  selectedColorId={selectedColorId}
                  onColorChange={setSelectedColorId}
                  trims={trims}
                  trimsLoading={trimsLoading}
                  selectedTrimId={selectedTrimId}
                  onTrimChange={setSelectedTrimId}
                  optionals={optionals}
                  optionalsLoading={optionalsLoading}
                  selectedOptionalIds={selectedOptionalIds}
                  onOptionalsChange={setSelectedOptionalIds}
                />
              </div>

              <ConfigurationSidebar
                vehicle={selectedVehicle}
                selectedColor={selectedColor}
                previewImageUrl={previewImageUrl}
                trim={selectedTrim}
                selectedOptionals={selectedOptionals}
                basePrice={vehicleBasePrice(selectedVehicle)}
                trimTotal={trimTotal}
                optionalsTotal={optionalsTotal}
                total={configurationTotal}
                canDownload={canDownload}
                canSaveAndEmail={canSaveAndEmail}
                isSaving={saveMutation.isPending}
                isEmailing={emailMutation.isPending}
                isDownloading={downloadMutation.isPending}
                onSave={handleSave}
                onEmail={handleEmail}
                onDownload={handleDownload}
              />
            </div>
          ) : (
            <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
              <p className="text-lg text-muted-foreground">
                Seleziona un modello sopra per continuare con la configurazione
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default ConfigurationPage
