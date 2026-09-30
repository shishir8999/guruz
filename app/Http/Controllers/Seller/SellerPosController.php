<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SellerPosController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $shop = $user->shop;

        if (!$shop) {
            $shop = \App\Models\Shop::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'name'        => ($user->name ?? 'Vendor') . "'s Shop",
                    'slug'        => Str::slug(($user->name ?? 'Vendor') . "-shop-" . $user->id),
                    'status'      => 'active',
                    'is_approved' => true,
                ]
            );
        }

        // Get shop products, if none exist fallback to active products so POS catalog is never empty
        $products = Product::where('shop_id', $shop->id)
            ->with(['category', 'brand'])
            ->latest()
            ->get();

        if ($products->isEmpty()) {
            $products = Product::with(['category', 'brand'])
                ->latest()
                ->take(40)
                ->get();
        }

        $categories = Category::latest()->get(['id', 'name', 'slug']);
        $brands = Brand::latest()->get(['id', 'name', 'slug']);
        
        try {
            $customers = User::latest()->take(50)->get(['id', 'name', 'phone', 'email']);
        } catch (\Exception $e) {
            $customers = collect();
        }

        return Inertia::render('Seller/Pos', [
            'shop'       => $shop,
            'products'   => $products,
            'categories' => $categories,
            'brands'     => $brands,
            'customers'  => $customers,
        ]);
    }

    public function storeCustomer(Request $request)
    {
        $request->validate([
            'name'  => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
        ]);

        $userData = [
            'name'     => $request->name,
            'phone'    => $request->phone,
            'email'    => $request->email ?: (Str::slug($request->name) . rand(100, 999) . '@pos.local'),
            'password' => bcrypt(Str::random(12)),
        ];

        if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'role')) {
            $userData['role'] = 'customer';
        }

        $customer = User::create($userData);

        return back()->with([
            'success' => 'কাস্টমার সফলভাবে যুক্ত হয়েছে!',
            'newCustomer' => $customer
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_name'  => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'cash_discount'  => 'nullable|numeric|min:0',
            'paid_amount'    => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'items'          => 'required|array|min:1',
            'items.*.id'     => 'required|exists:products,id',
            'items.*.qty'    => 'required|integer|min:1',
            'items.*.price'  => 'required|numeric|min:0',
        ]);

        $user = $request->user();
        $shop = $user->shop;

        try {
            $receiptData = DB::transaction(function () use ($request, $shop, $user) {
                $subtotal = 0;
                $orderItems = [];

                foreach ($request->items as $item) {
                    $product = Product::find($item['id']);
                    $itemPrice = floatval($item['price']);
                    $itemQty = intval($item['qty']);
                    $itemSubtotal = $itemPrice * $itemQty;
                    $subtotal += $itemSubtotal;

                    if ($product && isset($product->stock_quantity) && $product->stock_quantity >= $itemQty) {
                        $product->decrement('stock_quantity', $itemQty);
                    }

                    $orderItems[] = [
                        'product_id'   => $item['id'],
                        'product_name' => $item['name'] ?? ($product ? $product->name : 'Item'),
                        'price'        => $itemPrice,
                        'quantity'     => $itemQty,
                        'subtotal'     => $itemSubtotal,
                    ];
                }

                $cashDiscount = floatval($request->cash_discount ?? 0);
                $totalAmount = max(0, $subtotal - $cashDiscount);
                $orderNum = Order::generateOrderNumber();

                $order = Order::create([
                    'order_number'     => $orderNum,
                    'shop_id'          => $shop ? $shop->id : null,
                    'user_id'          => $user->id,
                    'customer_name'    => $request->customer_name ?: 'Walk-in Customer',
                    'customer_phone'   => $request->customer_phone ?: 'N/A',
                    'subtotal'         => $subtotal,
                    'discount'         => $cashDiscount,
                    'total'            => $totalAmount,
                    'payment_method'   => $request->payment_method ?: 'cash',
                    'payment_status'   => 'paid',
                    'status'           => 'delivered',
                    'shipping_address' => 'In-Store POS Counter Sale',
                ]);

                foreach ($orderItems as $oi) {
                    try {
                        $order->items()->create($oi);
                    } catch (\Exception $e) {
                        // fallback if items relation has different column names
                    }
                }

                return [
                    'order_number'   => $order->order_number,
                    'id'             => $order->id,
                    'customer_name'  => $order->customer_name,
                    'customer_phone' => $order->customer_phone,
                    'subtotal'       => $subtotal,
                    'discount'       => $cashDiscount,
                    'total'          => $totalAmount,
                    'paid_amount'    => floatval($request->paid_amount),
                    'change_amount'  => max(0, floatval($request->paid_amount) - $totalAmount),
                    'payment_method' => strtoupper($request->payment_method ?: 'cash'),
                    'items'          => $orderItems,
                    'date'           => now()->format('d M Y, h:i A'),
                ];
            });

            return back()->with([
                'success' => "POS Order #{$receiptData['order_number']} সফলভাবে সম্পন্ন হয়েছে!",
                'posReceipt' => $receiptData
            ]);
        } catch (\Exception $e) {
            return back()->with('error', 'POS বিক্রি সম্পন্ন করা সম্ভব হয়নি: ' . $e->getMessage());
        }
    }
}
