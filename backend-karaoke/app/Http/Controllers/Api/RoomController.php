<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Room;
use App\Models\AccessLog;
use PhpMqtt\Client\MqttClient;
use PhpMqtt\Client\ConnectionSettings;
use Illuminate\Support\Facades\Log;

class RoomController extends Controller
{

    // =============================
    // GET ROOMS + ACTIVE TRANSACTION
    // =============================
    public function index()
    {
        $rooms = DB::table('rooms')

            ->leftJoinSub(
                DB::table('transactions')
                    ->where('status', 'active')
                    ->orderByDesc('transaction_id')
                    ->select('*'),
                't',
                'rooms.room_id',
                '=',
                't.room_id'
            )

            ->leftJoin('iot_devices', 'rooms.iot_device_id', '=', 'iot_devices.device_id')

            ->select(
                'rooms.room_id',
                'rooms.room_name',
                'rooms.status',
                'rooms.room_type',
                'rooms.price_per_hour',

                't.end_time',
                't.customer_name',
                't.duration',
                't.total_price',

                'iot_devices.lock_status',
                'iot_devices.door_status',
                'iot_devices.status_online'
            )

            ->get();

        return response()->json($rooms);
    }

    // =============================
    // OPEN ROOM (START)
    // =============================
    public function open(Request $request, $id)
    {
        $minutes = (int) $request->duration;

        $startApi = microtime(true);

        if ($minutes <= 0) {
            return response()->json([
                "message" => "Durasi tidak valid"
            ], 400);
        }

        // 🔥 wajib kelipatan 60 menit
        if ($minutes % 60 !== 0) {
            return response()->json([
                "message" => "Durasi harus kelipatan 60 menit"
            ], 400);
        }

        $room = DB::table('rooms')->where('room_id', $id)->first();

        if (!$room) {
            return response()->json([
                "message" => "Room tidak ditemukan"
            ], 404);
        }

        // cek transaksi aktif
        $existing = DB::table('transactions')
            ->where('room_id', $id)
            ->where('status', 'active')
            ->exists();

        if ($existing) {
            return response()->json([
                "message" => "Room masih aktif"
            ], 400);
        }

        if ($request->filled('temp_id')) {

            $exists = DB::table('transactions')
                ->where(
                    'temp_id',
                    $request->temp_id
                )->exists();

            if ($exists) {

                return response()->json([
                    'message' => 'Already synced'
                ]);
            }
        }
        
       $start = $request->filled('start_time')
        ? Carbon::parse($request->start_time)
        : now();

        $hours = $minutes / 60;

        $end = $request->filled('end_time')

            ? \Carbon\Carbon::parse(
                $request->end_time
            )

            : $start->copy()->addMinutes($minutes);

        DB::table('transactions')->insert([
        'temp_id' => $request->temp_id,
        'room_id' => $id,
        'customer_name' =>
            $request->customer_name ?? 'Guest',
        'start_time' => $start,
        'end_time' => $end,
        'duration' => $hours,
        'price_per_hour' =>
            $room->price_per_hour,
        'total_price' =>
            $hours * $room->price_per_hour,
        'status' => 'active',
        'created_at' => $start,
        'updated_at' => $start
    ]);

        DB::table('rooms')
            ->where('room_id', $id)
            ->update(['status' => 'occupied']);

        // LOG ACCESS
        AccessLog::create([
            'temp_id' => $request->temp_id,
            'room_id' => $id,
            'customer_name' =>
                $request->customer_name ?? 'Guest',
            'room_status' => 'active',
            'duration' => (int) $hours,
            'timestamp' => $start,
        ]);

        $apiMs = round(
            (
                microtime(true)
                - $startApi
            ) * 1000,
            2
        );

                Log::info(
            "API PROCESS: "
            . $apiMs
            . " ms"
        );

        return response()->json([
            "message" => "Room started",
            "end_time" => $end,
            "api_ms" => $apiMs
        ]);
    }

    // =============================
    // CLOSE ROOM (AUTO / FORCE)
    // =============================
    public function close(Request $request, $id)
    {
        $startApi = microtime(true);

        $transaction = DB::table('transactions')
            ->where('room_id', $id)
            ->where('status', 'active')
            ->orderByDesc('transaction_id')
            ->first();

        if (!$transaction) {
            return response()->json([
                "message" => "Room already closed"
            ]);
        }

        if ($request->filled('temp_id')) {

            $exists = AccessLog::where(
                'temp_id',
                $request->temp_id
            )->exists();

            if ($exists) {

                return response()->json([
                    'message' => 'Already synced'
                ]);
            }
        }

        DB::table('transactions')
            ->where('transaction_id', $transaction->transaction_id)
            ->update([
                'status' => 'finished',
                'updated_at' => now()
            ]);

        DB::table('rooms')
            ->where('room_id', $id)
            ->update(['status' => 'available']);

        // LOG ACCESS
        $totalDuration = Carbon::parse($transaction->start_time)->diffInMinutes(now());
        AccessLog::create([
            'temp_id' => $request->temp_id,
            'room_id' => $id,
            'customer_name' =>
                $transaction->customer_name,
            'room_status' => 'standby',
            'duration' => $totalDuration,
            'timestamp' => now(),
        ]);

        $apiMs = round(
            (
                microtime(true)
                - $startApi
            ) * 1000,
            2
        );

                Log::info(
            "API PROCESS: "
            . $apiMs
            . " ms"
        );

        return response()->json([
            "message" => "Room closed",
            "api_ms" => $apiMs
        ]);
    }

    public function updateSetting(Request $request, $id)
    {
        $request->validate([
            'price' => 'nullable|numeric',
            'mode' => 'nullable|in:single,all_type',
            'room_type_filter' => 'nullable|string',
            'room_type' => 'nullable|string',
            'status' => 'nullable|in:available,disabled'
        ]);

        $room = Room::findOrFail($id);

        if ($request->filled('price')) {
            if ($request->mode === 'all_type' && $request->room_type_filter) {
                Room::where('room_type', $request->room_type_filter)
                    ->update(['price_per_hour' => $request->price]);
            } else {
                $room->update(['price_per_hour' => $request->price]);
            }
        }

        if ($request->filled('room_type')) {
            $room->update(['room_type' => $request->room_type]);
        }

        if ($request->filled('status')) {
            $room->update(['status' => $request->status]);
        }

        return response()->json(['message' => 'Setting room berhasil diupdate']);
    }

            public function syncAccessLog(
                Request $request
            ) {

               AccessLog::updateOrCreate(
                [
                    'temp_id' => $request->temp_id
                ],
                [
                    'room_id' => $request->room_id,
                    'customer_name' => $request->customer_name,
                    'room_status' => $request->room_status,
                    'duration' => $request->duration,
                    'timestamp' => $request->timestamp,
                ]
            );

                return response()->json([
                    'success' => true
                ]);
            }
}