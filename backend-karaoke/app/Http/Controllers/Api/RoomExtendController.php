<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Models\RoomExtendLog;
use Carbon\Carbon;
use App\Models\AccessLog;
class RoomExtendController extends Controller
{

// =============================
    // EXTEND ROOM (TAMBAH JAM)
    // =============================
    public function extend(Request $request, $id)
    {
        $minutes = (int) $request->minutes;

        if ($minutes <= 0) {
            return response()->json([
                'message' => 'Durasi tidak valid'
            ], 400);
        }

        // kelipatan 60 menit
        if ($minutes % 60 !== 0) {
            return response()->json([
                'message' => 'Extend harus kelipatan 60 menit'
            ], 400);
        }

        $transaction = Transaction::where('room_id', $id)
            ->where('status', 'active')
            ->latest()
            ->first();

        if (!$transaction) {
            return response()->json([
                'message' => 'No active transaction'
            ], 404);
        }

        $exists = RoomExtendLog::where(
            'temp_id',
            $request->temp_id
        )->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Already synced'
            ]);
        }

        $oldEnd = $transaction->end_time;

        $newEnd = Carbon::parse($transaction->end_time)
            ->addMinutes($minutes);

        // UPDATE TRANSACTION
        $transaction->end_time = $newEnd;

        $transaction->duration += $minutes; // tambah MENIT

        $transaction->total_price =
            ($transaction->duration / 60)
            * $transaction->price_per_hour;

        $transaction->save();

        //LOG
        RoomExtendLog::create([

            'temp_id' => $request->temp_id,

            'transaction_id' => $transaction->transaction_id,

            'added_minutes' => $minutes,

            'old_end_time' => $oldEnd,

            'new_end_time' => $newEnd,
        ]);

        // LOG ACCESS
        AccessLog::create([
            'room_id' => $id,
            'customer_name' => $transaction->customer_name,
            'room_status' => 'extend',
            'duration' => $minutes,
            'timestamp' =>
                $request->action_time
                    ? Carbon::parse(
                        $request->action_time
                    )
                    : now(),
        ]);

        return response()->json([
            "message" => "Room extended",
            "new_end_time" => $newEnd,
            "total_price" => $transaction->total_price
        ]);
    }


}