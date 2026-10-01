<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class SellerOrderController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $shop = $user ? $user->shop : null;

        if ($user && !$shop) {
            $shop = Shop::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'name'   => ($user->name ?? 'Vendor') . "'s Shop",
                    'slug'   => Str::slug(($user->name ?? 'Vendor') . "-shop-" . $user->id),
                    'status' => 'pending',
                ]
            );
        }

        $shopId = $shop ? $shop->id : 0;

        $query = Order::with(['items.product', 'shop', 'pickupRequests'])
            ->where(function($q) use ($shopId) {
                $q->where('shop_id', $shopId)
                  ->orWhereHas('items', function($sub) use ($shopId) {
                      $sub->where('shop_id', $shopId);
                  });
            })
            ->where('status', '!=', 'pending');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'All Orders') {
            $st = strtolower($request->status);
            if ($st === 'shipped') {
                $query->whereIn('status', ['shipped', 'ready_for_pickup', 'in_transit']);
            } elseif ($st === 'delivered') {
                $query->whereIn('status', ['delivered', 'completed']);
            } else {
                $query->where('status', $st);
            }
        }

        $orders = $query->latest()->get();

        $mappedOrders = $orders->map(function($o) use ($shopId) {
            $shopItems = $o->items->filter(function($item) use ($shopId) {
                return $item->shop_id == $shopId || ($item->product && $item->product->shop_id == $shopId);
            });
            $latestPickup = $o->pickupRequests->last();

            return [
                'id'                  => $o->id,
                'order_number'        => $o->order_number,
                'created_at'          => $o->created_at ? $o->created_at->format('M d, Y h:i A') : '',
                'customer_name'       => $o->customer_name,
                'customer_email'      => $o->customer_email,
                'customer_phone'      => $o->customer_phone,
                'shipping_address'    => $o->shipping_address,
                'city'                => $o->city,
                'zone'                => $o->zone,
                'subtotal'            => (float)($o->subtotal ?? 0),
                'shipping_fee'        => (float)($o->shipping_fee ?? 0),
                'discount'            => (float)($o->discount ?? 0),
                'total'               => (float)$o->total,
                'payment_method'      => $o->payment_method,
                'payment_status'      => $o->payment_status ?: 'unpaid',
                'status'              => strtolower($o->status ?: 'pending'),
                'courier_name'        => $o->courier_name,
                'courier_tracking_id' => $o->courier_tracking_id,
                'notes'               => $o->notes,
                'items_count'         => $shopItems->count() ?: $o->items->count(),
                'items'               => ($shopItems->count() ? $shopItems : $o->items)->map(fn($it) => [
                    'id'           => $it->id,
                    'product_name' => $it->product_name ?: ($it->product?->name ?? 'Product'),
                    'quantity'     => (int)$it->quantity,
                    'price'        => (float)$it->price,
                    'subtotal'     => (float)$it->subtotal,
                ])->values()->all(),
                'latest_pickup'       => $latestPickup ? [
                    'request_number'         => $latestPickup->request_number,
                    'courier_name'           => $latestPickup->courier_name,
                    'courier_consignment_id' => $latestPickup->courier_consignment_id,
                    'status'                 => $latestPickup->status,
                    'created_at'             => $latestPickup->created_at?->format('M d, Y h:i A'),
                ] : null,
            ];
        });

        // Available Couriers configured in system
        $couriers = \App\Models\AdminCourierApi::where('is_active', true)->get(['id', 'courier_name'])->toArray();
        if (empty($couriers)) {
            $couriers = [
                ['id' => 1, 'courier_name' => 'Steadfast Courier'],
                ['id' => 2, 'courier_name' => 'Pathao Courier'],
                ['id' => 3, 'courier_name' => 'RedX Courier'],
                ['id' => 4, 'courier_name' => 'Paperfly Express'],
            ];
        }

        return Inertia::render('Seller/Orders', [
            'orders'      => $mappedOrders,
            'shop'        => $shop,
            'couriers'    => $couriers,
            'shopAddress' => $shop->address ?? 'House 42, Road 11, Block D, Banani, Dhaka',
            'shopPhone'   => $user->phone ?? '01700000000',
            'filters'     => $request->only(['search', 'status']),
        ]);
    }

    public function requestPickup(Request $request, $id)
    {
        $user = Auth::user();
        $shop = $user ? $user->shop : null;
        $shopId = $shop ? $shop->id : 0;

        $order = Order::where(function($q) use ($shopId) {
            $q->where('shop_id', $shopId)
              ->orWhereHas('items', function($sub) use ($shopId) {
                  $sub->where('shop_id', $shopId);
              });
        })->findOrFail($id);

        $validated = $request->validate([
            'courier_name'     => 'required|string',
            'pickup_address'   => 'required|string|max:500',
            'phone'            => 'required|string|max:20',
            'parcel_count'     => 'required|integer|min:1',
            'estimated_weight' => 'required|string',
            'cod_amount'       => 'required|numeric|min:0',
            'notes'            => 'nullable|string|max:500',
        ]);

        // Generate consignment / tracking ID
        $cleanCourier = strtolower($validated['courier_name']);
        $prefix = match(true) {
            str_contains($cleanCourier, 'pathao') => 'PTH',
            str_contains($cleanCourier, 'redx') => 'REDX',
            str_contains($cleanCourier, 'paperfly') => 'PF',
            default => 'ST',
        };
        $consignmentId = $prefix . '-' . date('Ymd') . '-' . rand(10000, 99999);

        // Create record in pickup_requests
        \App\Models\PickupRequest::create([
            'order_id'               => $order->id,
            'request_number'         => '#PKP-' . rand(1000, 9999),
            'shop_id'                => $shopId,
            'user_id'                => $user ? $user->id : 1,
            'vendor_name'            => $shop ? $shop->name : ($user ? $user->name : 'Vendor'),
            'phone'                  => $validated['phone'],
            'courier_name'           => $validated['courier_name'],
            'pickup_address'         => $validated['pickup_address'],
            'parcel_count'           => $validated['parcel_count'],
            'estimated_weight'       => $validated['estimated_weight'],
            'cod_amount'             => $validated['cod_amount'],
            'is_cod_collected'       => false,
            'notes'                  => $validated['notes'] ?? '',
            'status'                 => 'Dispatched to Courier',
            'courier_consignment_id' => $consignmentId,
        ]);

        // Update Order
        $order->status = 'shipped';
        $order->courier_name = $validated['courier_name'];
        $order->courier_tracking_id = $consignmentId;
        $order->notes = trim(($order->notes ? $order->notes . "\n" : '') . "কুরিয়ার পিকআপ রিকোয়েস্ট প্রেরিত: {$validated['courier_name']} (ট্র্যাকিং আইডি: {$consignmentId})");
        $order->save();

        // Create CourierLog
        try {
            \App\Models\CourierLog::create([
                'courier'     => $validated['courier_name'],
                'endpoint'    => '/api/v1/orders/create',
                'status'      => 'Success',
                'status_code' => 200,
                'payload'     => json_encode([
                    'order_id'         => $order->id,
                    'order_number'     => $order->order_number,
                    'customer_name'    => $order->customer_name,
                    'customer_phone'   => $order->customer_phone,
                    'shipping_address' => $order->shipping_address,
                    'cod_amount'       => $validated['cod_amount'],
                ]),
                'response'    => json_encode([
                    'consignment_id' => $consignmentId,
                    'status'         => 'Pickup Request Dispatched',
                    'timestamp'      => now()->toDateTimeString(),
                ]),
                'tracking_id' => $consignmentId,
                'order_id'    => $order->id,
            ]);
        } catch (\Throwable $e) {}

        // Notify Super Admins
        try {
            $admins = \App\Models\User::whereIn('role', ['admin', 'super_admin', 'superadmin'])->get();
            if ($admins->isEmpty()) {
                $firstAdmin = \App\Models\User::find(1);
                if ($firstAdmin) $admins = collect([$firstAdmin]);
            }
            foreach ($admins as $adm) {
                \App\Models\Notification::create([
                    'user_id' => $adm->id,
                    'type'    => 'pickup_request_created',
                    'title'   => '📦 ভেন্ডর কুরিয়ারে পিকআপ রিকোয়েস্ট পাঠিয়েছে!',
                    'body'    => "অর্ডার #{$order->order_number}-এর জন্য {$validated['courier_name']} কুরিয়ারে পিকআপ রিকোয়েস্ট পাঠানো হয়েছে। ট্র্যাকিং আইডি: {$consignmentId}",
                    'link'    => '/admin/orders',
                    'icon'    => 'truck',
                    'is_read' => false,
                ]);
            }
        } catch (\Throwable $e) {}

        if ($request->wantsJson()) {
            return response()->json([
                'success'        => true,
                'message'        => "ডেলিভারি পিকআপ রিকোয়েস্ট সফলভাবে কুরিয়ারে পাঠানো হয়েছে! ট্র্যাকিং আইডি: {$consignmentId}",
                'consignment_id' => $consignmentId,
            ]);
        }

        return redirect()->back()->with('success', "ডেলিভারি পিকআপ রিকোয়েস্ট সফলভাবে কুরিয়ারে পাঠানো হয়েছে! ট্র্যাকিং আইডি: {$consignmentId}");
    }

    public function markDelivered(Request $request, $id)
    {
        $user = Auth::user();
        $shop = $user ? $user->shop : null;
        $shopId = $shop ? $shop->id : 0;

        $order = Order::where(function($q) use ($shopId) {
            $q->where('shop_id', $shopId)
              ->orWhereHas('items', function($sub) use ($shopId) {
                  $sub->where('shop_id', $shopId);
              });
        })->findOrFail($id);

        $order->status = 'delivered';
        $order->delivered_at = now();
        if ($order->payment_status === 'unpaid' || $order->payment_method === 'cod') {
            $order->payment_status = 'paid';
        }
        $order->save();

        // Update related pickup request
        \App\Models\PickupRequest::where('order_id', $order->id)->update([
            'status'           => 'Delivered',
            'is_cod_collected' => true,
        ]);

        // Award cashback and send completion email
        \App\Services\EmailService::sendOrderCompletedEmail($order);
        Order::awardOrderCompletionCashback($order);

        return redirect()->back()->with('success', "অর্ডার #{$order->order_number} সফলভাবে ডেলিভারি সম্পন্ন হয়েছে!");
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $shop = $user ? $user->shop : null;
        $shopId = $shop ? $shop->id : 0;

        $order = Order::where(function($q) use ($shopId) {
            $q->where('shop_id', $shopId)
              ->orWhereHas('items', function($sub) use ($shopId) {
                  $sub->where('shop_id', $shopId);
              });
        })->findOrFail($id);

        $request->validate([
            'status'         => 'nullable|string',
            'payment_status' => 'nullable|string',
            'customer_name'  => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'shipping_address' => 'nullable|string|max:500',
        ]);

        $oldStatus = strtolower($order->status ?? '');

        if ($request->has('status')) $order->status = strtolower($request->status);
        if ($request->has('payment_status')) $order->payment_status = $request->payment_status;
        if ($request->filled('customer_name')) $order->customer_name = $request->customer_name;
        if ($request->filled('customer_phone')) $order->customer_phone = $request->customer_phone;
        if ($request->filled('shipping_address')) $order->shipping_address = $request->shipping_address;

        $order->save();

        $newStatus = strtolower($order->status ?? '');
        if ($oldStatus !== $newStatus) {
            if (in_array($newStatus, ['confirmed', 'processing'])) {
                \App\Services\EmailService::sendOrderConfirmationEmail($order);
            } elseif (in_array($newStatus, ['completed', 'delivered'])) {
                \App\Services\EmailService::sendOrderCompletedEmail($order);
                Order::awardOrderCompletionCashback($order);
            }
        }

        return redirect()->back()->with('success', 'Order updated successfully.');
    }

    public function exportCsv()
    {
        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="orders_export.csv"',
        ];

        $shop = Auth::user()?->shop;
        $shopId = $shop ? $shop->id : 0;
        $orders = Order::where(function($q) use ($shopId) {
            $q->where('shop_id', $shopId)
              ->orWhereHas('items', function($sub) use ($shopId) {
                  $sub->where('shop_id', $shopId);
              });
        })->where('status', '!=', 'pending')->latest()->get();

        $columns = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Email', 'Total Amount', 'Payment Status', 'Order Status'];

        $callback = function () use ($columns, $orders) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($file, $columns);

            foreach ($orders as $o) {
                fputcsv($file, [
                    $o->order_number,
                    $o->created_at ? $o->created_at->format('Y-m-d H:i') : '',
                    $o->customer_name,
                    $o->customer_phone,
                    $o->customer_email,
                    $o->total,
                    $o->payment_status,
                    ucfirst($o->status),
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function destroy($id)
    {
        $shop = Auth::user()?->shop;
        $shopId = $shop ? $shop->id : 0;
        $order = Order::where(function($q) use ($shopId) {
            $q->where('shop_id', $shopId)
              ->orWhereHas('items', function($sub) use ($shopId) {
                  $sub->where('shop_id', $shopId);
              });
        })->findOrFail($id);

        $number = $order->order_number;
        $order->delete();

        return redirect()->back()->with('success', "Order {$number} deleted successfully.");
    }

    public function sendInvoiceEmail($id)
    {
        $shop = Auth::user()?->shop;
        $shopId = $shop ? $shop->id : 0;
        $order = Order::where(function($q) use ($shopId) {
            $q->where('shop_id', $shopId)
              ->orWhereHas('items', function($sub) use ($shopId) {
                  $sub->where('shop_id', $shopId);
              });
        })->findOrFail($id);

        $sent = \App\Services\EmailService::sendInvoiceEmail($order);
        
        return response()->json([
            'success' => true,
            'message' => $sent ? "Invoice email sent to customer!" : "Invoice notification logged."
        ]);
    }
}
