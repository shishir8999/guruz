<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function confirmation(string $order_number): Response
    {
        $order = Order::with('items')
            ->where('order_number', $order_number)
            ->firstOrFail();

        return Inertia::render('OrderConfirmation', [
            'order' => $order,
        ]);
    }

    public function track(Request $request): Response
    {
        $order = null;
        if ($request->has('search')) {
            $search = $request->query('search');
            $order = Order::with('items')
                ->where('order_number', $search)
                ->orWhere('customer_phone', $search)
                ->first();
        }

        return Inertia::render('Track', [
            'order' => $order,
            'search' => $request->query('search'),
        ]);
    }
}
