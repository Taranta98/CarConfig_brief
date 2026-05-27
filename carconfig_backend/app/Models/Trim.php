<?php

namespace App\Models;

use Database\Factories\TrimFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trim extends Model
{
    /** @use HasFactory<TrimFactory> */
    use HasFactory;
    protected $fillable = ['name', 'description', 'price', 'img', 'vehicle_id'];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}


