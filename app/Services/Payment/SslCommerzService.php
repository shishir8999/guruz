<?php

namespace App\Services\Payment;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * SSLCommerz Payment Gateway Integration
 * Docs: https://developer.sslcommerz.com/doc/v4/
 */
class SslCommerzService
{
    private string $storeId;
    private string $storePassword;
    private string $baseUrl;

    public function __construct()
    {
        $sandbox = config('services.sslcommerz.sandbox', true);
        $this->storeId       = config('services.sslcommerz.store_id', '');
        $this->storePassword = config('services.sslcommerz.store_password', '');
        $this->baseUrl       = $sandbox
            ? 'https://sandbox.sslcommerz.com'
            : 'https://securepay.sslcommerz.com';
    }

    public function initiatePayment(array $order, array $customer): array
    {
        $payload = [
            'store_id'         => $this->storeId,
            'store_passwd'     => $this->storePassword,
            'total_amount'     => $order['amount'],
            'currency'         => 'BDT',
            'tran_id'          => $order['tran_id'] ?? uniqid('TXN-'),
            'success_url'      => route('payment.ssl.success'),
            'fail_url'         => route('payment.ssl.fail'),
            'cancel_url'       => route('payment.ssl.cancel'),
            'ipn_url'          => route('payment.ssl.ipn'),

            // Customer info
            'cus_name'         => $customer['name'],
            'cus_email'        => $customer['email'],
            'cus_phone'        => $customer['phone'],
            'cus_add1'         => $customer['address'] ?? 'Dhaka',
            'cus_city'         => $customer['city'] ?? 'Dhaka',
            'cus_country'      => 'Bangladesh',

            // Shipping info
            'ship_name'        => $customer['name'],
            'ship_add1'        => $customer['address'] ?? 'Dhaka',
            'ship_city'        => $customer['city'] ?? 'Dhaka',
            'ship_country'     => 'Bangladesh',

            // Product info
            'product_name'     => 'Guruz E-Commerce Purchase',
            'product_category' => 'Mixed',
            'product_profile'  => 'general',

            'emi_option'       => 0,
            'multi_card_name'  => 'mastercard,visacard,amexcard,bkash,nagad,rocket',
        ];

        try {
            $response = Http::asForm()->post(
                "{$this->baseUrl}/gwprocess/v4/api.php",
                $payload
            );

            $data = $response->json();

            if (($data['status'] ?? '') === 'SUCCESS') {
                return [
                    'success'   => true,
                    'gatewayUrl' => $data['GatewayPageURL'],
                    'data'       => $data,
                ];
            }

            return ['success' => false, 'message' => $data['failedreason'] ?? 'Unknown error', 'data' => $data];
        } catch (\Exception $e) {
            Log::error('SSLCommerz initiate failed', ['error' => $e->getMessage()]);
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function validateIPN(array $data): bool
    {
        $validationUrl = "{$this->baseUrl}/validator/api/validationserverAPI.php"
            . "?val_id={$data['val_id']}&store_id={$this->storeId}"
            . "&store_passwd={$this->storePassword}&v=1&format=json";

        try {
            $response = Http::get($validationUrl);
            $result   = $response->json();
            return ($result['status'] ?? '') === 'VALID' || ($result['status'] ?? '') === 'VALIDATED';
        } catch (\Exception $e) {
            Log::error('SSLCommerz IPN validation failed', ['error' => $e->getMessage()]);
            return false;
        }
    }
}
