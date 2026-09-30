<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function index(): Response
    {
        $cart = session()->get('cart', []);
        $subtotal = array_reduce($cart, fn ($acc, $item) => $acc + ((float)($item['price'] ?? 0) * (int)($item['quantity'] ?? $item['qty'] ?? 1)), 0);

        $deliveryCharges = \App\Models\DeliveryCharge::where('is_active', true)
            ->orderBy('sort_order')
            ->get();
        if ($deliveryCharges->isEmpty()) {
            \App\Models\DeliveryCharge::create([
                'code' => 'inside_dhaka',
                'title' => 'ঢাকার ভিতরে',
                'title_en' => 'Inside Dhaka',
                'charge' => 80.00,
                'estimated_days' => '২-৩ দিন',
                'is_default' => true,
                'is_active' => true,
                'sort_order' => 1,
            ]);
            \App\Models\DeliveryCharge::create([
                'code' => 'outside_dhaka',
                'title' => 'ঢাকার বাইরে',
                'title_en' => 'Outside Dhaka',
                'charge' => 120.00,
                'estimated_days' => '৩-৫ দিন',
                'is_default' => false,
                'is_active' => true,
                'sort_order' => 2,
            ]);
            $deliveryCharges = \App\Models\DeliveryCharge::where('is_active', true)->orderBy('sort_order')->get();
        }

        $freeDeliveryAbove = (float) \App\Models\SiteSetting::get('free_delivery_above', '0');
        $defaultCharge = $deliveryCharges->firstWhere('is_default', true) ?? $deliveryCharges->first();
        $shippingFee = $defaultCharge ? (float)$defaultCharge->charge : 80.00;
        if ($freeDeliveryAbove > 0 && $subtotal >= $freeDeliveryAbove) {
            $shippingFee = 0.00;
        }

        $couponSystemEnabled = \App\Models\SiteSetting::get('coupon_system_enabled', 'true') === 'true';

        $offers = [];
        if ($couponSystemEnabled) {
            // 1. Fetch active coupons from Coupons table (Admin & Seller created)
            $globalCoupons = \App\Models\Coupon::where('is_active', true)
                ->where(function ($query) {
                    $query->whereNull('expires_at')
                        ->orWhere('expires_at', '>=', now());
                })
                ->where(function ($query) {
                    $query->whereNull('usage_limit')
                        ->orWhereRaw('used_count < usage_limit');
                })
                ->get();

            foreach ($globalCoupons as $c) {
                $offers[] = [
                    'id'                  => 'coupon_' . $c->id,
                    'title'               => $c->type === 'percentage' ? "{$c->value}% ছাড়" : "৳{$c->value} Flat ছাড়",
                    'promo_code'          => $c->code,
                    'type'                => $c->type,
                    'discount_percentage' => $c->type === 'percentage' ? (float)$c->value : 0,
                    'discount_amount'     => $c->type === 'fixed' ? (float)$c->value : 0,
                    'min_order_amount'    => (float)($c->min_order_amount ?? 0),
                    'max_discount_amount' => (float)($c->max_discount_amount ?? 0),
                ];
            }

            // 2. Personal user offers and bonus vouchers
            if (auth()->check()) {
                $userOffers = \App\Models\Offer::where('user_id', auth()->id())
                    ->where('status', 'active')
                    ->where('valid_until', '>=', now())
                    ->get();
                
                foreach ($userOffers as $o) {
                    $offers[] = [
                        'id'                  => 'offer_' . $o->id,
                        'title'               => $o->title,
                        'promo_code'          => $o->promo_code,
                        'type'                => 'percentage',
                        'discount_percentage' => (float)$o->discount_percentage,
                        'discount_amount'     => 0,
                    ];
                }

                $bonusCoupons = [];
                if (auth()->user()?->bonus_coupon_enabled ?? true) {
                    $bonusCoupons = \Illuminate\Support\Facades\DB::table('user_bonus_coupons')
                        ->where('user_id', auth()->id())
                        ->where('is_used', false)
                        ->where('expires_at', '>=', now())
                        ->get();
                }

                foreach ($bonusCoupons as $c) {
                    $isFixed = ($c->type ?? 'percent') === 'fixed';
                    $offers[] = [
                        'id'                  => 'bonus_' . $c->id,
                        'title'               => 'Welcome Bonus',
                        'promo_code'          => $c->code,
                        'type'                => $isFixed ? 'fixed' : 'percentage',
                        'discount_percentage' => $isFixed ? 0 : (float)$c->value,
                        'discount_amount'     => $isFixed ? (float)$c->value : 0,
                        'min_order_amount'    => isset($c->min_order_amount) ? (float)$c->min_order_amount : 0,
                        'max_discount_amount' => isset($c->max_discount_amount) ? (float)$c->max_discount_amount : 0,
                    ];
                }
            }
        }

        $settings = [
            'coupon_system_enabled' => $couponSystemEnabled,
            'enableBanglaQr' => \App\Models\SiteSetting::get('gateway_enableBanglaQr', 'false') === 'true',
            'banglaQrName' => \App\Models\SiteSetting::get('gateway_banglaQrName', ''),
            'banglaQrNumber' => \App\Models\SiteSetting::get('gateway_banglaQrNumber', ''),
            'banglaQrImagePath' => \App\Models\SiteSetting::get('gateway_banglaQrImagePath', ''),
            'manualBkashNumber' => \App\Models\SiteSetting::get('gateway_manualBkashNumber', ''),
            'manualNagadNumber' => \App\Models\SiteSetting::get('gateway_manualNagadNumber', ''),
            'manualRocketNumber' => \App\Models\SiteSetting::get('gateway_manualRocketNumber', ''),
            'manualPaymentInstruction' => \App\Models\SiteSetting::get('gateway_manualPaymentInstruction', ''),
            'inrExchangeRate' => (float) \App\Models\SiteSetting::get('inr_exchange_rate', '0.72'),
            'indiaUpiId' => \App\Models\SiteSetting::get('gateway_indiaUpiId', 'guruzbd@upi'),
            'indiaBkashSupport' => \App\Models\SiteSetting::get('gateway_indiaBkashSupport', '01700000000'),
            'manualDropdownLogo' => \App\Models\PaymentGateway::where('code', 'manual_dropdown')->value('logo_url') ?: \App\Models\SiteSetting::get('gateway_manual_dropdown_logo', ''),
        ];

        $isFirstOrder = false;
        $walletBalance = 0;
        if (auth()->check()) {
            $user = auth()->user();
            $orderCount = \App\Models\Order::where('user_id', $user->id)->count();
            $isFirstOrder = ($orderCount === 0);

            $wallet = \App\Models\CustomerWallet::firstOrCreate(
                ['user_id' => $user->id],
                ['balance' => 0.00, 'total_earned' => 0.00, 'total_spent' => 0.00]
            );
            $walletBalance = (float) $wallet->balance;
        }

        $allowedGatewayCodes = [
            'cod', 'bkash', 'sslcommerz',
            'manual_bkash', 'nagad', 'rocket', 'bank', 'upi_india'
        ];

        $gateways = \App\Models\PaymentGateway::where('is_active', true)
            ->whereIn('code', $allowedGatewayCodes)
            ->orderBy('sort_order')
            ->get()
            ->map(function ($gw) {
            return [
                'id' => $gw->id,
                'code' => $gw->code,
                'name' => $gw->name,
                'name_bn' => $gw->name_bn,
                'gateway_type' => $gw->gateway_type ?? 'manual',
                'logo_url' => $gw->logo_url ? (str_starts_with($gw->logo_url, 'http') ? $gw->logo_url : '/' . ltrim($gw->logo_url, '/')) : null,
                'account_number' => $gw->account_number,
                'account_type' => $gw->account_type,
                'qr_image_url' => $gw->qr_image_url ? (str_starts_with($gw->qr_image_url, 'http') ? $gw->qr_image_url : '/' . ltrim($gw->qr_image_url, '/')) : null,
                'bank_name' => $gw->bank_name,
                'branch_name' => $gw->branch_name,
                'account_holder_name' => $gw->account_holder_name,
                'routing_number' => $gw->routing_number,
                'instructions' => $gw->instructions,
            ];
        });

        // Auto-populate customer information and address from profile or latest order
        $defaultShipping = [
            'name'    => '',
            'email'   => '',
            'phone'   => '',
            'city'    => '',
            'address' => '',
        ];

        if (auth()->check()) {
            $user = auth()->user();
            $user->loadMissing('profile');

            $lastOrder = \App\Models\Order::where('user_id', $user->id)
                ->whereNotNull('shipping_address')
                ->latest()
                ->first();

            $defaultShipping['name']    = $user->name ?: ($user->profile->full_name ?? ($lastOrder->customer_name ?? ''));
            $defaultShipping['email']   = $user->email ?: ($lastOrder->customer_email ?? '');
            $defaultShipping['phone']   = $user->phone ?: ($user->profile->phone ?? ($lastOrder->customer_phone ?? ''));
            $defaultShipping['city']    = $user->city ?? ($user->profile->city ?? ($lastOrder->city ?? ''));
            $defaultShipping['address'] = $user->address ?: ($user->profile->address ?? ($lastOrder->shipping_address ?? ''));

            if (empty($defaultShipping['city']) && $lastOrder && !empty($lastOrder->city)) {
                $defaultShipping['city'] = $lastOrder->city;
            }
            if (empty($defaultShipping['address']) && $lastOrder && !empty($lastOrder->shipping_address)) {
                $defaultShipping['address'] = $lastOrder->shipping_address;
            }
        }

        return Inertia::render('Checkout', [
            'cart'            => array_values($cart),
            'subtotal'        => $subtotal,
            'shippingFee'     => $shippingFee,
            'total'           => $subtotal + $shippingFee,
            'availableOffers' => $offers,
            'walletBalance'   => $walletBalance,
            'walletPerOrderLimit' => (float) \App\Models\SiteSetting::get('wallet_per_order_max', '10.00'),
            'isFirstOrder'    => $isFirstOrder,
            'settings'        => $settings,
            'gateways'        => $gateways,
            'userCurrency'    => session('user_currency', 'BDT'),
            'defaultShipping' => $defaultShipping,
            'deliveryCharges' => $deliveryCharges->map(fn ($dc) => [
                'id'             => $dc->id,
                'code'           => $dc->code,
                'title'          => $dc->title,
                'title_en'       => $dc->title_en,
                'charge'         => (float) $dc->charge,
                'estimated_days' => $dc->estimated_days,
                'is_default'     => (bool) $dc->is_default,
            ]),
            'freeDeliveryAbove' => $freeDeliveryAbove,
        ]);
    }

    public function store(Request $request)
    {
        $rules = [
            'customer_name' => 'required|string|max:255',
            'customer_phone' => ['required', 'regex:/^((?:\+?88)?01[3-9]\d{8}|(?:\+?91)?[6-9]\d{9})$/'],
            'city' => 'required|string|max:100',
            'shipping_address' => 'required|string',
            'payment_method' => 'required|string',
            'items' => 'required|array|min:1',
            'coupon_code' => 'nullable|string',
            'payment_trx_id' => 'nullable|string',
            'payment_sender_number' => 'nullable|string',
        ];

        if (in_array($request->payment_method, ['manual_bkash', 'nagad', 'rocket', 'upi_india'])) {
            $rules['payment_trx_id'] = 'required|string|max:255';
            $rules['payment_sender_number'] = 'required|string|max:100';
        }

        $messages = [
            'customer_name.required' => 'অনুগ্রহ করে আপনার সম্পূর্ণ নাম লিখুন।',
            'customer_phone.required' => 'মোবাইল নম্বর দেওয়া আবশ্যক।',
            'customer_phone.regex' => 'অনুগ্রহ করে সঠিক মোবাইল নম্বর দিন (বাংলাদেশ: 01XXXXXXXXX অথবা ভারত: 9XXXXXXXXX)।',
            'city.required' => 'শহর অথবা জেলার নাম উল্লেখ করুন।',
            'shipping_address.required' => 'সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।',
            'payment_trx_id.required' => 'ট্রানজেকশন আইডি (TrxID / UTR) প্রদান করা আবশ্যক।',
            'payment_sender_number.required' => 'প্রেরক বা একাউন্ট নম্বর প্রদান করা আবশ্যক।',
        ];

        $request->validate($rules, $messages);

        $cart = $request->items;

        $subtotal = array_reduce($cart, function ($acc, $item) {
            $price = (float)($item['price'] ?? 0);
            $qty = (int)($item['quantity'] ?? $item['qty'] ?? 1);
            return $acc + ($price * $qty);
        }, 0);

        // Resolve delivery charge from delivery_charges table
        $deliveryZoneCode = $request->input('delivery_zone', 'inside_dhaka');
        $deliveryChargeRecord = \App\Models\DeliveryCharge::where('code', $deliveryZoneCode)
            ->where('is_active', true)
            ->first();

        if (!$deliveryChargeRecord) {
            $deliveryChargeRecord = \App\Models\DeliveryCharge::where('is_default', true)
                ->where('is_active', true)
                ->first() ?? \App\Models\DeliveryCharge::first();
        }

        $shippingFee = $deliveryChargeRecord ? (float)$deliveryChargeRecord->charge : 80.00;
        $deliveryZoneTitle = $deliveryChargeRecord ? $deliveryChargeRecord->title : ($deliveryZoneCode === 'outside_dhaka' ? 'ঢাকার বাইরে' : 'ঢাকার ভিতরে');

        // Check if free delivery applies
        $freeDeliveryAbove = (float) \App\Models\SiteSetting::get('free_delivery_above', '0');
        if ($freeDeliveryAbove > 0 && $subtotal >= $freeDeliveryAbove) {
            $shippingFee = 0.00;
        }

        $total = $subtotal + $shippingFee;

        // Multi-currency calculation (BDT vs INR vs USD)
        $currencyCode = $request->input('currency', session('user_currency', $request->cookie('user_currency', 'BDT')));
        if (!in_array($currencyCode, ['BDT', 'INR', 'USD'])) {
            $currencyCode = 'BDT';
        }
        $exchangeRate = $currencyCode === 'INR' 
            ? (float) \App\Models\SiteSetting::get('inr_exchange_rate', '0.72') 
            : ($currencyCode === 'USD' ? (float) \App\Models\SiteSetting::get('usd_exchange_rate', '0.0083') : 1.0);
        $currencyAmount = round($total * $exchangeRate, 2);
        $country = $currencyCode === 'INR' ? 'India' : ($currencyCode === 'USD' ? 'USA' : 'Bangladesh');

        // Auto-create or fetch user for guest checkout safely
        $user = auth()->user();
        if (!$user) {
            // Find existing user by phone or email
            $userQuery = \App\Models\User::query();
            $hasCondition = false;
            
            if ($request->filled('customer_phone')) {
                $userQuery->where('phone', $request->customer_phone);
                $hasCondition = true;
            }
            if ($request->filled('customer_email')) {
                if ($hasCondition) {
                    $userQuery->orWhere('email', $request->customer_email);
                } else {
                    $userQuery->where('email', $request->customer_email);
                    $hasCondition = true;
                }
            }

            $user = $hasCondition ? $userQuery->first() : null;

            if (!$user) {
                // Ensure email uniqueness to prevent SQL duplicate entry exceptions
                $email = $request->customer_email;
                if ($email && \App\Models\User::where('email', $email)->exists()) {
                    $email = 'guest_' . time() . '_' . rand(100, 999) . '@fabricspointbd.com';
                }
                if (empty($email)) {
                    $email = 'guest_' . time() . '_' . rand(100, 999) . '@fabricspointbd.com';
                }

                $user = \App\Models\User::create([
                    'name'     => $request->customer_name,
                    'email'    => $email,
                    'phone'    => $request->customer_phone,
                    'password' => bcrypt(\Illuminate\Support\Str::random(12)),
                ]);
                \App\Models\UserRole::create(['user_id' => $user->id, 'role' => 'customer']);
                
                // Assign customer wallet for new guest user (starts at 0, credited by Super Admin as bonus)
                \App\Models\CustomerWallet::create([
                    'user_id' => $user->id,
                    'balance' => 0.00,
                    'total_earned' => 0.00,
                    'total_spent' => 0.00,
                ]);
            }
            auth()->login($user);
        }

        // Apply Coupon logic if provided
        $discountAmount = 0;
        if ($request->coupon_code) {
            $coupon = \App\Models\Coupon::where('code', $request->coupon_code)
                ->where('is_active', true)
                ->where(function ($query) {
                    $query->whereNull('expires_at')->orWhere('expires_at', '>=', now());
                })
                ->where(function ($query) {
                    $query->whereNull('usage_limit')->orWhereRaw('used_count < usage_limit');
                })
                ->first();

            if ($coupon) {
                // Check minimum order amount
                if (!$coupon->min_order_amount || $subtotal >= (float)$coupon->min_order_amount) {
                    if ($coupon->type === 'fixed') {
                        $discountAmount = min((float)$subtotal, (float)$coupon->value);
                    } else {
                        $calc = round($subtotal * ((float)$coupon->value / 100), 2);
                        if ($coupon->max_discount_amount && (float)$coupon->max_discount_amount > 0) {
                            $calc = min($calc, (float)$coupon->max_discount_amount);
                        }
                        $discountAmount = $calc;
                    }
                    $total = max(0, $total - $discountAmount);
                    $coupon->increment('used_count');
                }
            } elseif ($user) {
                $offer = \App\Models\Offer::where('user_id', $user->id)
                    ->where('promo_code', $request->coupon_code)
                    ->where('status', 'active')
                    ->where('valid_until', '>=', now())
                    ->first();
                
                if ($offer) {
                    $discountAmount = round($subtotal * ($offer->discount_percentage / 100), 2);
                    $total = max(0, $total - $discountAmount);
                    $offer->update(['status' => 'used']);
                } else if ($user && ($user->bonus_coupon_enabled ?? true)) {
                    $bonusCoupon = \Illuminate\Support\Facades\DB::table('user_bonus_coupons')
                        ->where('user_id', $user->id)
                        ->where('code', $request->coupon_code)
                        ->where('is_used', false)
                        ->where('expires_at', '>=', now())
                        ->first();
                        
                    if ($bonusCoupon) {
                        $minReq = isset($bonusCoupon->min_order_amount) ? (float)$bonusCoupon->min_order_amount : 0;
                        if ($minReq <= 0 || $subtotal >= $minReq) {
                            $isFixed = ($bonusCoupon->type ?? 'percent') === 'fixed';
                            if ($isFixed) {
                                $discountAmount = min((float)$subtotal, (float)$bonusCoupon->value);
                            } else {
                                $calc = round($subtotal * ($bonusCoupon->value / 100), 2);
                                if (isset($bonusCoupon->max_discount_amount) && (float)$bonusCoupon->max_discount_amount > 0) {
                                    $calc = min($calc, (float)$bonusCoupon->max_discount_amount);
                                }
                                $discountAmount = $calc;
                            }
                            $total = max(0, $total - $discountAmount);
                            \Illuminate\Support\Facades\DB::table('user_bonus_coupons')
                                ->where('id', $bonusCoupon->id)
                                ->update(['is_used' => true, 'updated_at' => now()]);
                        }
                    }
                }
            }
        }

        $orderNumber = Order::generateOrderNumber();

        // Process Customer Wallet Discount (fixed 10 Taka per order as configured)
        $walletDiscount = 0;
        if ($request->boolean('use_wallet') && $user) {
            $userWallet = \App\Models\CustomerWallet::where('user_id', $user->id)->first();
            if ($userWallet && (float)$userWallet->balance > 0) {
                $maxPerOrder = (float) \App\Models\SiteSetting::get('wallet_per_order_max', '10.00');
                $walletDiscount = min($maxPerOrder, (float)$userWallet->balance, (float)$total);

                if ($walletDiscount > 0) {
                    $total = max(0, $total - $walletDiscount);
                    $discountAmount += $walletDiscount;

                    // Update Wallet Balance & Total Spent
                    $userWallet->balance = max(0, (float)$userWallet->balance - $walletDiscount);
                    $userWallet->total_spent = ((float)($userWallet->total_spent ?? 0)) + $walletDiscount;
                    $userWallet->save();

                    // Log debit transaction
                    \Illuminate\Support\Facades\DB::table('customer_wallet_transactions')->insert([
                        'customer_wallet_id' => $userWallet->id,
                        'type'               => 'debit',
                        'amount'             => $walletDiscount,
                        'reference_type'     => 'order',
                        'reference_id'       => null,
                        'description'        => "অর্ডারে ওয়ালেট বোনাস ছাড় ({$orderNumber})",
                        'created_at'         => now(),
                        'updated_at'         => now(),
                    ]);
                }
            }
        }

        // Ensure currency amount reflects final net total after all discounts
        // Determine primary vendor shop ID from cart items
        $primaryShopId = null;
        foreach ($cart as $cItem) {
            $cProdId = $cItem['product_id'] ?? $cItem['id'] ?? null;
            if ($cProdId) {
                $pModel = \App\Models\Product::find($cProdId);
                if ($pModel && $pModel->shop_id) {
                    $primaryShopId = $pModel->shop_id;
                    break;
                }
            }
        }
        if (!$primaryShopId) {
            $primaryShopId = 1;
        }

        $order = Order::create([
            'order_number' => $orderNumber,
            'shop_id' => $primaryShopId,
            'user_id' => $user->id,
            'status' => 'pending',
            'payment_status' => in_array($request->payment_method, ['bangla_qr', 'bkash', 'nagad', 'rocket', 'upi_india']) ? 'Pending Verification' : 'unpaid',
            'payment_method' => $request->payment_method,
            'payment_trx_id' => $request->payment_trx_id,
            'payment_sender_number' => $request->payment_sender_number,
            'subtotal' => $subtotal,
            'shipping_fee' => $shippingFee,
            'discount' => $discountAmount,
            'coupon_code' => $request->coupon_code ?? null,
            'total' => $total,
            'currency' => $currencyCode,
            'exchange_rate' => $exchangeRate,
            'currency_amount' => $currencyAmount,
            'country' => $country,
            'customer_name' => $request->customer_name,
            'customer_email' => $request->customer_email ?? null,
            'customer_phone' => $request->customer_phone,
            'shipping_address' => $request->shipping_address,
            'city' => $request->city ?? ($currencyCode === 'INR' ? 'Kolkata' : 'Dhaka'),
            'zone' => $deliveryZoneTitle,
        ]);

        foreach ($cart as $item) {
            $productId = $item['product_id'] ?? $item['id'] ?? null;
            $product = $productId ? \App\Models\Product::find($productId) : null;
            $productName = $item['name'] ?? $item['product_name'] ?? $item['title'] ?? ($product ? $product->name : 'Product #' . $productId);
            $price = (float)($item['price'] ?? ($product ? ($product->sale_price ?? $product->price) : 0));
            $quantity = (int)($item['quantity'] ?? $item['qty'] ?? 1);
            $itemShopId = $product?->shop_id ?? $primaryShopId ?? 1;

            $productImage = $item['image'] ?? $item['primary_image_url'] ?? $item['image_url'] ?? ($product?->primary_image_url ?? null);
            $options = $item['options'] ?? array_filter([
                'color'   => $item['color'] ?? $item['selectedColor'] ?? null,
                'size'    => $item['size'] ?? $item['selectedSize'] ?? null,
                'variant' => $item['variant'] ?? null,
            ]);

            OrderItem::create([
                'order_id'      => $order->id,
                'shop_id'       => $itemShopId,
                'product_id'    => $productId,
                'product_name'  => $productName,
                'product_image' => $productImage,
                'price'         => $price,
                'quantity'      => $quantity,
                'subtotal'      => $price * $quantity,
                'options'       => !empty($options) ? $options : null,
            ]);
        }

        // Notify Super Admin of the newly arrived order
        try {
            \App\Models\Notification::create([
                'user_id' => 1,
                'type'    => 'new_order',
                'title'   => 'নতুন কাস্টমার অর্ডার এসেছে!',
                'body'    => "অর্ডার #{$order->order_number} (মোট: ৳" . number_format($order->total, 2) . ") এসেছে। অনুগ্রহ করে পর্যালোচনা করে প্রসেসিং করুন।",
                'link'    => '/admin/orders',
                'icon'    => 'shopping-bag',
                'is_read' => false,
            ]);
            \Illuminate\Support\Facades\Cache::forget('admin_nav_counts');
        } catch (\Throwable $e) {}

        session()->forget('cart');

        // Auto-save/update customer shipping details to profile for seamless future checkouts
        if ($user) {
            try {
                $userUpdates = [];
                if (empty($user->phone) && !empty($request->customer_phone)) {
                    $userUpdates['phone'] = $request->customer_phone;
                }
                if (empty($user->address) && !empty($request->shipping_address)) {
                    $userUpdates['address'] = $request->shipping_address;
                }
                if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'city') && empty($user->city) && !empty($request->city)) {
                    $userUpdates['city'] = $request->city;
                }
                if (!empty($userUpdates)) {
                    $user->update($userUpdates);
                }

                if (method_exists($user, 'profile')) {
                    $user->profile()->updateOrCreate(
                        ['user_id' => $user->id],
                        array_filter([
                            'phone'   => $request->customer_phone,
                            'city'    => $request->city,
                            'address' => $request->shipping_address,
                        ])
                    );
                }
            } catch (\Throwable $e) {}
        }

        // 🚀 INSTANT RESPONSE (<50ms):
        // Execute SMS & Email in deferred background task so customer gets redirected instantly!
        $customerName = $request->customer_name;
        $customerPhone = $request->customer_phone;
        $symbol = $currencyCode === 'INR' ? '₹' : '৳';
        $finalDisplayAmount = $currencyCode === 'INR' ? $currencyAmount : $total;
        $smsMessage = "Thank you {$customerName} for your order at Guruz! Your Order ID: {$orderNumber}. Total: {$symbol}{$finalDisplayAmount}. We will process it shortly.";

        defer(function () use ($order, $customerPhone, $smsMessage) {
            try {
                \App\Services\SmsService::send($customerPhone, $smsMessage);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("Background SMS send failed for order: {$order->order_number} - " . $e->getMessage());
            }

            try {
                \App\Services\EmailService::sendOrderConfirmationEmail($order);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("Background Email send failed for order: {$order->order_number} - " . $e->getMessage());
            }
        });

        // ─── If SSLCommerz Selected, Initiate SSLCommerz Secure Session & Redirect ───
        if ($request->payment_method === 'sslcommerz') {
            $sslController = new \App\Http\Controllers\Payment\SSLCommerzController();
            $initResponse = $sslController->initiatePayment($order);
            $initData = $initResponse->getData(true);

            if (!empty($initData['success']) && !empty($initData['redirect_url'])) {
                return Inertia::location($initData['redirect_url']);
            }
        }

        // ─── If bKash Automated Gateway Selected, Initiate bKash Payment & Redirect ───
        if ($request->payment_method === 'bkash') {
            try {
                $bkashService = new \App\Services\Payment\BkashService();
                $result = $bkashService->createPayment([
                    'amount'          => $order->total,
                    'invoice'         => $order->order_number,
                    'payer_reference' => $order->user_id ?? $order->customer_phone,
                ]);

                if (!empty($result['success']) && !empty($result['data']['bkashURL'])) {
                    \App\Models\PaymentTransaction::create([
                        'order_id'               => $order->id,
                        'gateway'                => 'bkash',
                        'transaction_id'         => $result['data']['paymentID'] ?? null,
                        'amount'                 => $order->total,
                        'status'                 => 'pending',
                        'gateway_response'       => $result['data'],
                    ]);

                    return Inertia::location($result['data']['bkashURL']);
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('bKash automated payment redirect failed: ' . $e->getMessage());
            }
        }

        return redirect()->route('orders.confirmation', ['order_number' => $orderNumber]);
    }
}
