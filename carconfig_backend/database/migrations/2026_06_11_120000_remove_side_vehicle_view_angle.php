<?php

use App\Enums\VehicleViewAngle;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('vehicle_color_images')) {
            return;
        }

        DB::table('vehicle_color_images')->where('angle', 'side')->delete();

        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $angles = implode("','", VehicleViewAngle::values());

        DB::statement(
            "ALTER TABLE vehicle_color_images MODIFY angle ENUM('{$angles}') NOT NULL"
        );
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement(
            "ALTER TABLE vehicle_color_images MODIFY angle ENUM('front', 'rear', 'side') NOT NULL"
        );
    }
};
