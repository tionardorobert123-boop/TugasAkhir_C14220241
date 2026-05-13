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

        // UNIQUE CLIENT ID
        $clientId =
            'laravel-client-'
            . uniqid();

        $this->mqtt =
            new MqttClient(
                $server,
                $port,
                $clientId
            );

        $this->mqtt->connect();
    }

    public function publish(
        string $topic,
        string $message
    ): void {

        Log::info('MQTT PUBLISH CALLED', [
            'topic' => $topic,
            'message' => $message
        ]);

        try {

            $this->mqtt->publish(
                $topic,
                $message,
                0,
                false
            );

            Log::info('MQTT PUBLISH SUCCESS', [
                'topic' => $topic
            ]);

            $this->mqtt->disconnect();

            Log::info('MQTT DISCONNECT SUCCESS');

        } catch (\Exception $e) {

            Log::error('MQTT PUBLISH FAILED', [
                'error' => $e->getMessage(),
                'topic' => $topic
            ]);
        }
    }
}