<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\ConfigurationController;
use App\Http\Controllers\OptionalController;
use App\Http\Controllers\TrimController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VehicleController;
use Illuminate\Support\Facades\Route;


Route::controller(AuthController::class)->group(function() {
    Route::post('/register', 'register');
    Route::post('/login', 'login');
});

Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])->name('api.verification.verify');

Route::get('/vehicles', [VehicleController::class, 'index']);
Route::get('/vehicles/{vehicle}/trims', [VehicleController::class, 'trims']);
Route::get('/vehicles/{vehicle}/optionals', [VehicleController::class, 'optionals']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);

    Route::get('/configurations', [ConfigurationController::class, 'index']);
    Route::post('/configurations', [ConfigurationController::class, 'store']);
    Route::get('/configurations/{configuration}', [ConfigurationController::class, 'show']);
    Route::post('/configurations/quote/email', [ConfigurationController::class, 'emailQuote']);
});

Route::middleware(['auth:sanctum','admin'])->group(function(){
    Route::apiResource('users', UserController::class);
    Route::apiResource('vehicles', VehicleController::class)->except(['index']);
    Route::apiResource('trims', TrimController::class);
    Route::apiResource('optionals', OptionalController::class);
});



