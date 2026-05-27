<?php

namespace Database\Factories;

use App\Models\Optional;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Optional>
 */
class OptionalFactory extends Factory
{
    protected $model = Optional::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'image' => null,
            'price' => fake()->numberBetween(200, 2500),
            'category' => fake()->randomElement(['Comfort', 'Technology', 'Safety', 'Exterior']),
            'is_required' => false,
            'vehicle_id' => Vehicle::factory(),
        ];
    }

    public function forVehicle(Vehicle $vehicle): static
    {
        return $this->state(fn () => [
            'vehicle_id' => $vehicle->id,
        ]);
    }

    public function required(): static
    {
        return $this->state(fn () => [
            'is_required' => true,
            'price' => 0,
        ]);
    }
}
