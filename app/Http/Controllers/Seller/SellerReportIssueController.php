<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\VendorSupportTicket;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class SellerReportIssueController extends Controller
{
    private function ensureTableColumnsExist()
    {
        try {
            if (!Schema::hasTable('vendor_support_tickets')) {
                Schema::create('vendor_support_tickets', function (Blueprint $table) {
                    $table->id();
                    $table->string('ticket_number');
                    $table->unsignedBigInteger('shop_id')->nullable();
                    $table->unsignedBigInteger('user_id')->nullable();
                    $table->string('subject');
                    $table->string('category')->default('General Inquiry');
                    $table->string('priority')->default('Medium');
                    $table->string('status')->default('Open');
                    $table->text('description');
                    $table->text('admin_reply')->nullable();
                    $table->string('attachment_url')->nullable();
                    $table->timestamps();
                });
            }
        } catch (\Throwable $e) {
            // ignore
        }
    }

    public function index(Request $request): Response
    {
        $this->ensureTableColumnsExist();

        $user = Auth::user();
        $shop = $user ? $user->shop : null;

        if ($user && !$shop) {
            $shop = Shop::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'name'        => ($user->name ?? 'Vendor') . "'s Shop",
                    'slug'        => \Illuminate\Support\Str::slug(($user->name ?? 'Vendor') . "-shop-" . $user->id),
                    'status'      => 'active',
                    'is_approved' => true,
                ]
            );
        }

        $shopId = $shop ? $shop->id : 1;

        $query = VendorSupportTicket::where('shop_id', $shopId);

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('ticket_number', 'like', "%{$s}%")
                  ->orWhere('subject', 'like', "%{$s}%")
                  ->orWhere('category', 'like', "%{$s}%");
            });
        }

        $tickets = $query->latest()->get();

        $allTickets = VendorSupportTicket::where('shop_id', $shopId)->get();

        return Inertia::render('Seller/ReportIssue', [
            'tickets'      => $tickets,
            'counts'       => [
                'total'       => $allTickets->count(),
                'open'        => $allTickets->where('status', 'Open')->count(),
                'in_progress' => $allTickets->where('status', 'In Progress')->count(),
                'resolved'    => $allTickets->where('status', 'Resolved')->count(),
            ],
            'filters'      => $request->only(['status', 'search']),
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureTableColumnsExist();

        $validated = $request->validate([
            'subject'     => 'required|string|max:255',
            'category'    => 'required|string|max:255',
            'priority'    => 'required|string|in:Low,Medium,High,Urgent',
            'description' => 'required|string|max:2000',
        ]);

        $user = Auth::user();
        $shop = $user ? $user->shop : null;
        $shopId = $shop ? $shop->id : 1;

        $ticket = VendorSupportTicket::create([
            'ticket_number' => '#TKT-' . rand(100, 999),
            'shop_id'       => $shopId,
            'user_id'       => $user ? $user->id : 1,
            'subject'       => $validated['subject'],
            'category'      => $validated['category'],
            'priority'      => $validated['priority'],
            'status'        => 'Open',
            'description'   => $validated['description'],
        ]);

        try {
            $admins = \App\Models\User::whereHas('roles', function($q) {
                $q->whereIn('role', ['admin', 'super_admin', 'superadmin']);
            })->orWhereIn('email', [
                'admin@guruz.com',
                'shishirbarai2050@gmail.com',
                'shishirbarai019@gmail.com',
                'shishirbarai01982708789@gmail.com'
            ])->get();

            $shopName = $shop ? $shop->name : ($user->name ?? 'ভেন্ডর');
            foreach ($admins as $admin) {
                \App\Models\Notification::create([
                    'user_id' => $admin->id,
                    'type'    => 'vendor_support_ticket',
                    'title'   => 'নতুন ভেন্ডর সাপোর্ট টিকিট (' . $ticket->ticket_number . ')',
                    'body'    => "ভেন্ডর '{$shopName}' একটি নতুন সাপোর্ট টিকিট পাঠিয়েছেন: {$validated['subject']}",
                    'link'    => '/admin/vendor-tickets',
                    'icon'    => 'Ticket',
                    'is_read' => false,
                ]);
            }
        } catch (\Throwable $e) {}

        \Illuminate\Support\Facades\Cache::forget('admin_nav_counts');

        return redirect()->back()->with('success', 'Support ticket created successfully! Super Admin support team will respond shortly.');
    }

    public function reply(Request $request, $id)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $ticket = VendorSupportTicket::findOrFail($id);
        $existingReply = $ticket->admin_reply ? $ticket->admin_reply . "\n\n" : '';
        $user = Auth::user();

        $ticket->update([
            'admin_reply' => $existingReply . "Vendor (" . ($user->name ?? 'Shop') . "): " . $validated['message'],
            'status'      => 'In Progress',
        ]);

        return redirect()->back()->with('success', 'Follow-up message sent on Ticket ' . $ticket->ticket_number);
    }
}
