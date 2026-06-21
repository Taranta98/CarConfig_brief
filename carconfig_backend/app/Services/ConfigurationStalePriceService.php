<?php

namespace App\Services;

use App\Models\Configuration;
use App\Models\Optional;
use App\Models\Trim;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Collection;

class ConfigurationStalePriceService
{
    public function hasStalePrices(Configuration $configuration): bool
    {
        $configuration->loadMissing(['vehicle', 'trim', 'optionals']);

        if ($configuration->vehicle === null || $configuration->trim === null) {
            return true;
        }

        foreach ($configuration->optionals as $optional) {
            if ((float) $optional->price !== (float) $optional->pivot->price_snapshot) {
                return true;
            }

            if ((int) $optional->vehicle_id !== (int) $configuration->vehicle_id) {
                return true;
            }
        }

        return abs((float) $configuration->total_price - $this->expectedTotal($configuration)) >= 0.01;
    }

    public function expectedTotal(Configuration $configuration): float
    {
        $configuration->loadMissing(['vehicle', 'trim', 'optionals']);

        $base = (float) ($configuration->vehicle->base_price ?? 0);
        $trim = (float) ($configuration->trim->price ?? 0);
        $optionals = $configuration->optionals->sum(
            fn ($optional) => (float) ($optional->pivot->price_snapshot ?? 0)
        );

        return $base + $trim + $optionals;
    }

    public function deleteIfStale(Configuration $configuration): bool
    {
        if (! $this->hasStalePrices($configuration)) {
            return false;
        }

        $configuration->delete();

        return true;
    }

    /**
     * @param  Collection<int, Configuration>  $configurations
     * @return Collection<int, Configuration>
     */
    public function purgeStale(Collection $configurations): Collection
    {
        return $configurations->filter(function (Configuration $configuration) {
            return ! $this->deleteIfStale($configuration);
        })->values();
    }

    public function deleteConfigurationsForVehiclePriceChange(Vehicle $vehicle): void
    {
        if (! $vehicle->wasChanged('base_price')) {
            return;
        }

        Configuration::query()
            ->where('vehicle_id', $vehicle->id)
            ->delete();
    }

    public function deleteConfigurationsForTrimPriceChange(Trim $trim): void
    {
        if (! $trim->wasChanged('price')) {
            return;
        }

        Configuration::query()
            ->where('trim_id', $trim->id)
            ->delete();
    }

    public function deleteConfigurationsForOptionalPriceChange(Optional $optional): void
    {
        if (! $optional->wasChanged('price')) {
            return;
        }

        Configuration::query()
            ->whereHas('optionals', fn ($query) => $query->where('optionals.id', $optional->id))
            ->delete();
    }
}
