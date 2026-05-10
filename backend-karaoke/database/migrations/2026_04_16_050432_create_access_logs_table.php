<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('access_logs', function (Blueprint $table) {
            $table->id('log_id');

            $table->foreignId('room_id')
                ->constrained('rooms', 'room_id')
                ->cascadeOnDelete();

            $table->string('customer_name')->nullable();
            
            $table->enum('room_status', ['active', 'standby', 'disabled', 'extend']);
            $table->integer('duration')->nullable();

            $table->string('temp_id')->nullable()->unique();

            $table->timestamp('timestamp');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('access_logs');
    }
};