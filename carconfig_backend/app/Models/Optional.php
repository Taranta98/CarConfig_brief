<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Optional extends Model
{
    protected $fillable = ['name', 'description', 'price', 'category', 'is_required','vehicle_id', 'image'];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
