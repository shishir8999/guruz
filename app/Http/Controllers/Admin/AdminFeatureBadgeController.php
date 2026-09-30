<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SiteSetting;

class AdminFeatureBadgeController extends Controller
{
    /**
     * Display the Feature Badges page.
     */
    public function index()
    {
        $defaultBadges = [
            [
                'id' => 'safe_payments',
                'label_en' => 'Safe Payments',
                'label_bn' => 'নিরাপদ পেমেন্ট',
                'icon' => 'ShieldCheck',
                'gradient_from' => 'from-blue-600',
                'gradient_to' => 'to-cyan-500',
                'is_active' => true,
            ],
            [
                'id' => 'nationwide_delivery',
                'label_en' => 'Nationwide Delivery',
                'label_bn' => 'সারাদেশে ডেলিভারি',
                'icon' => 'Truck',
                'gradient_from' => 'from-orange-500',
                'gradient_to' => 'to-red-500',
                'is_active' => true,
            ],
            [
                'id' => 'guruz_verified',
                'label_en' => 'Guruz Verified',
                'label_bn' => 'গুরুজ ভেরিফাইড',
                'icon' => 'BadgeCheck',
                'gradient_from' => 'from-purple-600',
                'gradient_to' => 'to-pink-500',
                'is_active' => true,
            ],
            [
                'id' => 'easy_return',
                'label_en' => 'Easy Return Policy',
                'label_bn' => 'সহজ রিটার্ন',
                'icon' => 'RotateCcw',
                'gradient_from' => 'from-emerald-500',
                'gradient_to' => 'to-green-500',
                'is_active' => true,
            ],
            [
                'id' => 'best_price',
                'label_en' => 'Best Price Guaranteed',
                'label_bn' => 'সেরা দামের গ্যারান্টি',
                'icon' => 'Tag',
                'gradient_from' => 'from-amber-500',
                'gradient_to' => 'to-orange-500',
                'is_active' => true,
            ],
            [
                'id' => 'authentic_products',
                'label_en' => '100% Authentic Products',
                'label_bn' => '১০০% অরিজিনাল প্রোডাক্ট',
                'icon' => 'Sparkles',
                'gradient_from' => 'from-cyan-500',
                'gradient_to' => 'to-blue-500',
                'is_active' => true,
            ]
        ];

        $savedBadges = SiteSetting::get('feature_badges');
        $badges = $savedBadges ? json_decode($savedBadges, true) : $defaultBadges;

        $savedProfileCard = SiteSetting::get('profile_discount_card');
        $profileCard = $savedProfileCard ? json_decode($savedProfileCard, true) : [
            'is_active' => true,
            'text_bn' => 'আপনার প্রোফাইল সম্পূর্ণ করুন এবং পান অতিরিক্ত ২% ডিসকাউন্ট!',
            'discount_percentage' => '২%',
            'link_url' => '/account'
        ];

        return Inertia::render('Admin/FeatureBadgesPage', [
            'badges' => $badges,
            'defaultBadges' => $defaultBadges,
            'profileCard' => $profileCard
        ]);
    }

    /**
     * Save the updated feature badges and profile discount banner settings.
     */
    public function update(Request $request)
    {
        $request->validate([
            'badges' => 'required|array',
            'badges.*.id' => 'required|string',
            'badges.*.label_en' => 'required|string|max:255',
            'badges.*.label_bn' => 'nullable|string|max:255',
            'badges.*.icon' => 'required|string',
            'badges.*.gradient_from' => 'required|string',
            'badges.*.gradient_to' => 'required|string',
            'badges.*.is_active' => 'boolean',
            'profileCard' => 'nullable|array',
            'profileCard.is_active' => 'nullable|boolean',
            'profileCard.text_bn' => 'nullable|string|max:255',
            'profileCard.discount_percentage' => 'nullable|string|max:50',
            'profileCard.link_url' => 'nullable|string|max:255',
        ]);

        SiteSetting::set('feature_badges', json_encode($request->badges), 'appearance');

        if ($request->has('profileCard')) {
            SiteSetting::set('profile_discount_card', json_encode($request->profileCard), 'appearance');
        }

        \Illuminate\Support\Facades\Cache::forget('all_site_settings_map');
        \Illuminate\Support\Facades\Cache::flush();

        return redirect()->back()->with('success', 'ফিচার ব্যাজ ও প্রোফাইল ডিসকাউন্ট ব্যানার সফলভাবে সংরক্ষিত হয়েছে।');
    }
}
