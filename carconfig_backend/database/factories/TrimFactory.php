<?php

namespace Database\Factories;

use App\Models\Trim;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Trim>
 */
class TrimFactory extends Factory
{
    protected $model = Trim::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['Base', 'Comfort', 'Sport', 'Premium']),
            'description' => fake()->sentence(),
            'price' => fake()->randomElement([0, 1500, 2200, 3500, 4800]),
            'img' => '',
            'vehicle_id' => Vehicle::factory(),
        ];
    }

    public function forVehicle(Vehicle $vehicle): static
    {
        return $this->state(fn () => [
            'vehicle_id' => $vehicle->id,
        ]);
    }
}
