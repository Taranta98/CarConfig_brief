<?php

use App\Models\Configuration;
use App\Models\Optional;
use App\Models\Trim;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

function createSavedConfiguration(User $user, array $overrides = []): Configuration
{
    $vehicle = Vehicle::factory()->create([
        'base_price' => $overrides['vehicle_base_price'] ?? 30000,
    ]);
    $trim = Trim::factory()->forVehicle($vehicle)->create([
        'price' => $overrides['trim_price'] ?? 2000,
    ]);
    $optional = Optional::factory()->forVehicle($vehicle)->create([
        'price' => $overrides['optional_price'] ?? 500,
    ]);

    Sanctum::actingAs($user);

    test()->postJson('/api/configurations', [
        'vehicle_id' => $vehicle->id,
        'trim_id' => $trim->id,
        'optionals' => [$optional->id],
    ])->assertCreated();

    return Configuration::query()
        ->where('user_id', $user->id)
        ->with(['vehicle', 'trim', 'optionals'])
        ->firstOrFail();
}

it('removes saved configurations when vehicle base price changes', function () {
    $user = User::factory()->create();
    $configuration = createSavedConfiguration($user);

    $configuration->vehicle->update(['base_price' => 31000]);

    Sanctum::actingAs($user);

    $this->getJson('/api/configurations')
        ->assertOk()
        ->assertJsonCount(0, 'data');

    expect(Configuration::query()->count())->toBe(0);
});

it('removes saved configurations when trim price changes', function () {
    $user = User::factory()->create();
    $configuration = createSavedConfiguration($user);

    $configuration->trim->update(['price' => 2500]);

    Sanctum::actingAs($user);

    $this->getJson('/api/configurations')
        ->assertOk()
        ->assertJsonCount(0, 'data');
});

it('removes saved configurations when optional price changes', function () {
    $user = User::factory()->create();
    $configuration = createSavedConfiguration($user);
    $optional = $configuration->optionals->first();

    $optional->update(['price' => $optional->price + 100]);

    Sanctum::actingAs($user);

    $this->getJson('/api/configurations')
        ->assertOk()
        ->assertJsonCount(0, 'data');
});

it('keeps saved configurations when unrelated prices stay the same', function () {
    $user = User::factory()->create();
    createSavedConfiguration($user);

    Sanctum::actingAs($user);

    $this->getJson('/api/configurations')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

it('returns not found when requesting a configuration with stale prices', function () {
    $user = User::factory()->create();
    $configuration = createSavedConfiguration($user);

    $configuration->vehicle->update(['base_price' => 31000]);

    Sanctum::actingAs($user);

    $this->getJson("/api/configurations/{$configuration->id}")
        ->assertNotFound();
});
