<?php

namespace App\Services;

use App\Models\Configuration;
use App\Models\Optional;
use App\Models\Trim;

class ConfigurationService
{
    public function createConfiguration(int $userId, int $vehicleId, int $trimId, array $optionals, float $totalPrice): Configuration
    {
        $config = Configuration::create([
            'user_id' => $userId,
            'vehicle_id' => $vehicleId,
            'trim_id' => $trimId,
            'status' => Configuration::STATUS_COMPLETED,
            'total_price' => $totalPrice,
        ]);

        $this->syncOptionals($config->id, $optionals);

        return $this->getConfiguration($config->id);
    }

    public function getConfiguration(int $id): Configuration
    {
        return Configuration::with(['vehicle', 'trim', 'optionals'])
            ->findOrFail($id);
    }

    public function syncOptionals(int $configId, array $optionals): void
    {
        $config = Configuration::findOrFail($configId);

        $syncData = [];

        $optionalsModels = Optional::whereIn('id', $optionals)->get();

        foreach ($optionalsModels as $optional) {
            $syncData[$optional->id] = [
                'price_snapshot' => $optional->price,
            ];
        }

        $config->optionals()->sync($syncData);
    }

    public function assertTrimBelongsToVehicle(int $trimId, int $vehicleId): void
    {
        $belongs = Trim::query()
            ->whereKey($trimId)
            ->where('vehicle_id', $vehicleId)
            ->exists();

        if (! $belongs) {
            abort(422, 'L\'allestimento selezionato non appartiene a questo veicolo.');
        }
    }
}
