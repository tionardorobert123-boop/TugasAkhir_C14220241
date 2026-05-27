<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\MQTTService;

class LocalRoomController extends Controller
{


//cek timer backend ke mqtt
private function publishMQTT($roomId, $action)
{
    $server = '127.0.0.1';
    $port = 1883;

    $clientId =
        'laravel-publisher-'
        . uniqid();

    $mqtt =
        new MqttClient(
            $server,
            $port,
            $clientId
        );

    $connectionSettings =
        (new ConnectionSettings)
            ->setKeepAliveInterval(60);

    $mqtt->connect(
        $connectionSettings,
        false
    );

    // ================= TIMER START
    $startMqtt =
        microtime(true);

    $mqtt->publish(
        "room/{$roomId}/control",

        json_encode([
            'action' => $action
        ]),

        0
    );

    // ================= TIMER END
    $mqttMs =
        round(
            (
                microtime(true)
                - $startMqtt
            ) * 1000,
            2
        );

    Log::info(
        "MQTT PUBLISH: "
        . $mqttMs
        . " ms"
    );

    $mqtt->disconnect();

    return $mqttMs;
}
    // =============================
    // OPEN ROOM (LOCAL MQTT ONLY)
    // =============================
    public function open(
        Request $request,
        $id
    ) {

        try {

            $minutes =
                (int) $request->duration;

            $mqtt = new MQTTService();

             // ================= TIMER START
            $startMqtt =
                microtime(true);

            $mqtt->publish(
                "room/$id/control",
                json_encode([
                    "room_id" => (int) $id,
                    "action" => "open",
                    "duration" => $minutes
                ])
            );

             // ================= TIMER END
                $mqttMs =
                    round(
                        (
                            microtime(true)
                            - $startMqtt
                        ) * 1000,
                        2
                    );

                Log::info(
                    "MQTT PUBLISH: "
                    . $mqttMs
                    . " ms"
                );


            return response()->json([
                "success" => true,
                "mode" => "offline-local",
                "message" =>
                    "ROOM OPEN SENT"
            ]);

        } catch (\Throwable $e) {

            Log::error(
                'LOCAL OPEN MQTT ERROR: '
                . $e->getMessage()
            );

            return response()->json([
                "success" => false,
                "message" =>
                    "MQTT OPEN FAILED"
            ], 500);
        }
    }

    // =============================
    // CLOSE ROOM (LOCAL MQTT ONLY)
    // =============================
    public function close($id)
    {

        try {

            $mqtt = new MQTTService();

             // ================= TIMER START
            $startMqtt =
                microtime(true);

            $mqtt->publish(
                "room/$id/control",
                json_encode([
                    "room_id" => (int) $id,
                    "action" => "close"
                ])
            );

             // ================= TIMER END
                $mqttMs =
                    round(
                        (
                            microtime(true)
                            - $startMqtt
                        ) * 1000,
                        2
                    );

                Log::info(
                    "MQTT PUBLISH: "
                    . $mqttMs
                    . " ms"
                );


            return response()->json([
                "success" => true,
                "mode" => "offline-local",
                "message" =>
                    "ROOM CLOSE SENT"
            ]);

        } catch (\Throwable $e) {

            Log::error(
                'LOCAL CLOSE MQTT ERROR: '
                . $e->getMessage()
            );

            return response()->json([
                "success" => false,
                "message" =>
                    "MQTT CLOSE FAILED"
            ], 500);
        }
    }

    // =============================
    // EXTEND ROOM (LOCAL MQTT ONLY)
    // =============================
    public function extend(
        Request $request,
        $id
    ) {

        try {

            $minutes =
                (int) $request->minutes;

            $mqtt = new MQTTService();

            $mqtt->publish(
                "room/$id/control",
                json_encode([
                    "room_id" => (int) $id,
                    "action" => "extend",
                    "duration" => $minutes
                ])
            );

            return response()->json([
                "success" => true,
                "mode" => "offline-local",
                "message" =>
                    "ROOM EXTEND SENT"
            ]);

        } catch (\Throwable $e) {

            Log::error(
                'LOCAL EXTEND MQTT ERROR: '
                . $e->getMessage()
            );

            return response()->json([
                "success" => false,
                "message" =>
                    "MQTT EXTEND FAILED"
            ], 500);
        }
    }

    //resync iot ketika terjadi mati lampu/power off
        public function resync($id)
    {
        try {

            $mqtt = new MQTTService();

            $mqtt->publish(
                "room/$id/control",
                json_encode([
                    "room_id" => (int) $id,
                    "action" => "open"
                ])
            );

            return response()->json([
                'success' => true,
                'message' => 'ROOM RESYNC SENT'
            ]);

        } catch (\Throwable $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}