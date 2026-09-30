<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminCourierController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Courier/Couriers', [
            'couriers' => \App\Models\Courier::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'logo' => 'nullable|image|max:2048',
            'delivery_fee' => 'required|numeric|min:0',
            'phone' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'code' => 'nullable|string|max:255|unique:couriers',
            'email' => 'nullable|email|max:255',
            'tracking_url_template' => 'nullable|string|max:255',
            'per_kg_fee' => 'required|numeric|min:0',
            'cod_fee_percent' => 'required|numeric|min:0',
            'sort_order' => 'required|integer',
            'coverage_areas' => 'nullable|string',
            'api_endpoint' => 'nullable|string|max:255',
            'api_key' => 'nullable|string|max:255',
            'api_secret' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($request->hasFile('logo')) {
            $path = \App\Services\StorageHelper::storePublicly($request->file('logo'), 'couriers');
            $validated['logo'] = '/storage/' . $path;
        }

        if (array_key_exists('api_endpoint', $validated)) {
            $validated['base_url'] = $validated['api_endpoint'];
            unset($validated['api_endpoint']);
        }

        $validFields = [
            'name', 'logo', 'base_url', 'api_key', 'api_secret',
            'delivery_fee', 'per_kg_fee', 'cod_fee_percent', 'is_active'
        ];

        \App\Models\Courier::create(array_intersect_key($validated, array_flip($validFields)));

        return redirect()->back()->with('success', 'Courier added successfully.');
    }

    public function update(Request $request, \App\Models\Courier $courier)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'logo' => 'nullable|image|max:2048',
            'delivery_fee' => 'required|numeric|min:0',
            'phone' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'code' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'tracking_url_template' => 'nullable|string|max:255',
            'per_kg_fee' => 'required|numeric|min:0',
            'cod_fee_percent' => 'required|numeric|min:0',
            'sort_order' => 'required|integer',
            'coverage_areas' => 'nullable|string',
            'api_endpoint' => 'nullable|string|max:255',
            'api_key' => 'nullable|string|max:255',
            'api_secret' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($request->hasFile('logo')) {
            $path = \App\Services\StorageHelper::storePublicly($request->file('logo'), 'couriers');
            $validated['logo'] = '/storage/' . $path;
        }

        if (array_key_exists('api_endpoint', $validated)) {
            $validated['base_url'] = $validated['api_endpoint'];
            unset($validated['api_endpoint']);
        }

        $validFields = [
            'name', 'logo', 'base_url', 'api_key', 'api_secret',
            'delivery_fee', 'per_kg_fee', 'cod_fee_percent', 'is_active'
        ];

        $courier->update(array_intersect_key($validated, array_flip($validFields)));

        return redirect()->back()->with('success', 'Courier updated successfully.');
    }

    public function destroy(\App\Models\Courier $courier)
    {
        $courier->delete();
        return redirect()->back()->with('success', 'Courier deleted successfully.');
    }

    public function shipments()
    {
        $orders = \App\Models\Order::whereNotNull('courier_name')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_id' => $order->order_number,
                    'courier' => $order->courier_name,
                    'tracking_id' => $order->courier_tracking_id ?? 'N/A',
                    'status' => ucfirst($order->status),
                    'date' => $order->created_at->format('M d, Y'),
                ];
            });

        return Inertia::render('Admin/Courier/Shipments', [
            'shipments' => $orders
        ]);
    }

    public function shippingRates()
    {
        $charges = \App\Models\DeliveryCharge::orderBy('sort_order')->get();
        if ($charges->isEmpty()) {
            \App\Models\DeliveryCharge::create([
                'code' => 'inside_dhaka',
                'title' => 'ঢাকার ভিতরে',
                'title_en' => 'Inside Dhaka',
                'charge' => 80.00,
                'estimated_days' => '২-৩ দিন',
                'is_default' => true,
                'is_active' => true,
                'sort_order' => 1,
            ]);
            \App\Models\DeliveryCharge::create([
                'code' => 'outside_dhaka',
                'title' => 'ঢাকার বাইরে',
                'title_en' => 'Outside Dhaka',
                'charge' => 120.00,
                'estimated_days' => '৩-৫ দিন',
                'is_default' => false,
                'is_active' => true,
                'sort_order' => 2,
            ]);
            $charges = \App\Models\DeliveryCharge::orderBy('sort_order')->get();
        }

        $insideDhaka = $charges->firstWhere('code', 'inside_dhaka');
        $outsideDhaka = $charges->firstWhere('code', 'outside_dhaka');

        $settings = [
            'shipping_inside_dhaka' => $insideDhaka ? (string)$insideDhaka->charge : '80',
            'shipping_outside_dhaka' => $outsideDhaka ? (string)$outsideDhaka->charge : '120',
            'estimated_days_inside' => $insideDhaka ? ($insideDhaka->estimated_days ?? '২-৩ দিন') : '২-৩ দিন',
            'estimated_days_outside' => $outsideDhaka ? ($outsideDhaka->estimated_days ?? '৩-৫ দিন') : '৩-৫ দিন',
            'default_zone' => ($outsideDhaka && $outsideDhaka->is_default) ? 'outside_dhaka' : 'inside_dhaka',
            'free_delivery_above' => (string) \App\Models\SiteSetting::get('free_delivery_above', '0'),
        ];

        return Inertia::render('Admin/Courier/ShippingRates', [
            'settings' => $settings,
            'deliveryCharges' => $charges,
        ]);
    }

    public function updateShippingRates(Request $request)
    {
        $validated = $request->validate([
            'shipping_inside_dhaka' => 'required|numeric|min:0',
            'shipping_outside_dhaka' => 'required|numeric|min:0',
            'free_delivery_above' => 'required|numeric|min:0',
            'estimated_days_inside' => 'nullable|string|max:100',
            'estimated_days_outside' => 'nullable|string|max:100',
            'default_zone' => 'nullable|string|in:inside_dhaka,outside_dhaka',
        ]);

        $defaultZone = $request->input('default_zone', 'inside_dhaka');

        // 1. Update or create inside_dhaka in delivery_charges table
        \App\Models\DeliveryCharge::updateOrCreate(
            ['code' => 'inside_dhaka'],
            [
                'title' => 'ঢাকার ভিতরে',
                'title_en' => 'Inside Dhaka',
                'charge' => (float)$validated['shipping_inside_dhaka'],
                'estimated_days' => $validated['estimated_days_inside'] ?? '২-৩ দিন',
                'is_default' => ($defaultZone === 'inside_dhaka'),
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        // 2. Update or create outside_dhaka in delivery_charges table
        \App\Models\DeliveryCharge::updateOrCreate(
            ['code' => 'outside_dhaka'],
            [
                'title' => 'ঢাকার বাইরে',
                'title_en' => 'Outside Dhaka',
                'charge' => (float)$validated['shipping_outside_dhaka'],
                'estimated_days' => $validated['estimated_days_outside'] ?? '৩-৫ দিন',
                'is_default' => ($defaultZone === 'outside_dhaka'),
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        // 3. Keep site_settings table synced
        \App\Models\SiteSetting::set('shipping_inside_dhaka', (string)$validated['shipping_inside_dhaka'], 'shipping');
        \App\Models\SiteSetting::set('shipping_outside_dhaka', (string)$validated['shipping_outside_dhaka'], 'shipping');
        \App\Models\SiteSetting::set('free_delivery_above', (string)$validated['free_delivery_above'], 'shipping');

        return redirect()->back()->with('success', 'ডেলিভারি চার্জ সফলভাবে আপডেট করা হয়েছে।');
    }

    public function pickupRequests()
    {
        return Inertia::render('Admin/Courier/PickupRequests');
    }

    public function courierLogs()
    {
        $logs = \App\Models\CourierLog::latest()->get()->map(function ($log) {
            return [
                'id' => $log->id,
                'courier' => $log->courier,
                'endpoint' => $log->endpoint,
                'status' => $log->status,
                'status_code' => $log->status_code,
                'time' => $log->created_at->diffForHumans(),
                'date' => $log->created_at->format('M d, Y H:i'),
                'payload' => $log->payload ?? '{}',
            ];
        });

        return Inertia::render('Admin/Courier/CourierLogs', [
            'initialLogs' => $logs
        ]);
    }


    public function returns()
    {
        $returns = \App\Models\Order::where('status', 'returned')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer' => $order->customer_name,
                    'shop' => 'N/A', // Update with real shop if available
                    'type' => 'Return',
                    'status' => 'Returned',
                    'return_tracking' => $order->courier_tracking_id ?? 'N/A',
                    'requested_at' => $order->created_at->format('M d, Y')
                ];
            });

        return Inertia::render('Admin/Courier/Returns', [
            'returns' => $returns
        ]);
    }
}
