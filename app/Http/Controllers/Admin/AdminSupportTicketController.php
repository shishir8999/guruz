<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VendorSupportTicket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class AdminSupportTicketController extends Controller
{
    public function index(Request $request): Response
    {
        $query = VendorSupportTicket::with(['shop:id,name,slug,logo_url', 'user:id,name,email,phone'])->latest();

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('ticket_number', 'like', "%{$s}%")
                  ->orWhere('subject', 'like', "%{$s}%")
                  ->orWhere('category', 'like', "%{$s}%")
                  ->orWhere('description', 'like', "%{$s}%");
            });
        }

        $tickets = $query->paginate(20)->withQueryString();

        $allTickets = VendorSupportTicket::all();

        return Inertia::render('Admin/SupportTicketsPage', [
            'tickets' => $tickets,
            'counts'  => [
                'total'       => $allTickets->count(),
                'open'        => $allTickets->where('status', 'Open')->count(),
                'in_progress' => $allTickets->where('status', 'In Progress')->count(),
                'resolved'    => $allTickets->where('status', 'Resolved')->count(),
            ],
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function markRead(Request $request, $id)
    {
        $ticket = VendorSupportTicket::findOrFail($id);
        $ticket->update([
            'is_read' => true,
            'admin_seen_at' => now(),
        ]);
        \Illuminate\Support\Facades\Cache::forget('admin_nav_counts');

        if ($request->header('X-Inertia')) {
            return back();
        }

        return response()->json(['success' => true]);
    }

    public function markAllRead()
    {
        VendorSupportTicket::where('is_read', false)->update([
            'is_read' => true,
            'admin_seen_at' => now(),
        ]);
        \Illuminate\Support\Facades\Cache::forget('admin_nav_counts');

        return back()->with('success', 'সকল সাপোর্ট টিকেট পঠিত হিসেবে চিহ্নিত করা হয়েছে!');
    }

    public function reply(Request $request, $id)
    {
        $request->validate([
            'reply_message' => 'required|string|max:2000',
            'status'        => 'nullable|string|in:Open,In Progress,Resolved,Closed',
        ]);

        $ticket = VendorSupportTicket::findOrFail($id);
        $adminUser = Auth::user();
        $adminName = $adminUser ? $adminUser->name : 'Super Admin Support';

        $existingReply = $ticket->admin_reply ? $ticket->admin_reply . "\n\n" : '';
        $newReply = $existingReply . "{$adminName}: " . $request->reply_message;

        $updateData = [
            'admin_reply'   => $newReply,
            'is_read'       => true,
            'admin_seen_at' => now(),
        ];

        if ($request->filled('status')) {
            $updateData['status'] = $request->status;
        }

        $ticket->update($updateData);
        \Illuminate\Support\Facades\Cache::forget('admin_nav_counts');

        return back()->with('success', 'ভেন্ডরকে রিপ্লাই সফলভাবে পাঠানো হয়েছে!');
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:Open,In Progress,Resolved,Closed',
        ]);

        $ticket = VendorSupportTicket::findOrFail($id);
        $ticket->update([
            'status'        => $request->status,
            'is_read'       => true,
            'admin_seen_at' => now(),
        ]);
        \Illuminate\Support\Facades\Cache::forget('admin_nav_counts');

        return back()->with('success', 'টিকেট স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!');
    }

    public function destroy($id)
    {
        $ticket = VendorSupportTicket::findOrFail($id);
        $ticket->delete();
        \Illuminate\Support\Facades\Cache::forget('admin_nav_counts');

        return back()->with('success', 'টিকেট সফলভাবে মুছে ফেলা হয়েছে!');
    }
}
