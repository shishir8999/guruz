<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes for Webhooks and Integrations
|--------------------------------------------------------------------------
*/

Route::prefix('public')->group(function () {
    // Payment Gateway Webhooks
    Route::post('/bkash/init', [\App\Http\Controllers\Api\PaymentController::class, 'bkashInit']);
    Route::post('/bkash/callback', [\App\Http\Controllers\Api\PaymentController::class, 'bkashCallback']);
    Route::post('/nagad/init', [\App\Http\Controllers\Api\PaymentController::class, 'nagadInit']);
    Route::post('/nagad/callback', [\App\Http\Controllers\Api\PaymentController::class, 'nagadCallback']);
    Route::post('/sslcommerz/init', [\App\Http\Controllers\Api\PaymentController::class, 'sslInit']);
    Route::post('/sslcommerz/success', [\App\Http\Controllers\Api\PaymentController::class, 'sslSuccess']);
    Route::post('/sslcommerz/fail', [\App\Http\Controllers\Api\PaymentController::class, 'sslFail']);
    Route::post('/sslcommerz/cancel', [\App\Http\Controllers\Api\PaymentController::class, 'sslCancel']);
    Route::post('/sslcommerz/ipn', [\App\Http\Controllers\Api\PaymentController::class, 'sslIpn']);

    // Courier Webhooks
    Route::post('/courier/steadfast-webhook', [\App\Http\Controllers\Api\CourierWebhookController::class, 'steadfast']);
    Route::post('/courier/pathao-webhook', [\App\Http\Controllers\Api\CourierWebhookController::class, 'pathao']);
    Route::post('/courier/carrybee-webhook', [\App\Http\Controllers\Api\CourierWebhookController::class, 'carrybee']);
});

Route::post('/couriers/{id}', [\App\Http\Controllers\Api\CourierController::class, 'update']);

// Coupon Code Validation API
Route::post('/coupons/validate', function (Request $request) {
    $code = strtoupper(trim($request->input('code', '')));
    $subtotal = (float) $request->input('subtotal', 0);

    if (!$code) {
        return response()->json(['valid' => false, 'message' => '❌ কুপন কোড লিখুন।']);
    }

    // 1. Check in coupons table
    $coupon = \App\Models\Coupon::where('code', $code)
        ->where('is_active', true)
        ->where(function ($q) {
            $q->whereNull('expires_at')->orWhere('expires_at', '>=', now());
        })
        ->where(function ($q) {
            $q->whereNull('usage_limit')->orWhereRaw('used_count < usage_limit');
        })
        ->first();

    if ($coupon) {
        if ($coupon->min_order_amount && $subtotal < (float) $coupon->min_order_amount) {
            return response()->json([
                'valid' => false,
                'message' => "❌ এই কুপনের জন্য সর্বনিম্ন অর্ডার ৳{$coupon->min_order_amount} প্রয়োজন।",
            ]);
        }

        $discount = 0;
        if ($coupon->type === 'fixed') {
            $discount = min($subtotal, (float) $coupon->value);
        } else {
            $discount = round($subtotal * ((float) $coupon->value / 100), 2);
            if ($coupon->max_discount_amount && (float) $coupon->max_discount_amount > 0) {
                $discount = min($discount, (float) $coupon->max_discount_amount);
            }
        }

        return response()->json([
            'valid' => true,
            'discount' => $discount,
            'type' => $coupon->type,
            'value' => (float) $coupon->value,
            'message' => "✅ কুপন সঠিক! ছাড়: ৳{$discount}",
        ]);
    }

    // 2. Check in offers table (personal user offers)
    if (auth()->check()) {
        $offer = \App\Models\Offer::where('user_id', auth()->id())
            ->where('promo_code', $code)
            ->where('status', 'active')
            ->where('valid_until', '>=', now())
            ->first();

        if ($offer) {
            $discount = round($subtotal * ($offer->discount_percentage / 100), 2);
            return response()->json([
                'valid' => true,
                'discount' => $discount,
                'type' => 'percentage',
                'value' => (float) $offer->discount_percentage,
                'message' => "✅ কুপন সঠিক! ছাড়: ৳{$discount}",
            ]);
        }

        // 3. Check in user_bonus_coupons
        $bonus = \Illuminate\Support\Facades\DB::table('user_bonus_coupons')
            ->where('user_id', auth()->id())
            ->where('code', $code)
            ->where('is_used', false)
            ->where('expires_at', '>=', now())
            ->first();

        if ($bonus) {
            $discount = round($subtotal * ($bonus->value / 100), 2);
            return response()->json([
                'valid' => true,
                'discount' => $discount,
                'type' => 'percentage',
                'value' => (float) $bonus->value,
                'message' => "✅ বোনাস কুপন সঠিক! ছাড়: ৳{$discount}",
            ]);
        }
    }

    return response()->json([
        'valid' => false,
        'message' => '❌ এই কুপন কোডটি সঠিক নয় অথবা মেয়াদ শেষ হয়ে গেছে।',
    ]);
});
