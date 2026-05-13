<?php

namespace App\Services;

use PhpMqtt\Client\MqttClient;
use Illuminate\Support\Facades\Log;

class MQTTService
{
    protected MqttClient $mqtt;

    public function __construct()
    {
        try {

            Log::info('MQTT CONNECT START');

            $server = '127.0.0.1';

            $port = 1883;

            $clientId =
                'laravel-client-' . uniqid();

            $this->mqtt = new MqttClient(
                $server,
                $port,
                $clientId
            );

            $this->mqtt->connect();

            Log::info('MQTT CONNECT SUCCESS');

        } catch (\Throwable $e) {

            Log::error(
                'MQTT CONNECT FAILED',
                [
                    'error' => $e->getMessage()
                ]
            );

            throw $e;
        }
    }

    public function publish(
        string $topic,
        string $message
    ): void {

        try {

            Log::info(
                'MQTT PUBLISH START',
                [
                    'topic' => $topic,
                    'message' => $message
                ]
            );

            $this->mqtt->publish(
                $topic,
                $message,
                0,
                false
            );

            Log::info('MQTT PUBLISH SUCCESS');

            $this->mqtt->disconnect();

            Log::info('MQTT DISCONNECT SUCCESS');

        } catch (\Throwable $e) {

            Log::error(
                'MQTT PUBLISH FAILED',
                [
                    'error' => $e->getMessage()
                ]
            );

            throw $e;
        }
    }
}