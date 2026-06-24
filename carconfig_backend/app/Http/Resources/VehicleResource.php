<?php

namespace App\Http\Resources;

use App\Support\AssetUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'brand' => $this->brand,
            'model' => $this->model,
            'year' => $this->year,
            'fuel_type' => $this->fuel_type,
            'image' => AssetUrl::resolve($this->image) ?? $this->image,
            'co2_emissions' => $this->co2_emissions,
            'base_price' => $this->base_price,
        ];
    }
}
