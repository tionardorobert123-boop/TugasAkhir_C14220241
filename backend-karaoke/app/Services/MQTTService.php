<?php

namespace App\Services;

use PhpMqtt\Client\MqttClient;
use Illuminate\Support\Facades\Log;

class MQTTService
{
    protected MqttClient $mqtt;

    public function __construct()
    {
        $server = '127.0.0.1';

        $port = 1883;

        $clientId =
            'laravel-client-'
            . uniqid();

        Log::info('MQTT CONNECT START', [
            'server' => $server,
            'port' => $port,
            'client_id' => $clientId
        ]);

        try {

            $this->mqtt =
                new MqttClient(
                    $server,
                    $port,
                    $clientId
                );

            $connectStart =
                microtime(true);

            $this->mqtt->connect();

            $connectTime =
                (microtime(true) - $connectStart) * 1000;

            Log::info(
                'MQTT CONNECT SUCCESS',
                [
                    'time_ms' =>
                        round($connectTime, 2)
                ]
            );

        } catch (\Exception $e) {

            Log::error(
                'MQTT CONNECT FAILED',
                [
                    'error' =>
                        $e->getMessage()
                ]
            );
        }
    }

    public function publish(
        string $topic,
        string $message
    ): void {

        Log::info(
            'MQTT PUBLISH CALLED',
            [
                'topic' => $topic,
                'message' => $message
            ]
        );

        try {

            $publishStart =
                microtime(true);

            $this->mqtt->publish(
                $topic,
                $message,
                0,
                false
            );

            $publishTime =
                (microtime(true) - $publishStart) * 1000;

            Log::info(
                'MQTT PUBLISH SUCCESS',
                [
                    'topic' => $topic,
                    'time_ms' =>
                        round($publishTime, 2)
                ]
            );

            // ================= IMPORTANT
            // JANGAN DISCONNECT DULU
            // =================

            // $this->mqtt->disconnect();

            // Log::info(
            //     'MQTT DISCONNECT SUCCESS'
            // );

        } catch (\Exception $e) {

            Log::error(
                'MQTT PUBLISH FAILED',
                [
                    'error' =>
                        $e->getMessage(),

                    'topic' => $topic
                ]
            );
        }
    }
}