<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request)
    {
        // 1. Sanitize Email
        $cleanEmail = strtolower(trim((string)$request->email));

        // 2. Sanitize Phone (remove spaces, dashes, dots, etc.)
        $rawPhone = trim((string)$request->phone);
        $cleanPhone = preg_replace('/[^0-9]/', '', $rawPhone);
        if (str_starts_with($cleanPhone, '8801') && strlen($cleanPhone) === 13) {
            $cleanPhone = substr($cleanPhone, 2);
        }

        $request->merge([
            'email' => $cleanEmail,
            'phone' => $cleanPhone,
        ]);

        $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => [
                'required',
                'string',
                'email:rfc',
                'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}$/',
                'max:255',
                'unique:users,email',
            ],
            'phone' => [
                'required',
                'string',
                'regex:/^01[3-9]\d{8}$/',
                'unique:users,phone',
            ],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'name.required' => 'আপনার পুরো নাম লিখুন।',
            'name.min' => 'নাম কমপক্ষে ২ অক্ষরের হতে হবে।',
            'email.required' => 'ইমেইল অ্যাড্রেস দেওয়া আবশ্যক।',
            'email.email' => 'অনুগ্রহ করে একটি সঠিক ইমেইল অ্যাড্রেস লিখুন (যেমন: name@gmail.com)।',
            'email.regex' => 'অনুগ্রহ করে একটি সঠিক ও বৈধ ইমেইল অ্যাড্রেস দিন (যেমন: name@gmail.com)।',
            'email.unique' => 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে।',
            'phone.required' => 'মোবাইল নম্বর দেওয়া আবশ্যক।',
            'phone.regex' => 'অনুগ্রহ করে সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01712345678)। ডট (.) বা কোনো অক্ষর গ্রহণযোগ্য নয়।',
            'phone.unique' => 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে।',
            'password.required' => 'পাসওয়ার্ড দেওয়া আবশ্যক।',
            'password.min' => 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।',
            'password.confirmed' => 'কনফার্ম পাসওয়ার্ড মিলছে না।',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $cleanEmail,
            'phone' => $cleanPhone,
            'password' => Hash::make($request->password),
        ]);

        // Assign default customer role
        UserRole::create(['user_id' => $user->id, 'role' => 'customer']);

        // Add WELCOME coupon to user_bonus_coupons table
        if (\Illuminate\Support\Facades\Schema::hasTable('user_bonus_coupons')) {
            try {
                $enabled = \App\Models\SiteSetting::get('welcome_coupon_enabled', 'true') === 'true';
                if ($enabled) {
                    $validHours = max(1, (int) \App\Models\SiteSetting::get('welcome_coupon_valid_hours', '72'));
                    $discount = (float) \App\Models\SiteSetting::get('welcome_coupon_discount', '10.00');
                    $type = \App\Models\SiteSetting::get('welcome_coupon_type', 'percentage');
                    $minOrder = (float) \App\Models\SiteSetting::get('welcome_coupon_min_order', '0');
                    $maxDiscount = (float) \App\Models\SiteSetting::get('welcome_coupon_max_discount', '0');
                    $prefix = \App\Models\SiteSetting::get('welcome_coupon_prefix', 'WELCOME10');

                    DB::table('user_bonus_coupons')->insert([
                        'user_id'             => $user->id,
                        'code'                => $prefix . '-' . strtoupper(Str::random(4)),
                        'type'                => $type === 'fixed' ? 'fixed' : 'percent',
                        'value'               => $discount,
                        'min_order_amount'    => $minOrder,
                        'max_discount_amount' => $maxDiscount > 0 ? $maxDiscount : null,
                        'expires_at'          => now()->addHours($validHours),
                        'is_used'             => false,
                        'created_at'          => now(),
                        'updated_at'          => now(),
                    ]);
                }
            } catch (\Throwable $e) {}
        }

        event(new Registered($user));
        Auth::login($user);

        return redirect()->route('home')->with('registered', true);
    }
}
