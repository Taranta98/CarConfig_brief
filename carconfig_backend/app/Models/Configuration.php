<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Configuration extends Model
{
    const STATUS_COMPLETED = 'completed';

    protected $fillable = [
        'user_id',
        'vehicle_id',
        'trim_id',
        'vehicle_color_id',
        'total_price',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'total_price' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function trim(): BelongsTo
    {
        return $this->belongsTo(Trim::class);
    }

    public function vehicleColor(): BelongsTo
    {
        return $this->belongsTo(VehicleColor::class);
    }

    public function optionals(): BelongsToMany
    {
        return $this->belongsToMany(Optional::class, 'configuration_optionals')
            ->withPivot('price_snapshot')
            ->withTimestamps();
    }
}
