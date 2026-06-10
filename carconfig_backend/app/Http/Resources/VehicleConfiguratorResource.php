<?php

namespace App\Http\Resources;

use App\Enums\VehicleViewAngle;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleConfiguratorResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'vehicle' => new VehicleResource($this->resource),
            'angles' => VehicleViewAngle::values(),
            'colors' => VehicleColorResource::collection(
                $this->whenLoaded('colors')
            ),
        ];
    }
}
