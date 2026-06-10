<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

it('returns the authenticated user profile', function () {
    $user = User::factory()->create();

    Sanctum::actingAs($user);

    $response = $this->getJson('/api/auth/me');

    $response->assertOk()
        ->assertJsonPath('user.id', $user->id)
        ->assertJsonPath('user.email', $user->email);
});

it('updates profile credentials for the authenticated user', function () {
    $user = User::factory()->create([
        'first_name' => 'Mario',
        'last_name' => 'Rossi',
        'email' => 'mario@example.com',
    ]);

    Sanctum::actingAs($user);

    $response = $this->putJson('/api/profile', [
        'first_name' => 'Luigi',
        'last_name' => 'Verdi',
    ]);

    $response->assertOk()
        ->assertJsonPath('user.first_name', 'Luigi')
        ->assertJsonPath('user.last_name', 'Verdi')
        ->assertJsonPath('user.email', 'mario@example.com');

    $user->refresh();

    expect($user->first_name)->toBe('Luigi')
        ->and($user->last_name)->toBe('Verdi')
        ->and($user->email)->toBe('mario@example.com');
});

it('ignores email updates from profile requests', function () {
    $user = User::factory()->create([
        'email' => 'mario@example.com',
    ]);

    Sanctum::actingAs($user);

    $response = $this->putJson('/api/profile', [
        'first_name' => $user->first_name,
        'last_name' => $user->last_name,
        'email' => 'hacker@example.com',
    ]);

    $response->assertOk()
        ->assertJsonPath('user.email', 'mario@example.com');

    expect($user->fresh()->email)->toBe('mario@example.com');
});

it('updates the password for the authenticated user', function () {
    $user = User::factory()->create([
        'password' => Hash::make('current-password'),
    ]);

    Sanctum::actingAs($user);

    $response = $this->putJson('/api/profile/password', [
        'current_password' => 'current-password',
        'password' => 'new-password-1',
        'password_confirmation' => 'new-password-1',
    ]);

    $response->assertOk()
        ->assertJsonPath('message', 'Password aggiornata con successo');

    $user->refresh();

    expect(Hash::check('new-password-1', $user->password))->toBeTrue();
});

it('rejects password updates with an invalid current password', function () {
    $user = User::factory()->create([
        'password' => Hash::make('current-password'),
    ]);

    Sanctum::actingAs($user);

    $response = $this->putJson('/api/profile/password', [
        'current_password' => 'wrong-password',
        'password' => 'new-password-1',
        'password_confirmation' => 'new-password-1',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['current_password']);
});
