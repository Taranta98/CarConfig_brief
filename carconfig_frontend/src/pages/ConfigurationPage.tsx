import { useRef, useState } from 'react'
import ConfigurationOptionals from '@/components/ConfigurationOptionals'
import ConfigurationTrim from '@/components/ConfigurationTrim'
import {
  calculateOptionalsTotal,
  getRequiredOptionalIds
} from '@/data/optionals'
import { getDefaultTrimId, getTrimPrice } from '@/data/trims'
import { vehicles } from '@/pages/HomePage'
import { cn } from '@/lib/utils'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const modelImages: Record<number, string> = {
  1: '/qashqai-lato.png',
  2: '/juke-lato.png',
  3: '/kona-lato.png',
  4: '/tucson-lato.png'
}

const ConfigurationPage = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedTrimId, setSelectedTrimId] = useState<number | null>(null)
  const [selectedOptionalIds, setSelectedOptionalIds] = useState<number[]>([])
  const configSectionRef = useRef<HTMLElement>(null)

  const selectedVehicle = vehicles.find((v) => v.id === selectedId)
  const trimTotal =
    selectedId !== null ? getTrimPrice(selectedId, selectedTrimId) : 0
  const optionalsTotal =
    selectedId !== null ? calculateOptionalsTotal(selectedId, selectedOptionalIds) : 0
  const configurationTotal =
    selectedVehicle !== undefined
      ? selectedVehicle.base_price + trimTotal + optionalsTotal
      : 0

  const handleModelSelect = (id: number) => {
    setSelectedId(id)
    setSelectedTrimId(getDefaultTrimId(id))
    setSelectedOptionalIds(getRequiredOptionalIds(id))
    requestAnimationFrame(() => {
      configSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {vehicles.map((vehicle) => {
            const isSelected = selectedId === vehicle.id

            return (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => handleModelSelect(vehicle.id)}
                className={cn(
                  'group text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl',
                  isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                )}
                aria-pressed={isSelected}
                aria-label={`Seleziona ${vehicle.name}`}
              >
                <Card
                  className={cn(
                    'h-full cursor-pointer overflow-hidden py-0 transition-shadow hover:shadow-md',
                    isSelected && 'shadow-md'
                  )}
                >
                  <div className="flex aspect-4/3 items-center justify-center bg-muted/40 p-4">
                    <img
                      src={modelImages[vehicle.id]}
                      alt={vehicle.name}
                      className="max-h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <CardHeader className="pb-4">
                    <CardTitle>{vehicle.name}</CardTitle>
                    <CardDescription>{vehicle.model}</CardDescription>
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
                  src={modelImages[selectedVehicle.id]}
                  alt={selectedVehicle.name}
                  className="h-40 w-auto object-contain"
                />
                <div>
                  <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
                    Configura la tua {selectedVehicle.name}
                  </h2>
                  <p className="mt-2 text-muted-foreground">{selectedVehicle.model}</p>
                  <div className="mt-4 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Prezzo base{' '}
                      {selectedVehicle.base_price.toLocaleString('it-IT', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0
                      })}
                    </p>
                    {trimTotal > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Allestimento{' '}
                        {trimTotal.toLocaleString('it-IT', {
                          style: 'currency',
                          currency: 'EUR',
                          maximumFractionDigits: 0
                        })}
                      </p>
                    )}
                    {optionalsTotal > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Optional{' '}
                        {optionalsTotal.toLocaleString('it-IT', {
                          style: 'currency',
                          currency: 'EUR',
                          maximumFractionDigits: 0
                        })}
                      </p>
                    )}
                    <p className="text-lg font-medium">
                      Totale configurazione{' '}
                      {configurationTotal.toLocaleString('it-IT', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <ConfigurationTrim
                vehicleId={selectedVehicle.id}
                selectedId={selectedTrimId}
                onChange={setSelectedTrimId}
              />

              <ConfigurationOptionals
                vehicleId={selectedVehicle.id}
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
