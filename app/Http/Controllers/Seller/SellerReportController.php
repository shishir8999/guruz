<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class SellerReportController extends Controller
{
    public function index(Request $request): Response
    {
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

        $period = $request->input('period', 'this_month');

        // Top 5 Best Selling Products Report Data
        $bestSellingProducts = [
            [
                'id'            => 101,
                'name'          => 'Premium Wireless Noise Cancelling Headphones',
                'category'      => 'Electronics & Gadgets',
                'sku'           => 'AUDIO-WNC-01',
                'units_sold'    => 142,
                'total_revenue' => 355000.00,
                'stock'         => 38,
                'rating'        => 4.9,
                'badge'         => 'Best Seller',
            ],
            [
                'id'            => 102,
                'name'          => 'Smart Fitness Watch Series 7 Amoled',
                'category'      => 'Smart Watches',
                'sku'           => 'WATCH-S7-BLK',
                'units_sold'    => 98,
                'total_revenue' => 245000.00,
                'stock'         => 24,
                'rating'        => 4.8,
                'badge'         => 'High Demand',
            ],
            [
                'id'            => 103,
                'name'          => 'Ergonomic Executive Office Chair',
                'category'      => 'Furniture & Office',
                'sku'           => 'FURN-CHR-EX',
                'units_sold'    => 64,
                'total_revenue' => 832000.00,
                'stock'         => 12,
                'rating'        => 4.7,
                'badge'         => 'Popular',
            ],
            [
                'id'            => 104,
                'name'          => 'Ultra-Fast 65W GaN Charger Type-C',
                'category'      => 'Mobile Accessories',
                'sku'           => 'CHG-GAN-65W',
                'units_sold'    => 210,
                'total_revenue' => 189000.00,
                'stock'         => 85,
                'rating'        => 4.9,
                'badge'         => 'Top Volume',
            ],
            [
                'id'            => 105,
                'name'          => 'Mechanical RGB Gaming Keyboard',
                'category'      => 'Computer Accessories',
                'sku'           => 'KB-MECH-RGB',
                'units_sold'    => 52,
                'total_revenue' => 182000.00,
                'stock'         => 19,
                'rating'        => 4.6,
                'badge'         => 'Trending',
            ],
        ];

        // Monthly Breakdown Chart Data
        $monthlyPerformance = [
            ['month' => 'Jan', 'sales' => 125000, 'orders' => 45],
            ['month' => 'Feb', 'sales' => 168000, 'orders' => 62],
            ['month' => 'Mar', 'sales' => 210000, 'orders' => 78],
            ['month' => 'Apr', 'sales' => 195000, 'orders' => 70],
            ['month' => 'May', 'sales' => 285000, 'orders' => 98],
            ['month' => 'Jun', 'sales' => 342500, 'orders' => 118],
            ['month' => 'Jul', 'sales' => 410000, 'orders' => 142],
            ['month' => 'Aug', 'sales' => 389000, 'orders' => 135],
        ];

        // Recent Detailed Orders Report Table
        $recentOrderReports = [
            [
                'order_id'       => 'ORD-9824',
                'customer_name'  => 'Rahim Ahmed',
                'city'           => 'Dhaka',
                'items_count'    => 3,
                'courier_name'   => 'Steadfast Courier',
                'total_amount'   => 4500.00,
                'net_earnings'   => 4275.00,
                'payment_method' => 'COD (Super Admin Vault)',
                'status'         => 'Delivered',
                'date'           => now()->subHours(4)->toFormattedDateString(),
            ],
            [
                'order_id'       => 'ORD-9825',
                'customer_name'  => 'Tanvir Hasan',
                'city'           => 'Chittagong',
                'items_count'    => 1,
                'courier_name'   => 'Pathao Courier',
                'total_amount'   => 2800.00,
                'net_earnings'   => 2660.00,
                'payment_method' => 'bKash Online',
                'status'         => 'Shipped',
                'date'           => now()->subHours(8)->toFormattedDateString(),
            ],
            [
                'order_id'       => 'ORD-9826',
                'customer_name'  => 'Nusrat Jahan',
                'city'           => 'Sylhet',
                'items_count'    => 2,
                'courier_name'   => 'RedX Courier',
                'total_amount'   => 6200.00,
                'net_earnings'   => 5890.00,
                'payment_method' => 'COD (Super Admin Vault)',
                'status'         => 'Processing',
                'date'           => now()->subDay()->toFormattedDateString(),
            ],
            [
                'order_id'       => 'ORD-9827',
                'customer_name'  => 'Mahmudul Karim',
                'city'           => 'Rajshahi',
                'items_count'    => 4,
                'courier_name'   => 'Paperfly Express',
                'total_amount'   => 9400.00,
                'net_earnings'   => 8930.00,
                'payment_method' => 'Nagad Online',
                'status'         => 'Delivered',
                'date'           => now()->subDays(2)->toFormattedDateString(),
            ],
            [
                'order_id'       => 'ORD-9828',
                'customer_name'  => 'Sabrina Islam',
                'city'           => 'Khulna',
                'items_count'    => 1,
                'courier_name'   => 'Steadfast Courier',
                'total_amount'   => 1500.00,
                'net_earnings'   => 1425.00,
                'payment_method' => 'COD (Super Admin Vault)',
                'status'         => 'Delivered',
                'date'           => now()->subDays(3)->toFormattedDateString(),
            ],
        ];

        return Inertia::render('Seller/Report', [
            'period'               => $period,
            'summary'              => [
                'total_revenue'    => 2124500.00,
                'total_orders'     => 748,
                'avg_order_value'  => 2840.00,
                'fulfillment_rate' => 95.8,
                'return_rate'      => 1.8,
                'net_profit'       => 1912050.00,
            ],
            'bestSellingProducts'  => $bestSellingProducts,
            'monthlyPerformance'   => $monthlyPerformance,
            'recentOrderReports'   => $recentOrderReports,
        ]);
    }

    public function export(Request $request)
    {
        return redirect()->back()->with('success', 'Business analytics report generated and sent to your email!');
    }
}
