<?php

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;

uses(RefreshDatabase::class);

it('sends a password reset link for verified users', function () {
    Notification::fake();

    $user = User::factory()->create([
        'email' => 'verified@example.com',
    ]);

    $response = $this->postJson('/api/forgot-password', [
        'email' => $user->email,
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true);

    Notification::assertSentTo($user, ResetPasswordNotification::class);
});

it('sends a password reset link for unverified users', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create([
        'email' => 'unverified@example.com',
    ]);

    $response = $this->postJson('/api/forgot-password', [
        'email' => $user->email,
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true);

    Notification::assertSentTo($user, ResetPasswordNotification::class);
});

it('returns the same success response for unknown emails', function () {
    Notification::fake();

    $response = $this->postJson('/api/forgot-password', [
        'email' => 'unknown@example.com',
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true);

    Notification::assertNothingSent();
});

it('resets the password for unverified users and returns an auth token', function () {
    $user = User::factory()->unverified()->create([
        'email' => 'unverified-reset@example.com',
        'password' => Hash::make('old-password'),
    ]);

    $token = Password::createToken($user);

    $response = $this->postJson('/api/reset-password', [
        'email' => $user->email,
        'token' => $token,
        'password' => 'new-password-1',
        'password_confirmation' => 'new-password-1',
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonStructure(['user', 'token']);

    $user->refresh();

    expect(Hash::check('new-password-1', $user->password))->toBeTrue();
});

it('resets the password and returns an auth token', function () {
    $user = User::factory()->create([
        'email' => 'reset@example.com',
        'password' => Hash::make('old-password'),
    ]);

    $token = Password::createToken($user);

    $response = $this->postJson('/api/reset-password', [
        'email' => $user->email,
        'token' => $token,
        'password' => 'new-password-1',
        'password_confirmation' => 'new-password-1',
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonStructure(['user', 'token']);

    $user->refresh();

    expect(Hash::check('new-password-1', $user->password))->toBeTrue();
});

it('rejects invalid reset tokens', function () {
    $user = User::factory()->create([
        'email' => 'invalid@example.com',
    ]);

    $response = $this->postJson('/api/reset-password', [
        'email' => $user->email,
        'token' => 'invalid-token',
        'password' => 'new-password-1',
        'password_confirmation' => 'new-password-1',
    ]);

    $response->assertBadRequest()
        ->assertJsonPath('success', false);
});
