<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class SalesController extends Controller
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

        // Filter by Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        // Filter by Customer
        if ($request->filled('customer')) {
            $query->where('customer_name', $request->customer);
        }

        // Filter by Status
        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        // Filter by Payment Status
        if ($request->filled('payment_status') && $request->payment_status !== 'All') {
            $query->where('payment_status', $request->payment_status);
        }

        $allOrders = Order::where('shop_id', $shopId)->get();

        $totalSales = $allOrders->count();

        $totalRevenue = $allOrders->filter(function($o) {
            $st = strtolower((string)($o->payment_status ?? ''));
            return str_contains($st, 'paid') || $st === 'completed';
        })->sum('total');

        // Fallback: If revenue is 0 but orders exist and are delivered/active, sum total of non-cancelled orders
        if ($totalRevenue == 0 && $totalSales > 0) {
            $totalRevenue = $allOrders->whereNotIn('status', ['cancelled', 'failed'])->sum('total');
        }

        $sales = $query->latest()->get();

        $uniqueCustomers = Order::where('shop_id', $shopId)
            ->whereNotNull('customer_name')
            ->distinct()
            ->pluck('customer_name');

        return Inertia::render('Seller/Sales/Index', [
            'recentSales'  => $sales,
            'totalSales'   => $totalSales,
            'totalRevenue' => $totalRevenue,
            'customers'    => $uniqueCustomers,
            'filters'      => $request->only(['search', 'customer', 'status', 'payment_status']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_name'    => 'required|string|max:255',
            'customer_phone'   => 'nullable|string|max:50',
            'shipping_address' => 'nullable|string|max:500',
            'subtotal'         => 'required|numeric|min:0',
            'shipping_fee'     => 'nullable|numeric|min:0',
            'discount'         => 'nullable|numeric|min:0',
            'total'            => 'required|numeric|min:0',
            'payment_method'   => 'required|string',
            'payment_status'   => 'required|in:Paid,Unpaid',
            'status'           => 'required|in:delivered,processing,pending,cancelled'
        ]);

        $user = Auth::user();
        $shop = $user ? $user->shop : null;
        $shopId = $shop ? $shop->id : 1;

        $orderNumber = 'INV-' . date('Ymd') . '-' . rand(100, 999);

        Order::create([
            'shop_id'          => $shopId,
            'order_number'     => $orderNumber,
            'customer_name'    => $request->customer_name,
            'customer_phone'   => $request->customer_phone ?? 'N/A',
            'shipping_address' => $request->shipping_address ?? 'In-store Purchase',
            'subtotal'         => $request->subtotal,
            'shipping_fee'     => $request->shipping_fee ?? 0,
            'discount'         => $request->discount ?? 0,
            'total'            => $request->total,
            'payment_method'   => $request->payment_method,
            'payment_status'   => $request->payment_status,
            'status'           => $request->status,
        ]);

        return redirect()->back()->with('success', 'Sale order recorded successfully.');
    }

    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $request->validate([
            'status'         => 'nullable|in:delivered,processing,pending,cancelled',
            'payment_status' => 'nullable|in:Paid,Unpaid',
            'customer_name'  => 'nullable|string|max:255',
            'total'          => 'nullable|numeric|min:0',
        ]);

        if ($request->has('status')) $order->status = $request->status;
        if ($request->has('payment_status')) $order->payment_status = $request->payment_status;
        if ($request->has('customer_name')) $order->customer_name = $request->customer_name;
        if ($request->has('total')) $order->total = $request->total;

        $order->save();

        return redirect()->back()->with('success', 'Sale updated successfully.');
    }

    public function destroy($id)
    {
        $order = Order::find($id);
        if ($order) {
            $order->delete();
        }

        return redirect()->back()->with('success', 'Sale deleted.');
    }
}
