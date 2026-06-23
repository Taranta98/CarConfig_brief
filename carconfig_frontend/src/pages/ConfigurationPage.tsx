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
  formatCurrency,
  getDefaultColorId,
  getDefaultTrimId,
  getRequiredOptionalIds,
  getTrimPrice,
  vehicleBasePrice,
  vehicleDisplayName,
} from "@/features/Vehicles/vehicle.utils"
import VehicleImageViewer from "@/components/VehicleImageViewer"
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
      <section className="bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
              Configuratore online
            </p>
            <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-5xl">
              Scegli il tuo modello
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Personalizza colore, allestimento e optional con un&apos;esperienza
              simile ai configuratore dei brand automotive.
            </p>
          </div>

          <div className="mt-12">
            {vehiclesLoading && (
              <p className="text-center text-muted-foreground">Caricamento veicoli…</p>
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
          </div>
        </div>
      </section>

      <section
        ref={configSectionRef}
        id="vehicle-configuration"
        className="scroll-mt-24 min-h-screen bg-background"
      >
        {selectedVehicle ? (
          <>
            <div className="sticky top-17.5 z-30 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/90">
              <div className="mx-auto flex w-full max-w-7xl flex-wrap items-end justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <div>
                  <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                    Configurazione in corso
                  </p>
                  <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                    {vehicleDisplayName(selectedVehicle)}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedVehicle.fuel_type} · {selectedVehicle.year}
                    {selectedColor ? ` · ${selectedColor.name}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                    Prezzo stimato
                  </p>
                  <p className="font-heading text-3xl font-semibold tracking-tight">
                    {formatCurrency(configurationTotal)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mx-auto grid w-full max-w-7xl lg:grid-cols-[minmax(0,1.15fr)_minmax(380px,440px)] lg:gap-0">
              <div className="border-b border-border px-4 py-8 sm:px-6 lg:sticky lg:top-40 lg:self-start lg:border-b-0 lg:border-r lg:px-8 lg:py-10">
                <VehicleImageViewer
                  imageUrl={previewImageUrl}
                  alt={vehicleDisplayName(selectedVehicle)}
                  angles={angles}
                  selectedAngle={selectedAngle}
                  onAngleChange={setSelectedAngle}
                />
              </div>

              <div className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                <div className="surface-panel p-5 sm:p-6 lg:p-8">
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

                  <ConfigurationSidebar
                    vehicle={selectedVehicle}
                    selectedColor={selectedColor}
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
              </div>
            </div>
          </>
        ) : (
          <div className="mx-auto flex min-h-[50vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Inizia la configurazione
            </p>
            <p className="mt-4 text-2xl font-medium">
              Seleziona un modello per visualizzare l&apos;anteprima e
              personalizzare il veicolo
            </p>
            <p className="mt-3 text-muted-foreground">
              Scegli una vettura dalla gallery sopra per accedere al
              configuratore completo.
            </p>
          </div>
        )}
      </section>

      {selectedVehicle && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-4 backdrop-blur supports-backdrop-filter:bg-background/90 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Totale</p>
              <p className="text-xl font-semibold">
                {formatCurrency(configurationTotal)}
              </p>
            </div>
            <p className="text-right text-xs text-muted-foreground">
              {vehicleDisplayName(selectedVehicle)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConfigurationPage
