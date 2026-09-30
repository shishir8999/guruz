<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SellerCouponController extends Controller
{
    public function index(Request $request)
    {
        $coupons = Coupon::latest()->get();

        return Inertia::render('Seller/Coupons', [
            'coupons' => $coupons,
        ]);
    }

    public function store(Request $request)
    {
        $input = $request->all();
        foreach (['min_order_amount', 'max_discount_amount', 'usage_limit', 'expires_at'] as $field) {
            if (isset($input[$field]) && $input[$field] === '') {
                $input[$field] = null;
            }
        }
        $request->merge($input);

        $validated = $request->validate([
            'code'                => 'required|string|max:50|unique:coupons,code',
            'type'                => 'required|in:fixed,percentage',
            'value'               => 'required|numeric|min:0.01',
            'min_order_amount'    => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'usage_limit'         => 'nullable|integer|min:1',
            'expires_at'          => 'nullable|date',
            'is_active'           => 'boolean',
        ]);

        Coupon::create($validated);

        return back()->with('success', 'কুপন ডিসকাউন্ট সফলভাবে তৈরি হয়েছে!');
    }

    public function destroy($id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();

        return back()->with('success', 'কুপন সফলভাবে মুছে ফেলা হয়েছে!');
    }

    public function toggle($id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->update(['is_active' => !$coupon->is_active]);

        return back()->with('success', 'কুপন স্ট্যাটাস আপডেট করা হয়েছে!');
    }
}
