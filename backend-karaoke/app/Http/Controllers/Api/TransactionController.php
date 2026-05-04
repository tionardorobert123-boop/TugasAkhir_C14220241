<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    // ================= GET ALL (KASIR: HARI INI) =================
    public function index()
    {
        $today = now()->toDateString(); // YYYY-MM-DD

        $transactions = Transaction::whereDate('created_at', $today)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($transactions);
    }

    // ================= OWNER (FILTER TANGGAL) =================
    public function byDate(Request $request)
    {
        $date = $request->query('date'); // ?date=2026-04-26

        $transactions = Transaction::whereDate('created_at', $date)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($transactions);
    }
}