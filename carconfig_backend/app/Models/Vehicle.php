<?php

namespace App\Models;

use Database\Factories\VehicleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    /** @use HasFactory<VehicleFactory> */
    use HasFactory;
    protected $fillable = [
        'brand',
        'model',
        'year',
        'fuel_type',
        'image',
        'co2_emissions',
        'base_price',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'base_price' => 'decimal:2',
        ];
    }

    public function trims()
    {
        return $this->hasMany(Trim::class);
    }

    public function optionals()
    {
        return $this->hasMany(Optional::class);
    }

    public function colors()
    {
        return $this->hasMany(VehicleColor::class)->orderBy('sort_order');
    }
}
