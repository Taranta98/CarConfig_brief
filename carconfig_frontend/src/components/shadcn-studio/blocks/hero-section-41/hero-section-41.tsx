'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { ArrowUpRight } from 'lucide-react'
import Autoplay from 'embla-carousel-autoplay'

import { Button } from '@/components/ui/button'
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { useAuthStore } from '@/features/Auth/auth.store'
import type { Vehicle } from '@/features/Vehicles/vehicle.type'
import {
  vehicleDisplayName,
  vehicleImageUrl,
  vehicleBasePrice,
} from '@/features/Vehicles/vehicle.utils'
import { formatCurrency } from '@/lib/formatPrice'
import { cn } from '@/lib/utils'
import { Link } from 'react-router'

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

const HeroSection = ({ vehicles }: { vehicles: Vehicle[] }) => {
  const isLoggedIn = Boolean(useAuthStore((state) => state.token))
  const configureHref = isLoggedIn ? '/configuration' : '/auth/login'

  const [mainApi, setMainApi] = useState<CarouselApi>()
  const [thumbApi, setThumbApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  const autoplayPlugin = useMemo(
    () => Autoplay({ delay: 5000, stopOnInteraction: true }),
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

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6 lg:max-w-xl">
            <h1 className="font-heading text-4xl mb-15 font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Configura il tuo veicolo
            </h1>

            {activeVehicle && (
              <div className="rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur-sm">
                <p className="text-2xl font-semibold tracking-tight">
                  {vehicleDisplayName(activeVehicle)}
                </p>
                <p className="mt-1 text-lg font-medium text-muted-foreground">
                  {formatCurrency(vehicleBasePrice(activeVehicle))}
                </p>
              </div>
            )}

            <Link to={configureHref} className="w-fit">
              <ConfigureButton />
            </Link>

            {vehicles.length > 1 && (
              <div className="flex items-center gap-4 pt-1">
                <span className="text-sm tabular-nums text-muted-foreground">
                  {String(current + 1).padStart(2, '0')} /{' '}
                  {String(vehicles.length).padStart(2, '0')}
                </span>
                <div className="flex flex-1 gap-1.5">
                  {vehicles.map((vehicle, index) => (
                    <button
                      key={vehicle.id}
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
            )}
          </div>

          <div className="relative min-w-0">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-linear-to-b from-muted/50 to-transparent" />
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
              <Carousel
                setApi={setMainApi}
                plugins={[autoplayPlugin]}
                opts={{ loop: true }}
                className="w-full"
              >
                <CarouselContent>
                  {vehicles.map((item) => (
                    <CarouselItem key={item.id}>
                      <div className="flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
                        <img
                          src={vehicleImageUrl(item)}
                          alt={vehicleDisplayName(item)}
                          className="h-[240px] w-full object-contain drop-shadow-lg sm:h-[300px] lg:h-[380px]"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        </div>

        {vehicles.length > 1 && (
          <div className="relative mt-14">
            <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-10 bg-linear-to-r from-background to-transparent sm:w-16" />
            <div className="pointer-events-none absolute top-0 right-0 z-10 h-full w-10 bg-linear-to-l from-background to-transparent sm:w-16" />

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
                        'group flex w-full flex-col gap-2 rounded-2xl text-left transition-all duration-300',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
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
                          {formatCurrency(vehicleBasePrice(item))}
                        </p>
                      </div>
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        )}
      </div>
    </section>
  )
}

export default HeroSection
