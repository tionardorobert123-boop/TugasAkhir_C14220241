<?php

use App\Http\Controllers\Api\RoomController;
use Illuminate\Support\Facades\Route;
use App\Models\AccessLog;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\AccessLogController;
use App\Http\Controllers\Api\RoomExtendController;

Route::get('/logs', function () {
    return AccessLog::latest()->take(20)->get();
});

// ================= AUTH =================
Route::post('/login', [AuthController::class, 'login']);

// ================= PROTECTED =================
Route::middleware(['auth:sanctum'])->group(function () {

    // ================= ROOMS =================
    Route::get('/rooms', [RoomController::class, 'index']);

    // ================= TRANSACTIONS =================

    // kasir → transaksi hari ini
    Route::get(
        '/transactions',
        [TransactionController::class, 'index']
    );

    // owner → filter tanggal
    Route::get(
        '/transactions/by-date',
        [TransactionController::class, 'byDate']
    );

    // ================= KASIR =================
    Route::middleware('role:kasir')->group(function () {

        // OPEN ROOM
        Route::post(
            '/rooms/{id}/open',
            [RoomController::class, 'open']
        );

        // CLOSE ROOM
        Route::post(
            '/rooms/{id}/close',
            [RoomController::class, 'close']
        );

        // EXTEND ROOM
        Route::post(
            '/rooms/{id}/extend',
            [RoomExtendController::class, 'extend']
        );
    });

    // ================= OWNER =================
    Route::middleware('role:owner')->group(function () {

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