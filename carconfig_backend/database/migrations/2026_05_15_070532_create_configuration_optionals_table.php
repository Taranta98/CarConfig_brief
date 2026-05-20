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
        Schema::create('configuration_optionals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('configuration_id')->constrained()->onDelete('cascade');
            $table->foreignId('optional_id')->constrained()->onDelete('cascade');
            $table->integer('price_snapshot');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('configuration_optionals');
    }
};
