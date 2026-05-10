<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpMqtt\Client\MqttClient;
use PhpMqtt\Client\ConnectionSettings;
use App\Models\Room;
use Illuminate\Support\Facades\Http;

class MQTTListen extends Command
{
    protected $signature = 'mqtt:listen';
    protected $description = 'Listen MQTT from ESP';

    public function handle()
    {
        $server   = '127.0.0.1';
        $port     = 1883;
        $clientId = 'laravel-listener';

        $mqtt = new MqttClient($server, $port, $clientId);

        $connectionSettings = (new ConnectionSettings)
            ->setKeepAliveInterval(60);

        $mqtt->connect($connectionSettings, false);

        $this->info("MQTT Listener started...");

        // SUBSCRIBE HANYA STATUS
        $mqtt->subscribe('room/+/status', function (string $topic, string $message) {

            try {
                $data = json_decode($message, true);

                if (!is_array($data) || !isset($data['room_id'])) return;

                $room = Room::with('iotDevice')
                    ->where('room_id', $data['room_id'])
                    ->first();

                if (!$room || !$room->iotDevice) return;

                $device = $room->iotDevice;

                // reset miss_count 
                $device->lock_status   = $data['lock'] ?? 'unknown';
                $device->door_status   = $data['door'] ?? 'unknown';
                $device->status_online = true;
                $device->last_seen     = now();
                $device->miss_count    = 0;

                $device->save();

               Http::withHeaders([
                    'X-GATEWAY-KEY' => 'karaoke-secret'
                ])->post(
                    'https://tugasakhirc14220241.up.railway.app/api/iot-sync',
                    [
                        'room_id' =>
                            $data['room_id'],

                        'door_status' =>
                            $data['door'] ?? 'unknown',

                        'lock_status' =>
                            $data['lock'] ?? 'unknown',

                        'status_online' => true,

                        'last_seen' => now(),
                    ]
                );

                echo "MQTT UPDATE DEVICE {$data['room_id']}" . PHP_EOL;

            } catch (\Throwable $e) {
                echo "ERROR: " . $e->getMessage() . PHP_EOL;
            }

        }, 0);

        while (true) {
            $mqtt->loop(false);
            usleep(100000);
        }
    }
}