<?php

namespace Database\Factories;

use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vehicle>
 */
class VehicleFactory extends Factory
{
    protected $model = Vehicle::class;

    /**
     * Catalogo demo (allineato ai mock del frontend).
     *
     * @return list<array{
     *     brand: string,
     *     model: string,
     *     year: int,
     *     fuel_type: string,
     *     image: string,
     *     co2_emissions: string,
     *     base_price: int,
     *     trims: list<array{name: string, description: string, price: int, img?: string}>,
     *     optionals: list<array{
     *         name: string,
     *         description: string,
     *         price: int,
     *         category: string,
     *         is_required: bool,
     *         image?: string|null
     *     }>
     * }>
     */
    public static function catalog(): array
    {
        return [
            [
                'brand' => 'Nissan',
                'model' => 'Qashqai MY24',
                'year' => 2024,
                'fuel_type' => 'Benzina',
                'image' => 'https://www-europe.nissan-cdn.net/content/dam/Nissan/nissan_europe/Configurator/Qashqai-my24/configurator-webp/QQMC-ICE-N-Connecta.png.webp',
                'co2_emissions' => '142',
                'base_price' => 28900,
                'trims' => [
                    [
                        'name' => 'Acenta',
                        'description' => 'Allestimento di ingresso con dotazioni essenziali.',
                        'price' => 0,
                    ],
                    [
                        'name' => 'N-Connecta',
                        'description' => 'Comfort migliorato, clima automatico e sensori parcheggio.',
                        'price' => 2200,
                    ],
                    [
                        'name' => 'Tekna',
                        'description' => 'Top di gamma con pelle, navigatore e assistenza avanzata.',
                        'price' => 4500,
                    ],
                ],
                'optionals' => [
                    [
                        'name' => 'Tetto panoramico',
                        'description' => 'Tetto in vetro con tendina elettrica.',
                        'price' => 1200,
                        'category' => 'Comfort',
                        'is_required' => false,
                    ],
                    [
                        'name' => 'Sedili in pelle',
                        'description' => 'Rivestimento interno in pelle Nappa.',
                        'price' => 1800,
                        'category' => 'Comfort',
                        'is_required' => false,
                    ],
                    [
                        'name' => 'Navigatore satellitare',
                        'description' => 'Sistema di navigazione con aggiornamenti mappe.',
                        'price' => 650,
                        'category' => 'Technology',
                        'is_required' => false,
                    ],
                    [
                        'name' => 'Pacchetto sicurezza ProPILOT',
                        'description' => 'Assistenza alla guida e frenata automatica.',
                        'price' => 950,
                        'category' => 'Safety',
                        'is_required' => false,
                    ],
                    [
                        'name' => 'Cerchi in lega 19"',
                        'description' => 'Cerchi sportivi con pneumatici premium.',
                        'price' => 1100,
                        'category' => 'Exterior',
                        'is_required' => false,
                    ],
                ],
            ],
            [
                'brand' => 'Nissan',
                'model' => 'Juke MY24',
                'year' => 2024,
                'fuel_type' => 'Benzina',
                'image' => 'https://www-europe.nissan-cdn.net/content/dam/Nissan/it/vehicles/juke-my24-assets-webp/24TDIEU_PS_JUKEMC_ICE_N-Design_RCF_001.webp',
                'co2_emissions' => '135',
                'base_price' => 24900,
                'trims' => [
                    [
                        'name' => 'Visia',
                        'description' => 'Versione base con infotainment compatto.',
                        'price' => 0,
                    ],
                    [
                        'name' => 'N-Design',
                        'description' => 'Estetica sportiva e interni premium.',
                        'price' => 1800,
                    ],
                    [
                        'name' => 'Tekna',
                        'description' => 'Massimo equipaggiamento e tecnologia di bordo.',
                        'price' => 3600,
                    ],
                ],
                'optionals' => [
                    [
                        'name' => 'Sound system Bose',
                        'description' => 'Impianto audio premium a 8 altoparlanti.',
                        'price' => 750,
                        'category' => 'Technology',
                        'is_required' => false,
                    ],
                    [
                        'name' => 'Tetto bicolore',
                        'description' => 'Contrasto cromatico per il tetto.',
                        'price' => 450,
                        'category' => 'Exterior',
                        'is_required' => false,
                    ],
                    [
                        'name' => 'Climatizzatore bi-zona',
                        'description' => 'Controllo temperatura per conducente e passeggero.',
                        'price' => 0,
                        'category' => 'Comfort',
                        'is_required' => true,
                    ],
                    [
                        'name' => 'Telecamera posteriore',
                        'description' => 'Assistenza al parcheggio con linee guida.',
                        'price' => 350,
                        'category' => 'Safety',
                        'is_required' => false,
                    ],
                ],
            ],
            [
                'brand' => 'Hyundai',
                'model' => 'Kona EV',
                'year' => 2024,
                'fuel_type' => 'Elettrico',
                'image' => 'https://s7g10.scene7.com/is/image/hyundaiautoever/SX2_EV_calculator_asset_4x3:4x3?wid=960&hei=720&fmt=png-alpha&fit=wrap,1',
                'co2_emissions' => '0',
                'base_price' => 35900,
                'trims' => [
                    [
                        'name' => 'Essential',
                        'description' => 'Autonomia standard e dotazioni di serie EV.',
                        'price' => 0,
                    ],
                    [
                        'name' => 'Creative',
                        'description' => 'Fari LED, cerchi 17" e interni in tessuto premium.',
                        'price' => 2400,
                    ],
                    [
                        'name' => 'Prime',
                        'description' => 'Pacchetto completo con head-up display e sedili riscaldati.',
                        'price' => 4200,
                    ],
                ],
                'optionals' => [
                    [
                        'name' => 'Pacchetto ricarica rapida',
                        'description' => 'Supporto DC fino a 100 kW.',
                        'price' => 890,
                        'category' => 'Technology',
                        'is_required' => false,
                    ],
                    [
                        'name' => 'Sedili riscaldati',
                        'description' => 'Riscaldamento anteriori e posteriori.',
                        'price' => 620,
                        'category' => 'Comfort',
                        'is_required' => false,
                    ],
                    [
                        'name' => 'Fari LED Matrix',
                        'description' => 'Illuminazione adattiva intelligente.',
                        'price' => 780,
                        'category' => 'Safety',
                        'is_required' => false,
                    ],
                    [
                        'name' => 'Vernice metallizzata',
                        'description' => 'Colore premium con finitura metallizzata.',
                        'price' => 550,
                        'category' => 'Exterior',
                        'is_required' => false,
                    ],
                ],
            ],
            [
                'brand' => 'Hyundai',
                'model' => 'Tucson HEV',
                'year' => 2024,
                'fuel_type' => 'Ibrido',
                'image' => 'https://get-moba.com/app/uploads/2024/04/hyundai-tucson-hev-front-view-removebg-preview-1.png',
                'co2_emissions' => '121',
                'base_price' => 33900,
                'trims' => [
                    [
                        'name' => 'Classic',
                        'description' => 'Hybrid entry con sicurezza e connettività di base.',
                        'price' => 0,
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Tetto panoramico, portellone elettrico e cruise adaptivo.',
                        'price' => 2800,
                    ],
                    [
                        'name' => 'Premium',
                        'description' => 'HTRAC, pelle e pacchetto assistenza completo.',
                        'price' => 5200,
                    ],
                ],
                'optionals' => [
                    [
                        'name' => 'Trazione integrale HTRAC',
                        'description' => 'Sistema AWD per massima aderenza.',
                        'price' => 2100,
                        'category' => 'Safety',
                        'is_required' => false,
                    ],
                    [
                        'name' => 'Head-up display',
                        'description' => 'Informazioni di guida proiettate sul parabrezza.',
                        'price' => 980,
                        'category' => 'Technology',
                        'is_required' => false,
                    ],
                    [
                        'name' => 'Portellone elettrico',
                        'description' => 'Apertura e chiusura motorizzata del bagagliaio.',
                        'price' => 720,
                        'category' => 'Comfort',
                        'is_required' => false,
                    ],
                    [
                        'name' => 'Sensori parcheggio 360°',
                        'description' => 'Telecamere e sensori per manovre a bassa velocità.',
                        'price' => 0,
                        'category' => 'Safety',
                        'is_required' => true,
                    ],
                    [
                        'name' => 'Barre portatutto',
                        'description' => 'Sistema modulare per il tetto.',
                        'price' => 480,
                        'category' => 'Exterior',
                        'is_required' => false,
                    ],
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'brand' => fake()->randomElement(['Nissan', 'Hyundai', 'Toyota', 'Volkswagen']),
            'model' => fake()->words(2, true),
            'year' => (int) fake()->numberBetween(2022, 2026),
            'fuel_type' => fake()->randomElement(['Benzina', 'Diesel', 'Ibrido', 'Elettrico']),
            'image' => fake()->imageUrl(640, 480, 'transport'),
            'co2_emissions' => (string) fake()->numberBetween(0, 200),
            'base_price' => fake()->numberBetween(18000, 55000),
        ];
    }
}
