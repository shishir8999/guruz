<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Shop;
use App\Models\Message;
use App\Models\LiveChatThread;
use App\Models\LiveChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function index()
    {
        $shops = Shop::where('status', 'active')
            ->withCount(['products', 'followers'])
            ->orderBy('rating', 'desc')
            ->paginate(12);

        return Inertia::render('Shops/Index', [
            'shops' => $shops,
        ]);
    }

    public function show($slug)
    {
        $shop = Shop::where('slug', $slug)
            ->orWhere('id', $slug)
            ->first();

        if (!$shop) {
            $shop = Shop::where('status', 'active')->firstOrFail();
        }

        $shop->loadCount('followers');

        $products = Product::where('shop_id', $shop->id)
            ->published()
            ->paginate(16);

        $isFollowing = false;
        if (auth()->check()) {
            $isFollowing = \App\Models\ShopFollower::where('shop_id', $shop->id)
                ->where('user_id', auth()->id())
                ->exists();
        }

        $followersCount = $shop->followers_count ?? \App\Models\ShopFollower::where('shop_id', $shop->id)->count();

        $shop->load('user:id,name,phone,email');
        $rawPhone = $shop->phone ?: ($shop->user->phone ?? \App\Models\SiteSetting::get('contact_whatsapp', '01700000000'));
        $cleanPhone = preg_replace('/[^0-9]/', '', (string)$rawPhone);
        if (str_starts_with($cleanPhone, '01')) {
            $cleanPhone = '88' . $cleanPhone;
        }

        return Inertia::render('Shops/Show', [
            'shop'           => $shop,
            'products'       => $products,
            'isFollowing'    => $isFollowing,
            'followersCount' => $followersCount,
            'whatsappNumber' => $cleanPhone ?: '8801700000000',
        ]);
    }

    public function toggleFollow($shopId)
    {
        $shop = Shop::where('id', $shopId)->orWhere('slug', $shopId)->firstOrFail();

        if (!auth()->check()) {
            return response()->json([
                'success'  => false,
                'message'  => 'শপ ফলো করতে অনুগ্রহ করে অ্যাকাউন্টে লগইন বা সাইনআপ করুন।',
                'redirect' => route('login'),
            ], 401);
        }

        $userId = auth()->id();
        $follower = \App\Models\ShopFollower::where('shop_id', $shop->id)->where('user_id', $userId)->first();

        if ($follower) {
            $follower->delete();
            $isFollowing = false;
            $msg = 'আপনি শপটি আনফলো করেছেন।';
        } else {
            \App\Models\ShopFollower::create([
                'shop_id' => $shop->id,
                'user_id' => $userId,
            ]);
            $isFollowing = true;
            $msg = 'অভিনন্দন! আপনি শপটি অনুসরণ (Follow) করছেন।';
        }

        $followersCount = \App\Models\ShopFollower::where('shop_id', $shop->id)->count();

        return response()->json([
            'success'        => true,
            'isFollowing'    => $isFollowing,
            'followersCount' => $followersCount,
            'message'        => $msg,
        ]);
    }

    /**
     * Send message from customer on Shop Page directly to Vendor and Super Admin
     */
    public function sendCustomerMessage(Request $request, $shopId)
    {
        $shop = Shop::where('id', $shopId)->orWhere('slug', $shopId)->firstOrFail();
        $owner = $shop->owner;
        if (!$owner) {
            return response()->json(['error' => 'Shop owner not found'], 404);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        $senderUser = auth()->user();
        $senderId = $senderUser ? $senderUser->id : 1;
        $senderName = $senderUser ? $senderUser->name : 'ক্রেতা (Customer)';

        // 1. Create Message in database for Vendor & Super Admin
        $msg = Message::create([
            'sender_id'   => $senderId,
            'receiver_id' => $owner->id,
            'shop_id'     => $shop->id,
            'body'        => trim($validated['message']),
            'is_read'     => false,
        ]);

        Cache::forget("user_unread_messages_{$owner->id}");

        // 2. Also record in LiveChatThread
        try {
            $thread = LiveChatThread::where('user_id', $owner->id)->first();
            if (!$thread) {
                $thread = LiveChatThread::create([
                    'session_id'     => 'shop_customer_' . $shop->id . '_' . $senderId,
                    'user_id'        => $owner->id,
                    'customer_name'  => $shop->name . ' (' . $owner->name . ')',
                    'customer_email' => $owner->email,
                    'customer_phone' => $shop->phone ?? $owner->phone,
                    'status'         => 'open',
                ]);
            }

            LiveChatMessage::create([
                'live_chat_thread_id' => $thread->id,
                'sender_type'         => 'customer',
                'sender_id'           => $senderId,
                'sender_name'         => $senderName,
                'message'             => trim($validated['message']),
                'is_read'             => false,
            ]);

            $thread->increment('unread_admin_count');
            $thread->update([
                'last_message'    => Str::limit($validated['message'], 150),
                'last_message_at' => now(),
            ]);
        } catch (\Throwable $e) {}

        return response()->json([
            'success' => true,
            'message' => [
                'id'         => $msg->id,
                'body'       => $msg->body,
                'created_at' => $msg->created_at ? $msg->created_at->format('h:i A, d M') : '',
            ],
        ]);
    }
}
