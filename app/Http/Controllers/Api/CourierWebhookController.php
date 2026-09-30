<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CourierWebhookController extends Controller
{
    public function steadfast(Request $request): JsonResponse
    {
        return response()->json(['status' => 'success', 'message' => 'Steadfast webhook received']);
    }

    public function pathao(Request $request): JsonResponse
    {
        return response()->json(['status' => 'success', 'message' => 'Pathao webhook received']);
    }

    public function carrybee(Request $request): JsonResponse
    {
        return response()->json(['status' => 'success', 'message' => 'Carrybee webhook received']);
    }
}
