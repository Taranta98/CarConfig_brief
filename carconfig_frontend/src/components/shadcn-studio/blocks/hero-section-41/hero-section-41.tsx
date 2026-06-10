'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  ArrowUpRight,
  Car,
  Fuel,
  Gauge,
  Leaf,
} from 'lucide-react'
import Autoplay from 'embla-carousel-autoplay'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import type { Vehicle } from '@/features/Vehicles/vehicle.type'
import {
  vehicleDisplayName,
  vehicleImageUrl,
  vehicleBasePrice,
} from '@/features/Vehicles/vehicle.utils'
import { cn } from '@/lib/utils'
import { Link } from 'react-router'

const formatPrice = (value: number) =>
  value.toLocaleString('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  })

const ConfigureButton = ({ className }: { className?: string }) => (
  <Button
    className={cn(
      'group relative h-11 overflow-hidden rounded-full p-1 ps-5 pe-13 text-sm font-medium transition-all duration-500 hover:bg-primary/90 hover:pe-5 hover:ps-13',
      className
    )}
  >
    <span className="relative z-10">Configura ora</span>
    <span className="absolute right-1 flex size-9 items-center justify-center rounded-full bg-background text-foreground transition-all duration-500 group-hover:right-[calc(100%-2.25rem)] group-hover:rotate-45">
      <ArrowUpRight className="size-4" />
    </span>
  </Button>
)

function VehicleFuelIcon({
  fuelType,
  className,
}: {
  fuelType: string
  className?: string
}) {
  const normalized = fuelType.toLowerCase()
  const isEco =
    normalized.includes('elettr') || normalized.includes('ibrid')
  const Icon = isEco ? Leaf : Fuel
  return <Icon className={className} />
}

const HeroSection = ({ vehicles }: { vehicles: Vehicle[] }) => {
  const [mainApi, setMainApi] = useState<CarouselApi>()
  const [thumbApi, setThumbApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  const autoplayPlugin = useMemo(
    () => Autoplay({ delay: 4500, stopOnInteraction: true }),
    []
  )

  useEffect(() => {
    if (!mainApi) return

    const onSelect = () => {
      const index = mainApi.selectedScrollSnap()
      setCurrent(index)
      thumbApi?.scrollTo(index)
    }

    onSelect()
    mainApi.on('select', onSelect)

    return () => {
      mainApi.off('select', onSelect)
    }
  }, [mainApi, thumbApi])

  useEffect(() => {
    if (!thumbApi) return

    const onSelect = () => {
      const index = thumbApi.selectedScrollSnap()
      setCurrent(index)
      mainApi?.scrollTo(index)
    }

    thumbApi.on('select', onSelect)

    return () => {
      thumbApi.off('select', onSelect)
    }
  }, [thumbApi, mainApi])

  const handleThumbClick = useCallback(
    (index: number) => {
      mainApi?.scrollTo(index)
      thumbApi?.scrollTo(index)
    },
    [mainApi, thumbApi]
  )

  const activeVehicle = vehicles[current]

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--color-muted),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-24 -z-10 size-96 rounded-full bg-primary/5 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 bottom-0 -z-10 size-80 rounded-full bg-muted blur-3xl"
      />

      <div className="flex w-full flex-col gap-14 px-4 py-16 sm:px-6 lg:gap-20 lg:py-24 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6 lg:max-w-xl">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              <Car className="size-3.5 text-primary" />
              Configuratore auto online
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem]">
                La tua prossima auto,{' '}
                <span className="text-muted-foreground">su misura</span>
              </h1>
              <p className="max-w-lg text-base text-muted-foreground sm:text-lg">
                Scegli il modello, confronta allestimenti e optional. Il prezzo
                si aggiorna mentre configuri.
              </p>
            </div>

            {activeVehicle && (
              <div className="rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur-sm">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  In evidenza
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {vehicleDisplayName(activeVehicle)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activeVehicle.model}
                  {activeVehicle.year ? ` · ${activeVehicle.year}` : ''}
                </p>
                <p className="mt-2 text-lg font-medium">
                  Da {formatPrice(vehicleBasePrice(activeVehicle))}
                </p>
              </div>
            )}

            <Link to="/configuration">
              <ConfigureButton />
            </Link>

            <div className="flex items-center gap-4 pt-2">
              <span className="text-sm tabular-nums text-muted-foreground">
                {String(current + 1).padStart(2, '0')} /{' '}
                {String(vehicles.length).padStart(2, '0')}
              </span>
              <div className="flex flex-1 gap-1.5">
                {vehicles.map((_, index) => (
                  <button
                    key={vehicles[index].id}
                    type="button"
                    aria-label={`Vai al veicolo ${index + 1}`}
                    onClick={() => handleThumbClick(index)}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-all duration-300',
                      current === index
                        ? 'bg-primary'
                        : 'bg-border hover:bg-muted-foreground/40'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-linear-to-b from-muted/50 to-transparent" />
            <Carousel
              setApi={setMainApi}
              plugins={[autoplayPlugin]}
              opts={{ loop: true }}
              className="w-full"
            >
              <CarouselContent>
                {vehicles.map((item) => (
                  <CarouselItem key={item.id}>
                    <div className="flex items-center justify-center px-2">
                      <img
                        src={vehicleImageUrl(item)}
                        alt={vehicleDisplayName(item)}
                        className="h-[280px] w-full object-contain drop-shadow-lg sm:h-[340px] lg:h-[400px]"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {activeVehicle && (
              <Card className="absolute bottom-4 right-4 left-4 border-border/60 bg-background/90 py-4 shadow-lg backdrop-blur-md sm:left-auto sm:w-72">
                <CardHeader className="px-4 pb-2">
                  <CardTitle className="text-base">
                    {vehicleDisplayName(activeVehicle)}
                  </CardTitle>
                  <CardDescription>{activeVehicle.fuel_type}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-3 px-4 pt-0">
                  <div className="flex flex-col gap-1">
                    <VehicleFuelIcon
                      fuelType={activeVehicle.fuel_type}
                      className="size-4 text-muted-foreground"
                    />
                    <span className="text-xs text-muted-foreground">
                      Alimentazione
                    </span>
                    <span className="text-sm font-medium">
                      {activeVehicle.fuel_type}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Gauge className="size-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">CO₂</span>
                    <span className="text-sm font-medium">
                      {activeVehicle.co2_emissions} g/km
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Prezzo</span>
                    <span className="text-sm font-medium">
                      {formatPrice(vehicleBasePrice(activeVehicle))}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Scegli il modello
              </h2>
              <p className="text-sm text-muted-foreground">
                Scorri o seleziona un veicolo per visualizzarlo
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-12 bg-linear-to-r from-background to-transparent sm:w-16" />
            <div className="pointer-events-none absolute top-0 right-0 z-10 h-full w-12 bg-linear-to-l from-background to-transparent sm:w-16" />

            <Carousel setApi={setThumbApi} opts={{ loop: true, align: 'start' }}>
              <CarouselContent className="-ml-3 py-1">
                {vehicles.map((item, index) => (
                  <CarouselItem
                    key={item.id}
                    className="basis-[45%] pl-3 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                  >
                    <button
                      type="button"
                      onClick={() => handleThumbClick(index)}
                      className={cn(
                        'group flex w-full flex-col gap-2 rounded-2xl text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        current === index && 'scale-[1.02]'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-28 items-center justify-center rounded-2xl border bg-card/60 p-3 shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-md',
                          current === index
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-border/60'
                        )}
                      >
                        <img
                          src={vehicleImageUrl(item)}
                          alt={vehicleDisplayName(item)}
                          className="max-h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="px-0.5">
                        <p className="truncate text-sm font-medium">
                          {vehicleDisplayName(item)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          Da {formatPrice(vehicleBasePrice(item))}
                        </p>
                      </div>
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
