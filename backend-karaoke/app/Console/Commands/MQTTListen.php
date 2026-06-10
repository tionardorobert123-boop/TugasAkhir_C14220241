<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use PhpMqtt\Client\MqttClient;
use PhpMqtt\Client\ConnectionSettings;

use Illuminate\Support\Facades\Http;

class MQTTListen extends Command
{
    protected $signature =
        'mqtt:listen';

    protected $description =
        'Listen MQTT from ESP';

    public function handle(): void
    {
        //alamat broker mqtt
        $server = '127.0.0.1';
        $port = 1883;
        $clientId = 'laravel-listener';

        //mengirim ping ke broker untuk memastikan koneksi tetap aktif
        $connectionSettings = (new ConnectionSettings) ->setKeepAliveInterval(60);

        //reconnecting
        while (true) {
            try {
                $mqtt =
                    new MqttClient(
                        $server,
                        $port,
                        $clientId
                    );
                $mqtt->connect($connectionSettings,false);
                $this->info(
                    'MQTT Listener connected...'
                );
                //SUBSCRIBE
                $mqtt->subscribe(
                'room/+/status',
                function (
                    string $topic,
                    string $message
                ) {

                    //TART TIMER
                    $startProcess = microtime(true);

                    try {

                        //JSON
                        $data = json_decode(
                            $message,
                            true
                        );

                        if (
                            !is_array($data) ||

                            !isset(
                                $data['room_id']
                            )
                        ) {
                            return;
                        }

                        //DATA
                        $roomId =
                            $data['room_id'];

                        $espTimestamp =
                            $data['timestamp']
                            ?? 0;

                            //MQTT CALLBACK TIME
                        $callbackMs =
                            abs(
                                round(
                                    microtime(true) * 1000
                                    -
                                    $espTimestamp,
                                    2
                                )
                            );

                        $lock =
                            $data['lock']
                            ?? 'unknown';

                        $door =
                            $data['door']
                            ?? 'unknown';

                        //LOG
                        echo
                            "ROOM {$roomId}"
                            . " | LOCK: {$lock}"
                            . " | DOOR: {$door}"
                            . PHP_EOL;

                        //SYNC CLOUD
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
                                    'https://tugas-akhir-c14220241-robert.up.railway.app//api/iot-sync',
                                    [
                                        'room_id'=> $roomId,
                                        'door_status'=> $door,
                                        'lock_status'=> $lock,
                                        'status_online'=> true,
                                        'last_seen'=> now(),
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

                        // PROCESS TIME
                        $processMs =
                            round(
                                (microtime(true) - $startProcess)
                                * 1000,
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
                // MQTT LOOP
                while (true) {
                    try {
                        $mqtt->loop(
                            true
                        );
                    } catch (\Throwable $e) {

                        echo
                            "MQTT LOOP ERROR: ". $e->getMessage(). PHP_EOL;
                        break;
                    }
                }
            } catch (\Throwable $e) {
                echo
                    "MQTT CONNECT ERROR: ". $e->getMessage(). PHP_EOL;
            }
            echo
                "RECONNECTING MQTT..."
                . PHP_EOL;
            sleep(2);
        }
    }
}