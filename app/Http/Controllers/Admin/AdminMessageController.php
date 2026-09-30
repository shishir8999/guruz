<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LiveChatMessage;
use App\Models\LiveChatThread;
use App\Models\Message;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AdminMessageController extends Controller
{
    public function index(Request $request)
    {
        $activeThreadId = $request->query('thread_id');
        $activeUserId = $request->query('user_id');

        // 1. If an active conversation is selected, mark its messages as read FIRST before reading counts
        if ($activeThreadId) {
            $thread = LiveChatThread::find($activeThreadId);
            if ($thread) {
                $thread->messages()->where('sender_type', 'customer')->where('is_read', false)->update(['is_read' => true]);
                $thread->update(['unread_admin_count' => 0]);
                if ($thread->user_id) {
                    Message::where('sender_id', $thread->user_id)->where('is_read', false)->update(['is_read' => true]);
                }
            }
        } elseif ($activeUserId) {
            $user = User::find($activeUserId);
            if ($user) {
                Message::where('sender_id', $activeUserId)->where('is_read', false)->update(['is_read' => true]);
                $userThread = LiveChatThread::where('user_id', $activeUserId)->first();
                if ($userThread) {
                    $userThread->messages()->where('sender_type', 'customer')->where('is_read', false)->update(['is_read' => true]);
                    $userThread->update(['unread_admin_count' => 0]);
                }
            }
        }

        // Fetch Live Chat Threads
        $liveThreads = LiveChatThread::with(['user'])
            ->latest('last_message_at')
            ->limit(100)
            ->get()
            ->map(function ($thread) use ($activeThreadId) {
                // Ensure active thread reports 0 unread
                $unread = ($activeThreadId && $activeThreadId == $thread->id) ? 0 : (int) $thread->unread_admin_count;
                return [
                    'id'                => 'live_' . $thread->id,
                    'thread_id'         => $thread->id,
                    'is_live_thread'    => true,
                    'session_id'        => $thread->session_id,
                    'name'              => $thread->customer_name ?: 'ভিজিটর',
                    'email'             => $thread->customer_email ?: '',
                    'phone'             => $thread->customer_phone ?: '',
                    'ip_address'        => $thread->ip_address,
                    'current_page'      => $thread->current_page,
                    'avatar_url'        => null,
                    'last_message'      => $thread->last_message ?: 'নতুন চ্যাট সেশন...',
                    'last_message_time' => $thread->last_message_at ? $thread->last_message_at->diffForHumans() : $thread->created_at->diffForHumans(),
                    'unread_count'      => $unread,
                    'status'            => $thread->status,
                ];
            })
            ->toArray();

        // Also fetch direct registered user chats
        $userIdsFromMessages = Message::select(DB::raw('CASE WHEN sender_id = 1 THEN receiver_id ELSE sender_id END as u_id'))
            ->distinct()
            ->pluck('u_id')
            ->toArray();

        $recentUserIds = User::latest()->take(30)->pluck('id')->toArray();
        $existingUserIdsInThreads = LiveChatThread::whereNotNull('user_id')->pluck('user_id')->toArray();
        $targetUserIds = array_diff(array_unique(array_filter(array_merge($userIdsFromMessages, $recentUserIds))), $existingUserIdsInThreads);

        $registeredCustomers = User::whereIn('id', $targetUserIds)
            ->get()
            ->reject(fn($u) => $u->isAdmin())
            ->map(function ($user) use ($activeUserId) {
                $lastMessage = Message::where(function ($q) use ($user) {
                        $q->where('sender_id', $user->id)->orWhere('receiver_id', $user->id);
                    })
                    ->latest()
                    ->first();

                $unreadCount = ($activeUserId && $activeUserId == $user->id)
                    ? 0
                    : Message::where('sender_id', $user->id)->where('is_read', false)->count();

                return [
                    'id'                => 'user_' . $user->id,
                    'user_id'           => $user->id,
                    'is_live_thread'    => false,
                    'name'              => $user->name,
                    'email'             => $user->email,
                    'phone'             => $user->phone ?? 'N/A',
                    'avatar_url'        => $user->avatar_url ?? null,
                    'last_message'      => $lastMessage ? $lastMessage->body : 'মেসেজ শুরু করুন...',
                    'last_message_time' => $lastMessage ? $lastMessage->created_at->diffForHumans() : '',
                    'unread_count'      => $unreadCount,
                    'status'            => 'open',
                ];
            })
            ->toArray();

        // Merge both list: unread first, then latest
        $allChats = array_merge($liveThreads, $registeredCustomers);
        usort($allChats, function ($a, $b) {
            if ($a['unread_count'] > 0 && $b['unread_count'] == 0) return -1;
            if ($b['unread_count'] > 0 && $a['unread_count'] == 0) return 1;
            return 0;
        });

        // Determine active selected chat
        $selectedChat = null;
        $conversation = [];

        if ($activeThreadId) {
            $thread = LiveChatThread::find($activeThreadId);
            if ($thread) {
                $selectedChat = [
                    'id'             => 'live_' . $thread->id,
                    'thread_id'      => $thread->id,
                    'is_live_thread' => true,
                    'session_id'     => $thread->session_id,
                    'name'           => $thread->customer_name ?: 'ভিজিটর',
                    'email'          => $thread->customer_email,
                    'phone'          => $thread->customer_phone,
                    'ip_address'     => $thread->ip_address,
                    'current_page'   => $thread->current_page,
                    'user_agent'     => $thread->user_agent,
                    'status'         => $thread->status,
                ];

                $conversation = $thread->messages()->get()->map(function ($m) {
                    return [
                        'id'              => $m->id,
                        'is_live'         => true,
                        'sender_name'     => $m->sender_name,
                        'body'            => $m->message,
                        'attachment_url'  => $m->attachment_url,
                        'attachment_type' => $m->attachment_type,
                        'is_me'           => $m->sender_type === 'admin',
                        'is_read'         => (bool) $m->is_read,
                        'created_at'      => $m->created_at ? $m->created_at->format('h:i A, d M Y') : now()->format('h:i A, d M Y'),
                    ];
                })->toArray();
            }
        } elseif ($activeUserId) {
            $user = User::find($activeUserId);
            if ($user) {
                $selectedChat = [
                    'id'             => 'user_' . $user->id,
                    'user_id'        => $user->id,
                    'is_live_thread' => false,
                    'name'           => $user->name,
                    'email'          => $user->email,
                    'phone'          => $user->phone ?? 'N/A',
                    'avatar_url'     => $user->avatar_url ?? null,
                    'status'         => 'open',
                ];

                $conversation = Message::where(function ($q) use ($activeUserId) {
                        $q->where('sender_id', $activeUserId)->orWhere('receiver_id', $activeUserId);
                    })
                    ->orderBy('created_at', 'asc')
                    ->get()
                    ->map(function ($msg) use ($activeUserId) {
                        return [
                            'id'         => $msg->id,
                            'is_live'    => false,
                            'body'       => $msg->body,
                            'is_me'      => $msg->sender_id != $activeUserId,
                            'is_read'    => (bool) $msg->is_read,
                            'created_at' => $msg->created_at ? $msg->created_at->format('h:i A, d M Y') : now()->format('h:i A, d M Y'),
                        ];
                    })->toArray();
            }
        } elseif (count($allChats) > 0) {
            // Auto-select first chat
            $first = $allChats[0];
            if (!empty($first['is_live_thread'])) {
                return redirect()->route('admin.messages.index', ['thread_id' => $first['thread_id']]);
            } else {
                return redirect()->route('admin.messages.index', ['user_id' => $first['user_id']]);
            }
        }

        // Calculate accurate unread counts strictly from the loaded customer list
        $totalUnreadClients = count(array_filter($allChats, fn($c) => ($c['unread_count'] ?? 0) > 0));
        $totalUnreadMessages = array_sum(array_column($allChats, 'unread_count'));

        return Inertia::render('Admin/Messages/Index', [
            'customers'             => $allChats,
            'total_unread_messages' => (int) $totalUnreadMessages,
            'total_unread_clients'  => (int) $totalUnreadClients,
            'active_user'           => $selectedChat,
            'conversation'          => $conversation,
        ]);
    }

    /**
     * Send reply from Super Admin
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'thread_id'   => 'nullable|exists:live_chat_threads,id',
            'customer_id' => 'nullable|exists:users,id',
            'body'        => 'required|string|max:5000',
        ]);

        $admin = auth()->user();

        // 1. If it's a Live Chat Thread
        if (!empty($validated['thread_id'])) {
            $thread = LiveChatThread::findOrFail($validated['thread_id']);
            
            $msg = LiveChatMessage::create([
                'live_chat_thread_id' => $thread->id,
                'sender_type'         => 'admin',
                'sender_id'           => $admin?->id,
                'sender_name'         => $admin?->name ?? 'Guruz সাপোর্ট টিম',
                'message'             => trim($validated['body']),
                'is_read'             => false,
            ]);

            $thread->increment('unread_user_count');
            $thread->update([
                'last_message'    => Str::limit($validated['body'], 150),
                'last_message_at' => now(),
            ]);

            // If this thread is linked to a registered customer, also sync to direct messages
            if ($thread->user_id) {
                try {
                    Message::create([
                        'sender_id'   => $admin?->id ?: 1,
                        'receiver_id' => $thread->user_id,
                        'body'        => trim($validated['body']),
                        'is_read'     => false,
                    ]);
                } catch (\Throwable $e) {}
            }

            if ($request->wantsJson() && !$request->header('X-Inertia')) {
                return response()->json(['success' => true, 'message' => $msg]);
            }

            return back()->with('success', 'লাইভ চ্যাট মেসেজ সফলভাবে পাঠানো হয়েছে!');
        }

        // 2. If it's a Registered User Message
        if (!empty($validated['customer_id'])) {
            $adminId = $admin ? $admin->id : 1;

            $msg = Message::create([
                'sender_id'   => $adminId,
                'receiver_id' => $validated['customer_id'],
                'body'        => trim($validated['body']),
                'is_read'     => false,
            ]);

            // Also find or create live thread so the customer sees it in floating live chat
            try {
                $thread = LiveChatThread::where('user_id', $validated['customer_id'])->latest()->first();
                if (!$thread) {
                    $u = User::find($validated['customer_id']);
                    $thread = LiveChatThread::create([
                        'session_id'     => 'user_' . $validated['customer_id'],
                        'user_id'        => $validated['customer_id'],
                        'customer_name'  => $u?->name ?? 'কাস্টমার',
                        'customer_phone' => $u?->phone,
                        'customer_email' => $u?->email,
                        'status'         => 'open',
                    ]);
                }
                LiveChatMessage::create([
                    'live_chat_thread_id' => $thread->id,
                    'sender_type'         => 'admin',
                    'sender_id'           => $adminId,
                    'sender_name'         => $admin?->name ?? 'Guruz সাপোর্ট টিম',
                    'message'             => trim($validated['body']),
                    'is_read'             => false,
                ]);
                $thread->increment('unread_user_count');
                $thread->update([
                    'last_message'    => Str::limit($validated['body'], 150),
                    'last_message_at' => now(),
                ]);
            } catch (\Throwable $e) {}

            if ($request->wantsJson() && !$request->header('X-Inertia')) {
                return response()->json(['success' => true, 'message' => $msg]);
            }

            return back()->with('success', 'মেসেজ সফলভাবে পাঠানো হয়েছে!');
        }

        return back()->with('error', 'কোনো চ্যাট থ্রেড নির্বাচন করা হয়নি।');
    }

    /**
     * Delete an entire chat conversation thread permanently
     */
    public function deleteThread(Request $request, $id)
    {
        $thread = LiveChatThread::find($id);
        if ($thread) {
            $userId = $thread->user_id;
            $thread->messages()->delete();
            $thread->delete();
            if ($userId) {
                // Also clean up any unread messages from this user in direct messages
                Message::where('sender_id', $userId)->delete();
            }
            return redirect()->route('admin.messages.index')->with('success', 'লাইভ চ্যাট সম্পূর্ণ স্থায়ীভাবে মুছে ফেলা হয়েছে।');
        }

        return back()->with('error', 'চ্যাট পাওয়া যায়নি।');
    }

    /**
     * Delete a single message permanently
     */
    public function deleteMessage(Request $request, $id)
    {
        $type = $request->query('type', 'live');

        if ($type === 'live') {
            $msg = LiveChatMessage::find($id);
            if ($msg) {
                $thread = $msg->thread;
                $msg->delete();
                if ($thread) {
                    $realUnread = $thread->messages()->where('sender_type', 'customer')->where('is_read', false)->count();
                    $lastMsg = $thread->messages()->latest()->first();
                    $thread->update([
                        'unread_admin_count' => $realUnread,
                        'last_message'       => $lastMsg ? Str::limit($lastMsg->message ?: '📎 ফাইল', 150) : null,
                    ]);
                    if ($thread->user_id && $realUnread === 0) {
                        Message::where('sender_id', $thread->user_id)->where('is_read', false)->update(['is_read' => true]);
                    }
                }
                return back()->with('success', 'মেসেজ ডিলিট করা হয়েছে।');
            }
        } else {
            $msg = Message::find($id);
            if ($msg) {
                $senderId = $msg->sender_id;
                $msg->delete();
                return back()->with('success', 'মেসেজ ডিলিট করা হয়েছে।');
            }
        }

        return back()->with('error', 'মেসেজ পাওয়া যায়নি।');
    }

    /**
     * Return live unread count for admin sidebar polling
     */
    public function unreadCount()
    {
        $liveUnread = 0;
        if (\Illuminate\Support\Facades\Schema::hasTable('live_chat_threads')) {
            $liveUnread = (int) LiveChatThread::sum('unread_admin_count');
        }

        $existingThreadUserIds = LiveChatThread::whereNotNull('user_id')->pluck('user_id')->toArray();
        $directUnread = Message::where('sender_id', '!=', 1)
            ->whereNotIn('sender_id', $existingThreadUserIds)
            ->where('is_read', false)
            ->count();

        $pendingReviews = \App\Models\ProductReview::where(function($q) {
            $q->whereNotIn('status', ['approved', 'rejected'])
              ->orWhereNull('status');
        })->count();

        $pendingWarranty = \App\Models\WarrantyClaim::whereIn('status', ['pending', 'under_review'])->count();

        return response()->json([
            'unread_count'            => $liveUnread + $directUnread,
            'pending_reviews'         => $pendingReviews,
            'pending_warranty_claims' => $pendingWarranty,
        ]);
    }

    /**
     * Get live chat messages between Admin and specific Vendor Shop
     */
    public function getShopMessages(Shop $shop)
    {
        $owner = $shop->owner;
        if (!$owner) {
            return response()->json(['messages' => []]);
        }

        // Mark incoming messages from this vendor as read
        Message::where('sender_id', $owner->id)->where('is_read', false)->update(['is_read' => true]);
        if (auth()->check()) {
            Cache::forget("user_unread_messages_" . auth()->id());
        }

        $messages = Message::where(function ($q) use ($owner, $shop) {
            $q->where('sender_id', $owner->id)
              ->orWhere('receiver_id', $owner->id)
              ->orWhere('shop_id', $shop->id);
        })
        ->orderBy('created_at', 'asc')
        ->get()
        ->map(function ($msg) use ($owner) {
            $isAdmin = $msg->sender_id != $owner->id;
            return [
                'id'          => $msg->id,
                'body'        => $msg->body,
                'is_admin'    => $isAdmin,
                'sender_name' => $isAdmin ? 'Super Admin' : $owner->name,
                'created_at'  => $msg->created_at ? $msg->created_at->format('h:i A, d M') : '',
            ];
        });

        return response()->json([
            'shop' => [
                'id'         => $shop->id,
                'name'       => $shop->name,
                'owner_id'   => $owner->id,
                'owner_name' => $owner->name,
                'email'      => $owner->email,
                'phone'      => $shop->phone ?? $owner->phone,
                'status'     => $shop->status,
            ],
            'messages' => $messages,
        ]);
    }

    /**
     * Send direct live message from Admin to a Vendor Shop
     */
    public function sendShopMessage(Request $request)
    {
        $validated = $request->validate([
            'shop_id' => 'required|exists:shops,id',
            'body'    => 'required|string|max:5000',
        ]);

        $shop = Shop::findOrFail($validated['shop_id']);
        $owner = $shop->owner;
        if (!$owner) {
            return response()->json(['error' => 'Shop owner not found'], 404);
        }

        $admin = auth()->user();
        $adminId = $admin ? $admin->id : 1;

        $msg = Message::create([
            'sender_id'   => $adminId,
            'receiver_id' => $owner->id,
            'shop_id'     => $shop->id,
            'body'        => trim($validated['body']),
            'is_read'     => false,
        ]);

        Cache::forget("user_unread_messages_{$owner->id}");

        // Sync to LiveChatThread if exists
        try {
            $thread = LiveChatThread::where('user_id', $owner->id)->first();
            if (!$thread) {
                $thread = LiveChatThread::create([
                    'session_id'     => 'vendor_' . $owner->id,
                    'user_id'        => $owner->id,
                    'customer_name'  => $shop->name . ' (' . $owner->name . ')',
                    'customer_email' => $owner->email,
                    'customer_phone' => $shop->phone ?? $owner->phone,
                    'status'         => 'open',
                ]);
            }
            LiveChatMessage::create([
                'live_chat_thread_id' => $thread->id,
                'sender_type'         => 'admin',
                'sender_id'           => $adminId,
                'sender_name'         => $admin?->name ?? 'Guruz Admin',
                'message'             => trim($validated['body']),
                'is_read'             => false,
            ]);
            $thread->increment('unread_user_count');
            $thread->update([
                'last_message'    => Str::limit($validated['body'], 150),
                'last_message_at' => now(),
            ]);
        } catch (\Throwable $e) {}

        return response()->json([
            'success' => true,
            'message' => [
                'id'          => $msg->id,
                'body'        => $msg->body,
                'is_admin'    => true,
                'sender_name' => 'Super Admin',
                'created_at'  => now()->format('h:i A, d M'),
            ]
        ]);
    }

    /**
     * Real-time unread messages & pending requests counts for Admin sidebar
     */
    public function getUnreadCount(Request $request)
    {
        $directUnread = Message::where('sender_id', '!=', 1)->where('is_read', false)->count();
        $liveChatUnread = 0;
        if (\Illuminate\Support\Facades\Schema::hasTable('live_chat_threads')) {
            $liveChatUnread = (int) LiveChatThread::sum('unread_admin_count');
        }

        $pendingOrders = \App\Models\Order::whereNull('admin_seen_at')->whereIn('status', ['pending', 'processing'])->count();
        $pendingReviews = \App\Models\ProductReview::where(function ($q) {
            $q->whereNotIn('status', ['approved', 'rejected'])
              ->orWhereNull('status');
        })->count();
        $pendingWarranty = \Illuminate\Support\Facades\Schema::hasTable('warranty_claims')
            ? \App\Models\WarrantyClaim::whereNull('admin_seen_at')->whereIn('status', ['pending', 'under_review'])->count()
            : 0;
        $pendingCatRequests = \App\Models\CategoryRequest::where('status', 'pending')->count();
        $pendingPickup = \Illuminate\Support\Facades\Schema::hasTable('pickup_requests')
            ? \App\Models\PickupRequest::where('status', 'pending')->count()
            : 0;
        $pendingPayments = \Illuminate\Support\Facades\Schema::hasTable('payment_transactions')
            ? \App\Models\PaymentTransaction::where('status', 'pending')->count()
            : 0;
        $pendingPayouts = \Illuminate\Support\Facades\Schema::hasTable('payout_requests')
            ? \App\Models\PayoutRequest::where('status', 'pending')->count()
            : 0;
        $pendingVendors = \App\Models\Shop::where('status', 'pending')->count();
        $pendingVendorKyc = \Illuminate\Support\Facades\Schema::hasTable('vendor_kycs')
            ? \App\Models\VendorKyc::where('status', 'pending')->count()
            : 0;
        $newUsers = \App\Models\User::whereNull('admin_seen_at')->where('email', '!=', 'admin@guruz.com')->count();
        $pendingSupportTickets = \Illuminate\Support\Facades\Schema::hasTable('vendor_support_tickets')
            ? \App\Models\VendorSupportTicket::where('is_read', false)->whereIn('status', ['pending', 'open', 'Open'])->count()
            : 0;
        $pendingEmails = \Illuminate\Support\Facades\Schema::hasTable('notifications')
            ? \App\Models\Notification::where('is_read', false)->count()
            : 0;
        $pendingSms = \Illuminate\Support\Facades\Schema::hasTable('push_notifications')
            ? \App\Models\PushNotification::where('status', 'pending')->count()
            : 0;

        return response()->json([
            'unread_count'              => $directUnread + $liveChatUnread,
            'pending_orders'            => $pendingOrders,
            'pending_reviews'           => $pendingReviews,
            'pending_warranty_claims'   => $pendingWarranty,
            'pending_category_requests' => $pendingCatRequests,
            'pending_pickup_requests'   => $pendingPickup,
            'pending_payments'          => $pendingPayments,
            'pending_payouts'           => $pendingPayouts,
            'pending_vendors'           => $pendingVendors,
            'pending_vendor_kyc'        => $pendingVendorKyc,
            'new_users_today'           => $newUsers,
            'pending_support_tickets'   => $pendingSupportTickets,
            'pending_emails'            => $pendingEmails,
            'pending_sms'               => $pendingSms,
        ]);
    }

    /**
     * Mark all customer messages and live chat threads as read for admin
     */
    public function markAllAsRead(Request $request)
    {
        Message::where('sender_id', '!=', 1)->where('is_read', false)->update(['is_read' => true]);
        if (\Illuminate\Support\Facades\Schema::hasTable('live_chat_threads')) {
            LiveChatThread::query()->update(['unread_admin_count' => 0]);
            LiveChatMessage::where('sender_type', 'customer')->where('is_read', false)->update(['is_read' => true]);
        }
        Cache::forget('admin_nav_counts');

        return response()->json(['success' => true]);
    }
}
