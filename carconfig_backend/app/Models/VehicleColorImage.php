<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleColorImage extends Model
{
    protected $fillable = [
        'vehicle_color_id',
        'angle',
        'path',
    ];

    public function vehicleColor(): BelongsTo
    {
        return $this->belongsTo(VehicleColor::class);
    }
}
