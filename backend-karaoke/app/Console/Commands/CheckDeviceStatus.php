<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\IotDevice;
use Illuminate\Support\Facades\Http;

class CheckDeviceStatus extends Command
{
    protected $signature = 'iot:check-status';

    public function handle()
    {
        $this->info("IOT Status Checker started...");

        $timeout = 8;   // detik
        $maxMiss = 3;

        while (true) {

            $devices = IotDevice::all();

            foreach ($devices as $device) {

                if (!$device->last_seen) {
                    if ($device->status_online !== false) {
                        $device->status_online = false;
                        $device->miss_count = 0;
                        $device->save();
                    }
                    continue;
                }

                $diff = $device->last_seen->diffInSeconds(now());

                echo "Device {$device->device_id} | diff={$diff} | miss={$device->miss_count}" . PHP_EOL;

                // ================= CORE LOGIC =================
                if ($diff > $timeout) {

                    $device->miss_count++;

                    if ($device->miss_count >= $maxMiss) {

                        if ($device->status_online !== false) {

                            $device->status_online = false;

                            Http::withHeaders([
                                'X-GATEWAY-KEY' => 'karaoke-secret'
                            ])->post(
                                'https://tugasakhirc14220241.up.railway.app/api/iot-sync',
                                [
                                    'room_id' =>
                                        $device->room_id,

                                    'door_status' =>
                                        $device->door_status,

                                    'lock_status' =>
                                        $device->lock_status,

                                    'status_online' => false,

                                    'last_seen' =>
                                        $device->last_seen,
                                ]
                            );
                        }
                    }

                    $device->save();

                } else {

                    if ($device->status_online !== true || $device->miss_count !== 0) {
                        $device->status_online = true;
                        $device->miss_count = 0;
                        $device->save();
                    }
                }
            }

            sleep(5);
        }
    }
}