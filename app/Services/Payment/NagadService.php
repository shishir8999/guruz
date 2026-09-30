<?php

namespace App\Services\Payment;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Nagad Payment Gateway Integration
 * Docs: https://nagad.com.bd/developer-api
 */
class NagadService
{
    private string $baseUrl;
    private string $merchantId;
    private string $merchantNumber;
    private string $publicKey;
    private string $privateKey;

    public function __construct()
    {
        $sandbox = config('services.nagad.sandbox', true);
        $this->baseUrl        = $sandbox
            ? 'https://sandbox.mynagad.com:10080/remote-payment-gateway-1.0'
            : 'https://api.mynagad.com/api/dfs';
        $this->merchantId     = config('services.nagad.merchant_id', '');
        $this->merchantNumber = config('services.nagad.merchant_number', '');
        $this->publicKey      = config('services.nagad.public_key', '');
        $this->privateKey     = config('services.nagad.private_key', '');
    }

    public function initializePayment(string $orderId, float $amount): array
    {
        $datetime    = now()->format('YmdHis');
        $sensitiveData = [
            'merchantId'   => $this->merchantId,
            'datetime'     => $datetime,
            'orderId'      => $orderId,
            'challenge'    => $this->generateChallenge(),
        ];

        try {
            $response = Http::withHeaders([
                'X-KM-Api-Version' => 'v-0.2.0',
                'X-KM-IP-V4'       => request()->ip(),
                'X-KM-Client-Type' => 'PC_WEB',
                'Content-Type'     => 'application/json',
            ])->post(
                "{$this->baseUrl}/check-out/initialize/{$this->merchantId}/{$orderId}",
                [
                    'accountNumber' => $this->merchantNumber,
                    'dateTime'      => $datetime,
                    'sensitiveData' => $this->encrypt(json_encode($sensitiveData)),
                    'signature'     => $this->sign(json_encode($sensitiveData)),
                ]
            );

            return ['success' => $response->successful(), 'data' => $response->json()];
        } catch (\Exception $e) {
            Log::error('Nagad init failed', ['error' => $e->getMessage()]);
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function completePayment(string $paymentRefId, string $orderId, float $amount): array
    {
        $sensitiveData = [
            'merchantId'   => $this->merchantId,
            'orderId'      => $orderId,
            'currencyCode' => '050',
            'amount'       => (string) $amount,
            'challenge'    => $this->generateChallenge(),
        ];

        try {
            $response = Http::withHeaders([
                'X-KM-Api-Version' => 'v-0.2.0',
            ])->post(
                "{$this->baseUrl}/check-out/complete/{$paymentRefId}",
                [
                    'sensitiveData' => $this->encrypt(json_encode($sensitiveData)),
                    'signature'     => $this->sign(json_encode($sensitiveData)),
                    'merchantCallbackURL' => route('payment.nagad.callback'),
                ]
            );

            return ['success' => $response->successful(), 'data' => $response->json()];
        } catch (\Exception $e) {
            Log::error('Nagad complete failed', ['error' => $e->getMessage()]);
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    private function generateChallenge(): string
    {
        return bin2hex(random_bytes(20));
    }

    private function encrypt(string $data): string
    {
        if (empty($this->publicKey)) return base64_encode($data);
        $publicKey = "-----BEGIN PUBLIC KEY-----\n" . chunk_split($this->publicKey, 64, "\n") . "-----END PUBLIC KEY-----";
        openssl_public_encrypt($data, $encrypted, $publicKey, OPENSSL_PKCS1_PADDING);
        return base64_encode($encrypted);
    }

    private function sign(string $data): string
    {
        if (empty($this->privateKey)) return base64_encode($data);
        $privateKey = "-----BEGIN RSA PRIVATE KEY-----\n" . chunk_split($this->privateKey, 64, "\n") . "-----END RSA PRIVATE KEY-----";
        openssl_sign($data, $signature, $privateKey, OPENSSL_ALGO_SHA256);
        return base64_encode($signature);
    }
}
