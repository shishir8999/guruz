<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomerWallet;
use App\Models\CustomerWalletTransaction;
use App\Models\Notification;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminCustomerWalletController extends Controller
{
    public function index(): Response
    {
        $users = User::orderBy('id', 'desc')->get();

        $customers = $users->map(function ($user) {
            $wallet = CustomerWallet::firstOrCreate(
                ['user_id' => $user->id],
                ['balance' => 0.00, 'total_earned' => 0.00, 'total_spent' => 0.00]
            );

            return [
                'id'            => $user->id,
                'name'          => $user->name,
                'email'         => $user->email,
                'phone'         => $user->phone ?? '-',
                'customer_code' => 'GZ-' . str_pad((string)$user->id, 5, '0', STR_PAD_LEFT),
                'balance'       => (float) $wallet->balance,
                'earned'        => (float) ($wallet->total_earned ?? 0),
                'used'          => (float) ($wallet->total_spent ?? 0),
            ];
        });

        $settings = [
            'program_enabled'       => SiteSetting::get('wallet_program_enabled', '1') === '1',
            'per_order_max'         => SiteSetting::get('wallet_per_order_max', '10'),
            'first_order_cashback'  => SiteSetting::get('wallet_first_order_cashback', '20'),
            'signup_bonus'          => SiteSetting::get('wallet_signup_bonus', '0'),
            'min_subtotal'          => SiteSetting::get('wallet_min_subtotal', '0'),
        ];

        return Inertia::render('Admin/CustomerWalletPage', [
            'customers' => $customers,
            'settings'  => $settings,
        ]);
    }

    public function adjust(Request $request)
    {
        $request->validate([
            'user_id'     => 'required|exists:users,id',
            'amount'      => 'required|numeric|min:1',
            'type'        => 'required|in:add,subtract',
            'description' => 'nullable|string|max:255',
        ]);

        $user = User::findOrFail($request->user_id);
        $wallet = CustomerWallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0.00, 'total_earned' => 0.00, 'total_spent' => 0.00]
        );

        $amount = round((float) $request->amount, 2);
        $type = $request->type;
        $note = $request->description;

        if ($type === 'add') {
            $wallet->balance = (float)$wallet->balance + $amount;
            $wallet->total_earned = (float)($wallet->total_earned ?? 0) + $amount;
            $wallet->save();

            CustomerWalletTransaction::create([
                'customer_wallet_id' => $wallet->id,
                'type'               => 'credit',
                'amount'             => $amount,
                'reference_type'     => 'admin_bonus',
                'reference_id'       => auth()->id(),
                'description'        => $note ?: "সুপার অ্যাডমিন কর্তৃক ওয়ালেটে ৳{$amount} বোনাস ক্রেডিট",
            ]);

            // In-app customer notification
            try {
                Notification::create([
                    'user_id' => $user->id,
                    'title'   => "🎁 ৳{$amount} ওয়ালেট বোনাস পেয়েছেন!",
                    'message' => "সুপার অ্যাডমিন আপনার Guruz ওয়ালেটে ৳{$amount} বোনাস ক্রেডিট দিয়েছেন। প্রতি অর্ডারে আপনি এটি ব্যবহার করতে পারবেন।",
                    'type'    => 'wallet_credit',
                    'link'    => '/account/wallet',
                    'is_read' => false,
                ]);
            } catch (\Throwable $e) {}

            return back()->with('success', "কাস্টমার {$user->name}-এর ওয়ালেটে ৳{$amount} বোনাস ক্রেডিট সফলভাবে যোগ হয়েছে!");
        } else {
            $deduct = min((float)$wallet->balance, $amount);
            $wallet->balance = max(0, (float)$wallet->balance - $deduct);
            $wallet->total_spent = (float)($wallet->total_spent ?? 0) + $deduct;
            $wallet->save();

            CustomerWalletTransaction::create([
                'customer_wallet_id' => $wallet->id,
                'type'               => 'debit',
                'amount'             => $deduct,
                'reference_type'     => 'admin_adjustment',
                'reference_id'       => auth()->id(),
                'description'        => $note ?: "সুপার অ্যাডমিন কর্তৃক ওয়ালেট ব্যালেন্স সমন্বয় (-৳{$deduct})",
            ]);

            return back()->with('success', "কাস্টমার {$user->name}-এর ওয়ালেট ব্যালেন্স থেকে ৳{$deduct} কর্তন করা হয়েছে।");
        }
    }

    public function updateSettings(Request $request)
    {
        $request->validate([
            'program_enabled'       => 'nullable|boolean',
            'per_order_max'         => 'nullable|numeric|min:1',
            'first_order_cashback'  => 'nullable|numeric|min:0',
            'signup_bonus'          => 'nullable|numeric|min:0',
            'min_subtotal'          => 'nullable|numeric|min:0',
        ]);

        if ($request->has('program_enabled')) {
            SiteSetting::set('wallet_program_enabled', $request->program_enabled ? '1' : '0');
        }
        if ($request->filled('per_order_max')) {
            SiteSetting::set('wallet_per_order_max', (string) $request->per_order_max);
        }
        if ($request->filled('first_order_cashback')) {
            SiteSetting::set('wallet_first_order_cashback', (string) $request->first_order_cashback);
        }
        if ($request->filled('signup_bonus')) {
            SiteSetting::set('wallet_signup_bonus', (string) $request->signup_bonus);
        }
        if ($request->filled('min_subtotal')) {
            SiteSetting::set('wallet_min_subtotal', (string) $request->min_subtotal);
        }

        return back()->with('success', 'ওয়ালেট কনফিগারেশন সফলভাবে সেভ হয়েছে!');
    }
}
