<?php

namespace App\Services\Payment;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * bKash Payment Gateway Integration
 * Docs: https://developer.bka.sh/docs
 */
class BkashService
{
    private string $baseUrl;
    private string $appKey;
    private string $appSecret;
    private string $username;
    private string $password;
    private ?string $token = null;

    public function __construct()
    {
        $gw = \App\Models\PaymentGateway::where('code', 'bkash')->first();
        $isSandbox = ($gw?->environment ?? 'sandbox') === 'sandbox';

        $this->baseUrl   = $isSandbox
            ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
            : 'https://tokenized.pay.bka.sh/v1.2.0-beta';
        $this->appKey    = $gw?->app_key ?: config('services.bkash.app_key', '');
        $this->appSecret = $gw?->app_secret ?: config('services.bkash.app_secret', '');
        $this->username  = $gw?->merchant_id ?: config('services.bkash.username', '');
        $this->password  = $gw?->token_id ?: config('services.bkash.password', '');
    }

    public function grantToken(): ?string
    {
        try {
            $response = Http::withHeaders([
                'username' => $this->username,
                'password' => $this->password,
            ])->post("{$this->baseUrl}/tokenized/checkout/token/grant", [
                'app_key'    => $this->appKey,
                'app_secret' => $this->appSecret,
            ]);

            if ($response->successful()) {
                $this->token = $response->json('id_token');
                return $this->token;
            }
        } catch (\Exception $e) {
            Log::error('bKash grantToken failed', ['error' => $e->getMessage()]);
        }
        return null;
    }

    public function createPayment(array $payload): array
    {
        $token = $this->grantToken();
        if (!$token) {
            return ['success' => false, 'message' => 'Failed to get bKash token'];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $token,
                'X-APP-Key'     => $this->appKey,
            ])->post("{$this->baseUrl}/tokenized/checkout/create", [
                'mode'                => '0011',
                'payerReference'      => $payload['payer_reference'] ?? ' ',
                'callbackURL'         => route('payment.bkash.callback'),
                'amount'              => (string) $payload['amount'],
                'currency'            => 'BDT',
                'intent'              => 'sale',
                'merchantInvoiceNumber' => $payload['invoice'] ?? uniqid('INV-'),
            ]);

            return ['success' => $response->successful(), 'data' => $response->json()];
        } catch (\Exception $e) {
            Log::error('bKash createPayment failed', ['error' => $e->getMessage()]);
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function executePayment(string $paymentId): array
    {
        $token = $this->grantToken();
        if (!$token) {
            return ['success' => false, 'message' => 'Failed to get bKash token'];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $token,
                'X-APP-Key'     => $this->appKey,
            ])->post("{$this->baseUrl}/tokenized/checkout/execute", [
                'paymentID' => $paymentId,
            ]);

            return ['success' => $response->successful(), 'data' => $response->json()];
        } catch (\Exception $e) {
            Log::error('bKash executePayment failed', ['error' => $e->getMessage()]);
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function refund(string $paymentId, float $amount, string $trxId): array
    {
        $token = $this->grantToken();
        if (!$token) {
            return ['success' => false];
        }

        $response = Http::withHeaders([
            'Authorization' => $token,
            'X-APP-Key'     => $this->appKey,
        ])->post("{$this->baseUrl}/tokenized/checkout/payment/refund", [
            'paymentID'      => $paymentId,
            'amount'         => (string) $amount,
            'trxID'          => $trxId,
            'sku'            => 'Refund',
            'reason'         => 'Customer requested refund',
        ]);

        return ['success' => $response->successful(), 'data' => $response->json()];
    }
}
