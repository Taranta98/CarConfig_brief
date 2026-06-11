<?php

namespace App\Enums;

enum VehicleViewAngle: string
{
    case Front = 'front';
    case Rear = 'rear';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
