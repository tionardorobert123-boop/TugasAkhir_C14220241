<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpMqtt\Client\MqttClient;
use PhpMqtt\Client\ConnectionSettings;
use Illuminate\Support\Facades\Http;

class MQTTListen extends Command
{
    protected $signature = 'mqtt:listen';

    protected $description = 'Listen MQTT from ESP';

    protected array $lastSeen = [];

    protected array $offlineSent = [];

    public function handle(): void
    {
        $server = '127.0.0.1';

        $port = 1883;

        $clientId = 'laravel-listener';

        $connectionSettings =
            (new ConnectionSettings)
                ->setKeepAliveInterval(60);

        while (true) {

            try {

                $mqtt = new MqttClient(
                    $server,
                    $port,
                    $clientId
                );

                $mqtt->connect(
                    $connectionSettings,
                    false
                );

                $this->info(
                    'MQTT Listener connected...'
                );

                $mqtt->subscribe(

                    'room/+/status',

                    function (
                        string $topic,
                        string $message
                    ) {

                        $startProcess =
                            microtime(true);

                        try {

                            $data =
                                json_decode(
                                    $message,
                                    true
                                );

                            if (
                                !is_array($data)
                                ||
                                !isset(
                                    $data['room_id']
                                )
                            ) {
                                return;
                            }

                            $roomId =
                                $data['room_id'];

                            // ================= HEARTBEAT
                            $this->lastSeen[$roomId] =
                                time();

                            $this->offlineSent[$roomId] =
                                false;

                            $lock =
                                $data['lock']
                                ?? 'unknown';

                            $door =
                                $data['door']
                                ?? 'unknown';

                            echo
                                "ROOM {$roomId}"
                                . " | LOCK: {$lock}"
                                . " | DOOR: {$door}"
                                . PHP_EOL;

                            // ================= CLOUD ONLINE
                            try {

                                $response =
                                    Http::withOptions([
                                        'verify' => false,
                                        'timeout' => 3,
                                    ])
                                    ->withHeaders([
                                        'X-GATEWAY-KEY'
                                        => 'karaoke-secret'
                                    ])
                                    ->post(
                                        'https://tugasakhirc14220241-production-11c4.up.railway.app/api/iot-sync',
                                        [
                                            'room_id' => $roomId,
                                            'door_status' => $door,
                                            'lock_status' => $lock,
                                            'status_online' => true,
                                            'last_seen' => now(),
                                        ]
                                    );

                                echo
                                    "CLOUD STATUS: "
                                    . $response->status()
                                    . PHP_EOL;

                            } catch (\Throwable $e) {

                                echo
                                    "CLOUD OFFLINE"
                                    . PHP_EOL;
                            }

                            $processMs =
                                round(
                                    (
                                        microtime(true)
                                        -
                                        $startProcess
                                    ) * 1000,
                                    2
                                );

                            echo
                                "LISTENER PROCESS: "
                                . $processMs
                                . " ms"
                                . PHP_EOL;

                        } catch (\Throwable $e) {

                            echo
                                "CALLBACK ERROR: "
                                . $e->getMessage()
                                . PHP_EOL;
                        }
                    },

                    0
                );

                // ================= MQTT LOOP
                while (true) {

                echo "LOOP RUNNING" . PHP_EOL;
                
                    try {

                        $mqtt->loop(false);

                        // ================= CHECK OFFLINE ROOM
                        foreach (
                            $this->lastSeen
                            as $roomId => $lastTime
                        ) {

                            if (
                                time() - $lastTime > 10
                                &&
                                !(
                                    $this->offlineSent[$roomId]
                                    ?? false
                                )
                            ) {

                                echo
                                    "ROOM {$roomId} OFFLINE"
                                    . PHP_EOL;

                                try {

                                    Http::withOptions([
                                        'verify' => false,
                                        'timeout' => 3,
                                    ])
                                    ->withHeaders([
                                        'X-GATEWAY-KEY'
                                        => 'karaoke-secret'
                                    ])
                                    ->post(
                                        'https://tugasakhirc14220241-production-11c4.up.railway.app/api/iot-sync',
                                        [
                                            'room_id' => $roomId,
                                            'status_online' => false,
                                            'last_seen' => now(),
                                        ]
                                    );

                                    $this->offlineSent[$roomId] =
                                        true;

                                    echo
                                        "ROOM {$roomId} SET OFFLINE"
                                        . PHP_EOL;

                                } catch (\Throwable $e) {

                                    echo
                                        "OFFLINE UPDATE FAILED: "
                                        . $e->getMessage()
                                        . PHP_EOL;
                                }
                            }
                            echo
                                "ROOM {$roomId} LAST SEEN: "
                                . (time() - $lastTime)
                                . " sec"
                                . PHP_EOL;
                        }

                    } catch (\Throwable $e) {

                        echo
                            "MQTT LOOP ERROR: "
                            . $e->getMessage()
                            . PHP_EOL;

                        break;
                    }
                }

            } catch (\Throwable $e) {

                echo
                    "MQTT CONNECT ERROR: "
                    . $e->getMessage()
                    . PHP_EOL;
            }

            echo
                "RECONNECTING MQTT..."
                . PHP_EOL;

            sleep(2);
        }
    }
}