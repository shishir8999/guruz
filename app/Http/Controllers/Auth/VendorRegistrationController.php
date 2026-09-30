<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserRole;
use App\Models\Shop;
use App\Models\SellerWallet;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class VendorRegistrationController extends Controller
{
    /**
     * Display the vendor registration view.
     */
    public function create()
    {
        if (Auth::check() && (Auth::user()->isVendor() || Auth::user()->hasRole('seller')) && !session()->has('vendor_registration_success')) {
            return redirect()->route('seller.my-shop');
        }

        return Inertia::render('Auth/VendorRegister');
    }

    /**
     * Handle an incoming vendor registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        $cleanEmail = strtolower(trim((string)$request->email));
        
        $rawPhone = trim((string)$request->shop_phone);
        $cleanPhone = preg_replace('/[^0-9]/', '', $rawPhone);
        if (str_starts_with($cleanPhone, '8801') && strlen($cleanPhone) === 13) {
            $cleanPhone = substr($cleanPhone, 2);
        }

        $request->merge([
            'email' => $cleanEmail,
            'shop_phone' => $cleanPhone,
        ]);

        $request->validate([
            // User Validation
            'name'             => ['required', 'string', 'min:2', 'max:255'],
            'email'            => [
                'required',
                'string',
                'email:rfc',
                'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}$/',
                'max:255',
                'unique:users,email',
            ],
            'password'         => ['required', 'string', 'min:8', 'confirmed'],
            // Shop Validation
            'shop_name'        => ['required', 'string', 'max:255', 'unique:shops,name'],
            'shop_phone'       => [
                'required',
                'string',
                'regex:/^01[3-9]\d{8}$/',
            ],
            'shop_address'     => ['required', 'string', 'max:500'],
            'shop_description' => ['nullable', 'string', 'max:1000'],
            // Payment / KYC Validation (Step 3 Mandatory)
            'bank_name'        => ['required', 'string', 'max:255'],
            'account_number'   => ['required', 'string', 'max:255'],
            'nid_number'       => ['nullable', 'string', 'max:255'],
            'nid_front'        => ['required', 'file', 'mimes:jpeg,png,jpg,webp,pdf', 'max:20480'],
            'nid_back'         => ['required', 'file', 'mimes:jpeg,png,jpg,webp,pdf', 'max:20480'],
            'trade_license'    => ['nullable', 'file', 'mimes:jpeg,png,jpg,webp,pdf', 'max:20480'],
            'bank_statement'   => ['nullable', 'file', 'mimes:jpeg,png,jpg,webp,pdf', 'max:20480'],
        ], [
            'name.required' => 'আপনার পুরো নাম লিখুন।',
            'email.required' => 'ইমেইল অ্যাড্রেস দেওয়া আবশ্যক।',
            'email.email' => 'অনুগ্রহ করে একটি সঠিক ইমেইল অ্যাড্রেস লিখুন (যেমন: name@gmail.com)।',
            'email.regex' => 'অনুগ্রহ করে একটি বৈধ ইমেইল দিন (যেমন: name@gmail.com)।',
            'email.unique' => 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে।',
            'password.required' => 'পাসওয়ার্ড দেওয়া আবশ্যক।',
            'password.min' => 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।',
            'password.confirmed' => 'কনফার্ম পাসওয়ার্ড মিলছে না।',
            'shop_name.required' => 'শপের নাম লিখুন।',
            'shop_name.unique' => 'এই নামের শপ ইতিমধ্যে নিবন্ধিত আছে।',
            'shop_phone.required' => 'শপের মোবাইল নম্বর দেওয়া আবশ্যক।',
            'shop_phone.regex' => 'অনুগ্রহ করে সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01712345678)। ডট (.) বা কোনো অক্ষর গ্রহণযোগ্য নয়।',
            'shop_address.required' => 'শপের পূর্ণ ঠিকানা লিখুন।',
            'bank_name.required' => 'ব্যাংক অথবা মোবাইল ব্যাংকিং নাম লিখুন।',
            'account_number.required' => 'অ্যাকাউন্ট নম্বর লিখুন।',
            'nid_front.required' => 'জাতীয় পরিচয়পত্রের সামনের অংশের (NID Front) ছবি আপলোড করা আবশ্যক।',
            'nid_back.required'  => 'জাতীয় পরিচয়পত্রের পেছনের অংশের (NID Back) ছবি আপলোড করা আবশ্যক।',
            'nid_front.file'     => 'NID Front একটি ছবি বা ফাইল হতে হবে।',
            'nid_back.file'      => 'NID Back একটি ছবি বা ফাইল হতে হবে।',
            'nid_front.max'      => 'NID Front ছবির সাইজ সর্বোচ্চ ২০ মেগাবাইট হতে পারবে।',
            'nid_back.max'       => 'NID Back ছবির সাইজ সর্বোচ্চ ২০ মেগাবাইট হতে পারবে।',
        ]);

        DB::beginTransaction();

        try {
            // 1. Create the User
            $user = User::create([
                'name'     => $request->name,
                'email'    => $cleanEmail,
                'phone'    => $request->shop_phone,
                'password' => Hash::make($request->password),
            ]);

            // 2. Assign seller & vendor roles
            UserRole::firstOrCreate(['user_id' => $user->id, 'role' => 'seller']);
            UserRole::firstOrCreate(['user_id' => $user->id, 'role' => 'vendor']);

            // 3. Generate unique slug and create the Shop (Pending approval)
            $baseSlug = Str::slug($request->shop_name) ?: 'shop-' . Str::lower(Str::random(6));
            $slug = $baseSlug;
            $counter = 1;
            while (Shop::where('slug', $slug)->exists()) {
                $slug = "{$baseSlug}-" . $counter;
                $counter++;
            }

            $shop = Shop::create([
                'user_id'         => $user->id,
                'name'            => $request->shop_name,
                'phone'           => $request->shop_phone,
                'address'         => $request->shop_address,
                'description'     => $request->shop_description,
                'slug'            => $slug,
                'status'          => 'pending',
                'rating'          => 5.00,
                'commission_rate' => 10.00,
            ]);

            // 4. Create Seller Wallet
            SellerWallet::create(['shop_id' => $shop->id]);

            // 5. Store Vendor KYC details with uploaded documents
            $nidFrontPath = null;
            if ($request->hasFile('nid_front')) {
                $path = \App\Services\StorageHelper::storePublicly($request->file('nid_front'), 'kyc');
                $nidFrontPath = '/storage/' . ltrim($path, '/');
            }

            $nidBackPath = null;
            if ($request->hasFile('nid_back')) {
                $path = \App\Services\StorageHelper::storePublicly($request->file('nid_back'), 'kyc');
                $nidBackPath = '/storage/' . ltrim($path, '/');
            }

            $tradeLicensePath = null;
            if ($request->hasFile('trade_license')) {
                $path = \App\Services\StorageHelper::storePublicly($request->file('trade_license'), 'kyc');
                $tradeLicensePath = '/storage/' . ltrim($path, '/');
            }

            $bankStatementPath = null;
            if ($request->hasFile('bank_statement')) {
                $path = \App\Services\StorageHelper::storePublicly($request->file('bank_statement'), 'kyc');
                $bankStatementPath = '/storage/' . ltrim($path, '/');
            }

            \App\Models\VendorKyc::create([
                'shop_id'              => $shop->id,
                'user_id'              => $user->id,
                'nid_number'           => $request->nid_number ?: 'Uploaded via Document',
                'nid_front_image'      => $nidFrontPath,
                'nid_back_image'       => $nidBackPath,
                'trade_license_image'  => $tradeLicensePath,
                'bank_statement_image' => $bankStatementPath,
                'bank_name'            => $request->bank_name,
                'account_number'       => $request->account_number,
                'status'               => 'Pending',
                'rejection_reason'     => null,
            ]);

            DB::commit();

            // Send Vendor Registration Confirmation Email safely (don't roll back DB if mail server fails)
            try {
                \App\Services\EmailService::sendVendorRegistrationEmail($user, $shop);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Vendor registration email failed: ' . $e->getMessage());
            }

            // Create in-app notification for Admin
            try {
                $admins = User::whereHas('roles', function($q) {
                    $q->whereIn('role', ['admin', 'super_admin']);
                })->orWhereIn('email', ['admin@guruz.com', 'shishirbarai2050@gmail.com', 'shishirbarai019@gmail.com', 'shishirbarai01982708789@gmail.com'])->get();

                foreach ($admins as $admin) {
                    \App\Models\Notification::create([
                        'user_id' => $admin->id,
                        'type'    => 'vendor_registration',
                        'title'   => 'নতুন সেলার রেজিস্ট্রেশন',
                        'body'    => "নতুন সেলার '{$shop->name}' ({$user->name}) রেজিস্ট্রেশন করেছেন ও ভেন্ডর প্যানেল খুলেছেন।",
                        'link'    => '/admin/vendors',
                        'icon'    => 'Store',
                        'is_read' => false,
                    ]);
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Admin notification failed: ' . $e->getMessage());
            }

            try {
                event(new Registered($user));
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Vendor registration event failed: ' . $e->getMessage());
            }

            Auth::login($user);

            return back()->with('vendor_registration_success', [
                'user_name' => $user->name,
                'shop_name' => $shop->name,
                'shop_phone' => $shop->phone,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'রেজিস্ট্রেশন করতে সমস্যা হয়েছে: ' . $e->getMessage());
        }
    }
}
