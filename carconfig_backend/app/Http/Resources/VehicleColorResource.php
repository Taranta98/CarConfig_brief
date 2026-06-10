<?php

namespace App\Http\Resources;

use App\Enums\VehicleViewAngle;
use App\Support\AssetUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleColorResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $images = [];

        if ($this->relationLoaded('images')) {
            foreach (VehicleViewAngle::values() as $angle) {
                $image = $this->images->firstWhere('angle', $angle);

                if ($image !== null) {
                    $images[$angle] = AssetUrl::resolve($image->path);
                }
            }
        }

        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'hex' => $this->hex,
            'sort_order' => $this->sort_order,
            'images' => $images,
        ];
    }
}
