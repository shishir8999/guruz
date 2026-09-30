<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Payout;
use Illuminate\Support\Facades\Auth;

class SellerPayoutController extends Controller
{
    public function index()
    {
        $shop = Auth::user()->shop;
        
        if (!$shop) {
            return Inertia::render('Seller/Payouts', [
                'payouts' => [],
                'stats' => [
                    'available_balance' => 0.00,
                    'pending_payouts' => 0.00,
                    'total_withdrawn' => 0.00,
                ],
                'noShop' => true // Or just handle it implicitly via empty stats
            ]);
        }

        $payouts = Payout::where('shop_id', $shop->id)->latest()->get();

        $wallet = \App\Models\SellerWallet::where('shop_id', $shop->id)->first();
        $stats = [
            'available_balance' => (float)($wallet?->balance ?? 0.00),
            'pending_payouts' => (float)$payouts->where('status', 'pending')->sum('amount'),
            'total_withdrawn' => (float)$payouts->where('status', 'approved')->sum('amount'),
        ];

        $defaultNotice = "আপনার পে-আউট রিকোয়েস্টটি সফলভাবে জমা হয়েছে। আমাদের ফাইন্যান্স টিম যাচাই-বাছাই শেষে আগামী ২৪ থেকে ৪৮ কর্মঘণ্টার মধ্যে আপনার অ্যাকাউন্টে টাকা পাঠিয়ে দেবে। যেকোনো তথ্যের জন্য আমাদের সাপোর্ট সেন্টারে যোগাযোগ করুন।";
        $defaultTitle = "রিকোয়েস্ট সফলভাবে জমা হয়েছে!";

        return Inertia::render('Seller/Payouts', [
            'payouts'           => $payouts,
            'stats'             => $stats,
            'payoutNotice'      => \App\Models\SiteSetting::get('seller_payout_notice', $defaultNotice),
            'payoutNoticeTitle' => \App\Models\SiteSetting::get('seller_payout_notice_title', $defaultTitle),
        ]);
    }

    public function store(Request $request)
    {
        $shop = Auth::user()->shop;

        if (!$shop) {
            return redirect()->back()->with('error', 'You need to set up a shop first.');
        }

        $request->validate([
            'amount' => 'required|numeric|min:100',
            'payment_method' => 'nullable|string|max:255',
            'notes' => 'nullable|string'
        ]);

        Payout::create([
            'shop_id' => $shop->id,
            'amount' => $request->amount,
            'payment_method' => $request->payment_method ?? 'Bank Transfer',
            'notes' => $request->notes,
            'status' => 'pending'
        ]);

        return redirect()->back()->with('success', 'Payout request submitted successfully!');
    }
}
