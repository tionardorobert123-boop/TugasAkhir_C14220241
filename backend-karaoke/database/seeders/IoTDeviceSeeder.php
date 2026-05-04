<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class IotDeviceSeeder extends Seeder
{
    public function run(): void
    {
        for ($i = 1; $i <= 12; $i++) {
            DB::table('iot_devices')->insert([
                'device_id' => $i,
                'device_name' => 'Device '.$i,
                'status_online' => false,
                'lock_status' => 'unknown',
                'door_status' => 'unknown',
                'last_seen' => null,
                'miss_count' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}