<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Trim extends Model
{
    protected $fillable = ['name', 'description', 'price', 'vehicle_id'];

    public function vehicle() {
        return $this->hasMany(Vehicle::class);
    }
}


