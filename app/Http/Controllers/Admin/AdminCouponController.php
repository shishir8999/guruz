<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminCouponController extends Controller
{
    public function index()
    {
        $coupons = Coupon::latest()->get();
        $couponSystemEnabled = SiteSetting::get('coupon_system_enabled', 'true') === 'true';

        $welcomeSettings = [
            'enabled' => SiteSetting::get('welcome_coupon_enabled', 'true') === 'true',
            'discount' => (float) SiteSetting::get('welcome_coupon_discount', '10'),
            'type' => SiteSetting::get('welcome_coupon_type', 'percentage'),
            'valid_hours' => (int) SiteSetting::get('welcome_coupon_valid_hours', '72'),
            'min_order_amount' => (float) SiteSetting::get('welcome_coupon_min_order', '0'),
            'max_discount_amount' => (float) SiteSetting::get('welcome_coupon_max_discount', '0'),
            'prefix' => SiteSetting::get('welcome_coupon_prefix', 'WELCOME10'),
        ];

        $bonusCouponMessage = [
            'title'       => SiteSetting::get('bonus_coupon_empty_title', 'প্রিয় গ্রাহক, আমাদের সাথেই থাকুন!'),
            'description' => SiteSetting::get('bonus_coupon_empty_description', 'আপনার জন্য আকর্ষণীয় বোনাস কুপন ও স্পেশাল সারপ্রাইজ অফার খুব শীঘ্রই আসছে। নিয়মিত কেনাকাটায় চোখ রাখুন দারুণ সব ছাড়ে!'),
            'badge'       => SiteSetting::get('bonus_coupon_empty_badge', 'ধামাকা অফার লোড হচ্ছে...'),
            'icon'        => SiteSetting::get('bonus_coupon_empty_icon', '🎁'),
        ];

        return Inertia::render('Admin/Marketing/Coupons', [
            'coupons'              => $coupons,
            'couponSystemEnabled'  => $couponSystemEnabled,
            'welcomeSettings'      => $welcomeSettings,
            'bonus_coupon_message' => $bonusCouponMessage,
        ]);
    }

    public function updateWelcomeSettings(Request $request)
    {
        $validated = $request->validate([
            'enabled'             => 'required|boolean',
            'discount'            => 'required|numeric|min:0.01',
            'type'                => 'required|in:percentage,fixed',
            'valid_hours'         => 'required|integer|min:1|max:87600', // up to 10 years in hours
            'min_order_amount'    => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'prefix'              => 'required|string|max:20|alpha_dash',
        ]);

        SiteSetting::set('welcome_coupon_enabled', $validated['enabled'] ? 'true' : 'false', 'marketing');
        SiteSetting::set('welcome_coupon_discount', (string) $validated['discount'], 'marketing');
        SiteSetting::set('welcome_coupon_type', $validated['type'], 'marketing');
        SiteSetting::set('welcome_coupon_valid_hours', (string) $validated['valid_hours'], 'marketing');
        SiteSetting::set('welcome_coupon_min_order', (string) ($validated['min_order_amount'] ?? '0'), 'marketing');
        SiteSetting::set('welcome_coupon_max_discount', (string) ($validated['max_discount_amount'] ?? '0'), 'marketing');
        SiteSetting::set('welcome_coupon_prefix', strtoupper(trim($validated['prefix'])), 'marketing');

        \Illuminate\Support\Facades\Cache::flush();

        return back()->with('flash', [
            'type' => 'success',
            'message' => 'ওয়েলকাম বোনাস কুপন সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!'
        ]);
    }

    public function toggleSystem(Request $request)
    {
        $enabled = $request->boolean('enabled');
        SiteSetting::set('coupon_system_enabled', $enabled ? 'true' : 'false', 'marketing');
        \Illuminate\Support\Facades\Cache::flush();

        return back()->with('flash', [
            'type' => 'success',
            'message' => $enabled ? 'কুপন সিস্টেম সফলভাবে চালু করা হয়েছে!' : 'কুপন সিস্টেম সাময়িকভাবে বন্ধ করা হয়েছে!'
        ]);
    }

    public function store(Request $request)
    {
        $input = $request->all();
        foreach (['min_order_amount', 'max_discount_amount', 'usage_limit', 'starts_at', 'expires_at'] as $field) {
            if (isset($input[$field]) && $input[$field] === '') {
                $input[$field] = null;
            }
        }
        $request->merge($input);

        $validated = $request->validate([
            'code'                => 'required|string|max:50|unique:coupons,code',
            'type'                => 'required|in:percentage,fixed',
            'value'               => 'required|numeric|min:0.01',
            'min_order_amount'    => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'usage_limit'         => 'nullable|integer|min:1',
            'starts_at'           => 'nullable|date',
            'expires_at'          => 'nullable|date',
            'is_active'           => 'boolean',
        ]);

        if (empty($validated['starts_at'])) {
            $validated['starts_at'] = now();
        }

        $validated['min_order_amount'] = isset($validated['min_order_amount']) && $validated['min_order_amount'] !== null && $validated['min_order_amount'] !== ''
            ? (float) $validated['min_order_amount']
            : 0.00;

        Coupon::create($validated);

        return back()->with('success', 'নতুন কুপন সফলভাবে তৈরি করা হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $coupon = Coupon::findOrFail($id);

        $input = $request->all();
        foreach (['min_order_amount', 'max_discount_amount', 'usage_limit', 'starts_at', 'expires_at'] as $field) {
            if (isset($input[$field]) && $input[$field] === '') {
                $input[$field] = null;
            }
        }
        $request->merge($input);

        $validated = $request->validate([
            'code'                => 'required|string|max:50|unique:coupons,code,' . $coupon->id,
            'type'                => 'required|in:percentage,fixed',
            'value'               => 'required|numeric|min:0.01',
            'min_order_amount'    => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'usage_limit'         => 'nullable|integer|min:1',
            'starts_at'           => 'nullable|date',
            'expires_at'          => 'nullable|date',
            'is_active'           => 'boolean',
        ]);

        $validated['min_order_amount'] = isset($validated['min_order_amount']) && $validated['min_order_amount'] !== null && $validated['min_order_amount'] !== ''
            ? (float) $validated['min_order_amount']
            : 0.00;

        $coupon->update($validated);

        return back()->with('success', 'কুপন সফলভাবে আপডেট হয়েছে!');
    }

    public function toggle($id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->update(['is_active' => !$coupon->is_active]);

        return back()->with('success', 'কুপন স্ট্যাটাস পরিবর্তন করা হয়েছে!');
    }

    public function destroy($id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();

        return back()->with('success', 'কুপন সফলভাবে মুছে ফেলা হয়েছে!');
    }
}
