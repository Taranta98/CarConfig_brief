<?php

use App\Enums\VehicleViewAngle;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleColor;
use App\Support\AssetUrl;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns vehicle configurator data with colors and resolved image urls', function () {
    $vehicle = Vehicle::factory()->create([
        'brand' => 'Test',
        'model' => 'Model X',
    ]);

    $color = VehicleColor::query()->create([
        'vehicle_id' => $vehicle->id,
        'code' => 'pearl_white',
        'name' => 'Bianco perla',
        'hex' => '#F4F4F4',
        'sort_order' => 0,
    ]);

    foreach (VehicleViewAngle::values() as $angle) {
        $color->images()->create([
            'angle' => $angle,
            'path' => 'vehicle-views/test/'.$angle.'.png',
        ]);
    }

    $response = $this->getJson("/api/vehicles/{$vehicle->id}/configurator");

    $response->assertOk()
        ->assertJsonPath('data.vehicle.id', $vehicle->id)
        ->assertJsonPath('data.angles', VehicleViewAngle::values())
        ->assertJsonCount(1, 'data.colors')
        ->assertJsonPath('data.colors.0.code', 'pearl_white')
        ->assertJsonPath(
            'data.colors.0.images.side',
            AssetUrl::resolve('vehicle-views/test/side.png')
        );
});

it('allows admins to manage vehicle colors', function () {
    $admin = User::factory()->admin()->create();
    $vehicle = Vehicle::factory()->create();

    $images = collect(VehicleViewAngle::values())
        ->mapWithKeys(fn (string $angle) => [$angle => "vehicle-views/{$angle}.png"])
        ->all();

    $response = $this->actingAs($admin)->postJson("/api/vehicles/{$vehicle->id}/colors", [
        'code' => 'racing_red',
        'name' => 'Rosso racing',
        'hex' => '#CC0000',
        'sort_order' => 0,
        'images' => $images,
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.code', 'racing_red')
        ->assertJsonPath('data.images.front', AssetUrl::resolve('vehicle-views/front.png'));

    $this->assertDatabaseHas('vehicle_colors', [
        'vehicle_id' => $vehicle->id,
        'code' => 'racing_red',
    ]);
});
