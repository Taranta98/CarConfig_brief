import { useEffect, useRef, useState } from "react"
import ConfigurationOptionals from "@/components/ConfigurationOptionals"
import ConfigurationTrim from "@/components/ConfigurationTrim"
import {
  useVehicleOptionals,
  useVehicles,
  useVehicleTrims,
} from "@/features/Vehicles/vehicle.hooks"
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

const ConfigurationPage = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedTrimId, setSelectedTrimId] = useState<number | null>(null)
  const [selectedOptionalIds, setSelectedOptionalIds] = useState<number[]>([])
  const configSectionRef = useRef<HTMLElement>(null)

  const {
    data: vehicles = [],
    isLoading: vehiclesLoading,
    isError: vehiclesError,
  } = useVehicles()

  const { data: trims = [], isLoading: trimsLoading } =
    useVehicleTrims(selectedId)

  const { data: optionals = [], isLoading: optionalsLoading } =
    useVehicleOptionals(selectedId)

  const selectedVehicle = vehicles.find((v) => v.id === selectedId)
  const trimTotal = getTrimPrice(trims, selectedTrimId)
  const optionalsTotal = calculateOptionalsTotal(optionals, selectedOptionalIds)
  const configurationTotal =
    selectedVehicle !== undefined
      ? vehicleBasePrice(selectedVehicle) + trimTotal + optionalsTotal
      : 0

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

  const handleModelSelect = (id: number) => {
    setSelectedId(id)
    setSelectedTrimId(null)
    setSelectedOptionalIds([])
    requestAnimationFrame(() => {
      configSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    })
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
        <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          {selectedVehicle ? (
            <div className="space-y-8">
              <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
                <img
                  src={vehicleImageUrl(selectedVehicle)}
                  alt={vehicleDisplayName(selectedVehicle)}
                  className="h-40 w-auto object-contain"
                />
                <div>
                  <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
                    Configura la tua {vehicleDisplayName(selectedVehicle)}
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    {selectedVehicle.model} · {selectedVehicle.fuel_type} ·{" "}
                    {selectedVehicle.year}
                  </p>
                  <div className="mt-4 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Prezzo base{" "}
                      {vehicleBasePrice(selectedVehicle).toLocaleString("it-IT", {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    {trimTotal > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Allestimento{" "}
                        {trimTotal.toLocaleString("it-IT", {
                          style: "currency",
                          currency: "EUR",
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    )}
                    {optionalsTotal > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Optional{" "}
                        {optionalsTotal.toLocaleString("it-IT", {
                          style: "currency",
                          currency: "EUR",
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    )}
                    <p className="text-lg font-medium">
                      Totale configurazione{" "}
                      {configurationTotal.toLocaleString("it-IT", {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <ConfigurationTrim
                trims={trims}
                isLoading={trimsLoading}
                selectedId={selectedTrimId}
                onChange={setSelectedTrimId}
              />

              <ConfigurationOptionals
                optionals={optionals}
                isLoading={optionalsLoading}
                selectedIds={selectedOptionalIds}
                onChange={setSelectedOptionalIds}
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
