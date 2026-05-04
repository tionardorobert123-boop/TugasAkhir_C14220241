<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\MQTTService;
use Illuminate\Support\Facades\DB;
use App\Models\Transaction;
use App\Models\RoomExtendLog;
use Carbon\Carbon;

class RoomController extends Controller
{
    // =============================
    // GET ROOMS + ACTIVE TRANSACTION
    // =============================
    public function index()
{
    $rooms = DB::table('rooms')

        // 🔥 JOIN TRANSACTION (TETAP)
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

        // 🔥 TAMBAHAN: JOIN IOT DEVICE
        ->leftJoin('iot_devices', 'rooms.iot_device_id', '=', 'iot_devices.device_id')

        ->select(
            'rooms.room_id',
            'rooms.room_name',
            'rooms.status',

            't.end_time',
            't.customer_name',

            // 🔥 TAMBAHAN INI
            'iot_devices.lock_status',
            'iot_devices.door_status',
            'iot_devices.status_online'
        )

        ->get();

    return response()->json($rooms);
}

    // =============================
    // OPEN ROOM
    // =============================
    public function open(Request $request, $id)
    {
        $duration = $request->duration;

        $start = now();
        $end = now()->addMinutes($duration);

        // cek jika masih ada transaksi aktif
        $existing = DB::table('transactions')
            ->where('room_id', $id)
            ->where('status', 'active')
            ->orderByDesc('transaction_id')
            ->first();

        if ($existing) {
            return response()->json([
                "message" => "Room masih aktif, tidak bisa buka lagi"
            ], 400);
        }

        // insert transaksi baru
        DB::table('transactions')->insert([
            'room_id' => $id,
            'customer_name' => $request->customer_name ?? 'Guest',
            'start_time' => $start,
            'end_time' => $end->format('Y-m-d H:i:s'),
            'duration' => $duration,
            'price_per_hour' => 100000,
            'total_price' => ($duration / 60) * 100000,
            'status' => 'active',
            'created_at' => $start,
        ]);

        // update room
        DB::table('rooms')
            ->where('room_id', $id)
            ->update(['status' => 'occupied']);

        // MQTT
        $mqtt = new MQTTService();
        $mqtt->publish("room/$id/control", json_encode([
            "room_id" => $id,
            "action" => "open",
            "duration" => $duration
            
        ]));

        return response()->json([
            "message" => "Room started",
            "end_time" => $end->format('Y-m-d H:i:s')
        ]);
    }

    // =============================
    // CLOSE ROOM
    // =============================
    public function close($id)
    {
        // ambil transaksi aktif terakhir
        $transaction = DB::table('transactions')
            ->where('room_id', $id)
            ->where('status', 'active')
            ->orderByDesc('transaction_id')
            ->first();

        if (!$transaction) {
            return response()->json([
                "message" => "Already closed"
            ]);
        }

        // update hanya 1 transaksi (tidak semua)
        DB::table('transactions')
            ->where('transaction_id', $transaction->transaction_id)
            ->update([
                'status' => 'finished'
            ]);

        // update room
        DB::table('rooms')
            ->where('room_id', $id)
            ->update(['status' => 'available']);

        // MQTT
        $mqtt = new MQTTService();
        $mqtt->publish("room/$id/control", json_encode([
            "room_id" => $id,
            "action" => "close"
        ]));

        return response()->json([
            "message" => "Room closed"
        ]);
    }

    //extend room function
    public function extend(Request $request, $id)
    {
        $minutes = $request->minutes;

        $transaction = Transaction::where('room_id', $id)
            ->where('status', 'active')
            ->latest()
            ->first();

        if (!$transaction) {
            return response()->json(['message' => 'No active transaction'], 404);
        }

        $oldEnd = $transaction->end_time;

        $newEnd = Carbon::parse($transaction->end_time)->addMinutes($minutes);

        // update transaksi
        $transaction->end_time = $newEnd;
        $transaction->duration += $minutes / 60;
        $transaction->total_price = $transaction->duration * $transaction->price_per_hour;
        $transaction->save();

        // log extend
        RoomExtendLog::create([
            'transaction_id' => $transaction->transaction_id,
            'added_minutes' => $minutes,
            'old_end_time' => $oldEnd,
            'new_end_time' => $newEnd,
        ]);

        return response()->json($transaction);
    }
}