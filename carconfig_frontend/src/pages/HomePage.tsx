import HeroSection from '@/components/shadcn-studio/blocks/hero-section-41/hero-section-41'
import { Button } from '@/components/ui/button'
import { VehicleService } from '@/features/Vehicles/vehicle.service'
import { useQuery } from '@tanstack/react-query'

function HeroSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="h-14 w-full max-w-md rounded-xl bg-muted" />
          <div className="h-24 w-full max-w-sm rounded-2xl bg-muted" />
          <div className="h-11 w-36 rounded-full bg-muted" />
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

  return (
    <div className="overflow-x-hidden">
      <main className="flex flex-col pt-17.5 pb-12 lg:pb-16">
        {isLoading && <HeroSkeleton />}

        {isError && (
          <div className="mx-auto max-w-md px-4 py-16 text-center">
            <p className="text-destructive">Impossibile caricare i veicoli.</p>
            <Button
              variant="outline"
              className="mt-6 rounded-full"
              onClick={() => window.location.reload()}
            >
              Riprova
            </Button>
          </div>
        )}

        {showContent && <HeroSection vehicles={vehicles} />}

        {!isLoading && !isError && vehicles.length === 0 && (
          <p className="px-4 py-16 text-center text-muted-foreground">
            Nessun veicolo disponibile.
          </p>
        )}
      </main>
    </div>
  )
}

export default HomePage
