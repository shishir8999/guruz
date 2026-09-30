<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentGateway;
use App\Models\TransactionLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SSLCommerzController extends Controller
{
    /**
     * Get SSLCommerz API Gateway configuration.
     */
    protected function getGatewayConfig()
    {
        $gateway = PaymentGateway::where('code', 'sslcommerz')->first();

        $environment = $gateway->environment ?? 'sandbox';
        $storeId = $gateway->api_key ?: ($gateway->merchant_id ?: 'testbox');
        $storePasswd = $gateway->secret_key ?: ($gateway->app_secret ?: 'qwerty');

        $isLive = ($environment === 'live');
        $initUrl = $isLive
            ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
            : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

        $valUrl = $isLive
            ? 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
            : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';

        return [
            'gateway'     => $gateway,
            'environment' => $environment,
            'is_live'     => $isLive,
            'store_id'    => $storeId,
            'store_passwd'=> $storePasswd,
            'init_url'    => $initUrl,
            'val_url'     => $valUrl,
        ];
    }

    /**
     * Initiate payment session with SSLCommerz.
     */
    public function initiatePayment(Order $order)
    {
        $config = $this->getGatewayConfig();

        $postData = [
            'store_id'         => $config['store_id'],
            'store_passwd'     => $config['store_passwd'],
            'total_amount'     => (float) $order->total,
            'currency'         => $order->currency ?: 'BDT',
            'tran_id'          => (string) $order->order_number,
            'success_url'      => url('/payment/sslcommerz/success'),
            'fail_url'         => url('/payment/sslcommerz/fail'),
            'cancel_url'       => url('/payment/sslcommerz/cancel'),
            'ipn_url'          => url('/payment/sslcommerz/ipn'),
            // Customer Information
            'cus_name'         => $order->user->name ?? $order->customer_name ?? 'Valued Customer',
            'cus_email'        => $order->user->email ?? $order->customer_email ?? 'customer@guruzbd.com',
            'cus_add1'         => $order->shipping_address ?: 'Dhaka, Bangladesh',
            'cus_city'         => $order->city ?: 'Dhaka',
            'cus_country'      => 'Bangladesh',
            'cus_phone'        => $order->user->phone ?? $order->customer_phone ?? '01700000000',
            // Product info
            'shipping_method'  => 'NO',
            'product_name'     => 'Order #' . $order->order_number,
            'product_category' => 'General',
            'product_profile'  => 'general',
        ];

        try {
            $response = Http::asForm()->timeout(30)->post($config['init_url'], $postData);
            $result = $response->json();

            if (isset($result['status']) && strtoupper($result['status']) === 'SUCCESS' && !empty($result['GatewayPageURL'])) {
                return response()->json([
                    'success'      => true,
                    'redirect_url' => $result['GatewayPageURL'],
                    'session_id'   => $result['sessionkey'] ?? null,
                    'order_number' => $order->order_number,
                ]);
            }

            Log::warning('SSLCommerz initiation failed: ', ['response' => $result, 'order_id' => $order->id]);
            return response()->json([
                'success' => false,
                'message' => $result['failedreason'] ?? 'SSLCommerz session initiation failed. Please check credentials or try again.',
            ], 422);

        } catch (\Throwable $e) {
            Log::error('SSLCommerz API Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'SSLCommerz গেটওয়ের সাথে যোগাযোগ করা সম্ভব হচ্ছে না: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * SSLCommerz Success Callback.
     */
    public function success(Request $request)
    {
        $tranId = $request->input('tran_id');
        $valId = $request->input('val_id');
        $amount = (float) $request->input('amount', 0);
        $cardType = $request->input('card_type', 'Card/MFS');
        $bankTranId = $request->input('bank_tran_id', $valId);

        if (!$tranId) {
            return redirect('/')->with('error', 'অকার্যকর ট্রানজেকশন তথ্য।');
        }

        $order = Order::where('order_number', $tranId)->first();
        if (!$order) {
            return redirect('/')->with('error', 'অর্ডার খুঁজে পাওয়া যায়নি।');
        }

        $config = $this->getGatewayConfig();

        // Validate transaction via SSLCommerz Validator API
        $isValid = false;
        if ($valId) {
            try {
                $valResponse = Http::timeout(25)->get($config['val_url'], [
                    'val_id'       => $valId,
                    'store_id'     => $config['store_id'],
                    'store_passwd' => $config['store_passwd'],
                    'format'       => 'json',
                ]);

                $valData = $valResponse->json();
                if (isset($valData['status']) && in_array(strtoupper($valData['status']), ['VALID', 'VALIDATED'])) {
                    $isValid = true;
                }
            } catch (\Throwable $e) {
                Log::warning('SSLCommerz validation call failed: ' . $e->getMessage());
                // In sandbox or network glitch fallback to request status
                if (!$config['is_live'] && strtoupper($request->input('status', '')) === 'VALID') {
                    $isValid = true;
                }
            }
        } else if (strtoupper($request->input('status', '')) === 'VALID') {
            $isValid = true;
        }

        if ($isValid || !$config['is_live']) {
            $order->update([
                'payment_status'        => 'paid',
                'payment_method'        => 'sslcommerz',
                'payment_trx_id'        => $bankTranId ?: ($valId ?: 'SSL_' . time()),
                'payment_sender_number' => $cardType ?: 'SSLCommerz',
                'status'                => 'processing',
            ]);

            // Create Transaction Log if table exists
            try {
                TransactionLog::create([
                    'order_id'         => $order->id,
                    'transaction_type' => 'credit',
                    'amount'           => $order->total,
                    'payment_method'   => 'sslcommerz',
                    'trx_id'           => $bankTranId ?: $valId,
                    'status'           => 'completed',
                    'note'             => "SSLCommerz payment verified ({$cardType})",
                ]);
            } catch (\Throwable $e) {}

            return redirect()->route('orders.confirmation', ['order_number' => $order->order_number])
                ->with('success', 'আপনার পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে!');
        }

        $order->update(['payment_status' => 'failed']);
        return redirect()->route('checkout')->with('error', 'পেমেন্ট যাচাইকরণ ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }

    /**
     * SSLCommerz Fail Callback.
     */
    public function fail(Request $request)
    {
        $tranId = $request->input('tran_id');
        if ($tranId) {
            Order::where('order_number', $tranId)->update(['payment_status' => 'failed']);
        }

        return redirect()->route('checkout')->with('error', 'আপনার পেমেন্টটি ব্যর্থ হয়েছে। দয়া করে অন্য কোনো মাধ্যমে চেষ্টা করুন।');
    }

    /**
     * SSLCommerz Cancel Callback.
     */
    public function cancel(Request $request)
    {
        $tranId = $request->input('tran_id');
        if ($tranId) {
            Order::where('order_number', $tranId)->update(['payment_status' => 'cancelled']);
        }

        return redirect()->route('checkout')->with('info', 'পেমেন্ট প্রক্রিয়া বাতিল করা হয়েছে।');
    }

    /**
     * SSLCommerz IPN (Instant Payment Notification) Webhook.
     */
    public function ipn(Request $request)
    {
        $tranId = $request->input('tran_id');
        $valId = $request->input('val_id');
        $status = strtoupper($request->input('status', ''));

        Log::info('SSLCommerz IPN Received', $request->all());

        if (!$tranId || !$valId) {
            return response()->json(['status' => 'INVALID_PAYLOAD'], 400);
        }

        $order = Order::where('order_number', $tranId)->first();
        if (!$order) {
            return response()->json(['status' => 'ORDER_NOT_FOUND'], 404);
        }

        if ($status === 'VALID' || $status === 'VALIDATED') {
            $order->update([
                'payment_status' => 'paid',
                'status'         => 'processing',
                'payment_trx_id' => $request->input('bank_tran_id', $valId),
            ]);
            return response()->json(['status' => 'IPN_PROCESSED_SUCCESS'], 200);
        }

        return response()->json(['status' => 'IPN_IGNORED'], 200);
    }
}
