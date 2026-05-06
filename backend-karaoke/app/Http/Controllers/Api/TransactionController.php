<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    // ================= TODAY (KASIR)
    public function index()
    {
        $today = now()->toDateString();

        $transactions = Transaction::whereDate('created_at', $today)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($transactions);
    }

    // ================= FILTER OWNER
    public function byDate(Request $request)
    {
        $date = $request->query('date');

        if (!$date) {
            return response()->json([
                'message' => 'Tanggal wajib diisi'
            ], 400);
        }

        $transactions = Transaction::whereDate('created_at', $date)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($transactions);
    }
}