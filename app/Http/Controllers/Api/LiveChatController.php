<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LiveChatMessage;
use App\Models\LiveChatThread;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LiveChatController extends Controller
{
    /**
     * Get or initiate live chat thread and message history
     */
    public function getThread(Request $request)
    {
        $sessionId = $request->query('session_id');
        if (!$sessionId) {
            return response()->json([
                'success'    => true,
                'session_id' => null,
                'thread'     => null,
                'messages'   => [],
            ]);
        }

        // Strictly isolate by session_id to guarantee no cross-profile message leakage
        $thread = LiveChatThread::where('session_id', $sessionId)->first();

        if (!$thread) {
            return response()->json([
                'success'    => true,
                'session_id' => $sessionId,
                'thread'     => null,
                'messages'   => [],
            ]);
        }

        // Mark admin messages as read
        $thread->messages()->where('sender_type', 'admin')->where('is_read', false)->update(['is_read' => true]);
        $thread->update(['unread_user_count' => 0]);

        $messages = $thread->messages()->get()->map(fn($m) => [
            'id'              => $m->id,
            'sender_type'     => $m->sender_type,
            'sender_name'     => $m->sender_name,
            'message'         => $m->message,
            'attachment_url'  => $m->attachment_url,
            'attachment_type' => $m->attachment_type,
            'is_read'         => $m->is_read,
            'time'            => $m->created_at->format('h:i A'),
            'created_at'      => $m->created_at->toIso8601String(),
        ]);

        return response()->json([
            'success'    => true,
            'session_id' => $thread->session_id,
            'thread'     => [
                'id'             => $thread->id,
                'customer_name'  => $thread->customer_name,
                'customer_email' => $thread->customer_email,
                'customer_phone' => $thread->customer_phone,
                'has_lead_info'  => !empty($thread->customer_name) && !empty($thread->customer_email) && !empty($thread->customer_phone),
                'status'         => $thread->status,
            ],
            'messages'   => $messages,
        ]);
    }

    /**
     * Register visitor lead details (Name, Email, Phone) before chat
     */
    public function registerLead(Request $request)
    {
        $validated = $request->validate([
            'session_id'     => 'required|string',
            'customer_name'  => 'required|string|min:2|max:150',
            'customer_email' => 'required|email|max:150',
            'customer_phone' => 'required|string|min:6|max:30',
            'current_page'   => 'nullable|string|max:500',
        ]);

        $sessionId = $validated['session_id'];
        $user = $request->user('web');
        $thread = LiveChatThread::where('session_id', $sessionId)->first();

        $leadData = [
            'customer_name'  => trim($validated['customer_name']),
            'customer_email' => trim($validated['customer_email']),
            'customer_phone' => trim($validated['customer_phone']),
            'ip_address'     => $request->ip(),
            'user_agent'     => $request->userAgent(),
            'current_page'   => $validated['current_page'] ?? ($request->header('referer') ?: url()->previous()),
        ];

        if (!$thread) {
            $thread = LiveChatThread::create(array_merge($leadData, [
                'session_id'      => $sessionId,
                'user_id'         => $user?->id,
                'status'          => 'open',
                'last_message'    => '👋 স্বাগতম! Guruz সাপোর্টে আপনাকে স্বাগতম...',
                'last_message_at' => now(),
            ]));

            LiveChatMessage::create([
                'live_chat_thread_id' => $thread->id,
                'sender_type'         => 'admin',
                'sender_name'         => 'Guruz কাস্টমার সাপোর্ট',
                'message'             => '👋 স্বাগতম! Guruz সাপোর্টে আপনাকে স্বাগতম। আপনার কোনো প্রোডাক্ট, অর্ডার বা অফার সম্পর্কে প্রশ্ন থাকলে দয়া করে এখানে লিখুন। আমরা সাথে সাথেই সাহায্য করছি।',
                'is_read'             => true,
            ]);
        } else {
            $thread->update($leadData);
        }

        if ($user) {
            $userUpdate = [];
            if (empty($user->phone) && !empty($leadData['customer_phone'])) $userUpdate['phone'] = $leadData['customer_phone'];
            if (!empty($userUpdate)) {
                try {
                    $user->update($userUpdate);
                } catch (\Throwable $e) {}
            }
        }

        return response()->json([
            'success' => true,
            'thread'  => [
                'id'             => $thread->id,
                'customer_name'  => $thread->customer_name,
                'customer_email' => $thread->customer_email,
                'customer_phone' => $thread->customer_phone,
                'has_lead_info'  => true,
                'status'         => $thread->status,
            ],
            'messages' => $thread->messages()->get()->map(fn($m) => [
                'id'              => $m->id,
                'sender_type'     => $m->sender_type,
                'sender_name'     => $m->sender_name,
                'message'         => $m->message,
                'attachment_url'  => $m->attachment_url,
                'attachment_type' => $m->attachment_type,
                'is_read'         => $m->is_read,
                'time'            => $m->created_at->format('h:i A'),
                'created_at'      => $m->created_at->toIso8601String(),
            ]),
            'message' => 'তথ্য সফলভাবে সংরক্ষিত হয়েছে।',
        ]);
    }

    /**
     * Send a message from the customer
     */
    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'session_id'      => 'required|string',
            'message'         => 'nullable|string|max:5000',
            'customer_name'   => 'nullable|string|max:255',
            'customer_email'  => 'nullable|string|max:255',
            'customer_phone'  => 'nullable|string|max:50',
            'current_page'    => 'nullable|string|max:500',
            'attachment_url'  => 'nullable|string',
            'attachment_type' => 'nullable|string',
        ]);

        if (empty($validated['message']) && empty($validated['attachment_url'])) {
            return response()->json(['success' => false, 'message' => 'মেসেজ বা ফাইল দিতে হবে।'], 422);
        }

        $user = $request->user('web');
        $sessionId = $validated['session_id'];
        $thread = LiveChatThread::where('session_id', $sessionId)->first();

        if (!$thread) {
            $thread = LiveChatThread::create([
                'session_id'      => $sessionId,
                'user_id'         => $user?->id,
                'customer_name'   => $validated['customer_name'] ?? 'ভিজিটর',
                'customer_email'  => $validated['customer_email'] ?? null,
                'customer_phone'  => $validated['customer_phone'] ?? null,
                'current_page'    => $validated['current_page'] ?? $request->header('referer'),
                'ip_address'      => $request->ip(),
                'user_agent'      => $request->userAgent(),
                'status'          => 'open',
                'last_message_at' => now(),
            ]);
        }

        $threadUpdate = [];
        if (!empty($validated['customer_name'])) $threadUpdate['customer_name'] = trim($validated['customer_name']);
        if (!empty($validated['customer_email'])) $threadUpdate['customer_email'] = trim($validated['customer_email']);
        if (!empty($validated['customer_phone'])) $threadUpdate['customer_phone'] = trim($validated['customer_phone']);
        if (!empty($validated['current_page'])) $threadUpdate['current_page'] = trim($validated['current_page']);
        $threadUpdate['ip_address'] = $request->ip();
        $threadUpdate['user_agent'] = $request->userAgent();

        $thread->update($threadUpdate);

        $msgText = $validated['message'] ?? '📎 ফাইল সংযুক্ত করেছেন';

        $msg = LiveChatMessage::create([
            'live_chat_thread_id' => $thread->id,
            'sender_type'         => 'customer',
            'sender_id'           => $user?->id,
            'sender_name'         => $thread->customer_name,
            'message'             => $validated['message'] ?? '',
            'attachment_url'      => $validated['attachment_url'] ?? null,
            'attachment_type'     => $validated['attachment_type'] ?? null,
            'is_read'             => false,
        ]);

        $thread->increment('unread_admin_count');
        $thread->update([
            'last_message'    => Str::limit($msgText, 150),
            'last_message_at' => now(),
            'status'          => 'open',
        ]);

        if ($user) {
            try {
                \App\Models\Message::create([
                    'sender_id'   => $user->id,
                    'receiver_id' => 1,
                    'body'        => $msgText,
                    'is_read'     => false,
                ]);
            } catch (\Throwable $e) {}
        }

        return response()->json([
            'success' => true,
            'message' => [
                'id'              => $msg->id,
                'sender_type'     => $msg->sender_type,
                'sender_name'     => $msg->sender_name,
                'message'         => $msg->message,
                'attachment_url'  => $msg->attachment_url,
                'attachment_type' => $msg->attachment_type,
                'is_read'         => $msg->is_read,
                'time'            => $msg->created_at->format('h:i A'),
                'created_at'      => $msg->created_at->toIso8601String(),
            ]
        ]);
    }

    /**
     * Poll new messages for live chat window
     */
    public function poll(Request $request)
    {
        $sessionId = $request->query('session_id');
        $lastId = (int) $request->query('last_id', 0);

        if (!$sessionId) {
            return response()->json(['success' => false, 'messages' => []]);
        }

        $thread = LiveChatThread::where('session_id', $sessionId)->first();

        if (!$thread) {
            return response()->json(['success' => true, 'messages' => []]);
        }

        $newMessages = $thread->messages()
            ->where('id', '>', $lastId)
            ->get()
            ->map(fn($m) => [
                'id'              => $m->id,
                'sender_type'     => $m->sender_type,
                'sender_name'     => $m->sender_name,
                'message'         => $m->message,
                'attachment_url'  => $m->attachment_url,
                'attachment_type' => $m->attachment_type,
                'is_read'         => $m->is_read,
                'time'            => $m->created_at->format('h:i A'),
                'created_at'      => $m->created_at->toIso8601String(),
            ]);

        if ($newMessages->count() > 0) {
            $thread->messages()->where('sender_type', 'admin')->where('is_read', false)->update(['is_read' => true]);
            $thread->update(['unread_user_count' => 0]);
        }

        return response()->json([
            'success'  => true,
            'messages' => $newMessages,
        ]);
    }

    /**
     * Upload an attachment for chat
     */
    public function uploadAttachment(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        $file = $request->file('file');
        $ext = strtolower($file->getClientOriginalExtension());
        if (!$ext) {
            $mime = $file->getMimeType();
            if (str_contains($mime, 'audio')) {
                $ext = 'webm';
            } elseif (str_contains($mime, 'image')) {
                $ext = 'png';
            } else {
                $ext = 'bin';
            }
        }
        
        $isImage = in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']);
        $isAudio = in_array($ext, ['mp3', 'wav', 'ogg', 'webm', 'm4a', 'aac']) || str_contains($file->getMimeType() ?? '', 'audio');
        
        $filename = 'chat_' . time() . '_' . Str::random(8) . '.' . $ext;

        // Save directly to public/uploads/chat for guaranteed web serving on all servers (cPanel, Apache, etc)
        $publicChatDir = public_path('uploads/chat');
        if (!file_exists($publicChatDir)) {
            @mkdir($publicChatDir, 0755, true);
        }

        $file->move($publicChatDir, $filename);

        // Also mirror to storage/app/public/uploads/chat
        try {
            $storageChatDir = storage_path('app/public/uploads/chat');
            if (!file_exists($storageChatDir)) {
                @mkdir($storageChatDir, 0755, true);
            }
            @copy($publicChatDir . DIRECTORY_SEPARATOR . $filename, $storageChatDir . DIRECTORY_SEPARATOR . $filename);
        } catch (\Throwable $e) {}

        $url = '/uploads/chat/' . $filename;
        $type = $isImage ? 'image' : ($isAudio ? 'audio' : 'file');

        return response()->json([
            'success' => true,
            'url'     => $url,
            'type'    => $type,
            'name'    => $file->getClientOriginalName() ?: ('voice_' . time() . '.' . $ext),
        ]);
    }
}
