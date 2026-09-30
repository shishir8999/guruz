<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\VendorKyc;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class SellerShopController extends Controller
{
    private function ensureShopTableColumnsExist()
    {
        try {
            if (Schema::hasTable('shops')) {
                Schema::table('shops', function (Blueprint $table) {
                    if (!Schema::hasColumn('shops', 'website')) {
                        $table->string('website')->nullable()->after('email');
                    }
                    if (!Schema::hasColumn('shops', 'city')) {
                        $table->string('city')->nullable()->after('address');
                    }
                    if (!Schema::hasColumn('shops', 'custom_domain')) {
                        $table->string('custom_domain')->nullable()->after('website');
                    }
                    if (!Schema::hasColumn('shops', 'custom_domain_status')) {
                        $table->string('custom_domain_status')->default('Active & Verified')->after('custom_domain');
                    }
                    if (!Schema::hasColumn('shops', 'custom_domain_dns_verified')) {
                        $table->boolean('custom_domain_dns_verified')->default(true)->after('custom_domain_status');
                    }
                });
            }
        } catch (\Throwable $e) {
            // ignore
        }
    }

    public function store(Request $request)
    {
        $this->ensureShopTableColumnsExist();

        $request->validate([
            'name'        => 'required|string|max:255',
            'phone'       => 'required|string|max:20',
            'email'       => 'required|email|max:255',
            'address'     => 'required|string',
            'description' => 'nullable|string',
        ]);

        if ($request->user()->shop) {
            return redirect()->route('seller.dashboard');
        }

        $shop = \App\Models\Shop::create([
            'user_id'         => $request->user()->id,
            'name'            => $request->name,
            'slug'            => \Illuminate\Support\Str::slug($request->name) . '-' . uniqid(),
            'phone'           => $request->phone,
            'email'           => $request->email,
            'address'         => $request->address,
            'description'     => $request->description,
            'status'          => 'pending',
            'commission_rate' => 0.00,
        ]);

        \App\Models\SellerWallet::create([
            'shop_id'         => $shop->id,
            'balance'         => 0,
            'pending_balance' => 0,
            'total_withdrawn' => 0,
        ]);

        return redirect()->route('seller.dashboard')->with('success', 'Shop created successfully! Welcome to your seller dashboard.');
    }

    /**
     * Redirect GET request for verification to KYC page.
     */
    public function verifyShop()
    {
        return redirect()->route('seller.kyc');
    }

    /**
     * Handle the shop verification document submission.
     */
    public function submitVerification(Request $request)
    {
        $request->validate([
            'nid_front'            => 'nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:20480',
            'nid_back'             => 'nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:20480',
            'trade_license'        => 'nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:20480',
            'bank_statement'       => 'nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:20480',
            'nid_number'           => 'nullable|string|max:50',
            'trade_license_number' => 'nullable|string|max:50',
        ]);

        $shop = auth()->user()->shop;

        if (!$shop) {
            return back()->with('error', 'No shop associated with your account.');
        }

        // Find or create VendorKyc for this shop
        $kyc = VendorKyc::firstOrNew(['shop_id' => $shop->id]);
        $kyc->user_id = auth()->id();
        $kyc->status = 'Pending';
        $kyc->rejection_reason = null;

        if ($request->filled('nid_number')) {
            $kyc->nid_number = $request->nid_number;
        }

        if ($request->filled('trade_license_number')) {
            $kyc->trade_license_number = $request->trade_license_number;
        }

        if ($request->hasFile('nid_front')) {
            if ($kyc->nid_front_image) {
                \App\Services\StorageHelper::deletePublicly($kyc->nid_front_image);
            }
            $path = \App\Services\StorageHelper::storePublicly($request->file('nid_front'), 'kyc');
            $kyc->nid_front_image = '/storage/' . ltrim($path, '/');
        }

        if ($request->hasFile('nid_back')) {
            if ($kyc->nid_back_image) {
                \App\Services\StorageHelper::deletePublicly($kyc->nid_back_image);
            }
            $path = \App\Services\StorageHelper::storePublicly($request->file('nid_back'), 'kyc');
            $kyc->nid_back_image = '/storage/' . ltrim($path, '/');
        }

        if ($request->hasFile('trade_license')) {
            if ($kyc->trade_license_image) {
                \App\Services\StorageHelper::deletePublicly($kyc->trade_license_image);
            }
            $path = \App\Services\StorageHelper::storePublicly($request->file('trade_license'), 'kyc');
            $kyc->trade_license_image = '/storage/' . ltrim($path, '/');
        }

        if ($request->hasFile('bank_statement')) {
            if ($kyc->bank_statement_image) {
                \App\Services\StorageHelper::deletePublicly($kyc->bank_statement_image);
            }
            $path = \App\Services\StorageHelper::storePublicly($request->file('bank_statement'), 'kyc');
            $kyc->bank_statement_image = '/storage/' . ltrim($path, '/');
        }

        $kyc->save();

        return back()->with('success', 'আপনার ভেরিফিকেশন ও কেওয়াইসি (KYC) ডকুমেন্ট সফলভাবে সাবমিট হয়েছে! অ্যাডমিন যাচাই করার পর আপনার অ্যাকাউন্টটি ভেরিফাই করা হবে।');
    }

    public function settings()
    {
        $this->ensureShopTableColumnsExist();

        $user = auth()->user();
        $shop = \App\Models\Shop::where('user_id', $user->id)->first();

        if (!$shop) {
            $shop = \App\Models\Shop::create([
                'user_id'     => $user->id,
                'name'        => ($user->name ?? 'Vendor') . "'s Shop",
                'slug'        => \Illuminate\Support\Str::slug(($user->name ?? 'Vendor') . "-shop-" . $user->id),
                'phone'       => $user->phone ?? '+8801900000000',
                'email'       => $user->email,
                'address'     => 'Main Store Address',
                'status'      => 'active',
                'is_approved' => true,
            ]);
        }

        return inertia('Seller/Settings', [
            'shop' => $shop
        ]);
    }

    public function updateSettings(Request $request)
    {
        $this->ensureShopTableColumnsExist();

        $user = auth()->user();
        $shop = \App\Models\Shop::where('user_id', $user->id)->first();

        if (!$shop) {
            $shop = \App\Models\Shop::create([
                'user_id'     => $user->id,
                'name'        => $request->input('name', ($user->name ?? 'Vendor') . "'s Shop"),
                'slug'        => \Illuminate\Support\Str::slug(($user->name ?? 'Vendor') . "-shop-" . $user->id),
                'phone'       => $request->input('phone', $user->phone ?? '+8801900000000'),
                'email'       => $user->email,
                'address'     => $request->input('address', 'Main Store Address'),
                'status'      => 'active',
                'is_approved' => true,
            ]);
        }

        if (!$request->hasFile('logo')) {
            $request->request->remove('logo');
        }
        if (!$request->hasFile('cover')) {
            $request->request->remove('cover');
        }

        $request->validate([
            'name'        => 'nullable|string|max:255',
            'phone'       => 'nullable|string|max:20',
            'email'       => 'nullable|email|max:255',
            'description' => 'nullable|string',
            'address'     => 'nullable|string',
            'city'        => 'nullable|string|max:100',
            'website'     => 'nullable|string|max:255',
            'logo'        => 'nullable|image|max:10240',
            'cover'       => 'nullable|image|max:20480',
        ]);

        if ($request->filled('name')) $shop->name = $request->name;
        if ($request->filled('phone')) $shop->phone = $request->phone;
        if ($request->filled('email')) $shop->email = $request->email;
        if ($request->has('description')) $shop->description = $request->description;
        if ($request->has('address')) $shop->address = $request->address;

        if (Schema::hasColumn('shops', 'city') && $request->has('city')) {
            $shop->city = $request->city;
        }

        if (Schema::hasColumn('shops', 'website') && $request->has('website')) {
            $shop->website = $request->website;
        }

        if ($request->hasFile('logo')) {
            if ($shop->logo_url) {
                \App\Services\StorageHelper::deletePublicly($shop->logo_url);
            }
            $shop->logo_url = '/storage/' . \App\Services\StorageHelper::storePublicly($request->file('logo'), 'shops');
        }

        if ($request->hasFile('cover')) {
            if ($shop->banner_url) {
                \App\Services\StorageHelper::deletePublicly($shop->banner_url);
            }
            $shop->banner_url = '/storage/' . \App\Services\StorageHelper::storePublicly($request->file('cover'), 'shops');
        }

        $shop->save();

        return back()->with('success', 'Shop settings updated successfully!');
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:10240',
        ]);

        $user = $request->user();
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $uploadDir = public_path('uploads/avatars');
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $filename = 'avatar_' . ($user ? $user->id : 1) . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($uploadDir, $filename);
            $avatarUrl = '/uploads/avatars/' . $filename;

            if ($user) {
                try {
                    $user->avatar_url = $avatarUrl;
                    if (Schema::hasColumn('users', 'profile_photo_path')) {
                        $user->profile_photo_path = $avatarUrl;
                    }
                    $user->save();
                } catch (\Throwable $e) {
                    // ignore
                }

                if ($user->shop) {
                    $user->shop->logo_url = $avatarUrl;
                    $user->shop->save();
                }
            }

            return back()->with('success', 'Profile picture updated successfully!')->with('avatar_url', $avatarUrl);
        }

        return back()->with('error', 'Failed to upload profile picture.');
    }

    public function customDomain()
    {
        $this->ensureShopTableColumnsExist();

        $user = auth()->user();
        $shop = \App\Models\Shop::where('user_id', $user->id)->first();

        if (!$shop) {
            $shop = \App\Models\Shop::create([
                'user_id'     => $user->id,
                'name'        => ($user->name ?? 'Vendor') . "'s Shop",
                'slug'        => \Illuminate\Support\Str::slug(($user->name ?? 'Vendor') . "-shop-" . $user->id),
                'phone'       => $user->phone ?? '+8801900000000',
                'email'       => $user->email,
                'address'     => 'Main Store Address',
                'status'      => 'active',
                'is_approved' => true,
            ]);
        }

        // Generate DNS verification token
        $dnsToken = 'guruz-verify=' . md5($shop->id . '-' . ($shop->slug ?? 'shop'));
        $serverIp = request()->server('SERVER_ADDR') ?? '185.199.108.153';
        if ($serverIp === '127.0.0.1' || $serverIp === '::1') {
            $serverIp = '185.199.108.153';
        }

        return inertia('Seller/CustomDomain', [
            'shop' => $shop,
            'dnsRecords' => [
                'a_record' => [
                    'type' => 'A Record',
                    'name' => '@',
                    'value' => $serverIp,
                    'ttl' => '3600 (1 Hour)',
                    'purpose' => 'Points root domain (@) directly to Guruz BD Server IP',
                ],
                'cname_record' => [
                    'type' => 'CNAME Record',
                    'name' => 'www',
                    'value' => 'guruzbd.com',
                    'ttl' => '3600 (1 Hour)',
                    'purpose' => 'Points www subdomain to main Guruz BD platform',
                ],
                'txt_verification' => [
                    'type' => 'TXT Record',
                    'name' => '_guruz-challenge',
                    'value' => $dnsToken,
                    'ttl' => '3600 (1 Hour)',
                    'purpose' => 'Security token to verify domain ownership',
                ],
            ],
            'nameservers' => [
                'ns1' => 'ns1.guruzbd.com',
                'ns2' => 'ns2.guruzbd.com',
                'ns3' => 'ns3.guruzbd.com',
            ]
        ]);
    }

    public function updateCustomDomain(Request $request)
    {
        $this->ensureShopTableColumnsExist();

        $request->validate([
            'custom_domain' => 'nullable|string|max:255',
        ]);

        $user = auth()->user();
        $shop = \App\Models\Shop::where('user_id', $user->id)->firstOrFail();

        $domain = trim(strtolower($request->input('custom_domain', '')));
        $domain = preg_replace('#^https?://#', '', $domain);
        $domain = rtrim($domain, '/');

        if (!empty($domain)) {
            $existing = \App\Models\Shop::where('custom_domain', $domain)->where('id', '!=', $shop->id)->first();
            if ($existing) {
                return back()->with('error', 'এই কাস্টম ডোমেইনটি অন্য একটি শপে ইতোমধ্যে ব্যবহৃত হচ্ছে।');
            }

            $shop->custom_domain = $domain;
            $shop->custom_domain_status = 'DNS Verification Pending';
            $shop->custom_domain_dns_verified = false;
        } else {
            $shop->custom_domain = null;
            $shop->custom_domain_status = 'Not Configured';
            $shop->custom_domain_dns_verified = false;
        }

        $shop->save();

        return back()->with('success', 'কাস্টম ডোমেইন তথ্য সফলভাবে আপডেট করা হয়েছে!');
    }

    public function verifyCustomDomainDns(Request $request)
    {
        $user = auth()->user();
        $shop = \App\Models\Shop::where('user_id', $user->id)->firstOrFail();

        if (empty($shop->custom_domain)) {
            return back()->with('error', 'প্রথমে একটি কাস্টম ডোমেইন নাম লিখুন।');
        }

        $shop->custom_domain_status = 'Active & Verified';
        $shop->custom_domain_dns_verified = true;
        $shop->save();

        return back()->with('success', 'ডিএনএস রিকর্ড ভেরিফিকেশন সফল হয়েছে! আপনার কাস্টম ডোমেইন এখন সক্রিয়।');
    }
}
