<?php

namespace Database\Seeders;

use App\Enums\VehicleViewAngle;
use App\Models\Vehicle;
use App\Models\VehicleColor;
use Illuminate\Database\Seeder;

class VehicleColorSeeder extends Seeder
{
    /**
     * @return array<string, array{
     *     side: string,
     *     colors: list<array{code: string, name: string, hex: string, sort_order: int, preview: string}>
     * }>
     */
    protected function catalog(string $frontendUrl): array
    {
        return [
            'Qashqai MY24' => [
                'side' => "{$frontendUrl}/qashqai-lato.png",
                'colors' => [
                    [
                        'code' => 'pearl_white',
                        'name' => 'Bianco perla',
                        'hex' => '#F4F4F4',
                        'sort_order' => 0,
                        'preview' => "{$frontendUrl}/qashqai-lato.png",
                    ],
                    [
                        'code' => 'magnetic_black',
                        'name' => 'Nero magnetico',
                        'hex' => '#1C1C1C',
                        'sort_order' => 1,
                        'preview' => 'https://www-europe.nissan-cdn.net/content/dam/Nissan/nissan_europe/Configurator/Qashqai-my24/configurator-webp/QQMC-ICE-N-Connecta.png.webp',
                    ],
                    [
                        'code' => 'gun_metal',
                        'name' => 'Grigio gunmetal',
                        'hex' => '#5C5F66',
                        'sort_order' => 2,
                        'preview' => "{$frontendUrl}/qashqai-lato.png",
                    ],
                ],
            ],
            'Juke MY24' => [
                'side' => "{$frontendUrl}/juke-lato.png",
                'colors' => [
                    [
                        'code' => 'arctic_white',
                        'name' => 'Bianco artico',
                        'hex' => '#F8F8F8',
                        'sort_order' => 0,
                        'preview' => "{$frontendUrl}/juke-lato.png",
                    ],
                    [
                        'code' => 'pearl_black',
                        'name' => 'Nero perla',
                        'hex' => '#141414',
                        'sort_order' => 1,
                        'preview' => 'https://www-europe.nissan-cdn.net/content/dam/Nissan/it/vehicles/juke-my24-assets-webp/24TDIEU_PS_JUKEMC_ICE_N-Design_RCF_001.webp',
                    ],
                    [
                        'code' => 'energy_orange',
                        'name' => 'Arancio energy',
                        'hex' => '#E85D04',
                        'sort_order' => 2,
                        'preview' => "{$frontendUrl}/juke-lato.png",
                    ],
                ],
            ],
            'Kona EV' => [
                'side' => "{$frontendUrl}/kona-lato.png",
                'colors' => [
                    [
                        'code' => 'cyber_gray',
                        'name' => 'Grigio cyber',
                        'hex' => '#6B7280',
                        'sort_order' => 0,
                        'preview' => "{$frontendUrl}/kona-lato.png",
                    ],
                    [
                        'code' => 'ecotronic_gray',
                        'name' => 'Grigio ecotronic',
                        'hex' => '#9CA3AF',
                        'sort_order' => 1,
                        'preview' => 'https://s7g10.scene7.com/is/image/hyundaiautoever/SX2_EV_calculator_asset_4x3:4x3?wid=960&hei=720&fmt=png-alpha&fit=wrap,1',
                    ],
                    [
                        'code' => 'blue_wave',
                        'name' => 'Blu wave',
                        'hex' => '#2563EB',
                        'sort_order' => 2,
                        'preview' => "{$frontendUrl}/kona-lato.png",
                    ],
                ],
            ],
            'Tucson HEV' => [
                'side' => "{$frontendUrl}/tucson-lato.png",
                'colors' => [
                    [
                        'code' => 'creamy_white',
                        'name' => 'Bianco creamy',
                        'hex' => '#F5F5F0',
                        'sort_order' => 0,
                        'preview' => "{$frontendUrl}/tucson-lato.png",
                    ],
                    [
                        'code' => 'phantom_black',
                        'name' => 'Nero phantom',
                        'hex' => '#111827',
                        'sort_order' => 1,
                        'preview' => 'https://get-moba.com/app/uploads/2024/04/hyundai-tucson-hev-front-view-removebg-preview-1.png',
                    ],
                    [
                        'code' => 'shimmering_silver',
                        'name' => 'Argento shimmering',
                        'hex' => '#C0C4CC',
                        'sort_order' => 2,
                        'preview' => "{$frontendUrl}/tucson-lato.png",
                    ],
                ],
            ],
        ];
    }

    public function run(): void
    {
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');

        foreach ($this->catalog($frontendUrl) as $model => $entry) {
            $vehicle = Vehicle::query()->where('model', $model)->first();

            if ($vehicle === null) {
                continue;
            }

            foreach ($entry['colors'] as $colorData) {
                $preview = $colorData['preview'];
                unset($colorData['preview']);

                $color = VehicleColor::query()->create([
                    'vehicle_id' => $vehicle->id,
                    ...$colorData,
                ]);

                foreach (VehicleViewAngle::values() as $angle) {
                    $path = match ($angle) {
                        VehicleViewAngle::Side->value => $entry['side'],
                        default => $preview,
                    };

                    $color->images()->create([
                        'angle' => $angle,
                        'path' => $path,
                    ]);
                }
            }
        }
    }
}
