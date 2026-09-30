<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class SellerInvoiceController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $shop = $user ? $user->shop : null;

        if ($user && !$shop) {
            $shop = Shop::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'name'        => ($user->name ?? 'Vendor') . "'s Shop",
                    'slug'        => Str::slug(($user->name ?? 'Vendor') . "-shop-" . $user->id),
                    'status'      => 'active',
                    'is_approved' => true,
                ]
            );
        }

        $shopId = $shop ? $shop->id : 1;

        $query = Order::where('shop_id', $shopId);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        $orders = $query->latest()->get();

        // Map orders to dynamic invoices
        $invoices = $orders->map(function($order) {
            return [
                'id'               => $order->id,
                'invoice_number'   => 'INV-' . str_replace('ORD-', '', $order->order_number),
                'order_number'     => $order->order_number,
                'customer_name'    => $order->customer_name,
                'customer_phone'   => $order->customer_phone,
                'customer_email'   => $order->customer_email,
                'shipping_address' => $order->shipping_address,
                'subtotal'         => $order->subtotal ?? $order->total,
                'shipping_fee'     => $order->shipping_fee ?? 0,
                'discount'         => $order->discount ?? 0,
                'total'            => $order->total,
                'payment_method'   => $order->payment_method ?? 'Cash',
                'payment_status'   => $order->payment_status,
                'status'           => $order->status,
                'created_at'       => $order->created_at ? $order->created_at->format('Y-m-d H:i') : date('Y-m-d H:i'),
            ];
        });

        $totalInvoicesCount = $invoices->count();

        $totalPaidRevenue = $invoices->filter(function($inv) {
            $st = strtolower((string)($inv['payment_status'] ?? ''));
            return str_contains($st, 'paid') || $st === 'completed';
        })->sum('total');

        $pendingInvoicesCount = $invoices->filter(function($inv) {
            $st = strtolower((string)($inv['payment_status'] ?? ''));
            return str_contains($st, 'pending') || str_contains($st, 'unpaid');
        })->count();

        return Inertia::render('Seller/Invoices', [
            'invoices'             => $invoices,
            'totalInvoicesCount'   => $totalInvoicesCount,
            'totalPaidRevenue'     => $totalPaidRevenue,
            'pendingInvoicesCount' => $pendingInvoicesCount,
            'shop'                 => $shop,
            'filters'              => $request->only(['search']),
        ]);
    }
}
