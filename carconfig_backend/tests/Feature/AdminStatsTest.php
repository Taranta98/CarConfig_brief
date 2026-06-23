<?php

use App\Models\Configuration;
use App\Models\Trim;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

function createConfigurationForVehicle(User $user, Vehicle $vehicle): Configuration
{
    $trim = Trim::factory()->forVehicle($vehicle)->create();

    return Configuration::query()->create([
        'user_id' => $user->id,
        'vehicle_id' => $vehicle->id,
        'trim_id' => $trim->id,
        'status' => Configuration::STATUS_COMPLETED,
        'total_price' => 1000,
    ]);
}

it('returns admin stats for configured vehicles and users', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $popularVehicle = Vehicle::factory()->create([
        'brand' => 'Nissan',
        'model' => 'Qashqai',
        'year' => 2024,
    ]);
    $otherVehicle = Vehicle::factory()->create([
        'brand' => 'Hyundai',
        'model' => 'Tucson',
        'year' => 2024,
    ]);

    createConfigurationForVehicle($user, $popularVehicle);
    createConfigurationForVehicle($otherUser, $popularVehicle);
    createConfigurationForVehicle($user, $otherVehicle);

    Sanctum::actingAs($admin);

    $response = $this->getJson('/api/admin/stats');

    $response->assertOk()
        ->assertJsonPath('data.configured_vehicles.0.label', 'Nissan Qashqai (2024)')
        ->assertJsonPath('data.configured_vehicles.0.count', 2)
        ->assertJsonPath('data.configured_vehicles.1.label', 'Hyundai Tucson (2024)')
        ->assertJsonPath('data.configured_vehicles.1.count', 1)
        ->assertJsonPath('data.users.total', 3)
        ->assertJsonPath('data.users.by_role.0.role', 'admin')
        ->assertJsonPath('data.users.by_role.0.count', 1)
        ->assertJsonPath('data.users.by_role.1.role', 'user')
        ->assertJsonPath('data.users.by_role.1.count', 2);
});

it('forbids admin stats for non-admin users', function () {
    $user = User::factory()->create();

    Sanctum::actingAs($user);

    $this->getJson('/api/admin/stats')->assertForbidden();
});
