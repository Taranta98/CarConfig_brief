'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { ArrowRightIcon, ArrowUpRight } from 'lucide-react'
import Autoplay from 'embla-carousel-autoplay'

import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem
} from '@/components/ui/carousel'
import type { Vehicle } from '@/features/Vehicles/vehicle.type'
import {
  vehicleDisplayName,
  vehicleImageUrl,
  vehicleBasePrice,
} from '@/features/Vehicles/vehicle.utils'
import { cn } from '@/lib/utils'
import { Link } from 'react-router'

const CollaborateButton = ({ className }: { className?: string }) => (
  <Button className={cn("relative text-sm font-medium rounded-full h-10 p-1 ps-4 pe-12 group transition-all duration-500 hover:ps-12 hover:pe-4 w-fit overflow-hidden hover:bg-primary/80", className)}>
    <span className="relative z-10 transition-all duration-500 hover:cursor-pointer">
      Configura ora la tua auto
    </span>
    <div className="absolute right-1 w-8 h-8 bg-background text-foreground rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-36px)] group-hover:rotate-45">
      <ArrowUpRight size={16} />
    </div>
  </Button>
);

const HeroSection = ({ vehicles }: { vehicles: Vehicle[] }) => {
  const [mainApi, setMainApi] = useState<CarouselApi>()
  const [thumbApi, setThumbApi] = useState<CarouselApi>()
  const [commentsApi, setCommentsApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  )

  /* ---------------- MAIN SYNC ---------------- */
  useEffect(() => {
    if (!mainApi) return

    const onSelect = () => {
      const index = mainApi.selectedScrollSnap()
      setCurrent(index)

      thumbApi?.scrollTo(index)
      commentsApi?.scrollTo(index)
    }

    setCurrent(mainApi.selectedScrollSnap())
    mainApi.on('select', onSelect)

    return () => mainApi.off('select', onSelect)
  }, [mainApi, thumbApi, commentsApi])

  /* ---------------- THUMB SYNC ---------------- */
  useEffect(() => {
    if (!thumbApi) return

    const onSelect = () => {
      const index = thumbApi.selectedScrollSnap()
      setCurrent(index)

      mainApi?.scrollTo(index)
      commentsApi?.scrollTo(index)
    }

    thumbApi.on('select', onSelect)

    return () => thumbApi.off('select', onSelect)
  }, [thumbApi, mainApi, commentsApi])

  /* ---------------- COMMENTS SYNC ---------------- */
  useEffect(() => {
    if (!commentsApi) return

    const onSelect = () => {
      const index = commentsApi.selectedScrollSnap()
      setCurrent(index)

      mainApi?.scrollTo(index)
      thumbApi?.scrollTo(index)
    }

    commentsApi.on('select', onSelect)

    return () => commentsApi.off('select', onSelect)
  }, [commentsApi, mainApi, thumbApi])

  const handleThumbClick = useCallback(
    (index: number) => {
      mainApi?.scrollTo(index)
    },
    [mainApi]
  )

  const activeVehicle = vehicles[current]

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 sm:px-6 lg:px-8">

        {/* ================= HERO TOP ================= */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-5">

          {/* TEXT */}
          <div className="flex flex-col gap-6 lg:col-span-3">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              {activeVehicle ? vehicleDisplayName(activeVehicle) : ''}
            </h1>

            <p className="max-w-xl text-lg text-muted-foreground sm:text-xl">
              {activeVehicle?.model}
              {activeVehicle?.year ? ` · ${activeVehicle.year}` : ''}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              
            <Link to="/configuration">  <CollaborateButton /></Link>
            </div>
          </div>

          {/* MAIN CAROUSEL */}
          <div className="lg:col-span-2">
            <Carousel
              setApi={setMainApi}
              plugins={[plugin.current]}
              opts={{ loop: true }}
              className="w-full"
            >
              <CarouselContent>
                {vehicles.map(item => (
                  <CarouselItem key={item.id}>
                    <div className="flex items-center justify-center">
                      <img
                        src={vehicleImageUrl(item)}
                        alt={vehicleDisplayName(item)}
                        className="h-[320px] w-full object-contain sm:h-[380px] lg:h-[420px]"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>

        {/* ================= BOTTOM SECTION ================= */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">

          {/* THUMBNAILS */}
          <div className="relative lg:col-span-3">

            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-background" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-background" />

            <Carousel setApi={setThumbApi} opts={{ loop: true }}>
              <CarouselContent className="py-2">
                {vehicles.map((item, index) => (
                  <CarouselItem
                    key={item.id}
                    className={cn(
                      "basis-1/3 cursor-pointer sm:basis-1/4 lg:basis-1/3"
                    )}
                    onClick={() => handleThumbClick(index)}
                  >
                    <div className="flex flex-col items-center gap-2">

  <div
  className={cn(
    "h-[130px] w-[170px] rounded-2xl border bg-background/40 backdrop-blur-md shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md",
    current === index
      ? "border-primary shadow-primary/20 ring-2 ring-primary/20"
      : "border-border/60"
  )}
>
    <img
      src={vehicleImageUrl(item)}
      alt={vehicleDisplayName(item)}
      className="h-full w-full object-contain p-3"
    />
  </div>

  <span className="text-xs font-medium text-muted-foreground">
    {item.model}
  </span>

</div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          {/* COMMENTS (placeholder adattato) */}
          <div className="lg:col-span-2">
            <Carousel setApi={setCommentsApi} opts={{ loop: true }}>
              <CarouselContent>
                {vehicles.map(item => (
                  <CarouselItem
                    key={item.id}
                    className="flex flex-col gap-2 px-6"
                  >
                    <p className="text-lg font-medium text-card-foreground">
                      {vehicleDisplayName(item)}
                    </p>

                    <Separator />

                    <p className="text-sm text-muted-foreground">
                      {item.fuel_type} · {item.year}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      CO₂: {item.co2_emissions} g/km
                    </p>

                    <p className="text-sm text-muted-foreground">
                      A partire da:{' '}
                      {vehicleBasePrice(item).toLocaleString('it-IT', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0,
                      })}
                    </p>
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