<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Services\Payment\BkashService;
use App\Services\Payment\NagadService;
use App\Services\Payment\SslCommerzService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PaymentController extends Controller
{
    // ─── bKash ────────────────────────────────────────

    public function bkashCreate(Request $request, BkashService $bkash): JsonResponse
    {
        $order = Order::findOrFail($request->input('order_id'));

        $result = $bkash->createPayment([
            'amount'          => $order->total,
            'invoice'         => $order->order_number,
            'payer_reference' => $order->user_id,
        ]);

        if ($result['success'] && isset($result['data']['bkashURL'])) {
            PaymentTransaction::create([
                'order_id'               => $order->id,
                'gateway'                => 'bkash',
                'transaction_id'         => $result['data']['paymentID'] ?? null,
                'amount'                 => $order->total,
                'status'                 => 'pending',
                'gateway_response'       => $result['data'],
            ]);

            return response()->json([
                'redirect_url' => $result['data']['bkashURL'],
            ]);
        }

        return response()->json(['error' => 'Failed to initiate bKash payment'], 422);
    }

    public function bkashCallback(Request $request, BkashService $bkash): \Illuminate\Http\RedirectResponse
    {
        $paymentId = $request->query('paymentID');
        $status    = $request->query('status');

        if ($status !== 'success' || !$paymentId) {
            return redirect()->route('checkout.index')->with('error', 'bKash payment cancelled or failed.');
        }

        $result = $bkash->executePayment($paymentId);

        if ($result['success'] && ($result['data']['statusCode'] ?? '') === '0000') {
            $txn = PaymentTransaction::where('transaction_id', $paymentId)->first();
            if ($txn) {
                $txn->update([
                    'status'                 => 'success',
                    'gateway_transaction_id' => $result['data']['trxID'] ?? null,
                    'gateway_response'       => $result['data'],
                ]);
                Order::find($txn->order_id)?->update(['payment_status' => 'paid', 'status' => 'processing']);
            }
            return redirect()->route('order.confirmation', $txn?->order_id);
        }

        return redirect()->route('checkout.index')->with('error', 'bKash payment execution failed.');
    }

    // ─── Nagad ────────────────────────────────────────

    public function nagadInit(Request $request, NagadService $nagad): JsonResponse
    {
        $order  = Order::findOrFail($request->input('order_id'));
        $result = $nagad->initializePayment($order->order_number, $order->total);

        if ($result['success']) {
            return response()->json($result['data']);
        }

        return response()->json(['error' => 'Failed to initialize Nagad'], 422);
    }

    public function nagadCallback(Request $request): \Illuminate\Http\RedirectResponse
    {
        Log::info('Nagad callback', $request->all());

        $orderId = $request->query('order_id');
        $status  = $request->query('status');

        if ($status === 'Success' && $orderId) {
            Order::where('order_number', $orderId)->update([
                'payment_status' => 'paid',
                'status'         => 'processing',
            ]);
            $order = Order::where('order_number', $orderId)->first();
            return redirect()->route('order.confirmation', $order?->id);
        }

        return redirect()->route('checkout.index')->with('error', 'Nagad payment failed.');
    }

    // ─── SSLCommerz ───────────────────────────────────

    public function sslInit(Request $request, SslCommerzService $ssl): JsonResponse
    {
        $order    = Order::findOrFail($request->input('order_id'));
        $customer = [
            'name'    => $order->customer_name,
            'email'   => $order->customer_email,
            'phone'   => $order->customer_phone,
            'address' => $order->shipping_address,
            'city'    => $order->city,
        ];

        $result = $ssl->initiatePayment([
            'amount'  => $order->total,
            'tran_id' => $order->order_number,
        ], $customer);

        if ($result['success']) {
            return response()->json(['gateway_url' => $result['gatewayUrl']]);
        }

        return response()->json(['error' => $result['message'] ?? 'SSLCommerz error'], 422);
    }

    public function sslSuccess(Request $request, SslCommerzService $ssl): \Illuminate\Http\RedirectResponse
    {
        if (!$ssl->validateIPN($request->all())) {
            return redirect()->route('checkout.index')->with('error', 'Payment validation failed.');
        }

        $tranId = $request->input('tran_id');
        $order  = Order::where('order_number', $tranId)->first();

        if ($order) {
            $order->update(['payment_status' => 'paid', 'status' => 'processing']);
            PaymentTransaction::create([
                'order_id'               => $order->id,
                'gateway'                => 'sslcommerz',
                'transaction_id'         => $tranId,
                'gateway_transaction_id' => $request->input('bank_tran_id'),
                'amount'                 => $order->total,
                'status'                 => 'success',
                'gateway_response'       => $request->all(),
            ]);
        }

        return redirect()->route('order.confirmation', $order?->id);
    }

    public function sslFail(Request $request): \Illuminate\Http\RedirectResponse
    {
        return redirect()->route('checkout.index')->with('error', 'SSLCommerz payment failed.');
    }

    public function sslCancel(Request $request): \Illuminate\Http\RedirectResponse
    {
        return redirect()->route('checkout.index')->with('error', 'Payment was cancelled.');
    }

    public function sslIPN(Request $request, SslCommerzService $ssl): JsonResponse
    {
        Log::info('SSLCommerz IPN', $request->all());

        if ($ssl->validateIPN($request->all())) {
            $tranId = $request->input('tran_id');
            Order::where('order_number', $tranId)->update(['payment_status' => 'paid']);
        }

        return response()->json(['status' => 'received']);
    }
}
