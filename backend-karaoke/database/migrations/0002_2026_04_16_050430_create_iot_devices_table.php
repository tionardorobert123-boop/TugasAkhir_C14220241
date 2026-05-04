<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('iot_devices', function (Blueprint $table) {
            $table->id('device_id');
            $table->string('device_name');

            $table->boolean('status_online')->default(false);

            $table->enum('lock_status', ['locked', 'unlocked', 'unknown'])->default('unknown');
            $table->enum('door_status', ['open', 'closed', 'unknown'])->default('unknown');

            $table->timestamp('last_seen')->nullable();

            $table->integer('miss_count')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('iot_devices');
    }
};