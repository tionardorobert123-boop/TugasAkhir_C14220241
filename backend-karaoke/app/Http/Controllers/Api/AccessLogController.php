<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccessLog;
use Illuminate\Http\Request;

class AccessLogController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->query('date');

        $query = AccessLog::with('room')->orderByDesc('timestamp');

        if ($date) {
            $query->whereDate('timestamp', $date);
        }

        $logs = $query->get()->map(function ($log) {
            return [
                'log_id' => $log->log_id,
                'room_id' => $log->room_id,
                'room_name' => $log->room?->room_name,
                'customer_name' => $log->customer_name,
                'room_status' => $log->room_status,
                'timestamp' => $log->timestamp,
                'duration' => $log->duration,
            ];
        });

        return response()->json($logs);
    }

}
