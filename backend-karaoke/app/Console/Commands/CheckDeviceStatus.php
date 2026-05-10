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
        $this->info(
            "IOT Status Checker started..."
        );

        $timeout = 8;
        $maxMiss = 3;

        while (true) {

            try {

                $devices = IotDevice::all();

                foreach ($devices as $device) {

                    try {

                        // =================
                        // DEVICE BELUM ADA
                        // =================

                        if (!$device->last_seen) {

                            if (
                                $device->status_online
                                !== false
                            ) {

                                $device->status_online =
                                    false;

                                $device->miss_count =
                                    0;

                                $device->save();
                            }

                            continue;
                        }

                        $diff =
                            $device->last_seen
                            ->diffInSeconds(now());

                        echo "Device {$device->device_id}"
                            . " | diff={$diff}"
                            . " | miss={$device->miss_count}"
                            . PHP_EOL;

                        // =================
                        // OFFLINE DETECT
                        // =================

                        if ($diff > $timeout) {

                            $device->miss_count++;

                            if (
                                $device->miss_count
                                >= $maxMiss
                            ) {

                                // =================
                                // STATUS OFFLINE
                                // =================

                                if (
                                    $device->status_online
                                    !== false
                                ) {

                                    $device->status_online =
                                        false;

                                    echo "DEVICE OFFLINE "
                                        . $device->device_id
                                        . PHP_EOL;

                                    // =================
                                    // SYNC CLOUD
                                    // =================

                                    try {

                                        $response =
                                            Http::withOptions([
                                                'verify' => false,
                                                'timeout' => 5,
                                            ])
                                            ->withHeaders([
                                                'X-GATEWAY-KEY'
                                                =>
                                                'karaoke-secret'
                                            ])
                                            ->post(
                                                'https://tugasakhirc14220241.up.railway.app/api/iot-sync',
                                                [
                                                    'room_id' =>
                                                        $device->device_id,

                                                    'door_status' =>
                                                        $device->door_status,

                                                    'lock_status' =>
                                                        $device->lock_status,

                                                    'status_online' =>
                                                        false,

                                                    'last_seen' =>
                                                        $device->last_seen,
                                                ]
                                            );

                                        echo "CLOUD OFFLINE SYNC "
                                            . $response->status()
                                            . PHP_EOL;

                                    } catch (\Throwable $e) {

                                        echo "CLOUD ERROR: "
                                            . $e->getMessage()
                                            . PHP_EOL;
                                    }
                                }
                            }

                            $device->save();

                        } else {

                            // =================
                            // DEVICE ONLINE
                            // =================

                            if (
                                $device->status_online
                                !== true ||

                                $device->miss_count
                                !== 0
                            ) {

                                $device->status_online =
                                    true;

                                $device->miss_count =
                                    0;

                                $device->save();
                            }
                        }

                    } catch (\Throwable $e) {

                        echo "DEVICE LOOP ERROR: "
                            . $e->getMessage()
                            . PHP_EOL;
                    }
                }

            } catch (\Throwable $e) {

                echo "MAIN LOOP ERROR: "
                    . $e->getMessage()
                    . PHP_EOL;
            }

            sleep(5);
        }
    }
}