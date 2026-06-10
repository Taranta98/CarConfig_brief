<?php

namespace App\Enums;

enum VehicleViewAngle: string
{
    case Front = 'front';
    case FrontRight = 'front_right';
    case Right = 'right';
    case RearRight = 'rear_right';
    case Rear = 'rear';
    case RearLeft = 'rear_left';
    case Left = 'left';
    case FrontLeft = 'front_left';
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
        return array_values(array_filter(
            self::values(),
            fn (string $angle) => $angle !== self::Side->value
        ));
    }
}
