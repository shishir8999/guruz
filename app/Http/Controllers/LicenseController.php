<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\LicenseService;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;

class LicenseController extends Controller
{
    /**
     * Show the Activation Lock Screen
     */
    public function showActivation(Request $request)
    {
        $domain = LicenseService::getCurrentDomain();
        $isActivated = LicenseService::isActivated();
        $isLocalhost = LicenseService::isLocalhost($domain);

        if ($isActivated && !$isLocalhost) {
            return redirect('/')->with('success', 'সফটওয়্যার লাইসেন্স সক্রিয় রয়েছে।');
        }

        return view('license.activate', [
            'domain'      => $domain,
            'isLocalhost' => $isLocalhost,
            'isActivated' => $isActivated,
        ]);
    }

    /**
     * Submit and activate the license
     */
    public function submitActivation(Request $request)
    {
        $request->validate([
            'license_key' => 'required|string|min:10',
            'owner_email' => 'nullable|email',
            'client_name' => 'nullable|string|max:100',
        ], [
            'license_key.required' => 'অনুগ্রহ করে লাইসেন্স কী (License Key) প্রদান করুন।',
        ]);

        $key = trim($request->input('license_key'));
        $ownerEmail = LicenseService::$masterOwnerEmail;
        $clientName = trim($request->input('client_name', ''));
        $domain = LicenseService::getCurrentDomain();

        $success = LicenseService::activate($key, $ownerEmail, $clientName);

        if ($success) {
            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return back()->with('success', 'অভিনন্দন! আপনার সফটওয়্যার লাইসেন্স সফলভাবে সক্রিয় (Activated) হয়েছে। ফ্রন্ট ভিউ সফলভাবে আনলক করা হয়েছে।');
            }
            return redirect('/')->with('success', 'অভিনন্দন! আপনার সফটওয়্যার লাইসেন্স সফলভাবে সক্রিয় (Activated) হয়েছে।');
        }

        if ($request->wantsJson() || $request->header('X-Inertia')) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'license_key' => ["অবৈধ লাইসেন্স কী! '{$domain}' ডোমেইনের জন্য এই জিমেইল ও লাইসেন্স কী সমন্বয়টি সঠিক নয়। অনুগ্রহ করে আপনার জিমেইলে পাঠানো সঠিক কী ব্যবহার করুন।"],
            ]);
        }

        return back()->withInput()->with('error', "অবৈধ লাইসেন্স কী! '{$domain}' ডোমেইনের জন্য এই জিমেইল ও লাইসেন্স কী সমন্বয়টি সঠিক নয়। অনুগ্রহ করে অথরাইজড কী ব্যবহার করুন।");
    }

    /**
     * Admin view for License info & key generator
     */
    public function adminView()
    {
        $domain = LicenseService::getCurrentDomain();
        $license = LicenseService::getStoredLicense();
        $isActivated = LicenseService::isActivated();
        $isLocalhost = LicenseService::isLocalhost($domain);

        return Inertia::render('Admin/System/LicenseManager', [
            'domain'            => $domain,
            'license'           => $license,
            'isActivated'       => $isActivated,
            'isLocalhost'       => $isLocalhost,
            'defaultOwnerEmail' => LicenseService::$masterOwnerEmail,
        ]);
    }

    /**
     * Admin action to generate a license key for any domain (Protected by Master PIN)
     */
    public function adminGenerate(Request $request)
    {
        $request->validate([
            'master_pin'    => 'required|string',
            'owner_email'   => 'nullable|email',
            'target_domain' => 'required|string',
            'client_name'   => 'nullable|string',
        ], [
            'master_pin.required'    => 'মাস্টার সিকিউরিটি পিন দিন।',
            'target_domain.required' => 'টার্গেট ডোমেইনের নাম দিন।',
        ]);

        $pin = $request->input('master_pin');
        if (!LicenseService::verifyMasterPin($pin)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'master_pin' => ['ভুল মাস্টার সিকিউরিটি পিন! সঠিক পিন ছাড়া লাইসেন্স তৈরি করা সম্পূর্ণ নিষিদ্ধ।'],
            ]);
        }

        $targetDomain = LicenseService::normalizeDomain($request->input('target_domain'));
        // Strictly enforce master owner email — cannot be edited, removed or manipulated by anyone
        $ownerEmail = LicenseService::$masterOwnerEmail;
        $client = $request->input('client_name') ?: 'Authorized Client';

        $generatedKey = LicenseService::generateKey($targetDomain, $ownerEmail);

        // Send email with rich styling directly to the owner's Gmail
        $emailSent = false;
        try {
            $formattedDate = now()->format('d M Y, h:i A');
            $htmlBody = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);'>
                <div style='background: linear-gradient(135deg, #1e1b4b, #312e81); padding: 24px; text-align: center; color: #ffffff;'>
                    <h2 style='margin: 0 0 6px 0; font-size: 20px; font-weight: bold;'>🛡️ সফটওয়্যার লাইসেন্স সুরক্ষা হাব</h2>
                    <p style='margin: 0; font-size: 13px; color: #c7d2fe;'>একক-ডোমেইন সফটওয়্যার লাইসেন্স সফলভাবে জেনারেট হয়েছে</p>
                </div>
                <div style='padding: 24px; color: #334155; line-height: 1.6;'>
                    <p style='font-size: 14px; margin-top: 0;'>প্রিয় ডেভেলপার / সফটওয়্যার ওনার,</p>
                    <p style='font-size: 13px; margin-bottom: 20px;'>
                        আপনার মাস্টার সিকিউরিটি পিন ও জিমেইল ভেরিফিকেশন সম্পন্ন করে নিচের ডোমেইনের জন্য নতুন একটি ক্রিপ্টোগ্রাফিক একক-ডোমেইন লাইসেন্স প্রস্তুত করা হয়েছে:
                    </p>

                    <div style='background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;'>
                        <table style='width: 100%; border-collapse: collapse; font-size: 13px;'>
                            <tr>
                                <td style='padding: 6px 0; color: #64748b; width: 140px;'>🌐 <strong>টার্গেট ডোমেইন:</strong></td>
                                <td style='padding: 6px 0; font-family: monospace; font-weight: bold; color: #0f172a;'>{$targetDomain}</td>
                            </tr>
                            <tr>
                                <td style='padding: 6px 0; color: #64748b;'>👤 <strong>ক্লায়েন্টের নাম:</strong></td>
                                <td style='padding: 6px 0; font-weight: bold; color: #0f172a;'>{$client}</td>
                            </tr>
                            <tr>
                                <td style='padding: 6px 0; color: #64748b;'>📧 <strong>ওনার জিমেইল:</strong></td>
                                <td style='padding: 6px 0; font-weight: bold; color: #4338ca;'>{$ownerEmail}</td>
                            </tr>
                            <tr>
                                <td style='padding: 6px 0; color: #64748b;'>⏰ <strong>জেনারেটের সময়:</strong></td>
                                <td style='padding: 6px 0; color: #64748b;'>{$formattedDate}</td>
                            </tr>
                        </table>
                    </div>

                    <div style='margin-bottom: 24px;'>
                        <div style='font-size: 12px; font-weight: bold; color: #475569; margin-bottom: 6px; text-transform: uppercase;'>🔑 একক-ডোমেইন লাইসেন্স কী (License Key):</div>
                        <div style='background: #eef2ff; border: 2px dashed #6366f1; border-radius: 8px; padding: 14px; text-align: center;'>
                            <span style='font-family: monospace; font-size: 16px; font-weight: 900; color: #3730a3; letter-spacing: 1px; user-select: all;'>{$generatedKey}</span>
                        </div>
                    </div>

                    <div style='background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 14px; border-radius: 0 8px 8px 0; margin-bottom: 20px;'>
                        <div style='font-size: 13px; font-weight: bold; color: #166534; margin-bottom: 6px;'>📌 ক্লায়েন্টকে কীভাবে দিবেন?</div>
                        <p style='font-size: 12px; color: #15803d; margin: 0;'>
                            ক্লায়েন্টকে শুধু এই <strong>লাইসেন্স কী ({$generatedKey})</strong> এবং আপনার <strong>জিমেইল ({$ownerEmail})</strong> পাঠিয়ে দিন। ক্লায়েন্ট তার সাইট ওপেন করে লক স্ক্রিনে এটি বসালেই সাইট চালু হবে।
                        </p>
                    </div>

                    <div style='background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px; border-radius: 0 8px 8px 0;'>
                        <div style='font-size: 13px; font-weight: bold; color: #92400e; margin-bottom: 4px;'>🔒 একক-ডোমেইন সুরক্ষা সতর্কতা:</div>
                        <p style='font-size: 12px; color: #b45309; margin: 0;'>
                            এই লাইসেন্স কী শুধুমাত্র <strong>{$targetDomain}</strong> ডোমেইনেই কাজ করবে। অন্য কোনো ডোমেইনে বা হোস্টিংয়ে ওয়েবসাইট আপলোড করা হলে সাইট স্বয়ংক্রিয়ভাবে লক হয়ে যাবে।
                        </p>
                    </div>
                </div>
                <div style='background-color: #f8fafc; padding: 14px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;'>
                    Guruz E-Commerce Security System • All Rights Reserved
                </div>
            </div>";

            Mail::html($htmlBody, function ($message) use ($ownerEmail, $targetDomain) {
                $message->to($ownerEmail)
                        ->subject("🛡️ নতুন লাইসেন্স কী প্রস্তুত [{$targetDomain}]");
            });
            $emailSent = true;
        } catch (\Throwable $e) {
            // SMTP logged silently
        }

        return back()->with([
            'email_sent'       => $emailSent,
            'generated_domain' => $targetDomain,
            'generated_email'  => $ownerEmail,
            'success'          => "লাইসেন্স কী তৈরি হয়েছে এবং সফলভাবে আপনার মাস্টার জিমেইলে ({$ownerEmail}) পাঠিয়ে দেওয়া হয়েছে। অনুগ্রহ করে আপনার জিমেইল ইনবক্স চেক করুন।",
        ]);
    }
}
