import { useEffect, useMemo, useRef, useState } from "react"
import ConfigurationSidebar from "@/features/Configurations/components/ConfigurationSidebar"
import ConfigurationWizard, {
  type WizardStep,
} from "@/features/Configurations/components/ConfigurationWizard"
import { ConfigurationService } from "@/features/Configurations/configuration.service"
import type { QuotePdfData } from "@/features/Configurations/configuration.type"
import { downloadQuotePdf } from "@/features/Configurations/quotePdf"
import { useAuthStore } from "@/features/Auth/auth.store"
import { VehicleService } from "@/features/Vehicles/vehicle.service"
import {
  calculateOptionalsTotal,
  getDefaultTrimId,
  getRequiredOptionalIds,
  getTrimPrice,
  vehicleBasePrice,
  vehicleDisplayName,
  vehicleImageUrl,
} from "@/features/Vehicles/vehicle.utils"
import { cn } from "@/lib/utils"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { useNavigate } from "react-router"
import { toast } from "sonner"

const ConfigurationPage = () => {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedTrimId, setSelectedTrimId] = useState<number | null>(null)
  const [selectedOptionalIds, setSelectedOptionalIds] = useState<number[]>([])
  const [wizardStep, setWizardStep] = useState<WizardStep>("trim")
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

  const selectedVehicle = vehicles.find((v) => v.id === selectedId)
  const selectedTrim = trims.find((t) => t.id === selectedTrimId) ?? null
  const selectedOptionals = optionals.filter((o) =>
    selectedOptionalIds.includes(o.id)
  )

  const trimTotal = getTrimPrice(trims, selectedTrimId)
  const optionalsTotal = calculateOptionalsTotal(optionals, selectedOptionalIds)
  const configurationTotal =
    selectedVehicle !== undefined
      ? vehicleBasePrice(selectedVehicle) + trimTotal + optionalsTotal
      : 0

  const canDownload = selectedTrimId !== null
  const canSaveAndEmail =
    selectedTrimId !== null && wizardStep === "optionals"

  const quotePdfData = useMemo((): QuotePdfData | null => {
    if (!selectedVehicle || selectedTrimId === null) return null

    return {
      vehicleLabel: vehicleDisplayName(selectedVehicle),
      vehicleDetails: `${selectedVehicle.model} · ${selectedVehicle.fuel_type} · ${selectedVehicle.year}`,
      trimName: selectedTrim?.name ?? null,
      trimPrice: trimTotal,
      basePrice: vehicleBasePrice(selectedVehicle),
      optionals: selectedOptionals.map((o) => ({
        name: o.name,
        price: o.price,
      })),
      optionalsTotal,
      total: configurationTotal,
      generatedAt: new Date().toLocaleString("it-IT"),
    }
  }, [
    selectedVehicle,
    selectedTrimId,
    selectedTrim,
    trimTotal,
    selectedOptionals,
    optionalsTotal,
    configurationTotal,
  ])

  const savePayload = useMemo(() => {
    if (selectedId === null || selectedTrimId === null) return null
    return {
      vehicle_id: selectedId,
      trim_id: selectedTrimId,
      optionals: selectedOptionalIds,
    }
  }, [selectedId, selectedTrimId, selectedOptionalIds])

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
    setSelectedTrimId(null)
    setSelectedOptionalIds([])
    setWizardStep("trim")
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

  const handleDownload = () => {
    if (!quotePdfData || !selectedVehicle) return

    const filename = `preventivo-${selectedVehicle.brand}-${selectedVehicle.model}.pdf`
      .replace(/\s+/g, "-")
      .toLowerCase()

    downloadQuotePdf(quotePdfData, filename)
    toast.success("PDF scaricato")
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
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {vehicles.map((vehicle) => {
            const isSelected = selectedId === vehicle.id

            return (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => handleModelSelect(vehicle.id)}
                className={cn(
                  "group rounded-xl text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isSelected &&
                    "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
                aria-pressed={isSelected}
                aria-label={`Seleziona ${vehicleDisplayName(vehicle)}`}
              >
                <Card
                  className={cn(
                    "h-full cursor-pointer overflow-hidden py-0 transition-shadow hover:shadow-md",
                    isSelected && "shadow-md"
                  )}
                >
                  <div className="flex aspect-4/3 items-center justify-center bg-muted/40 p-4">
                    <img
                      src={vehicleImageUrl(vehicle)}
                      alt={vehicleDisplayName(vehicle)}
                      className="max-h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <CardHeader className="pb-4">
                    <CardTitle>{vehicleDisplayName(vehicle)}</CardTitle>
                    <CardDescription>
                      {vehicle.model} · {vehicle.fuel_type} · {vehicle.year}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </button>
            )
          })}
        </div>
      </section>

      <Separator />

      <section
        ref={configSectionRef}
        id="vehicle-configuration"
        className="scroll-mt-24 min-h-[60vh] bg-muted/20"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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

                <ConfigurationWizard
                  step={wizardStep}
                  onStepChange={setWizardStep}
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
