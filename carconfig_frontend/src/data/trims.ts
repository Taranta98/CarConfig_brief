import type { Trim } from '@/types/trim'

export const trimsByVehicle: Record<number, Trim[]> = {
  1: [
    {
      id: 11,
      name: 'Acenta',
      description: 'Allestimento di ingresso con dotazioni essenziali.',
      price: 0,
      vehicle_id: 1
    },
    {
      id: 12,
      name: 'N-Connecta',
      description: 'Comfort migliorato, clima automatico e sensori parcheggio.',
      price: 2200,
      vehicle_id: 1
    },
    {
      id: 13,
      name: 'Tekna',
      description: 'Top di gamma con pelle, navigatore e assistenza avanzata.',
      price: 4500,
      vehicle_id: 1
    }
  ],
  2: [
    {
      id: 21,
      name: 'Visia',
      description: 'Versione base con infotainment compatto.',
      price: 0,
      vehicle_id: 2
    },
    {
      id: 22,
      name: 'N-Design',
      description: 'Estetica sportiva e interni premium.',
      price: 1800,
      vehicle_id: 2
    },
    {
      id: 23,
      name: 'Tekna',
      description: 'Massimo equipaggiamento e tecnologia di bordo.',
      price: 3600,
      vehicle_id: 2
    }
  ],
  3: [
    {
      id: 31,
      name: 'Essential',
      description: 'Autonomia standard e dotazioni di serie EV.',
      price: 0,
      vehicle_id: 3
    },
    {
      id: 32,
      name: 'Creative',
      description: 'Fari LED, cerchi 17" e interni in tessuto premium.',
      price: 2400,
      vehicle_id: 3
    },
    {
      id: 33,
      name: 'Prime',
      description: 'Pacchetto completo con head-up display e sedili riscaldati.',
      price: 4200,
      vehicle_id: 3
    }
  ],
  4: [
    {
      id: 41,
      name: 'Classic',
      description: 'Hybrid entry con sicurezza e connettività di base.',
      price: 0,
      vehicle_id: 4
    },
    {
      id: 42,
      name: 'Modern',
      description: 'Tetto panoramico, portellone elettrico e cruise adaptivo.',
      price: 2800,
      vehicle_id: 4
    },
    {
      id: 43,
      name: 'Premium',
      description: 'HTRAC, pelle e pacchetto assistenza completo.',
      price: 5200,
      vehicle_id: 4
    }
  ]
}

export function getTrimsForVehicle(vehicleId: number): Trim[] {
  return trimsByVehicle[vehicleId] ?? []
}

export function getDefaultTrimId(vehicleId: number): number | null {
  const trims = getTrimsForVehicle(vehicleId)
  return trims[0]?.id ?? null
}

export function getTrimById(vehicleId: number, trimId: number): Trim | undefined {
  return getTrimsForVehicle(vehicleId).find((t) => t.id === trimId)
}

export function getTrimPrice(vehicleId: number, trimId: number | null): number {
  if (trimId === null) return 0
  return getTrimById(vehicleId, trimId)?.price ?? 0
}
