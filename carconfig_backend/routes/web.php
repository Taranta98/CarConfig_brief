<?php

use App\Http\Controllers\PublicStorageController;
use Illuminate\Support\Facades\Route;

Route::get('/storage/{path}', [PublicStorageController::class, 'show'])
    ->where('path', '.*')
    ->name('storage.public');
