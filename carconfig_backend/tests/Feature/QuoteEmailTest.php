<?php

use App\Mail\ConfigurationQuoteMail;
use App\Models\Optional;
use App\Models\Trim;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

it('downloads a formatted quote pdf', function () {
    $vehicle = Vehicle::factory()->create();
    $trim = Trim::factory()->forVehicle($vehicle)->create();

    $response = $this->post('/api/configurations/quote/pdf', [
        'vehicle_id' => $vehicle->id,
        'trim_id' => $trim->id,
        'optionals' => [],
    ]);

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('application/pdf');
    expect(str_starts_with($response->getContent(), '%PDF'))->toBeTrue();
});

it('emails a quote pdf to the authenticated user', function () {
    Mail::fake();

    $user = User::factory()->create();
    $vehicle = Vehicle::factory()->create();
    $trim = Trim::factory()->forVehicle($vehicle)->create();
    $optional = Optional::factory()->forVehicle($vehicle)->create();

    Sanctum::actingAs($user);

    $response = $this->postJson('/api/configurations/quote/email', [
        'vehicle_id' => $vehicle->id,
        'trim_id' => $trim->id,
        'optionals' => [$optional->id],
    ]);

    $response->assertOk()
        ->assertJsonPath('message', 'Preventivo inviato alla tua email.');

    Mail::assertSent(ConfigurationQuoteMail::class, function (ConfigurationQuoteMail $mail) use ($user, $vehicle) {
        return $mail->hasTo($user->email)
            && $mail->vehicle->is($vehicle)
            && str_starts_with($mail->pdfContent, '%PDF');
    });
});

it('rejects quote email when trim does not belong to the vehicle', function () {
    Mail::fake();

    $user = User::factory()->create();
    $vehicle = Vehicle::factory()->create();
    $otherVehicle = Vehicle::factory()->create();
    $trim = Trim::factory()->forVehicle($otherVehicle)->create();

    Sanctum::actingAs($user);

    $response = $this->postJson('/api/configurations/quote/email', [
        'vehicle_id' => $vehicle->id,
        'trim_id' => $trim->id,
        'optionals' => [],
    ]);

    $response->assertStatus(422);
    Mail::assertNothingSent();
});
