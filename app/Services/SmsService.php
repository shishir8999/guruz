<?php

namespace App\Services;

use App\Models\SiteSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    /**
     * Send SMS using configured Gateway (BulkSMS BD, Twilio, GreenWeb).
     * Automatically reads credentials saved in Admin Panel (SiteSettings) or .env file.
     * 
     * @param string $phone
     * @param string $message
     * @return bool
     */
    public static function send($phone, $message)
    {
        // Format Bangladeshi phone number (ensure 880 prefix if needed by gateway)
        $cleanPhone = preg_replace('/\D/', '', $phone);
        if (strlen($cleanPhone) === 11 && str_starts_with($cleanPhone, '01')) {
            $formattedPhone = '88' . $cleanPhone;
        } else {
            $formattedPhone = $cleanPhone;
        }

        // 1. Check BulkSMS BD Gateway (Primary Bangladeshi Gateway)
        $bulkSmsApiKey   = SiteSetting::get('bulksmsbd_api_key') ?: env('BULKSMSBD_API_KEY');
        $bulkSmsSenderId = SiteSetting::get('bulksmsbd_sender_id') ?: env('BULKSMSBD_SENDER_ID');

        if (!empty($bulkSmsApiKey)) {
            try {
                $response = Http::get('http://bulksmsbd.net/api/smsapi', [
                    'api_key'  => trim($bulkSmsApiKey),
                    'type'     => 'text',
                    'number'   => $formattedPhone,
                    'senderid' => trim($bulkSmsSenderId ?: '8809612770480'),
                    'message'  => $message,
                ]);

                if ($response->successful()) {
                    Log::info("BulkSMS BD sent successfully to {$formattedPhone}: " . $response->body());
                    return true;
                }
                Log::error("BulkSMS BD Response Error: " . $response->body());
            } catch (\Throwable $e) {
                Log::error("BulkSMS BD Exception: " . $e->getMessage());
            }
        }

        // 2. Check Twilio Gateway (International Gateway)
        $twilioSid   = SiteSetting::get('twilio_sid') ?: env('TWILIO_SID');
        $twilioToken = SiteSetting::get('twilio_token') ?: env('TWILIO_TOKEN');
        $twilioFrom  = SiteSetting::get('twilio_from') ?: env('TWILIO_FROM');

        if (!empty($twilioSid) && !empty($twilioToken) && !empty($twilioFrom)) {
            try {
                $recipientPhone = str_starts_with($formattedPhone, '+') ? $formattedPhone : '+' . $formattedPhone;
                $response = Http::withBasicAuth(trim($twilioSid), trim($twilioToken))
                    ->asForm()
                    ->post("https://api.twilio.com/2010-04-01/Accounts/" . trim($twilioSid) . "/Messages.json", [
                        'To'   => $recipientPhone,
                        'From' => trim($twilioFrom),
                        'Body' => $message,
                    ]);

                if ($response->successful()) {
                    Log::info("Twilio SMS sent successfully to {$recipientPhone}");
                    return true;
                }
                Log::error("Twilio Response Error: " . $response->body());
            } catch (\Throwable $e) {
                Log::error("Twilio Exception: " . $e->getMessage());
            }
        }

        // 3. Check GreenWeb SMS Gateway
        $greenwebToken = SiteSetting::get('greenweb_token') ?: env('SMS_API_TOKEN');
        if (!empty($greenwebToken)) {
            try {
                $response = Http::asForm()->post('http://api.greenweb.com.bd/api.php', [
                    'token'   => trim($greenwebToken),
                    'to'      => $cleanPhone,
                    'message' => $message,
                ]);

                if ($response->successful()) {
                    Log::info("GreenWeb SMS sent successfully to {$cleanPhone}");
                    return true;
                }
            } catch (\Throwable $e) {
                Log::error("GreenWeb Exception: " . $e->getMessage());
            }
        }

        Log::warning("No active SMS Gateway configured or all gateways failed to send to {$phone}.");
        return false;
    }
}
