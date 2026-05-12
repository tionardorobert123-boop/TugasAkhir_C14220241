<?php

namespace App\Services;

use PhpMqtt\Client\MqttClient;

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

        $this->mqtt->publish(
            $topic,
            $message,
            0,
            false
        );

        $this->mqtt->disconnect();
    }
}