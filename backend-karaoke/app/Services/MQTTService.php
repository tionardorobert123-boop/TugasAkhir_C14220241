<?php

namespace App\Services;

use PhpMqtt\Client\MqttClient;

class MqttService
{
    protected $mqtt;

    public function __construct()
    {
        $server = '127.0.0.1';
        $port = 1883;
        $clientId = 'laravel-client';

        $this->mqtt = new MqttClient($server, $port, $clientId);
        $this->mqtt->connect();
    }

    public function publish($topic, $message)
    {
        $this->mqtt->publish($topic, $message, 0, false);
        $this->mqtt->disconnect();
    }
}