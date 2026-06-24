<?php

namespace App\Console\Commands;

use App\Models\VehicleColorImage;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('vehicle-colors:sync-preview-images')]
#[Description('Replace broken demo color preview paths with each vehicle catalog image')]
class SyncVehicleColorPreviewImages extends Command
{
    public function handle(): int
    {
        $updated = 0;

        VehicleColorImage::query()
            ->with('vehicleColor.vehicle')
            ->each(function (VehicleColorImage $image) use (&$updated): void {
                $vehicleImage = $image->vehicleColor?->vehicle?->image;

                if ($vehicleImage === null || $vehicleImage === '') {
                    return;
                }

                if (! $this->isBrokenDemoPath($image->path)) {
                    return;
                }

                $image->update(['path' => $vehicleImage]);
                $updated++;
            });

        $this->info("Updated {$updated} vehicle color preview image(s).");

        return self::SUCCESS;
    }

    protected function isBrokenDemoPath(string $path): bool
    {
        if (str_contains($path, '-lato.png')) {
            return true;
        }

        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');

        if ($frontendUrl === '') {
            return false;
        }

        return str_starts_with($path, "{$frontendUrl}/")
            && ! str_starts_with($path, "{$frontendUrl}/storage/");
    }
}
