<?php

use Illuminate\Support\Facades\Route;

use App\Models\AccessLog;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\AccessLogController;
use App\Http\Controllers\Api\RoomExtendController;
use App\Http\Controllers\Api\IotDeviceController;
use App\Http\Controllers\Api\LocalRoomController;

// ================= PUBLIC =================

// HEALTH CHECK
Route::get('/ping', function () {
    return response()->json([
        'status' => 'ok'
    ]);
});

// LOGIN
Route::post(
    '/login',
    [AuthController::class, 'login']
);

// IOT SYNC
Route::post(
    '/iot-sync',
    [IotDeviceController::class, 'sync']
);

    // LOCAL OFFLINE MQTT ONLY
        Route::prefix('local')
            ->group(function () {

            Route::post(
                '/rooms/{id}/open',
                [LocalRoomController::class, 'open']
            );

            Route::post(
                '/rooms/{id}/close',
                [LocalRoomController::class, 'close']
            );

            Route::post(
                '/rooms/{id}/extend',
                [LocalRoomController::class, 'extend']
            );

            Route::post(
                '/rooms/{id}/resync',
                [LocalRoomController::class, 'resync']
            );

             Route::post(
                '/rooms/{id}/emergency-open',
                [LocalRoomController::class, 'emergencyOpen']
            );

             Route::post(
                '/rooms/{id}/emergency-close',
                [LocalRoomController::class, 'emergencyClose']
            );
        });

// QUICK LOGS
Route::get('/logs', function () {
    return AccessLog::latest()
        ->take(20)
        ->get();
});

// PROTECTED API
Route::middleware(['auth:sanctum'])
    ->group(function () {

     Route::get(
        '/iot-devices',
        [IoTDeviceController::class, 'index']
    );
    
    // ROOMS
    Route::get(
        '/rooms',
        [RoomController::class, 'index']
    );

    // TRANSACTIONS
    // kasir
    Route::get(
        '/transactions',
        [TransactionController::class, 'index']
    );

    // owner
    Route::get(
        '/transactions/by-date',
        [TransactionController::class, 'byDate']
    );

    // KASIR (ONLINE / CLOUD)
    Route::middleware('role:kasir')
        ->group(function () {

        // CLOUD BUSINESS LOGIC
        Route::post(
            '/rooms/{id}/open',
            [RoomController::class, 'open']
        );

        Route::post(
            '/rooms/{id}/close',
            [RoomController::class, 'close']
        );

        Route::post(
            '/rooms/{id}/extend',
            [RoomExtendController::class, 'extend']
        );

        Route::post(
            '/sync/access-log',
            [CloudSyncController::class, 'syncAccessLog']
        );

    });

    // OWNER
    Route::middleware('role:owner')
        ->group(function () {

        Route::post(
            '/rooms/{id}/update-setting',
            [RoomController::class, 'updateSetting']
        );

        Route::get(
            '/access-logs',
            [AccessLogController::class, 'index']
        );
    });
});