<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class IotDeviceController extends Controller
{
    public function sync(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->all()
        ]);
    }
}