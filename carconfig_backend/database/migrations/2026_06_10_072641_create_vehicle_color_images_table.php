<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vehicle_color_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_color_id')->constrained()->cascadeOnDelete();
            $table->string('angle');
            $table->string('path');
            $table->timestamps();

            $table->unique(['vehicle_color_id', 'angle']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_color_images');
    }
};
