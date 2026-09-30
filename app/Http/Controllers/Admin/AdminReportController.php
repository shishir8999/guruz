<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminReportController extends Controller
{
    public function index(Request $request)
    {
        $dateRange = $request->query('range', 'this_month');

        $queryStart = match($dateRange) {
            'today' => now()->startOfDay(),
            'this_week' => now()->startOfWeek(),
            'this_month' => now()->startOfMonth(),
            'this_year' => now()->startOfYear(),
            default => now()->startOfMonth(),
        };

        $queryEnd = now()->endOfDay();

        // Orders Query
        $orders = \App\Models\Order::whereBetween('created_at', [$queryStart, $queryEnd]);
        
        $totalOrders = $orders->count();
        $completedOrders = (clone $orders)->where('status', 'delivered')->count();
        $pendingOrders = (clone $orders)->whereIn('status', ['pending', 'processing'])->count();
        $canceledOrders = (clone $orders)->where('status', 'cancelled')->count();
        $returnedOrders = (clone $orders)->where('status', 'returned')->count();

        $totalRevenue = (clone $orders)->where('status', 'delivered')->sum('total');
        $taxCollected = 0; // if you don't have tax in orders, keeping 0
        $shippingCollected = (clone $orders)->where('status', 'delivered')->sum('shipping_fee');
        $averageOrderValue = $completedOrders > 0 ? $totalRevenue / $completedOrders : 0;

        // Sales Trend (Grouping by Date)
        $trendData = (clone $orders)
            ->where('status', 'delivered')
            ->selectRaw('DATE(created_at) as date, SUM(total) as amount')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // Top Selling Products
        $topSelling = \DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereBetween('orders.created_at', [$queryStart, $queryEnd])
            ->where('orders.status', 'delivered')
            ->select('order_items.product_name as name', \DB::raw('SUM(order_items.quantity) as sold'))
            ->groupBy('order_items.product_id', 'order_items.product_name')
            ->orderByDesc('sold')
            ->take(5)
            ->get();

        // Low stock - just get all products with low stock (independent of date range mostly)
        $lowStock = \App\Models\Product::where('stock_quantity', '<=', 5)->where('stock_quantity', '>', 0)->count();
        $outOfStock = \App\Models\Product::where('stock_quantity', 0)->count();

        // Customers
        $newCustomers = \App\Models\User::whereBetween('created_at', [$queryStart, $queryEnd])->count();
        $totalCustomers = \App\Models\User::count(); // Usually total customers is overall, or active in period

        $reports = [
            'sales' => [
                'total_revenue' => $totalRevenue,
                'tax_collected' => $taxCollected,
                'shipping_collected' => $shippingCollected,
                'average_order_value' => round($averageOrderValue, 2),
                'trend' => $trendData
            ],
            'orders' => [
                'total_orders' => $totalOrders,
                'completed' => $completedOrders,
                'pending' => $pendingOrders,
                'canceled' => $canceledOrders,
                'returned' => $returnedOrders,
            ],
            'inventory' => [
                'low_stock_items' => $lowStock,
                'out_of_stock' => $outOfStock,
                'top_selling' => $topSelling
            ],
            'customers' => [
                'total_customers' => $totalCustomers,
                'new_this_period' => $newCustomers,
                'returning_this_period' => 0, // Needs complex logic, stubbing for now
            ]
        ];

        return Inertia::render('Admin/ReportsDashboard', [
            'reports' => $reports,
            'currentRange' => $dateRange
        ]);
    }

    public function exportCsv(Request $request)
    {
        $dateRange = $request->query('range', 'this_month');

        $queryStart = match($dateRange) {
            'today' => now()->startOfDay(),
            'this_week' => now()->startOfWeek(),
            'this_month' => now()->startOfMonth(),
            'this_year' => now()->startOfYear(),
            default => now()->startOfMonth(),
        };

        $queryEnd = now()->endOfDay();

        $orders = \App\Models\Order::whereBetween('created_at', [$queryStart, $queryEnd])->get();

        $filename = "reports_export_{$dateRange}.csv";
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['Order ID', 'Status', 'Total', 'Created At'];

        $callback = function() use($orders, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->order_number ?? $order->id,
                    $order->status,
                    $order->total,
                    $order->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
