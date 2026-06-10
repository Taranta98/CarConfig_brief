import { useEffect } from 'react'
import HeroSection from '@/components/shadcn-studio/blocks/hero-section-41/hero-section-41'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { VehicleService } from '@/features/Vehicles/vehicle.service'
import { useQuery } from '@tanstack/react-query'
import { COME_FUNZIONA_SECTION_ID, scrollToSection } from '@/lib/scroll'
import { ArrowRight, Layers, Settings2, Sparkles } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router'

const steps = [
  {
    icon: Sparkles,
    title: 'Scegli il modello',
    description:
      'Esplora il catalogo e seleziona il veicolo che fa per te.',
  },
  {
    icon: Layers,
    title: 'Personalizza',
    description:
      'Allestimenti e optional con prezzo aggiornato in tempo reale.',
  },
  {
    icon: Settings2,
    title: 'Salva e confronta',
    description:
      'Tieni traccia delle tue configurazioni e riparti quando vuoi.',
  },
] as const

function HeroSkeleton() {
  return (
    <div className="w-full animate-pulse px-4 py-16 sm:px-6 lg:py-24 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="h-7 w-48 rounded-full bg-muted" />
          <div className="h-14 w-full max-w-md rounded-xl bg-muted" />
          <div className="h-20 w-full max-w-lg rounded-2xl bg-muted" />
          <div className="h-24 w-full max-w-sm rounded-2xl bg-muted" />
          <div className="flex gap-3">
            <div className="h-11 w-36 rounded-full bg-muted" />
            <div className="h-11 w-40 rounded-full bg-muted" />
          </div>
        </div>
        <div className="h-[360px] rounded-3xl bg-muted" />
      </div>
    </div>
  )
}

const HomePage = () => {
  const { data: vehiclesResponse, isLoading, isError } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => VehicleService.list(),
  })
  const vehicles = vehiclesResponse?.data.data ?? []
  const showContent = !isLoading && !isError && vehicles.length > 0
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!showContent) return

    const state = location.state as { scrollTo?: string } | null
    const shouldScrollFromState =
      state?.scrollTo === COME_FUNZIONA_SECTION_ID
    const shouldScrollFromHash =
      location.hash === `#${COME_FUNZIONA_SECTION_ID}`

    if (!shouldScrollFromState && !shouldScrollFromHash) return

    requestAnimationFrame(() => {
      scrollToSection(COME_FUNZIONA_SECTION_ID)
    })

    if (shouldScrollFromState) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [
    showContent,
    location.state,
    location.hash,
    location.pathname,
    navigate,
  ])

  return (
    <div className="overflow-x-hidden">
      <main className="flex flex-col pt-17.5">
        {isLoading && <HeroSkeleton />}

        {isError && (
          <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
            <p className="text-destructive font-medium">
              Impossibile caricare i veicoli
            </p>
            <p className="text-sm text-muted-foreground">
              Verifica la connessione o riprova tra qualche istante.
            </p>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => window.location.reload()}
            >
              Riprova
            </Button>
          </div>
        )}

        {showContent && <HeroSection vehicles={vehicles} />}

        {!isLoading && !isError && vehicles.length === 0 && (
          <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
            <p className="font-medium">Nessun veicolo disponibile</p>
            <p className="text-sm text-muted-foreground">
              Il catalogo è temporaneamente vuoto. Torna a trovarci presto.
            </p>
          </div>
        )}

        {showContent && (
          <>
            <section
              id={COME_FUNZIONA_SECTION_ID}
              className="scroll-mt-24 border-t border-border/60 bg-muted/30 py-16 lg:py-20"
            >
              <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                  <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    Come funziona
                  </h2>
                  <p className="mt-3 text-muted-foreground">
                    Tre passaggi per passare dall&apos;idea alla configurazione
                    completa.
                  </p>
                </div>

                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {steps.map((step, index) => (
                    <Card
                      key={step.title}
                      className="relative border-border/60 bg-card/80 backdrop-blur-sm"
                    >
                      <CardHeader>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <step.icon className="size-5" />
                          </span>
                          <span className="text-xs font-medium tabular-nums text-muted-foreground">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <CardTitle>{step.title}</CardTitle>
                        <CardDescription>{step.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            <section className="py-16 lg:py-20">
              <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-primary to-primary/80 px-6 py-12 text-primary-foreground sm:px-10 sm:py-14 lg:flex lg:items-center lg:justify-between lg:gap-8">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl"
                  />
                  <div className="relative max-w-xl">
                    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      Pronto a configurare?
                    </h2>
                    <p className="mt-3 text-primary-foreground/85">
                      {vehicles.length} modelli disponibili. Inizia ora e
                      costruisci l&apos;auto che hai in mente.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="relative mt-8 shrink-0 rounded-full lg:mt-0"
                    render={<Link to="/configuration" />}
                    nativeButton={false}
                  >
                    Vai al configuratore
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default HomePage
