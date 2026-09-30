<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentGateway;
use App\Models\TransactionLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BanglaQrController extends Controller
{
    /**
     * Get Bangla QR configuration from DB.
     */
    protected function getGatewayConfig()
    {
        $gateway = PaymentGateway::where('code', 'bangla_qr')->first();

        $environment = $gateway->environment ?? 'live';
        $isLive = ($environment === 'live');
        
        $apiKey = $gateway->api_key ?: '';
        $secretKey = $gateway->secret_key ?: '';
        $merchantId = $gateway->merchant_id ?: ($gateway->account_number ?: 'BD_MERCHANT_001');
        $terminalId = $gateway->token_id ?: 'TID001';
        $bankName = $gateway->bank_name ?: ($gateway->extra_config['acquirer_bank'] ?? 'Islami Bank Bangladesh PLC');

        return [
            'gateway'     => $gateway,
            'environment' => $environment,
            'is_live'     => $isLive,
            'api_key'     => $apiKey,
            'secret_key'  => $secretKey,
            'merchant_id' => $merchantId,
            'terminal_id' => $terminalId,
            'bank_name'   => $bankName,
        ];
    }

    /**
     * Generate standard EMVCo Bangla QR Payload for the order.
     */
    protected function generateEmvcoPayload(Order $order, array $config, string $selectedBank = 'all'): string
    {
        $merchantId = $config['merchant_id'] ?: '01700000000';
        $amount = number_format((float) $order->total, 2, '.', '');
        $orderNumber = (string) $order->order_number;

        // EMVCo format segments
        $pfi = "000201"; // Payload Format Indicator
        $poi = "010212"; // Point of Initiation: 12 (Dynamic QR with amount)

        // Tag 26: Merchant Account Information (Bangla QR Interoperable Standard)
        $guid = "0016com.banglaqr.bd";
        $mid = "01" . sprintf("%02d", strlen($merchantId)) . $merchantId;
        $tid = "02" . sprintf("%02d", strlen($config['terminal_id'])) . $config['terminal_id'];
        $bankTag = "03" . sprintf("%02d", strlen($selectedBank)) . $selectedBank;
        $maiContent = $guid . $mid . $tid . $bankTag;
        $mai = "26" . sprintf("%02d", strlen($maiContent)) . $maiContent;

        // Tag 52: Merchant Category Code (General Retail)
        $mcc = "52045399";

        // Tag 53: Transaction Currency (050 = BDT ISO-4217)
        $curr = "5303050";

        // Tag 54: Transaction Amount
        $amt = "54" . sprintf("%02d", strlen($amount)) . $amount;

        // Tag 58: Country Code (BD)
        $country = "5802BD";

        // Tag 59: Merchant Name
        $merchantName = config('app.name', 'Guruz BD');
        $mName = "59" . sprintf("%02d", strlen($merchantName)) . $merchantName;

        // Tag 60: Merchant City
        $city = "Dhaka";
        $mCity = "60" . sprintf("%02d", strlen($city)) . $city;

        // Tag 62: Additional Data Field (Order ID reference)
        $ref = "01" . sprintf("%02d", strlen($orderNumber)) . $orderNumber;
        $addContent = $ref;
        $add = "62" . sprintf("%02d", strlen($addContent)) . $addContent;

        $rawPayload = $pfi . $poi . $mai . $mcc . $curr . $amt . $country . $mName . $mCity . $add . "6304";

        // Calculate CRC16-CCITT checksum
        $crc = $this->calculateCrc16($rawPayload);

        return $rawPayload . strtoupper(sprintf("%04x", $crc));
    }

    /**
     * Calculate CRC16 CCITT (0xFFFF) Checksum for EMVCo QR code.
     */
    protected function calculateCrc16(string $data): int
    {
        $crc = 0xFFFF;
        for ($i = 0; $i < strlen($data); $i++) {
            $crc ^= (ord($data[$i]) << 8);
            for ($j = 0; $j < 8; $j++) {
                if (($crc & 0x8000) != 0) {
                    $crc = (($crc << 1) ^ 0x1021) & 0xFFFF;
                } else {
                    $crc = ($crc << 1) & 0xFFFF;
                }
            }
        }
        return $crc;
    }

    /**
     * Initiate Bangla QR Session via API.
     */
    public function initiatePayment(Order $order, Request $request)
    {
        $config = $this->getGatewayConfig();
        $selectedBank = $request->input('bank', 'all');

        $qrPayload = $this->generateEmvcoPayload($order, $config, $selectedBank);

        // App deep links for popular Bangladeshi Banks & MFS
        $amount = (float) $order->total;
        $deepLinks = [
            'bkash'     => "bkash://qr?payload=" . urlencode($qrPayload),
            'nagad'     => "nagad://qr?payload=" . urlencode($qrPayload),
            'cellfin'   => "cellfin://banglaqr?payload=" . urlencode($qrPayload) . "&amount={$amount}&ref={$order->order_number}",
            'citytouch' => "citytouch://qr?payload=" . urlencode($qrPayload),
            'astha'     => "astha://qr?payload=" . urlencode($qrPayload),
            'universal' => "banglaqr://pay?payload=" . urlencode($qrPayload) . "&amount={$amount}&order={$order->order_number}",
        ];

        return response()->json([
            'success'        => true,
            'order_number'   => $order->order_number,
            'total_amount'   => (float) $order->total,
            'currency'       => $order->currency ?: 'BDT',
            'qr_payload'     => $qrPayload,
            'acquirer_bank'  => $config['bank_name'],
            'merchant_id'    => $config['merchant_id'],
            'terminal_id'    => $config['terminal_id'],
            'expires_in'     => 300, // 5 minutes
            'deep_links'     => $deepLinks,
        ]);
    }

    /**
     * Real-time Polling endpoint for Checkout page to check if payment is confirmed.
     */
    public function checkStatus($orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->first();
        if (!$order) {
            return response()->json(['success' => false, 'status' => 'not_found'], 404);
        }

        return response()->json([
            'success'        => true,
            'order_number'   => $order->order_number,
            'payment_status' => $order->payment_status,
            'is_paid'        => in_array(strtolower($order->payment_status), ['paid', 'completed', 'success']),
            'trx_id'         => $order->payment_trx_id,
        ]);
    }

    /**
     * Bank / Acquirer IPN Webhook for automated Bangla QR payment confirmation.
     */
    public function webhook(Request $request)
    {
        $config = $this->getGatewayConfig();

        Log::info('Bangla QR Bank Webhook received', $request->all());

        $orderNumber = $request->input('order_number') ?: ($request->input('tran_id') ?: $request->input('ref'));
        $trxId = $request->input('trx_id') ?: ($request->input('bank_tran_id') ?: $request->input('val_id'));
        $amount = (float) $request->input('amount', 0);
        $bankName = $request->input('bank_name') ?: $request->input('sender_bank', 'Bangla QR Bank');
        $status = strtolower($request->input('status', ''));

        if (!$orderNumber) {
            return response()->json(['success' => false, 'message' => 'Order number missing'], 400);
        }

        $order = Order::where('order_number', $orderNumber)->first();
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        if (in_array($status, ['success', 'paid', 'completed', 'valid']) || empty($status)) {
            $order->update([
                'payment_status'        => 'paid',
                'payment_method'        => 'bangla_qr',
                'payment_trx_id'        => $trxId ?: ('BQR_' . strtoupper(uniqid())),
                'payment_sender_number' => $bankName,
                'status'                => 'processing',
            ]);

            try {
                TransactionLog::create([
                    'order_id'         => $order->id,
                    'transaction_type' => 'credit',
                    'amount'           => $order->total,
                    'payment_method'   => 'bangla_qr',
                    'trx_id'           => $trxId ?: $order->payment_trx_id,
                    'status'           => 'completed',
                    'note'             => "Bangla QR Direct API payment confirmed ({$bankName})",
                ]);
            } catch (\Throwable $e) {}

            return response()->json(['success' => true, 'message' => 'Order payment verified successfully']);
        }

        return response()->json(['success' => false, 'message' => 'Payment status not approved'], 422);
    }

    /**
     * Simulated Sandbox Verification for testing Bangla QR without live bank terminal.
     */
    public function simulateBankPayment(Request $request)
    {
        $orderNumber = $request->input('order_number');
        $bankName = $request->input('bank_name', 'Islami Bank Cellfin');

        $order = Order::where('order_number', $orderNumber)->first();
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'অর্ডার পাওয়া যায়নি'], 404);
        }

        $generatedTrxId = 'BQR' . strtoupper(substr(md5(time() . rand()), 0, 10));

        $order->update([
            'payment_status'        => 'paid',
            'payment_method'        => 'bangla_qr',
            'payment_trx_id'        => $generatedTrxId,
            'payment_sender_number' => $bankName,
            'status'                => 'processing',
        ]);

        return response()->json([
            'success'        => true,
            'message'        => 'বাংলা কিউআর পেমেন্ট সফলভাবে সম্পন্ন হয়েছে!',
            'trx_id'         => $generatedTrxId,
            'payment_status' => 'paid',
        ]);
    }
}
