<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConfigurationResource extends JsonResource
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
            'user_id' => $this->user_id,

            'vehicle' => [
                'id' => $this->vehicle->id,
                'brand' => $this->vehicle->brand,
                'model' => $this->vehicle->model,
                'year' => $this->vehicle->year,
                'fuel_type' => $this->vehicle->fuel_type,
                'base_price' => $this->vehicle->base_price,
            ],
            'trim' => $this->when($this->trim, fn () => [
                'id' => $this->trim->id,
                'name' => $this->trim->name,
                'price' => $this->trim->price,
                'description' => $this->trim->description,
            ]),
            'optionals' => OptionalResource::collection($this->whenLoaded('optionals')),
            'total_price' => $this->total_price,
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];
    }
}
