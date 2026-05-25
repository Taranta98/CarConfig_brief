import type { Optional, OptionalCategory } from '@/types/optional'

export const optionalCategories: OptionalCategory[] = [
  'Comfort',
  'Technology',
  'Safety',
  'Exterior'
]

export const optionalsByVehicle: Record<number, Optional[]> = {
  1: [
    {
      id: 101,
      name: 'Tetto panoramico',
      description: 'Tetto in vetro con tendina elettrica.',
      price: 1200,
      category: 'Comfort',
      is_required: false,
      vehicle_id: 1
    },
    {
      id: 102,
      name: 'Sedili in pelle',
      description: 'Rivestimento interno in pelle Nappa.',
      price: 1800,
      category: 'Comfort',
      is_required: false,
      vehicle_id: 1
    },
    {
      id: 103,
      name: 'Navigatore satellitare',
      description: 'Sistema di navigazione con aggiornamenti mappe.',
      price: 650,
      category: 'Technology',
      is_required: false,
      vehicle_id: 1
    },
    {
      id: 104,
      name: 'Pacchetto sicurezza ProPILOT',
      description: 'Assistenza alla guida e frenata automatica.',
      price: 950,
      category: 'Safety',
      is_required: false,
      vehicle_id: 1
    },
    {
      id: 105,
      name: 'Cerchi in lega 19"',
      description: 'Cerchi sportivi con pneumatici premium.',
      price: 1100,
      category: 'Exterior',
      is_required: false,
      vehicle_id: 1
    }
  ],
  2: [
    {
      id: 201,
      name: 'Sound system Bose',
      description: 'Impianto audio premium a 8 altoparlanti.',
      price: 750,
      category: 'Technology',
      is_required: false,
      vehicle_id: 2
    },
    {
      id: 202,
      name: 'Tetto bicolore',
      description: 'Contrasto cromatico per il tetto.',
      price: 450,
      category: 'Exterior',
      is_required: false,
      vehicle_id: 2
    },
    {
      id: 203,
      name: 'Climatizzatore bi-zona',
      description: 'Controllo temperatura per conducente e passeggero.',
      price: 0,
      category: 'Comfort',
      is_required: true,
      vehicle_id: 2
    },
    {
      id: 204,
      name: 'Telecamera posteriore',
      description: 'Assistenza al parcheggio con linee guida.',
      price: 350,
      category: 'Safety',
      is_required: false,
      vehicle_id: 2
    }
  ],
  3: [
    {
      id: 301,
      name: 'Pacchetto ricarica rapida',
      description: 'Supporto DC fino a 100 kW.',
      price: 890,
      category: 'Technology',
      is_required: false,
      vehicle_id: 3
    },
    {
      id: 302,
      name: 'Sedili riscaldati',
      description: 'Riscaldamento anteriori e posteriori.',
      price: 620,
      category: 'Comfort',
      is_required: false,
      vehicle_id: 3
    },
    {
      id: 303,
      name: 'Fari LED Matrix',
      description: 'Illuminazione adattiva intelligente.',
      price: 780,
      category: 'Safety',
      is_required: false,
      vehicle_id: 3
    },
    {
      id: 304,
      name: 'Vernice metallizzata',
      description: 'Colore premium con finitura metallizzata.',
      price: 550,
      category: 'Exterior',
      is_required: false,
      vehicle_id: 3
    }
  ],
  4: [
    {
      id: 401,
      name: 'Trazione integrale HTRAC',
      description: 'Sistema AWD per massima aderenza.',
      price: 2100,
      category: 'Safety',
      is_required: false,
      vehicle_id: 4
    },
    {
      id: 402,
      name: 'Head-up display',
      description: 'Informazioni di guida proiettate sul parabrezza.',
      price: 980,
      category: 'Technology',
      is_required: false,
      vehicle_id: 4
    },
    {
      id: 403,
      name: 'Portellone elettrico',
      description: 'Apertura e chiusura motorizzata del bagagliaio.',
      price: 720,
      category: 'Comfort',
      is_required: false,
      vehicle_id: 4
    },
    {
      id: 404,
      name: 'Sensori parcheggio 360°',
      description: 'Telecamere e sensori per manovre a bassa velocità.',
      price: 0,
      category: 'Safety',
      is_required: true,
      vehicle_id: 4
    },
    {
      id: 405,
      name: 'Barre portatutto',
      description: 'Sistema modulare per il tetto.',
      price: 480,
      category: 'Exterior',
      is_required: false,
      vehicle_id: 4
    }
  ]
}

export function getOptionalsForVehicle(vehicleId: number): Optional[] {
  return optionalsByVehicle[vehicleId] ?? []
}

export function getRequiredOptionalIds(vehicleId: number): number[] {
  return getOptionalsForVehicle(vehicleId)
    .filter((o) => o.is_required)
    .map((o) => o.id)
}

export function calculateOptionalsTotal(
  vehicleId: number,
  selectedIds: number[]
): number {
  const optionals = getOptionalsForVehicle(vehicleId)
  return optionals
    .filter((o) => selectedIds.includes(o.id))
    .reduce((sum, o) => sum + o.price, 0)
}
