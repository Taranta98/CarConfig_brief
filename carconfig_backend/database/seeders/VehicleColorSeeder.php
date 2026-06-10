<?php

namespace Database\Seeders;

use App\Enums\VehicleViewAngle;
use App\Models\Vehicle;
use App\Models\VehicleColor;
use Illuminate\Database\Seeder;

class VehicleColorSeeder extends Seeder
{
    /**
     * @return list<array{code: string, name: string, hex: string, sort_order: int}>
     */
    protected function standardColors(): array
    {
        return [
            [
                'code' => 'white',
                'name' => 'Bianco',
                'hex' => '#F5F5F5',
                'sort_order' => 0,
            ],
            [
                'code' => 'black',
                'name' => 'Nero',
                'hex' => '#1C1C1C',
                'sort_order' => 1,
            ],
            [
                'code' => 'light_gray',
                'name' => 'Grigio chiaro',
                'hex' => '#D1D5DB',
                'sort_order' => 2,
            ],
            [
                'code' => 'dark_gray',
                'name' => 'Grigio scuro',
                'hex' => '#4B5563',
                'sort_order' => 3,
            ],
        ];
    }

    /**
     * @return array<string, array{front: string, rear: string, side: string}>
     */
    protected function vehicleViews(string $frontendUrl): array
    {
        return [
            'Qashqai MY24' => [
                'front' => "{$frontendUrl}/qashqai-lato.png",
                'rear' => "{$frontendUrl}/qashqai-lato.png",
                'side' => "{$frontendUrl}/qashqai-lato.png",
            ],
            'Juke MY24' => [
                'front' => "{$frontendUrl}/juke-lato.png",
                'rear' => "{$frontendUrl}/juke-lato.png",
                'side' => "{$frontendUrl}/juke-lato.png",
            ],
            'Kona EV' => [
                'front' => "{$frontendUrl}/kona-lato.png",
                'rear' => "{$frontendUrl}/kona-lato.png",
                'side' => "{$frontendUrl}/kona-lato.png",
            ],
            'Tucson HEV' => [
                'front' => "{$frontendUrl}/tucson-lato.png",
                'rear' => "{$frontendUrl}/tucson-lato.png",
                'side' => "{$frontendUrl}/tucson-lato.png",
            ],
        ];
    }

    public function run(): void
    {
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');

        foreach ($this->vehicleViews($frontendUrl) as $model => $views) {
            $vehicle = Vehicle::query()->where('model', $model)->first();

            if ($vehicle === null) {
                continue;
            }

            foreach ($this->standardColors() as $colorData) {
                $color = VehicleColor::query()->create([
                    'vehicle_id' => $vehicle->id,
                    ...$colorData,
                ]);

                foreach (VehicleViewAngle::values() as $angle) {
                    $color->images()->create([
                        'angle' => $angle,
                        'path' => $views[$angle],
                    ]);
                }
            }
        }
    }
}
