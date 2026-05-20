<?php

namespace App\Services;

use App\Models\Configuration;
use App\Models\Optional;

class ConfigurationService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        
    }
      public function createConfiguration(?int $userId, int $vehicleId): Configuration
    {
        return Configuration::create([
            'user_id' => $userId,
            'vehicle_id' => $vehicleId,
            'status' => Configuration::STATUS_DRAFT ?? 'in_progress',
            'total_price' => 0,
        ]);
    }
     public function getConfiguration($id)
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
            'price_snapshot' => $optional->price
        ];
    }

    $config->optionals()->sync($syncData);
}
}
