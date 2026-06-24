<?php

namespace App\Http\Resources;

use App\Support\AssetUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrimResource extends JsonResource
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
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'image' => AssetUrl::resolve($this->img) ?? $this->img,
            'vehicle_id' => $this->vehicle_id,
            'vehicle' => new VehicleResource($this->whenLoaded('vehicle')),
        ];
    }
}
