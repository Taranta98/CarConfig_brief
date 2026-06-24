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

    public function run(): void
    {
        $vehicles = Vehicle::query()
            ->whereIn('model', ['Qashqai MY24', 'Juke MY24', 'Kona EV', 'Tucson HEV'])
            ->get()
            ->keyBy('model');

        foreach ($vehicles as $vehicle) {
            if ($vehicle->image === null || $vehicle->image === '') {
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
                        'path' => $vehicle->image,
                    ]);
                }
            }
        }
    }
}
