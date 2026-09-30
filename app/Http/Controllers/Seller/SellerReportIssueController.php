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

        // Seed initial tickets matching screenshot if empty
        if (VendorSupportTicket::where('shop_id', $shopId)->count() === 0) {
            VendorSupportTicket::create([
                'ticket_number' => '#TKT-991',
                'shop_id'       => $shopId,
                'user_id'       => $user ? $user->id : 1,
                'subject'       => 'Payment not received for Order #90234',
                'category'      => 'Payment & Payout',
                'priority'      => 'High',
                'status'        => 'Open',
                'description'   => 'I submitted a payout request for Order #90234 3 days ago. The status shows approved in Super Admin Vault, but funds have not reached my City Bank account yet.',
                'admin_reply'   => 'Hello! Super Admin finance team is verifying the bank clearing reference. The payout will be transferred within 2 hours.',
                'created_at'    => now()->subDays(2),
            ]);

            VendorSupportTicket::create([
                'ticket_number' => '#TKT-985',
                'shop_id'       => $shopId,
                'user_id'       => $user ? $user->id : 1,
                'subject'       => 'Product variations bug in add product form',
                'category'      => 'Bug / Technical Issue',
                'priority'      => 'Medium',
                'status'        => 'In Progress',
                'description'   => 'When selecting multiple color variations (Red, Blue) in the Add Product form, the price input resets automatically.',
                'admin_reply'   => 'Our technical team is reviewing the Inertia form state. A fix will be deployed shortly.',
                'created_at'    => now()->subDays(5),
            ]);

            VendorSupportTicket::create([
                'ticket_number' => '#TKT-942',
                'shop_id'       => $shopId,
                'user_id'       => $user ? $user->id : 1,
                'subject'       => 'How to integrate with external courier?',
                'category'      => 'Courier & Dispatch',
                'priority'      => 'Low',
                'status'        => 'Resolved',
                'description'   => 'Can I use Steadfast Courier API keys directly or does Super Admin manage the parcel pickup?',
                'admin_reply'   => 'Super Admin manages all master courier APIs centrally. You just submit pickup requests from your vendor dashboard!',
                'created_at'    => now()->subDays(10),
            ]);
        }

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

        VendorSupportTicket::create([
            'ticket_number' => '#TKT-' . rand(100, 999),
            'shop_id'       => $shopId,
            'user_id'       => $user ? $user->id : 1,
            'subject'       => $validated['subject'],
            'category'      => $validated['category'],
            'priority'      => $validated['priority'],
            'status'        => 'Open',
            'description'   => $validated['description'],
        ]);

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
