<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\IoTDevice;
use Illuminate\Support\Facades\DB;

class IotDeviceController extends Controller
{
    public function sync(Request $request)
    {
        try {

            $device = IoTDevice::where(
                'device_id',
                $request->room_id
            )->first();

            if (!$device) {

                return response()->json([
                    'message' => 'Device not found'
                ], 404);
            }

            $device->door_status =
                $request->door_status;

            $device->lock_status =
                $request->lock_status;

            $device->status_online =
                $request->status_online;

            $device->last_seen =
                $request->last_seen;

            $device->miss_count = 0;

            $device->save();

            return response()->json([
                'message' => 'IoT synced'
            ]);

        } catch (\Throwable $e) {

            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

  public function checkOffline()
{
    $devices = IoTDevice::all();

    foreach ($devices as $device) {

        if (!$device->last_seen) {
            continue;
        }

        $seconds =
            \Carbon\Carbon::parse(
                $device->last_seen
            )->diffInSeconds(now());

        echo "ROOM {$device->device_id} = {$seconds}\n";

        if ($seconds > 10) {

            $device->update([
                'status_online' => false
            ]);
        }
    }

    return response()->json([
        'message' => 'offline check completed'
    ]);
}

    public function index()
{
    return DB::table('iot_devices')->get();
}
}