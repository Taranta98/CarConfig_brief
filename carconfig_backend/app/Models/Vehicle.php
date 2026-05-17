<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = [ 'name','model','image','co2_emissions','base_price' ];

    
}
