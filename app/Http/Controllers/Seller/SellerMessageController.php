<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\LiveChatMessage;
use App\Models\LiveChatThread;
use App\Models\Message;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SellerMessageController extends Controller
{
    /**
     * Get or resolve the platform admin user
     */
    protected function getAdminUser()
    {
        return User::whereHas('roles', fn($q) => $q->where('role', 'admin'))
            ->orWhereIn('email', ['admin@guruz.com', 'shishirbarai2050@gmail.com', 'shishirbarai019@gmail.com'])
            ->first() ?: User::find(1);
    }

    /**
     * Display seller messages page
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $shop = $user->shop;
        $admin = $this->getAdminUser();

        // Mark all incoming unread messages as read
        Message::where('receiver_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        Cache::forget("user_unread_messages_{$user->id}");

        // Also mark live chat thread messages as read if exists
        try {
            $thread = LiveChatThread::where('user_id', $user->id)->first();
            if ($thread) {
                $thread->messages()->where('sender_type', 'admin')->where('is_read', false)->update(['is_read' => true]);
                $thread->update(['unread_user_count' => 0]);
            }
        } catch (\Throwable $e) {}

        // Fetch conversation between this vendor user and admin / shop messages
        $messages = Message::where(function ($q) use ($user, $admin, $shop) {
            $q->where(function ($sub) use ($user, $admin) {
                $sub->where('sender_id', $user->id);
                if ($admin) {
                    $sub->where('receiver_id', $admin->id);
                }
            })->orWhere(function ($sub) use ($user, $admin) {
                $sub->where('receiver_id', $user->id);
                if ($admin) {
                    $sub->where('sender_id', $admin->id);
                }
            });

            if ($shop) {
                $q->orWhere('shop_id', $shop->id);
            }
        })
        ->orderBy('created_at', 'asc')
        ->get()
        ->map(function ($msg) use ($user) {
            $isMe = $msg->sender_id == $user->id;
            return [
                'id'              => $msg->id,
                'body'            => $msg->body,
                'is_me'           => $isMe,
                'is_admin_reply'  => !$isMe,
                'sender_name'     => $isMe ? ($user->name ?? 'You') : 'Guruz Super Admin',
                'created_at'      => $msg->created_at ? $msg->created_at->format('h:i A, d M') : '',
            ];
        });

        return Inertia::render('Seller/Messages', [
            'shop'     => $shop ? [
                'id'       => $shop->id,
                'name'     => $shop->name,
                'logo_url' => $shop->logo_url,
                'status'   => $shop->status,
            ] : null,
            'admin'    => [
                'name'   => $admin?->name ?? 'Guruz Super Admin',
                'role'   => 'Platform Administration & Support',
                'online' => true,
            ],
            'messages' => $messages,
        ]);
    }

    /**
     * Send message from Seller to Admin
     */
    public function send(Request $request)
    {
        $validated = $request->validate([
            'body' => 'required|string|max:5000',
        ]);

        $user = Auth::user();
        $shop = $user->shop;
        $admin = $this->getAdminUser();
        $adminId = $admin ? $admin->id : 1;

        $msg = Message::create([
            'sender_id'   => $user->id,
            'receiver_id' => $adminId,
            'shop_id'     => $shop?->id,
            'body'        => trim($validated['body']),
            'is_read'     => false,
        ]);

        // Invalidate admin unread cache
        Cache::forget("user_unread_messages_{$adminId}");

        // Also sync to LiveChatThread so it shows on all admin live chat interfaces
        try {
            $thread = LiveChatThread::where('user_id', $user->id)->first();
            if (!$thread) {
                $thread = LiveChatThread::create([
                    'session_id'     => 'vendor_' . $user->id,
                    'user_id'        => $user->id,
                    'customer_name'  => ($shop ? $shop->name : $user->name) . ' (' . $user->name . ')',
                    'customer_email' => $user->email,
                    'customer_phone' => $shop?->phone ?? $user->phone,
                    'status'         => 'open',
                ]);
            }
            LiveChatMessage::create([
                'live_chat_thread_id' => $thread->id,
                'sender_type'         => 'customer',
                'sender_id'           => $user->id,
                'sender_name'         => $shop ? $shop->name : $user->name,
                'message'             => trim($validated['body']),
                'is_read'             => false,
            ]);
            $thread->increment('unread_admin_count');
            $thread->update([
                'last_message'    => Str::limit($validated['body'], 150),
                'last_message_at' => now(),
            ]);
        } catch (\Throwable $e) {}

        $formatted = [
            'id'             => $msg->id,
            'body'           => $msg->body,
            'is_me'          => true,
            'is_admin_reply' => false,
            'sender_name'    => $user->name ?? 'You',
            'created_at'     => now()->format('h:i A, d M'),
        ];

        if ($request->wantsJson() || $request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'message' => $formatted,
            ]);
        }

        return back()->with('success', 'মেসেজ পাঠানো হয়েছে!');
    }

    /**
     * Poll endpoint for Seller to get new messages from Admin in real-time
     */
    public function poll(Request $request)
    {
        $user = Auth::user();
        $shop = $user->shop;
        $admin = $this->getAdminUser();
        $afterId = (int) $request->query('after_id', 0);

        // Mark incoming unread messages as read
        Message::where('receiver_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        Cache::forget("user_unread_messages_{$user->id}");

        $newMessages = Message::where(function ($q) use ($user, $admin, $shop) {
            $q->where(function ($sub) use ($user, $admin) {
                $sub->where('sender_id', $user->id);
                if ($admin) {
                    $sub->where('receiver_id', $admin->id);
                }
            })->orWhere(function ($sub) use ($user, $admin) {
                $sub->where('receiver_id', $user->id);
                if ($admin) {
                    $sub->where('sender_id', $admin->id);
                }
            });

            if ($shop) {
                $q->orWhere('shop_id', $shop->id);
            }
        })
        ->where('id', '>', $afterId)
        ->orderBy('created_at', 'asc')
        ->get()
        ->map(function ($msg) use ($user) {
            $isMe = $msg->sender_id == $user->id;
            return [
                'id'             => $msg->id,
                'body'           => $msg->body,
                'is_me'          => $isMe,
                'is_admin_reply' => !$isMe,
                'sender_name'    => $isMe ? ($user->name ?? 'You') : 'Guruz Super Admin',
                'created_at'     => $msg->created_at ? $msg->created_at->format('h:i A, d M') : '',
            ];
        });

        return response()->json([
            'new_messages' => $newMessages,
        ]);
    }
}