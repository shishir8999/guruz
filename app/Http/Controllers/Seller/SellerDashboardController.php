<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\SellerWallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SellerDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $shop = $user->shop;

        if (!$shop) {
            return Inertia::render('Seller/Dashboard', [
                'shop' => null,
                'stats' => [
                    'total_orders' => 0,
                    'pending_orders' => 0,
                    'total_revenue' => 0,
                    'total_products' => 0,
                    'wallet_balance' => 0,
                ],
                'recent_orders' => [],
            ]);
        }

        $wallet = SellerWallet::where('shop_id', $shop->id)->first();
        $wallet = SellerWallet::where('shop_id', $shop->id)->first();
        $shopOrderQuery = Order::where(function($q) use ($shop) {
            $q->where('shop_id', $shop->id)
              ->orWhereHas('items', function($sub) use ($shop) {
                  $sub->where('shop_id', $shop->id);
              });
        })->where('status', '!=', 'pending');

        $totalOrders = (clone $shopOrderQuery)->count();
        $deliveredOrders = (clone $shopOrderQuery)->where('status', 'delivered')->count();
        $cancelledOrders = (clone $shopOrderQuery)->where('status', 'cancelled')->count();
        $returnedOrders = (clone $shopOrderQuery)->where('status', 'returned')->count();
        $processingOrders = (clone $shopOrderQuery)->where('status', 'processing')->count();
        $pendingOrders = $processingOrders; // For seller, orders awaiting their action are processing orders!
        
        $totalRevenue = (clone $shopOrderQuery)
            ->whereIn('status', ['delivered', 'shipped'])
            ->sum('total');
        $totalProducts = Product::where('shop_id', $shop->id)->count();

        $recentOrders = (clone $shopOrderQuery)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get(['id', 'order_number', 'total', 'status', 'created_at', 'customer_name']);

        return Inertia::render('Seller/Dashboard', [
            'shop' => [
                'id' => $shop->id,
                'name' => $shop->name,
                'logo_url' => $shop->logo_url,
                'status' => $shop->status,
                'rating' => $shop->rating ?? null,
            ],
            'stats' => [
                'total_orders' => $totalOrders,
                'pending_orders' => $pendingOrders,
                'total_revenue' => $totalRevenue,
                'total_products' => $totalProducts,
                'wallet_balance' => $wallet?->balance ?? 0,
                'order_summary' => [
                    'pending' => $pendingOrders,
                    'delivered' => $deliveredOrders,
                    'cancelled' => $cancelledOrders,
                    'returned' => $returnedOrders,
                    'processing' => $processingOrders,
                ],
                // placeholders for now
                'total_purchases' => 0,
                'total_expenses' => 0,
                'net_profit' => 0,
                'packly_earnings' => 0,
                'total_purchase_due' => 0,
                'others_due' => 0,
            ],
            'recent_orders' => $recentOrders,
        ]);
    }
}
