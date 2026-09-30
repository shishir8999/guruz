<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user();

        // Fetch recent orders safely
        $recentOrders = [];
        try {
            $recentOrders = $user->orders()
                ->with('items')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn($o) => [
                    'id'            => $o->id,
                    'order_number'  => $o->order_number ?? ('GZ-' . str_pad($o->id, 6, '0', STR_PAD_LEFT)),
                    'total'         => $o->total ?? 0,
                    'status'        => $o->status ?? 'pending',
                    'created_at'    => $o->created_at->toDateTimeString(),
                    'items_count'   => $o->items->count(),
                ])
                ->toArray();
        } catch (\Exception $e) {
            $recentOrders = [];
        }

        $stats = [
            'total_orders'  => 0,
            'in_progress'   => 0,
            'delivered'     => 0,
            'total_spent'   => 0,
        ];

        try {
            $orders = $user->orders()->get();
            $stats = [
                'total_orders'  => $orders->count(),
                'in_progress'   => $orders->whereIn('status', ['processing', 'shipped'])->count(),
                'delivered'     => $orders->where('status', 'delivered')->count(),
                'total_spent'   => $orders->sum('total'),
            ];
        } catch (\Exception $e) {}

        $coupons = [];
        $isCouponEnabled = (bool) ($user->bonus_coupon_enabled ?? true);

        if ($isCouponEnabled) {
            try {
                $user->ensureBonusCoupon();
            } catch (\Throwable $e) {}

            $coupons = \Illuminate\Support\Facades\DB::table('user_bonus_coupons')
                ->where('user_id', $user->id)
                ->where('is_used', false)
                ->where('expires_at', '>', now())
                ->get()
                ->map(function($c) {
                    $expiresAt = \Carbon\Carbon::parse($c->expires_at);
                    $diffSeconds = max(0, now()->diffInSeconds($expiresAt, false));
                    return [
                        'id'                  => $c->id,
                        'code'                => $c->code,
                        'type'                => $c->type ?? 'percent',
                        'discount'            => (float) $c->value,
                        'min_order_amount'    => isset($c->min_order_amount) ? (float) $c->min_order_amount : 0,
                        'max_discount_amount' => isset($c->max_discount_amount) ? (float) $c->max_discount_amount : 0,
                        'expires_at'          => $expiresAt->toIso8601String(),
                        'valid_till'          => $expiresAt->format('d/m/Y h:i A'),
                        'remaining_seconds'   => (int) $diffSeconds,
                    ];
                })
                ->toArray();
        }

        $bonusCouponMessage = [
            'title'       => \App\Models\SiteSetting::get('bonus_coupon_empty_title', 'প্রিয় গ্রাহক, আমাদের সাথেই থাকুন!'),
            'description' => \App\Models\SiteSetting::get('bonus_coupon_empty_description', 'আপনার জন্য আকর্ষণীয় বোনাস কুপন ও স্পেশাল সারপ্রাইজ অফার খুব শীঘ্রই আসছে। নিয়মিত কেনাকাটায় চোখ রাখুন দারুণ সব ছাড়ে!'),
            'badge'       => \App\Models\SiteSetting::get('bonus_coupon_empty_badge', 'ধামাকা অফার লোড হচ্ছে...'),
            'icon'        => \App\Models\SiteSetting::get('bonus_coupon_empty_icon', '🎁'),
        ];

        return Inertia::render('Account/Dashboard', [
            'user'                 => [
                'name'      => $user->name,
                'email'     => $user->email,
                'avatar'    => $user->avatar ?? null,
            ],
            'stats'                => $stats,
            'recent_orders'        => $recentOrders,
            'coupons'              => $coupons,
            'bonus_coupon_enabled' => $isCouponEnabled,
            'bonus_coupon_message' => $bonusCouponMessage,
        ]);
    }

    public function offers(Request $request)
    {
        $userId = auth()->id();

        $offers = \App\Models\Offer::where(function($q) use ($userId) {
                $q->where('user_id', $userId)->orWhereNull('user_id');
            })
            ->where('status', 'active')
            ->where(function($q) {
                $q->whereNull('valid_until')->orWhere('valid_until', '>=', now());
            })
            ->latest()
            ->get()
            ->map(function($o) {
                return [
                    'id'                  => $o->id,
                    'title'               => $o->title,
                    'description'         => $o->description,
                    'promo_code'          => $o->promo_code,
                    'discount_percentage' => (float) $o->discount_percentage,
                    'valid_until'         => $o->valid_until ? \Carbon\Carbon::parse($o->valid_until)->format('d M Y') : 'Unlimited',
                    'status'              => $o->status,
                ];
            });

        return Inertia::render('Account/Offers', [
            'offers' => $offers,
        ]);
    }

    public function notifications(Request $request)
    {
        $userId = auth()->id();

        if ($userId) {
            // 1. Immediately mark all user notifications as read in database upon opening this page!
            \App\Models\Notification::where('user_id', $userId)
                ->where(function($q) {
                    $q->where('is_read', false)->orWhereNull('is_read');
                })
                ->update(['is_read' => true]);

            $nowStr = now()->toDateTimeString();
            session()->put('customer_viewed_notifications_' . $userId, $nowStr);
            session()->save();
            \Illuminate\Support\Facades\Cache::forever('customer_viewed_notifications_' . $userId, $nowStr);
        }

        // 2. Fetch user notifications (all are now marked as read)
        $userNotifications = \App\Models\Notification::where('user_id', $userId)->latest()->get()->map(function($notif) {
            $notif->is_read = true;
            return $notif;
        });

        // 3. System notifications are all considered read for this view
        $systemNotifications = \App\Models\SystemNotification::where('active', true)->latest()->get()->map(function($sysNotif) {
            return [
                'id' => 'sys_' . $sysNotif->id,
                'type' => 'system',
                'title' => $sysNotif->title,
                'body' => $sysNotif->message,
                'link' => '/account/offers',
                'icon' => 'Megaphone',
                'is_read' => true,
                'created_at' => $sysNotif->created_at,
            ];
        });

        // Merge and sort by created_at descending
        $allNotifications = $userNotifications->concat($systemNotifications)->sortByDesc('created_at')->values();

        return Inertia::render('Account/Notifications', [
            'notifications' => $allNotifications,
        ]);
    }

    public function readNotification(Request $request, $id)
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['success' => false], 401);
        }

        $nowStr = now()->toDateTimeString();
        if (str_starts_with((string)$id, 'sys_')) {
            session()->put('customer_viewed_notifications_' . $userId, $nowStr);
            session()->save();
            \Illuminate\Support\Facades\Cache::forever('customer_viewed_notifications_' . $userId, $nowStr);
            return response()->json(['success' => true]);
        }

        $notification = \App\Models\Notification::where('id', $id)->where('user_id', $userId)->first();
        if ($notification) {
            $notification->update(['is_read' => true]);
        }

        session()->put('customer_viewed_notifications_' . $userId, $nowStr);
        session()->save();
        \Illuminate\Support\Facades\Cache::forever('customer_viewed_notifications_' . $userId, $nowStr);

        return response()->json(['success' => true]);
    }

    public function markAllNotificationsRead(Request $request)
    {
        $userId = auth()->id();
        if ($userId) {
            \App\Models\Notification::where('user_id', $userId)->update(['is_read' => true]);
            $nowStr = now()->toDateTimeString();
            session()->put('customer_viewed_notifications_' . $userId, $nowStr);
            session()->save();
            \Illuminate\Support\Facades\Cache::forever('customer_viewed_notifications_' . $userId, $nowStr);
        }

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['success' => true, 'unread_count' => 0]);
        }

        return back()->with('success', 'সকল নোটিফিকেশন পঠিত হিসেবে চিহ্নিত করা হয়েছে।');
    }

    public function orders(Request $request)
    {
        $user = $request->user();

        $orders = \App\Models\Order::with(['items.product', 'items'])
            ->where(function($q) use ($user) {
                $q->where('user_id', $user->id);
                if ($user->email) {
                    $q->orWhere('customer_email', $user->email);
                }
                if ($user->phone) {
                    $q->orWhere('customer_phone', $user->phone);
                }
            })
            ->latest()
            ->get()
            ->map(function ($o) {
                $status = strtolower($o->status ?? 'pending');
                $createdAt = $o->created_at ? \Carbon\Carbon::parse($o->created_at) : now();
                $hoursDiff = $createdAt->diffInHours(now(), false);
                $isWithin12Hours = $hoursDiff < 12;
                $isProcessingOrPending = in_array($status, ['pending', 'processing', 'to pay', 'to accept']);
                $canCancel = $isProcessingOrPending && $isWithin12Hours;
                $remainingCancelMinutes = $canCancel ? max(0, (12 * 60) - $createdAt->diffInMinutes(now(), false)) : 0;
                $hoursRemaining = floor($remainingCancelMinutes / 60);
                $minsRemaining = $remainingCancelMinutes % 60;
                $cancelRemainingText = $canCancel ? ($hoursRemaining > 0 ? "{$hoursRemaining} ঘণ্টা {$minsRemaining} মিনিট বাকি" : "{$minsRemaining} মিনিট বাকি") : null;

                return [
                    'id'                    => $o->id,
                    'order_number'          => $o->order_number ?? ('GZ-' . str_pad($o->id, 6, '0', STR_PAD_LEFT)),
                    'status'                => $status,
                    'total'                 => (float) ($o->total ?? 0),
                    'payment_status'        => $o->payment_status ?? 'unpaid',
                    'created_at'            => $o->created_at ? $o->created_at->toDateTimeString() : now()->toDateTimeString(),
                    'delivered_at'          => $o->delivered_at ? $o->delivered_at->toDateTimeString() : null,
                    'items_count'           => $o->items->count(),
                    'can_cancel'            => $canCancel,
                    'cancel_remaining_text' => $cancelRemainingText,
                    'is_past_12_hours'      => !$isWithin12Hours && $isProcessingOrPending,
                    'items'          => $o->items->map(function ($item) {
                        return [
                            'id'           => $item->id,
                            'product_name' => $item->product_name ?? ($item->product->name ?? 'Product Item'),
                            'quantity'     => (int) ($item->quantity ?? 1),
                            'price'        => (float) ($item->price ?? 0),
                            'subtotal'     => (float) ($item->subtotal ?? ($item->price * ($item->quantity ?? 1))),
                            'image'        => $item->image_url ?? ($item->product->primary_image_url ?? ($item->product->image_url ?? null)),
                        ];
                    })->values()->toArray(),
                ];
            })
            ->values()
            ->toArray();

        return Inertia::render('Account/Orders', [
            'orders' => $orders,
        ]);
    }

    public function orderDetails(Request $request, $orderId)
    {
        $user = auth()->user();

        $order = \App\Models\Order::with(['items.product', 'items'])
            ->where(function($q) use ($orderId) {
                $q->where('id', $orderId)
                  ->orWhere('order_number', $orderId);
            })
            ->first();

        if (!$order) {
            abort(404, 'অর্ডারটি খুঁজে পাওয়া যায়নি');
        }

        $status = strtolower($order->status ?? 'pending');
        $createdAt = $order->created_at ? \Carbon\Carbon::parse($order->created_at) : now();
        $hoursDiff = $createdAt->diffInHours(now(), false);
        $isWithin12Hours = $hoursDiff < 12;
        $isProcessingOrPending = in_array($status, ['pending', 'processing', 'to pay', 'to accept']);
        $canCancel = $isProcessingOrPending && $isWithin12Hours;
        $remainingCancelMinutes = $canCancel ? max(0, (12 * 60) - $createdAt->diffInMinutes(now(), false)) : 0;
        $hoursRemaining = floor($remainingCancelMinutes / 60);
        $minsRemaining = $remainingCancelMinutes % 60;
        $cancelRemainingText = $canCancel ? ($hoursRemaining > 0 ? "{$hoursRemaining} ঘণ্টা {$minsRemaining} মিনিট বাকি" : "{$minsRemaining} মিনিট বাকি") : null;

        return Inertia::render('Account/OrderDetails', [
            'order' => [
                'id'                  => $order->id,
                'order_number'        => $order->order_number ?? ('GZ-' . str_pad($order->id, 6, '0', STR_PAD_LEFT)),
                'status'              => $status,
                'total'               => (float) ($order->total ?? 0),
                'payment_status'      => $order->payment_status ?? 'unpaid',
                'created_at'          => $order->created_at ? $order->created_at->toDateTimeString() : now()->toDateTimeString(),
                'delivered_at'        => $order->delivered_at ? $order->delivered_at->toDateTimeString() : null,
                'courier_name'        => $order->courier_name ?? null,
                'courier_tracking_id' => $order->courier_tracking_id ?? null,
                'can_cancel'          => $canCancel,
                'cancel_remaining_text' => $cancelRemainingText,
                'is_past_12_hours'    => !$isWithin12Hours && $isProcessingOrPending,
                'items'               => $order->items->map(function ($item) {
                    return [
                        'id'           => $item->id,
                        'product_name' => $item->product_name ?? ($item->product->name ?? 'Product Item'),
                        'quantity'     => (int) ($item->quantity ?? 1),
                        'price'        => (float) ($item->price ?? 0),
                        'subtotal'     => (float) ($item->subtotal ?? ($item->price * ($item->quantity ?? 1))),
                        'image'        => $item->image_url ?? ($item->product->image_url ?? null),
                    ];
                })->values()->toArray(),
            ],
        ]);
    }

    public function cancelOrder(Request $request, $orderId)
    {
        $user = auth()->user();
        $realOrderId = is_object($orderId) ? $orderId->id : $orderId;

        $order = \App\Models\Order::where(function ($q) use ($realOrderId) {
            $q->where('id', $realOrderId)
              ->orWhere('order_number', $realOrderId);
        })->where(function ($q) use ($user) {
            $q->where('user_id', $user->id);
            if ($user->email) {
                $q->orWhere('customer_email', $user->email);
            }
            if ($user->phone) {
                $q->orWhere('customer_phone', $user->phone);
            }
        })->firstOrFail();

        $status = strtolower($order->status ?? 'pending');

        if (!in_array($status, ['pending', 'processing', 'to pay', 'to accept'])) {
            return back()->with('error', 'এই অর্ডারটি ইতিমধ্যে ' . ucfirst($status) . ' অবস্থায় রয়েছে, তাই এটি বাতিল করা সম্ভব নয়।');
        }

        $createdAt = $order->created_at ? \Carbon\Carbon::parse($order->created_at) : now();
        if ($createdAt->diffInHours(now(), false) >= 12) {
            return back()->with('error', 'অর্ডার করার ১২ ঘণ্টা পার হয়ে যাওয়ায় অর্ডারটি বাতিল করার সময়সীমা শেষ হয়ে গেছে।');
        }

        // Cancel the order
        $order->status = 'cancelled';
        $currentPaymentStatus = strtolower($order->payment_status ?? 'unpaid');
        if (in_array($currentPaymentStatus, ['paid', 'completed'])) {
            $order->payment_status = 'refunded';
        }
        // If unpaid, keep it as 'unpaid' — no need to change
        $order->save();

        // 1. If customer spent from Guruz Wallet on this order, refund the amount
        try {
            $walletDebit = \Illuminate\Support\Facades\DB::table('customer_wallet_transactions')
                ->where('description', 'like', "%{$order->order_number}%")
                ->where('type', 'debit')
                ->latest()
                ->first();

            if ($walletDebit && (float)$walletDebit->amount > 0) {
                $refundAmount = (float)$walletDebit->amount;
                $userWallet = \App\Models\CustomerWallet::where('user_id', $user->id)->first();
                if ($userWallet) {
                    $userWallet->balance += $refundAmount;
                    $userWallet->total_spent = max(0, (float)($userWallet->total_spent ?? 0) - $refundAmount);
                    $userWallet->save();

                    \Illuminate\Support\Facades\DB::table('customer_wallet_transactions')->insert([
                        'customer_wallet_id' => $userWallet->id,
                        'type'               => 'credit',
                        'amount'             => $refundAmount,
                        'description'        => "অর্ডার বাতিল বাবদ ওয়ালেট রিফান্ড ({$order->order_number})",
                        'created_at'         => now(),
                        'updated_at'         => now(),
                    ]);
                }
            }
        } catch (\Throwable $e) {}

        // 2. Restore any used bonus coupon
        try {
            \Illuminate\Support\Facades\DB::table('user_bonus_coupons')
                ->where('user_id', $user->id)
                ->where('is_used', true)
                ->update(['is_used' => false, 'updated_at' => now()]);
        } catch (\Throwable $e) {}

        // 3. Send Notification to user
        try {
            \App\Models\Notification::create([
                'user_id' => $user->id,
                'title'   => 'অর্ডার বাতিল সফল হয়েছে',
                'message' => "আপনার অর্ডার #{$order->order_number} সফলভাবে বাতিল করা হয়েছে।",
                'type'    => 'order_cancelled',
                'link'    => '/account/orders',
                'is_read' => false,
            ]);
        } catch (\Throwable $e) {}

        return back()->with('success', "অর্ডার #{$order->order_number} সফলভাবে বাতিল করা হয়েছে।");
    }

    public function requestReturn(Request $request, $orderId)
    {
        $order = \App\Models\Order::where('id', $orderId)->where('user_id', auth()->id())->firstOrFail();
        
        if ($order->status !== 'delivered') {
            return back()->with('error', 'Only delivered orders can be returned.');
        }

        if ($order->delivered_at && now()->diffInDays($order->delivered_at) > 7) {
            return back()->with('error', 'Return window (7 days) has expired.');
        }

        $order->update(['status' => 'returned']);
        
        return back()->with('success', 'Return request submitted successfully.');
    }

    public function wallet(Request $request)
    {
        $userId = auth()->id();

        $wallet = \App\Models\CustomerWallet::firstOrCreate(
            ['user_id' => $userId],
            ['balance' => 100.00, 'points' => 100, 'tier' => 'bronze']
        );

        // Ensure at least 1 transaction exists for welcome bonus
        $transactionsCount = \Illuminate\Support\Facades\DB::table('customer_wallet_transactions')
            ->where('customer_wallet_id', $wallet->id)
            ->count();

        if ($transactionsCount === 0) {
            \Illuminate\Support\Facades\DB::table('customer_wallet_transactions')->insert([
                'customer_wallet_id' => $wallet->id,
                'type' => 'credit',
                'amount' => 100.00,
                'description' => 'স্বাগতম সাইনআপ বোনাস',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $transactions = \Illuminate\Support\Facades\DB::table('customer_wallet_transactions')
            ->where('customer_wallet_id', $wallet->id)
            ->latest()
            ->get();

        $totalEarned = \Illuminate\Support\Facades\DB::table('customer_wallet_transactions')
            ->where('customer_wallet_id', $wallet->id)
            ->where('type', 'credit')
            ->sum('amount');

        $totalSpent = \Illuminate\Support\Facades\DB::table('customer_wallet_transactions')
            ->where('customer_wallet_id', $wallet->id)
            ->where('type', 'debit')
            ->sum('amount');

        return Inertia::render('Account/Wallet', [
            'wallet' => [
                'balance' => (float) $wallet->balance,
                'total_earned' => (float) ($totalEarned ?: 100.00),
                'total_spent' => (float) ($totalSpent ?: 0.00),
            ],
            'transactions' => $transactions,
        ]);
    }

    public function loyalty(Request $request)
    {
        $user = $request->user();
        $completedOrdersCount = $user->orders()->whereIn('status', ['delivered', 'completed', 'shipped', 'processing', 'pending'])->count();

        // Dynamically compute user's vip level based on actual order count
        $tiers = \App\Models\User::getVipTiers();
        $currentTierName = 'Beginner';
        $nextTierName = null;
        $ordersToNext = 0;

        foreach ($tiers as $index => $t) {
            $min = (int)($t['min_orders'] ?? 0);
            if ($completedOrdersCount >= $min) {
                $currentTierName = $t['name'];
                if (isset($tiers[$index + 1])) {
                    $nextTierName = $tiers[$index + 1]['name'];
                    $ordersToNext = (int)($tiers[$index + 1]['min_orders'] ?? 0) - $completedOrdersCount;
                } else {
                    $nextTierName = null;
                    $ordersToNext = 0;
                }
            }
        }

        return Inertia::render('Account/Loyalty', [
            'user' => [
                'name'                   => $user->name,
                'email'                  => $user->email,
                'vip_level'              => $currentTierName,
                'completed_orders_count' => $completedOrdersCount,
                'next_vip_level'         => $nextTierName,
                'orders_to_next_level'   => max(0, $ordersToNext),
            ],
            'tiers' => $tiers,
        ]);
    }

    public function messages(Request $request)
    {
        $userId = auth()->id();

        // 1. Mark all incoming unread messages as read upon opening chat
        \App\Models\Message::where('receiver_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        try {
            \App\Models\LiveChatThread::where('user_id', $userId)
                ->update(['unread_user_count' => 0]);
            
            $threadIds = \App\Models\LiveChatThread::where('user_id', $userId)->pluck('id');
            if ($threadIds->isNotEmpty()) {
                \App\Models\LiveChatMessage::whereIn('live_chat_thread_id', $threadIds)
                    ->where('sender_type', '!=', 'customer')
                    ->where('is_read', false)
                    ->update(['is_read' => true]);
            }
        } catch (\Throwable $e) {}

        \Illuminate\Support\Facades\Cache::forget("user_unread_messages_{$userId}");

        $adminUser = \App\Models\User::where('email', 'shishirbarai2050@gmail.com')
            ->orWhere('id', 1)
            ->first();

        $siteLogo = \App\Models\SiteSetting::get('site_logo');
        $adminAvatar = $adminUser?->avatar_url ?? ($siteLogo ? (str_starts_with($siteLogo, 'http') || str_starts_with($siteLogo, '/') ? $siteLogo : '/storage/' . $siteLogo) : null);

        $messages = \App\Models\Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($msg) use ($userId, $adminUser) {
                $sender = \App\Models\User::find($msg->sender_id);
                $isAdminReply = ($msg->sender_id == 1) || ($adminUser && $msg->sender_id == $adminUser->id) || ($sender && method_exists($sender, 'isAdmin') && $sender->isAdmin());

                return [
                    'id'             => $msg->id,
                    'body'           => $msg->body,
                    'is_me'          => !$isAdminReply,
                    'is_admin_reply' => $isAdminReply,
                    'created_at'     => $msg->created_at ? $msg->created_at->format('h:i A, d M Y') : now()->format('h:i A, d M Y'),
                ];
            })
            ->toArray();

        return Inertia::render('Account/Messages', [
            'messages'     => $messages,
            'admin_avatar' => $adminAvatar,
        ]);
    }

    /**
     * JSON API endpoint for polling new messages + unread count (no Inertia overhead).
     */
    public function messagesPoll(Request $request)
    {
        $userId = auth()->id();
        $afterId = (int) $request->input('after_id', 0);

        // Mark any incoming messages as read since user is actively in the messages view
        \App\Models\Message::where('receiver_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        try {
            \App\Models\LiveChatThread::where('user_id', $userId)
                ->update(['unread_user_count' => 0]);
        } catch (\Throwable $e) {}

        \Illuminate\Support\Facades\Cache::forget("user_unread_messages_{$userId}");

        $adminUser = \App\Models\User::where('email', 'shishirbarai2050@gmail.com')
            ->orWhere('id', 1)
            ->first();

        // Get new messages since last known ID
        $newMessages = [];
        if ($afterId > 0) {
            $newMessages = \App\Models\Message::where('id', '>', $afterId)
                ->where(function ($q) use ($userId) {
                    $q->where('sender_id', $userId)->orWhere('receiver_id', $userId);
                })
                ->orderBy('created_at', 'asc')
                ->get()
                ->map(function ($msg) use ($userId, $adminUser) {
                    $isAdminReply = ($msg->sender_id == 1) || ($adminUser && $msg->sender_id == $adminUser->id);
                    return [
                        'id'             => $msg->id,
                        'body'           => $msg->body,
                        'is_me'          => !$isAdminReply,
                        'is_admin_reply' => $isAdminReply,
                        'created_at'     => $msg->created_at ? $msg->created_at->format('h:i A, d M Y') : now()->format('h:i A, d M Y'),
                    ];
                })
                ->toArray();
        }

        return response()->json([
            'unread_count' => 0,
            'new_messages' => $newMessages,
        ]);
    }

    public function markMessagesRead(Request $request)
    {
        $userId = auth()->id();
        \App\Models\Message::where('receiver_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        try {
            \App\Models\LiveChatThread::where('user_id', $userId)
                ->update(['unread_user_count' => 0]);
        } catch (\Throwable $e) {}

        \Illuminate\Support\Facades\Cache::forget("user_unread_messages_{$userId}");

        return response()->json(['success' => true]);
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $userId = auth()->id();
        $user = auth()->user();

        // Mark previously received unread messages as read
        \App\Models\Message::where('receiver_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        try {
            \App\Models\LiveChatThread::where('user_id', $userId)
                ->update(['unread_user_count' => 0]);
        } catch (\Throwable $e) {}

        \Illuminate\Support\Facades\Cache::forget("user_unread_messages_{$userId}");

        \App\Models\Message::create([
            'sender_id'   => $userId,
            'receiver_id' => 1, // Support / Admin ID
            'body'        => trim($request->body),
            'is_read'     => false,
        ]);

        // Dual-sync to LiveChatThread for seamless multi-channel live experience
        try {
            $thread = \App\Models\LiveChatThread::where('user_id', $userId)->latest()->first();
            if (!$thread) {
                $thread = \App\Models\LiveChatThread::create([
                    'session_id'     => 'user_chat_' . $userId,
                    'user_id'        => $userId,
                    'customer_name'  => $user?->name ?? 'কাস্টমার',
                    'customer_phone' => $user?->phone,
                    'customer_email' => $user?->email,
                    'status'         => 'open',
                ]);
            }
            \App\Models\LiveChatMessage::create([
                'live_chat_thread_id' => $thread->id,
                'sender_type'         => 'customer',
                'sender_id'           => $userId,
                'sender_name'         => $user?->name ?? 'কাস্টমার',
                'message'             => trim($request->body),
                'is_read'             => false,
            ]);
            $thread->increment('unread_admin_count');
            $thread->update([
                'last_message'    => \Illuminate\Support\Str::limit(trim($request->body), 150),
                'last_message_at' => now(),
                'status'          => 'open',
            ]);
        } catch (\Throwable $e) {}

        return back()->with('success', 'মেসেজ সফলভাবে পাঠানো হয়েছে!');
    }

    public function updateMessage(Request $request, $id)
    {
        $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $message = \App\Models\Message::where('id', $id)
            ->where('sender_id', auth()->id())
            ->firstOrFail();

        $message->update([
            'body' => trim($request->body),
        ]);

        return back()->with('success', 'মেসেজ এডিট করা হয়েছে!');
    }

    public function profile(Request $request)
    {
        $user = $request->user();
        $customerId = '1000' . str_pad($user->id, 3, '0', STR_PAD_LEFT);
        $user->load('profile');

        $avatar = $user->avatar_url ?? $user->avatar ?? null;

        return Inertia::render('Account/Profile', [
            'user' => [
                'id'          => $user->id,
                'customer_id' => $customerId,
                'name'        => $user->name,
                'email'       => $user->email,
                'phone'       => $user->phone ?? ($user->profile->phone ?? ''),
                'avatar'      => $avatar,
                'city'        => $user->city ?? ($user->profile->city ?? ''),
                'address'     => $user->address ?? ($user->profile->address ?? ''),
                'birthday'    => $user->birthday ?? ($user->profile->date_of_birth ?? ''),
            ],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = auth()->user();
        
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone'    => 'nullable|string|max:50',
            'city'     => 'nullable|string|max:100',
            'address'  => 'nullable|string|max:500',
            'birthday' => 'nullable|string|max:20',
            'avatar'   => 'nullable|image|max:3072',
        ]);

        $userData = [
            'name'  => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
        ];

        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $uploadDir = public_path('uploads/avatars');
            if (!file_exists($uploadDir)) {
                @mkdir($uploadDir, 0755, true);
            }
            $filename = 'avatar_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($uploadDir, $filename);

            // Also mirror to storage/app/public/avatars for dual compatibility
            try {
                $storageDir = storage_path('app/public/avatars');
                if (!file_exists($storageDir)) {
                    @mkdir($storageDir, 0755, true);
                }
                @copy($uploadDir . DIRECTORY_SEPARATOR . $filename, $storageDir . DIRECTORY_SEPARATOR . $filename);
            } catch (\Throwable $e) {}

            $avatarUrl = '/uploads/avatars/' . $filename;
            $userData['avatar_url'] = $avatarUrl;
            $userData['avatar'] = $avatarUrl;
            if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'profile_photo_path')) {
                $userData['profile_photo_path'] = $avatarUrl;
            }
            if (method_exists($user, 'profile')) {
                $user->profile()->updateOrCreate(
                    ['user_id' => $user->id],
                    ['avatar' => $avatarUrl]
                );
            }
        }

        if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'birthday')) {
            $userData['birthday'] = $request->birthday;
        }
        if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'city')) {
            $userData['city'] = $request->city;
        }
        if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'address')) {
            $userData['address'] = $request->address;
        }

        $user->update($userData);

        try {
            if (method_exists($user, 'profile')) {
                $user->profile()->updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'full_name'     => $request->name,
                        'phone'         => $request->phone,
                        'city'          => $request->city,
                        'address'       => $request->address,
                        'date_of_birth' => $request->birthday,
                    ]
                );
            }
        } catch (\Throwable $e) {}

        return back()->with('success', 'প্রোফাইল ও ছবি সফলভাবে আপডেট করা হয়েছে!');
    }

    // --- New Layout Methods ---

    public function returns()
    {
        return Inertia::render('Account/Returns');
    }

    public function favorites()
    {
        $wishlistItems = \App\Models\Wishlist::with('product')
            ->where('user_id', auth()->id())
            ->latest()
            ->get();
            
        return Inertia::render('Account/Favorites', [
            'wishlistItems' => $wishlistItems
        ]);
    }

    public function removeFavorite($id)
    {
        $userId = auth()->id();
        $item = \App\Models\Wishlist::where('id', $id)->where('user_id', $userId)->first();
        if ($item) {
            $item->delete();
            \Illuminate\Support\Facades\Cache::forget("user_wishlist_ids_{$userId}");
        }
        return back()->with('success', 'Item removed from favorites.');
    }

    public function reviews()
    {
        $userId = auth()->id();

        // 1. Published reviews by this user
        $publishedReviews = \App\Models\ProductReview::with('product')
            ->where('user_id', $userId)
            ->latest()
            ->get();

        // 2. Products purchased by this user that are pending review
        $reviewedProductIds = $publishedReviews->pluck('product_id')->toArray();

        $orderItems = \App\Models\OrderItem::with('product')
            ->whereHas('order', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->whereNotIn('product_id', $reviewedProductIds)
            ->latest()
            ->get()
            ->unique('product_id');

        $toBeReviewed = $orderItems->map(function ($item) {
            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'order_id' => $item->order_id,
                'product' => $item->product,
                'created_at' => $item->created_at->format('Y-m-d'),
            ];
        })->values();

        return Inertia::render('Account/Reviews', [
            'publishedReviews' => $publishedReviews,
            'toBeReviewed' => $toBeReviewed,
        ]);
    }

    public function storeReview(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:3',
        ]);

        \App\Models\ProductReview::create([
            'user_id' => auth()->id(),
            'product_id' => $request->product_id,
            'order_id' => $request->order_id ?? null,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'is_verified' => true,
        ]);

        return back()->with('success', 'আপনার রিভিউ সফলভাবে প্রকাশ করা হয়েছে!');
    }

    public function updateReview(Request $request, $id)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:3',
        ]);

        $review = \App\Models\ProductReview::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $review->update([
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return back()->with('success', 'রিভিউ আপডেট করা হয়েছে!');
    }

    public function deleteReview($id)
    {
        $review = \App\Models\ProductReview::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $review->delete();

        return back()->with('success', 'রিভিউ মুছে ফেলা হয়েছে।');
    }

    public function addresses()
    {
        return Inertia::render('Account/Addresses');
    }

    public function password()
    {
        return Inertia::render('Account/Password');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $user = $request->user();
        $user->password = $request->password;
        $user->save();

        return back()->with('success', 'পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!');
    }

    public function twoFactor()
    {
        $user = auth()->user();
        $enabled = session("2fa_enabled_{$user->id}", false);
        $secret  = session("2fa_secret_{$user->id}", \App\Services\TotpService::generateSecret($user->id));

        return Inertia::render('Account/TwoFactor', [
            'two_factor_enabled' => (bool) $enabled,
            'secret_key'         => $secret,
            'user'               => [
                'name'  => $user->name,
                'email' => $user->email,
            ]
        ]);
    }

    public function toggleTwoFactor()
    {
        $user = auth()->user();
        $current = session("2fa_enabled_{$user->id}", false);
        session(["2fa_enabled_{$user->id}" => !$current]);
        $statusStr = !$current ? "সক্রিয় (Enabled)" : "নিষ্ক্রিয় (Disabled)";
        return back()->with('success', "Google Authenticator (2FA) সিকিউরিটি {$statusStr} করা হয়েছে!");
    }

    public function trackOrder()
    {
        return Inertia::render('Account/TrackOrder');
    }
}
