<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/storage/{path}', function (string $path) {
    $disk = Storage::disk('public');

    if (! $disk->exists($path)) {
        abort(404);
    }

    return response()->file($disk->path($path));
})->where('path', '.*');
