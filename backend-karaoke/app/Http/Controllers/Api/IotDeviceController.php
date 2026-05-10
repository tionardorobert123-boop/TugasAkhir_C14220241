<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\IoTDevice;

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
                now();

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
}