<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id('room_id');

            $table->foreignId('iot_device_id')
                ->constrained('iot_devices', 'device_id')
                ->cascadeOnDelete();

            $table->string('room_name');
            $table->string('room_type');

            $table->integer('price_per_hour');

            $table->enum('status', ['available', 'occupied', 'disabled'])
                ->default('available');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};