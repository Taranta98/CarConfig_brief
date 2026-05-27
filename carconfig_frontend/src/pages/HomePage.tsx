import HeroSection from '@/components/shadcn-studio/blocks/hero-section-41/hero-section-41'
import { useVehicles } from '@/features/Vehicles/vehicle.hooks'

const HomePage = () => {
  const { data: vehicles = [], isLoading, isError } = useVehicles()

  return (
    <div className="overflow-x-hidden">
      <main className="flex flex-col pt-17.5">
        {isLoading && (
          <p className="py-24 text-center text-muted-foreground">
            Caricamento veicoli…
          </p>
        )}
        {isError && (
          <p className="py-24 text-center text-destructive">
            Impossibile caricare i veicoli. Riprova più tardi.
          </p>
        )}
        {!isLoading && !isError && vehicles.length > 0 && (
          <HeroSection vehicles={vehicles} />
        )}
        {!isLoading && !isError && vehicles.length === 0 && (
          <p className="py-24 text-center text-muted-foreground">
            Nessun veicolo disponibile al momento.
          </p>
        )}
      </main>
    </div>
  )
}

export default HomePage
