<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\CommissionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['shop:id,name', 'items.product:id,name,slug,primary_image_url,sku,price'])
            ->latest();

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('order_number', 'like', "%{$s}%")
                  ->orWhere('customer_name', 'like', "%{$s}%")
                  ->orWhere('customer_phone', 'like', "%{$s}%");
            });
        }

        $orders = $query->paginate(20)->withQueryString();

        $statusCounts = [
            'All'        => Order::count(),
            'Pending'    => Order::where('status', 'pending')->count(),
            'Processing' => Order::where('status', 'processing')->count(),
            'Shipped'    => Order::where('status', 'shipped')->count(),
            'Delivered'  => Order::where('status', 'delivered')->count(),
            'Cancelled'  => Order::where('status', 'cancelled')->count(),
        ];

        $mapped = $orders->getCollection()->map(fn($o) => [
            'id'                  => $o->id,
            'order_number'        => $o->order_number,
            'customer_name'       => $o->customer_name,
            'customer_email'      => $o->customer_email,
            'phone'               => $o->customer_phone,
            'shipping_address'    => $o->shipping_address,
            'city'                => $o->city,
            'zone'                => $o->zone,
            'courier_name'        => $o->courier_name,
            'courier_tracking_id' => $o->courier_tracking_id,
            'payment_method'      => $o->payment_method,
            'payment_status'      => $o->payment_status,
            'subtotal'            => (float) ($o->subtotal ?? 0),
            'shipping_fee'        => (float) ($o->shipping_fee ?? 0),
            'discount'            => (float) ($o->discount ?? 0),
            'coupon_code'         => $o->coupon_code,
            'total'               => (float) $o->total,
            'notes'               => $o->notes,
            'date'                => $o->created_at?->toDateTimeString(),
            'shop'                => $o->shop?->name ?? '—',
            'status'              => ucfirst(strtolower($o->status ?? 'pending')),
            'is_unseen'           => empty($o->admin_seen_at),
            'admin_seen_at'       => $o->admin_seen_at?->toDateTimeString(),
            'items'               => $o->items->map(function ($item) {
                $product = $item->product;
                $imageUrl = $item->product_image 
                    ?: ($product?->primary_image_url 
                    ?: '/images/placeholder.png');

                return [
                    'id'           => $item->id,
                    'product_id'   => $item->product_id,
                    'product_name' => $item->product_name ?: ($product?->name ?? 'পণ্য'),
                    'product_slug' => $product?->slug,
                    'product_sku'  => $product?->sku ?? '—',
                    'product_image'=> $imageUrl,
                    'price'        => (float) $item->price,
                    'quantity'     => (int) $item->quantity,
                    'subtotal'     => (float) $item->subtotal,
                    'options'      => is_array($item->options) ? $item->options : (json_decode($item->options ?? '[]', true) ?: []),
                ];
            })->values()->all(),
        ]);

        return Inertia::render('Admin/OrdersPage', [
            'initialOrders' => $mapped->values(),
            'statusCounts'  => $statusCounts,
            'filters'       => $request->only(['status', 'search']),
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'customer_name'       => 'required|string|max:255',
            'phone'               => 'required|string|max:50',
            'customer_email'      => 'nullable|string|max:255',
            'shipping_address'    => 'nullable|string',
            'city'                => 'nullable|string|max:100',
            'zone'                => 'nullable|string|max:100',
            'total'               => 'required|numeric|min:0',
            'subtotal'            => 'nullable|numeric|min:0',
            'shipping_fee'        => 'nullable|numeric|min:0',
            'discount'            => 'nullable|numeric|min:0',
            'courier_name'        => 'nullable|string|max:100',
            'courier_tracking_id' => 'nullable|string|max:100',
            'payment_method'      => 'nullable|string|max:100',
            'payment_status'      => 'nullable|string|max:100',
            'notes'               => 'nullable|string',
            'status'              => 'nullable|string',
        ]);

        $order = Order::findOrFail($id);
        $order->customer_name       = $validated['customer_name'];
        $order->customer_phone      = $validated['phone'];
        $order->customer_email      = $validated['customer_email'] ?? $order->customer_email;
        $order->shipping_address    = $validated['shipping_address'] ?? $order->shipping_address;
        $order->city                = $validated['city'] ?? $order->city;
        $order->zone                = $validated['zone'] ?? $order->zone;
        $order->total               = $validated['total'];
        $order->subtotal            = $validated['subtotal'] ?? $order->subtotal;
        $order->shipping_fee        = $validated['shipping_fee'] ?? $order->shipping_fee;
        if (isset($validated['discount'])) {
            $order->discount        = $validated['discount'];
        }
        $order->courier_name        = $validated['courier_name'] ?? $order->courier_name;
        $order->courier_tracking_id = $validated['courier_tracking_id'] ?? $order->courier_tracking_id;
        $order->payment_method      = $validated['payment_method'] ?? $order->payment_method;
        $order->payment_status      = $validated['payment_status'] ?? $order->payment_status;
        $order->notes               = $validated['notes'] ?? $order->notes;
        
        $oldStatus = strtolower($order->status ?? '');
        if (!empty($validated['status'])) {
            $order->status = strtolower($validated['status']);
        }
        
        $order->save();

        // Send Email notifications & Process Wallet Cashback on status update
        $newStatus = strtolower($order->status ?? '');
        if ($oldStatus !== $newStatus) {
            if (in_array($newStatus, ['confirmed', 'processing'])) {
                \App\Services\EmailService::sendOrderConfirmationEmail($order);
                
                // Notify Vendor Shop Owner
                $shop = $order->shop;
                if (!$shop && $order->items->isNotEmpty()) {
                    $shop = $order->items->first()?->product?->shop;
                }
                if ($shop && $shop->user_id && $shop->user_id != 1) {
                    try {
                        \App\Models\Notification::create([
                            'user_id' => $shop->user_id,
                            'type'    => 'order_processing',
                            'title'   => '📦 অর্ডার প্রসেসিং হিসেবে অনুমোদিত!',
                            'body'    => "অর্ডার #{$order->order_number} সুপার অ্যাডমিন প্রসেসিং সম্পন্ন করেছেন। ভেন্ডর প্যানেল থেকে ডেলিভারি পিকআপ রিকোয়েস্ট পাঠান।",
                            'link'    => '/seller/orders',
                            'icon'    => 'truck',
                            'is_read' => false,
                        ]);
                    } catch (\Throwable $e) {}
                }
            } elseif (in_array($newStatus, ['completed', 'delivered'])) {
                \App\Services\EmailService::sendOrderCompletedEmail($order);
                Order::awardOrderCompletionCashback($order);
                // Settle commission automatically on delivery
                CommissionService::processOrderSettlement($order);
            }
        }

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['success' => true, 'message' => 'Customer and order details updated successfully.']);
        }

        return back()->with('success', 'Customer and order details updated successfully.');
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string',
        ]);

        $order = Order::findOrFail($id);
        $oldStatus = strtolower($order->status ?? '');
        $newStatus = strtolower($validated['status']);

        $order->status = $newStatus;
        if (!$order->admin_seen_at) {
            $order->admin_seen_at = now();
        }
        $order->save();

        \Illuminate\Support\Facades\Cache::forget('admin_nav_counts');

        // Send Email notifications & Process Wallet Cashback on status update
        if ($oldStatus !== $newStatus) {
            if (in_array($newStatus, ['confirmed', 'processing'])) {
                \App\Services\EmailService::sendOrderConfirmationEmail($order);

                // Notify Vendor Shop Owner
                $shop = $order->shop;
                if (!$shop && $order->items->isNotEmpty()) {
                    $shop = $order->items->first()?->product?->shop;
                }
                if ($shop && $shop->user_id && $shop->user_id != 1) {
                    try {
                        \App\Models\Notification::create([
                            'user_id' => $shop->user_id,
                            'type'    => 'order_processing',
                            'title'   => '📦 অর্ডার প্রসেসিং হিসেবে অনুমোদিত!',
                            'body'    => "অর্ডার #{$order->order_number} সুপার অ্যাডমিন প্রসেসিং সম্পন্ন করেছেন। ভেন্ডর প্যানেল থেকে ডেলিভারি পিকআপ রিকোয়েস্ট পাঠান।",
                            'link'    => '/seller/orders',
                            'icon'    => 'truck',
                            'is_read' => false,
                        ]);
                    } catch (\Throwable $e) {}
                }
            } elseif (in_array($newStatus, ['completed', 'delivered'])) {
                \App\Services\EmailService::sendOrderCompletedEmail($order);
                Order::awardOrderCompletionCashback($order);
                // Settle commission automatically on delivery
                CommissionService::processOrderSettlement($order);
            }
        }

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['success' => true, 'message' => "Order status updated to {$newStatus}."]);
        }

        return back()->with('success', "Order status updated to {$newStatus}.");
    }

    public function markSeen(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        if (!$order->admin_seen_at) {
            $order->update(['admin_seen_at' => now()]);
            \Illuminate\Support\Facades\Cache::forget('admin_nav_counts');
        }
        if ($request->header('X-Inertia')) {
            return back();
        }
        return response()->json(['success' => true]);
    }

    public function markAllSeen()
    {
        Order::whereNull('admin_seen_at')->update(['admin_seen_at' => now()]);
        \Illuminate\Support\Facades\Cache::forget('admin_nav_counts');
        return back()->with('success', 'সকল নতুন অর্ডার পঠিত হিসেবে চিহ্নিত করা হয়েছে!');
    }

    public function destroy(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $number = $order->order_number;
        $order->delete();

        \Illuminate\Support\Facades\Cache::forget('admin_nav_counts');

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['success' => true, 'message' => "Order {$number} deleted."]);
        }

        return back()->with('success', "Order {$number} deleted.");
    }

    public function bulkStatus(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:orders,id',
            'status' => 'required|string',
        ]);

        $newStatus = strtolower($validated['status']);
        $orders = Order::whereIn('id', $validated['ids'])->get();

        $count = 0;
        foreach ($orders as $order) {
            $oldStatus = strtolower($order->status ?? '');
            $order->status = $newStatus;
            if (!$order->admin_seen_at) {
                $order->admin_seen_at = now();
            }
            $order->save();
            $count++;

            // Email & Cashback / Commission / Vendor notification if status changed
            if ($oldStatus !== $newStatus) {
                try {
                    if (in_array($newStatus, ['confirmed', 'processing'])) {
                        \App\Services\EmailService::sendOrderConfirmationEmail($order);
                        $shop = $order->shop ?? $order->items->first()?->product?->shop;
                        if ($shop && $shop->user_id && $shop->user_id != 1) {
                            \App\Models\Notification::create([
                                'user_id' => $shop->user_id,
                                'type'    => 'order_processing',
                                'title'   => '📦 অর্ডার প্রসেসিং হিসেবে অনুমোদিত!',
                                'body'    => "অর্ডার #{$order->order_number} সুপার অ্যাডমিন প্রসেসিং সম্পন্ন করেছেন।",
                                'link'    => '/seller/orders',
                                'icon'    => 'truck',
                                'is_read' => false,
                            ]);
                        }
                    } elseif (in_array($newStatus, ['completed', 'delivered'])) {
                        \App\Services\EmailService::sendOrderCompletedEmail($order);
                        Order::awardOrderCompletionCashback($order);
                        CommissionService::processOrderSettlement($order);
                    }
                } catch (\Throwable $e) {}
            }
        }

        \Illuminate\Support\Facades\Cache::forget('admin_nav_counts');

        $displayStatus = ucfirst($newStatus);
        $message = "সফলভাবে {$count} টি অর্ডারের স্ট্যাটাস '{$displayStatus}' করা হয়েছে!";

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['success' => true, 'message' => $message, 'count' => $count]);
        }

        return back()->with('success', $message);
    }

    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer',
        ]);

        $ids = $validated['ids'];
        try {
            \App\Models\OrderItem::whereIn('order_id', $ids)->delete();
        } catch (\Throwable $e) {}

        $count = Order::whereIn('id', $ids)->delete();

        \Illuminate\Support\Facades\Cache::forget('admin_nav_counts');

        $message = "সফলভাবে {$count} টি অর্ডার মুছে ফেলা হয়েছে!";

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['success' => true, 'message' => $message, 'count' => $count]);
        }

        return back()->with('success', $message);
    }

    public function sendInvoiceEmail($id)
    {
        $order = Order::findOrFail($id);
        $sent = \App\Services\EmailService::sendInvoiceEmail($order);
        
        return response()->json([
            'success' => true,
            'message' => $sent ? "Invoice email sent to customer!" : "Invoice notification logged."
        ]);
    }
}
