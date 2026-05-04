<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id('transaction_id');

            $table->foreignId('room_id')
                  ->constrained('rooms', 'room_id')
                  ->cascadeOnDelete();

            $table->string('customer_name')->nullable();

            $table->timestamp('start_time');
            $table->timestamp('end_time')->nullable();

            $table->integer('duration')->nullable();
            $table->integer('price_per_hour')->nullable();
            $table->integer('total_price')->nullable();

            $table->enum('status', ['active', 'finished'])->default('active');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};