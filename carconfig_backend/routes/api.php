<?php

use App\Http\Controllers\OptionalController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VehicleController;
use Illuminate\Support\Facades\Route;




Route::apiResource('users', UserController::class);
Route::apiResource('vechicles', VehicleController::class);
Route::apiResource('optionals', OptionalController::class);