<?php

namespace App\Enums;

enum VehicleViewAngle: string
{
    case Front = 'front';
    case Rear = 'rear';
    case Side = 'side';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * @return list<string>
     */
    public static function rotationValues(): array
    {
        return [
            self::Front->value,
            self::Rear->value,
        ];
    }
}
