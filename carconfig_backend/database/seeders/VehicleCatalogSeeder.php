<?php

namespace Database\Seeders;

use App\Models\Optional;
use App\Models\Trim;
use App\Models\Vehicle;
use Database\Factories\VehicleFactory;
use Illuminate\Database\Seeder;

class VehicleCatalogSeeder extends Seeder
{
    public function run(): void
    {
        foreach (VehicleFactory::catalog() as $entry) {
            $trims = $entry['trims'];
            $optionals = $entry['optionals'];
            unset($entry['trims'], $entry['optionals']);

            $vehicle = Vehicle::query()->create($entry);

            foreach ($trims as $trim) {
                Trim::query()->create([
                    'vehicle_id' => $vehicle->id,
                    'name' => $trim['name'],
                    'description' => $trim['description'],
                    'price' => $trim['price'],
                    'img' => $trim['img'] ?? '',
                ]);
            }

            foreach ($optionals as $optional) {
                Optional::query()->create([
                    'vehicle_id' => $vehicle->id,
                    'name' => $optional['name'],
                    'description' => $optional['description'],
                    'price' => $optional['price'],
                    'category' => $optional['category'],
                    'is_required' => $optional['is_required'],
                    'image' => $optional['image'] ?? null,
                ]);
            }
        }
    }
}
