<?php

namespace App\Models;

use Database\Factories\OptionalFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Optional extends Model
{
    /** @use HasFactory<OptionalFactory> */
    use HasFactory;
    protected $fillable = ['name', 'description', 'price', 'category', 'is_required','vehicle_id', 'image'];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
