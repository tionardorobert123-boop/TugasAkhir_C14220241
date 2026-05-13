<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\MQTTService;

class LocalRoomController extends Controller
{
    protected MQTTService $mqtt;

    public function __construct(
        MQTTService $mqtt
    ) {
        $this->mqtt = $mqtt;
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

            Log::info(
                'LOCAL MQTT OPEN HIT',
                [
                    'room_id' => $id,
                    'duration' => $minutes
                ]
            );

            $this->mqtt->publish(

                "room/$id/control",

                json_encode([
                    "room_id" => (int) $id,
                    "action" => "open",
                    "duration" => $minutes
                ])
            );

            return response()->json([
                "success" => true,
                "mode" => "offline-local",
                "message" =>
                    "ROOM OPEN SENT"
            ]);

        } catch (\Throwable $e) {

            Log::error(
                'LOCAL OPEN MQTT ERROR',
                [
                    'room_id' => $id,
                    'error' => $e->getMessage()
                ]
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

            Log::info(
                'LOCAL MQTT CLOSE HIT',
                [
                    'room_id' => $id
                ]
            );

            $this->mqtt->publish(

                "room/$id/control",

                json_encode([
                    "room_id" => (int) $id,
                    "action" => "close"
                ])
            );

            return response()->json([
                "success" => true,
                "mode" => "offline-local",
                "message" =>
                    "ROOM CLOSE SENT"
            ]);

        } catch (\Throwable $e) {

            Log::error(
                'LOCAL CLOSE MQTT ERROR',
                [
                    'room_id' => $id,
                    'error' => $e->getMessage()
                ]
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

            Log::info(
                'LOCAL MQTT EXTEND HIT',
                [
                    'room_id' => $id,
                    'minutes' => $minutes
                ]
            );

            $this->mqtt->publish(

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
                'LOCAL EXTEND MQTT ERROR',
                [
                    'room_id' => $id,
                    'error' => $e->getMessage()
                ]
            );

            return response()->json([
                "success" => false,
                "message" =>
                    "MQTT EXTEND FAILED"
            ], 500);
        }
    }
}