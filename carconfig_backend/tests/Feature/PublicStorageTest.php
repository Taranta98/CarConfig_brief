<?php

use Illuminate\Support\Facades\Storage;

it('serves files from the public storage disk', function () {
    Storage::fake('public');
    Storage::disk('public')->put('vehicles/test.png', 'image-bytes');

    $this->get('/storage/vehicles/test.png')->assertOk();
});

it('returns 404 for missing storage files', function () {
    Storage::fake('public');

    $this->get('/storage/vehicles/missing.png')->assertNotFound();
});

it('blocks path traversal in storage urls', function () {
    Storage::fake('public');

    $this->get('/storage/../.env')->assertNotFound();
});
