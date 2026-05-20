<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\Trim;
use App\Models\Optional;


class Configuration extends Model
{
    protected $fillable = ['user_id', 'vehicle_id', 'trim_id', 'total_price', 'status'];
    

    protected $casts = [
        'total_price' => 'float',
    ];

    const STATUS_DRAFT = 'draft';
    const STATUS_COMPLETED = 'completed';

    public function user()
    {
       return $this->belongsTo(User::class); 
    }
    
    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
    
    public function trim()
    {
        return $this->belongsTo(Trim::class);
    }
    public function optionals()
    {
        return $this->belongsToMany(Optional::class)
            ->withPivot('price_snapshot')
            ->withTimestamps();
    }
}