<?php

use App\Http\Controllers\Api\RoomController;
use Illuminate\Support\Facades\Route;
use App\Models\AccessLog;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\AccessLogController;

Route::get('/logs', function () {
    return AccessLog::latest()->take(20)->get();
});

//autentikasi login
Route::post('/login', [AuthController::class, 'login']);

//PROTECTED ROUTES LOGIN KE DASHBOARD
Route::middleware(['auth:sanctum'])->group(function () {

    // semua bisa akses
    Route::get('/rooms', [RoomController::class, 'index']);
    // ================= TRANSACTIONS =================
    // kasir → hari ini saja
    Route::get('/transactions', [TransactionController::class, 'index']);
    // owner → filter tanggal
    Route::get('/transactions/by-date', [TransactionController::class, 'byDate']);
    // hanya kasir
    Route::middleware('role:kasir')->group(function () {
        Route::post('/rooms/{id}/open', [RoomController::class, 'open']);
        Route::post('/rooms/{id}/close', [RoomController::class, 'close']);
        Route::post('/rooms/{id}/extend', [RoomController::class, 'extend']);
    });
    // hanya owner
    Route::middleware('role:owner')->group(function () {
        Route::post('/rooms/{id}/update-setting', [RoomController::class, 'updateSetting']);
        Route::get('/access-logs', [AccessLogController::class, 'index']);
    });

});