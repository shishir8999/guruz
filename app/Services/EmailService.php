<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Shop;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailService
{
    /**
     * Configure SMTP settings dynamically from SiteSetting or fallback to env.
     */
    public static function configureSmtp(): void
    {
        $dbSettings = SiteSetting::where('group', 'smtp')->pluck('value', 'key')->toArray();

        $host       = !empty($dbSettings['mail_host'])       ? trim($dbSettings['mail_host'])       : env('MAIL_HOST', 'smtp.gmail.com');
        $port       = !empty($dbSettings['mail_port'])       ? (int)$dbSettings['mail_port']        : (int)env('MAIL_PORT', 465);
        $username   = !empty($dbSettings['mail_username'])   ? trim($dbSettings['mail_username'])   : trim(env('MAIL_USERNAME', 'noreply.guruz@gmail.com'));
        $rawPassword= !empty($dbSettings['mail_password'])   ? trim($dbSettings['mail_password'])   : trim(env('MAIL_PASSWORD', 'izzaujgavcvnxkhm'));
        $password   = str_replace(' ', '', $rawPassword);
        $encryption = !empty($dbSettings['mail_encryption']) ? trim($dbSettings['mail_encryption']) : env('MAIL_ENCRYPTION', 'ssl');
        $fromAddr   = !empty($dbSettings['mail_from_address'])? trim($dbSettings['mail_from_address']): env('MAIL_FROM_ADDRESS', $username);
        $fromName   = !empty($dbSettings['mail_from_name'])   ? trim($dbSettings['mail_from_name'])   : env('MAIL_FROM_NAME', 'Guruz E-Commerce');

        Config::set('mail.default', 'smtp');
        Config::set('mail.mailers.smtp.transport', 'smtp');
        Config::set('mail.mailers.smtp.host', $host);
        Config::set('mail.mailers.smtp.port', $port);
        Config::set('mail.mailers.smtp.username', $username);
        Config::set('mail.mailers.smtp.password', $password);
        Config::set('mail.mailers.smtp.encryption', $encryption);
        Config::set('mail.from.address', $fromAddr);
        Config::set('mail.from.name', $fromName);

        Mail::purge('smtp');
    }

    /**
     * 1. Send Vendor Registration Confirmation Email
     */
    public static function sendVendorRegistrationEmail(User $user, ?Shop $shop = null): bool
    {
        if (empty($user->email)) return false;

        self::configureSmtp();

        $shopName = $shop ? $shop->name : 'আপনার শপ';
        $shopPhone = $shop ? $shop->phone : $user->phone;
        $sellerDashboardUrl = url('/seller');
        $siteTitle = SiteSetting::get('site_title', 'Guruz E-Commerce');
        $supportPhone = SiteSetting::get('support_phone', '01700000000');

        $subject = "🎉 অভিনন্দন! {$siteTitle}-এ আপনার ভেন্ডর প্যানেল খোলা সম্পন্ন হয়েছে!";

        $bodyHtml = "
        <div style='font-family: Arial, \"Hind Siliguri\", sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f1f5f9; color: #1e293b;'>
            <div style='background: linear-gradient(135deg, #059669 0%, #0d9488 50%, #4338ca 100%); padding: 32px 20px; text-align: center; border-radius: 16px 16px 0 0;'>
                <div style='display: inline-block; background-color: rgba(255, 255, 255, 0.2); padding: 4px 14px; border-radius: 20px; color: #a7f3d0; font-size: 12px; font-weight: bold; margin-bottom: 12px; border: 1px solid rgba(255, 255, 255, 0.25);'>
                    🎉 ভেন্ডর রেজিস্ট্রেশন ও প্যানেল তৈরি সফল
                </div>
                <div style='font-size: 40px; margin-bottom: 6px;'>🚀🏪</div>
                <h1 style='color: #ffffff; margin: 0; font-size: 22px; font-weight: 900; line-height: 1.4;'>
                    অভিনন্দন " . htmlspecialchars($user->name) . "!<br/>আপনার ভেন্ডর প্যানেল খোলা সম্পন্ন হয়েছে!
                </h1>
                <p style='color: #d1fae5; margin: 8px 0 0 0; font-size: 13px; line-height: 1.5;'>
                    {$siteTitle} মাল্টিভেন্ডর প্ল্যাটফর্মে আপনার সেলার স্টোর ও ভেন্ডর প্যানেল সফলভাবে উন্মুক্ত হয়েছে।
                </p>
            </div>
            
            <div style='background-color: #ffffff; padding: 28px 24px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.06);'>
                <p style='font-size: 14px; line-height: 1.7; color: #334155; margin-top: 0;'>
                    প্রিয় <strong>" . htmlspecialchars($user->name) . "</strong>,<br/>
                    {$siteTitle} ভেন্ডর পরিবারে আপনাকে আন্তরিক শুভেচ্ছা ও স্বাগতম! আপনার সেলার অ্যাকাউন্ট ও বিজনেস প্রোফাইল সফলভাবে তৈরি হয়েছে এবং ভেন্ডর প্যানেল উন্মুক্ত করা হয়েছে। এখন থেকেই আপনার ব্যবসা পরিচালনার নতুন অধ্যায় শুরু হলো।
                </p>

                <!-- Registered Shop Info Summary Card -->
                <div style='background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 18px; margin: 20px 0;'>
                    <h3 style='margin: 0 0 12px 0; font-size: 14px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;'>
                        📋 আপনার নিবন্ধিত শপ তথ্য:
                    </h3>
                    <table style='width: 100%; border-collapse: collapse; font-size: 13px;'>
                        <tr>
                            <td style='padding: 5px 0; color: #64748b; width: 140px;'><strong>শপের নাম:</strong></td>
                            <td style='padding: 5px 0; color: #0f172a; font-weight: bold;'>" . htmlspecialchars($shopName) . "</td>
                        </tr>
                        <tr>
                            <td style='padding: 5px 0; color: #64748b;'><strong>মালিক / প্রোপ্রাইটর:</strong></td>
                            <td style='padding: 5px 0; color: #0f172a; font-weight: bold;'>" . htmlspecialchars($user->name) . "</td>
                        </tr>
                        <tr>
                            <td style='padding: 5px 0; color: #64748b;'><strong>রেজিস্টার্ড ইমেইল:</strong></td>
                            <td style='padding: 5px 0; color: #0f172a;'>" . htmlspecialchars($user->email) . "</td>
                        </tr>
                        <tr>
                            <td style='padding: 5px 0; color: #64748b;'><strong>মোবাইল নম্বর:</strong></td>
                            <td style='padding: 5px 0; color: #0f172a;'>" . htmlspecialchars($shopPhone) . "</td>
                        </tr>
                        <tr>
                            <td style='padding: 5px 0; color: #64748b;'><strong>প্যানেল স্ট্যাটাস:</strong></td>
                            <td style='padding: 5px 0;'>
                                <span style='background-color: #fef3c7; color: #92400e; padding: 3px 10px; border-radius: 20px; font-weight: bold; font-size: 11px; border: 1px solid #fde68a;'>
                                    ⏳ রিভিউ চলছে (অনুমোদন প্রক্রিয়াধীন)
                                </span>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Guidelines & Next Steps -->
                <div style='margin: 22px 0;'>
                    <h4 style='margin: 0 0 12px 0; font-size: 14px; color: #0f172a;'>
                        🛡️ ভেন্ডর প্যানেল অনুমোদন ও পরিচালনার নিয়মাবলী:
                    </h4>

                    <!-- Rule 1 -->
                    <div style='background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 14px; border-radius: 8px; margin-bottom: 10px;'>
                        <strong style='color: #92400e; font-size: 13px;'>১. কখন শপটি সক্রিয় (Active) হবে? ⏳</strong>
                        <p style='margin: 4px 0 0 0; font-size: 12px; color: #78350f; line-height: 1.6;'>
                            আপনার দেওয়া সকল তথ্য (জাতীয় পরিচয়পত্র/NID, ব্যাংক অ্যাকাউন্ট ও শপের ঠিকানা) আমাদের ভেরিফিকেশন টিম পর্যালোচনা করছে। সাধারণত <strong>১২ থেকে ২৪ ঘণ্টার মধ্যে</strong> সুপার অ্যাডমিন রিভিউ সম্পন্ন করে শপটি সম্পূর্ণ <strong>অ্যাক্টিভ ও অ্যাপ্রুভ (Approved)</strong> করে দেবে।
                        </p>
                    </div>

                    <!-- Rule 2 -->
                    <div style='background-color: #eff6ff; border: 1px solid #dbeafe; border-left: 4px solid #3b82f6; padding: 12px 14px; border-radius: 8px; margin-bottom: 10px;'>
                        <strong style='color: #1e40af; font-size: 13px;'>২. কখন ভেন্ডর প্যানেল ব্যবহার শুরু করতে পারবেন? 📦</strong>
                        <p style='margin: 4px 0 0 0; font-size: 12px; color: #1e3a8a; line-height: 1.6;'>
                            <strong>এখন থেকেই!</strong> আপনি এখনই আপনার সেলার ড্যাশবোর্ডে প্রবেশ করে শপ প্রোফাইল সাজাতে পারবেন, ব্যানার ও লোগো যুক্ত করতে পারবেন এবং নতুন প্রোডাক্ট আপলোড করে প্রস্তুত রাখতে পারবেন।
                        </p>
                    </div>

                    <!-- Rule 3 -->
                    <div style='background-color: #ecfdf5; border: 1px solid #d1fae5; border-left: 4px solid #10b981; padding: 12px 14px; border-radius: 8px; margin-bottom: 10px;'>
                        <strong style='color: #065f46; font-size: 13px;'>৩. ক্রেতাদের কাছে কখন প্রোডাক্ট লাইভ হবে? 🚀</strong>
                        <p style='margin: 4px 0 0 0; font-size: 12px; color: #047857; line-height: 1.6;'>
                            সুপার অ্যাডমিন শপটি অনুমোদন (Active/Approved) করার <strong>সাথে সাথে</strong> আপনার আপলোড করা সকল প্রোডাক্ট {$siteTitle} প্ল্যাটফর্মের হোম পেজ ও ক্যাটাগরিতে সকল ক্রেতার জন্য <strong>সম্পূর্ণ লাইভ ও বিক্রয়ের জন্য উন্মুক্ত</strong> হবে।
                        </p>
                    </div>

                    <!-- Rule 4 -->
                    <div style='background-color: #faf5ff; border: 1px solid #f3e8ff; border-left: 4px solid #a855f7; padding: 12px 14px; border-radius: 8px;'>
                        <strong style='color: #6b21a8; font-size: 13px;'>৪. কনফার্মেশন নোটিফিকেশন 🔔</strong>
                        <p style='margin: 4px 0 0 0; font-size: 12px; color: #581c87; line-height: 1.6;'>
                            আপনার শপ অনুমোদন সম্পন্ন হওয়া মাত্রই আপনার এই ইমেইল এবং মোবাইল নম্বরে সরাসরি কনফার্মেশন মেসেজ পৌঁছে যাবে।
                        </p>
                    </div>
                </div>

                <!-- Action Button -->
                <div style='text-align: center; margin: 30px 0 20px 0;'>
                    <a href='{$sellerDashboardUrl}' style='background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; padding: 14px 34px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4); letter-spacing: 0.3px;'>
                        🚀 সরাসরি ভেন্ডর প্যানেলে প্রবেশ করুন
                    </a>
                </div>

                <hr style='border: none; border-top: 1px solid #e2e8f0; margin: 25px 0 15px 0;' />
                <div style='font-size: 12px; color: #64748b; text-align: center;'>
                    যেকোনো প্রয়োজনে আমাদের সাপোর্ট হেল্পলাইন: <strong>{$supportPhone}</strong>
                </div>
            </div>

            <div style='text-align: center; margin-top: 20px; font-size: 12px; color: #94a3b8;'>
                © " . date('Y') . " {$siteTitle}. সর্বস্বত্ব সংরক্ষিত।
            </div>
        </div>";

        return self::sendMail($user->email, $subject, $bodyHtml);
    }

    /**
     * Send Vendor Shop Approval Confirmation Email
     */
    public static function sendVendorApprovedEmail(User $user, Shop $shop): bool
    {
        if (empty($user->email)) return false;

        self::configureSmtp();

        $shopName = $shop->name ?: 'আপনার শপ';
        $sellerDashboardUrl = url('/seller');
        $siteTitle = SiteSetting::get('site_title', 'Guruz BD');
        $supportPhone = SiteSetting::get('support_phone', '01700000000');

        $subject = "🎉 অভিনন্দন! আপনার ভেন্ডর শপ '{$shopName}' অনুমোদিত হয়েছে - {$siteTitle}";

        $bodyHtml = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; color: #1e293b; border-radius: 16px;'>
            <div style='background: linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;'>
                <div style='font-size: 44px; margin-bottom: 8px;'>🎉🏪✅</div>
                <h1 style='color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; text-shadow: 0 2px 4px rgba(0,0,0,0.15);'>শপ অনুমোদন সম্পন্ন হয়েছে!</h1>
                <p style='color: #d1fae5; margin: 6px 0 0 0; font-size: 14px; font-weight: bold;'>Vendor Account Approved & Live</p>
            </div>
            <div style='background-color: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);'>
                <h2 style='color: #0f172a; margin-top: 0; font-size: 18px;'>প্রিয় {$user->name},</h2>
                <p style='font-size: 14px; line-height: 1.7; color: #334155;'>
                    আমরা আনন্দের সাথে জানাচ্ছি যে, সুপার অ্যাডমিন কর্তৃক আপনার ভেন্ডর শপ <strong>'{$shopName}'</strong> সফলভাবে পর্যালোচনা ও <strong>অনুমোদিত (Approved)</strong> করা হয়েছে! 🎉
                </p>
                <p style='font-size: 14px; line-height: 1.7; color: #334155;'>
                    এখন আপনার ভেন্ডর অ্যাকাউন্ট সম্পূর্ণ সক্রিয়। আপনি এখনই সেলার প্যানেলে প্রবেশ করে আপনার পণ্য আপলোড করতে পারেন এবং ক্রেতাদের কাছে অনলাইন বিক্রয় শুরু করতে পারেন।
                </p>

                <div style='background-color: #ecfdf5; border: 1.5px solid #a7f3d0; padding: 18px; border-radius: 12px; margin: 22px 0;'>
                    <h3 style='margin-top: 0; font-size: 14px; color: #065f46;'>📋 আপনার অনুমোদিত শপ বিবরণ:</h3>
                    <p style='margin: 5px 0; font-size: 13px; color: #047857;'><strong>দোকানের নাম:</strong> {$shopName}</p>
                    <p style='margin: 5px 0; font-size: 13px; color: #047857;'><strong>রেজিস্টার্ড ইমেইল:</strong> {$user->email}</p>
                    <p style='margin: 5px 0; font-size: 13px; color: #047857;'><strong>অ্যাকাউন্ট স্ট্যাটাস:</strong> <span style='background-color: #10b981; color: #ffffff; padding: 2px 8px; border-radius: 6px; font-weight: bold; font-size: 11px;'>সক্রিয় (Active & Verified)</span></p>
                </div>

                <div style='text-align: center; margin: 30px 0;'>
                    <a href='{$sellerDashboardUrl}' style='background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 14px 34px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);'>
                        🚀 সেলার প্যানেলে প্রবেশ করুন
                    </a>
                </div>

                <div style='background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 10px; margin-top: 25px;'>
                    <h4 style='margin: 0 0 8px 0; font-size: 13px; color: #475569;'>💡 পরবর্তী পদক্ষেপসমূহ:</h4>
                    <ul style='margin: 0; padding-left: 20px; font-size: 12px; color: #64748b; line-height: 1.8;'>
                        <li>ড্যাশবোর্ডে লগইন করে আপনার শপের ব্যানার ও লোগো সাজিয়ে নিন।</li>
                        <li>'নতুন প্রোডাক্ট যোগ করুন' সেকশনে গিয়ে আপনার প্রথম পণ্যটি আপলোড করুন।</li>
                        <li>ব্যাংক বা বিকাশ অ্যাকাউন্ট যুক্ত করে সহজে পেমেন্ট ও পে-আউট গ্রহণ করুন।</li>
                    </ul>
                </div>

                <hr style='border: none; border-top: 1px solid #f1f5f9; margin: 25px 0 15px 0;' />
                <div style='font-size: 12px; color: #64748b; text-align: center;'>
                    যেকোনো সহায়তার জন্য আমাদের হেল্পলাইন: <strong>{$supportPhone}</strong>
                </div>
            </div>
            <div style='text-align: center; margin-top: 20px; font-size: 12px; color: #94a3b8;'>
                © " . date('Y') . " {$siteTitle}. All rights reserved.
            </div>
        </div>";

        return self::sendMail($user->email, $subject, $bodyHtml);
    }

    /**
     * Send Vendor Shop Rejection Email
     */
    public static function sendVendorRejectedEmail(User $user, Shop $shop, string $reason = ''): bool
    {
        if (empty($user->email)) return false;

        self::configureSmtp();

        $shopName    = $shop->name ?: 'আপনার শপ';
        $siteTitle   = SiteSetting::get('site_title', 'Guruz BD');
        $supportPhone= SiteSetting::get('support_phone', '01700000000');
        $reapplyUrl  = url('/vendor/register');

        $subject = "⚠️ আপনার ভেন্ডর শপ '{$shopName}' অনুমোদিত হয়নি - {$siteTitle}";

        $reasonBlock = $reason
            ? "<div style='background-color:#fff7ed;border:1.5px solid #fed7aa;padding:14px 18px;border-radius:10px;margin:18px 0;'>
                <strong style='font-size:13px;color:#c2410c;'>📋 কারণ:</strong>
                <p style='margin:6px 0 0 0;font-size:13px;color:#9a3412;line-height:1.6;'>" . htmlspecialchars($reason) . "</p>
               </div>"
            : '';

        $bodyHtml = "
        <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background-color:#f8fafc;color:#1e293b;border-radius:16px;'>
            <div style='background:linear-gradient(135deg,#dc2626 0%,#ef4444 50%,#b91c1c 100%);padding:30px 20px;text-align:center;border-radius:12px 12px 0 0;'>
                <div style='font-size:44px;margin-bottom:8px;'>❌🏪</div>
                <h1 style='color:#ffffff;margin:0;font-size:22px;font-weight:900;'>শপ অনুমোদন হয়নি</h1>
                <p style='color:#fecaca;margin:6px 0 0 0;font-size:13px;font-weight:bold;'>Vendor Application – Rejected</p>
            </div>
            <div style='background-color:#ffffff;padding:28px 24px;border-radius:0 0 12px 12px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);'>
                <h2 style='color:#0f172a;margin-top:0;font-size:17px;'>প্রিয় " . htmlspecialchars($user->name) . ",</h2>
                <p style='font-size:14px;line-height:1.7;color:#334155;'>
                    দুঃখের সাথে জানাচ্ছি যে, আপনার ভেন্ডর শপ <strong>'{$shopName}'</strong> বর্তমানে অনুমোদন করা সম্ভব হয়নি।
                    তবে, আপনি প্রয়োজনীয় তথ্য সংশোধন করে পুনরায় আবেদন করতে পারেন।
                </p>
                {$reasonBlock}
                <div style='background-color:#f8fafc;border:1px solid #e2e8f0;padding:16px;border-radius:10px;margin-top:18px;'>
                    <h4 style='margin:0 0 8px 0;font-size:13px;color:#475569;'>🔄 পরবর্তী পদক্ষেপ:</h4>
                    <ul style='margin:0;padding-left:20px;font-size:12px;color:#64748b;line-height:1.8;'>
                        <li>আমাদের সাথে যোগাযোগ করে কারণ জানুন এবং তথ্য সংশোধন করুন।</li>
                        <li>সঠিক ব্যবসায়িক তথ্য ও ডকুমেন্ট নিয়ে পুনরায় নিবন্ধন করুন।</li>
                        <li>যেকোনো প্রশ্নের জন্য আমাদের সাপোর্টে যোগাযোগ করুন।</li>
                    </ul>
                </div>
                <div style='text-align:center;margin:28px 0;'>
                    <a href='{$reapplyUrl}' style='background:linear-gradient(135deg,#2563eb 0%,#4f46e5 100%);color:#ffffff;padding:13px 30px;text-decoration:none;border-radius:10px;font-weight:bold;font-size:14px;display:inline-block;box-shadow:0 4px 14px rgba(37,99,235,0.3);'>
                        🔄 পুনরায় আবেদন করুন
                    </a>
                </div>
                <hr style='border:none;border-top:1px solid #f1f5f9;margin:20px 0 14px 0;'/>
                <div style='font-size:12px;color:#64748b;text-align:center;'>
                    সহায়তা প্রয়োজনে কল করুন: <strong>{$supportPhone}</strong>
                </div>
            </div>
            <div style='text-align:center;margin-top:18px;font-size:12px;color:#94a3b8;'>
                © " . date('Y') . " {$siteTitle}. All rights reserved.
            </div>
        </div>";

        return self::sendMail($user->email, $subject, $bodyHtml);
    }

    /**
     * Send Vendor Shop Suspended Email
     */
    public static function sendVendorSuspendedEmail(User $user, Shop $shop, string $reason = ''): bool
    {
        if (empty($user->email)) return false;

        self::configureSmtp();

        $shopName    = $shop->name ?: 'আপনার শপ';
        $siteTitle   = SiteSetting::get('site_title', 'Guruz BD');
        $supportPhone= SiteSetting::get('support_phone', '01700000000');

        $subject = "⚠️ আপনার ভেন্ডর শপ '{$shopName}' সাময়িকভাবে স্থগিত হয়েছে - {$siteTitle}";

        $reasonBlock = $reason
            ? "<div style='background-color:#fff7ed;border:1.5px solid #fed7aa;padding:14px 18px;border-radius:10px;margin:18px 0;'>
                <strong style='font-size:13px;color:#c2410c;'>📋 কারণ:</strong>
                <p style='margin:6px 0 0 0;font-size:13px;color:#9a3412;line-height:1.6;'>" . htmlspecialchars($reason) . "</p>
               </div>"
            : '';

        $bodyHtml = "
        <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background-color:#f8fafc;color:#1e293b;border-radius:16px;'>
            <div style='background:linear-gradient(135deg,#d97706 0%,#f59e0b 50%,#b45309 100%);padding:30px 20px;text-align:center;border-radius:12px 12px 0 0;'>
                <div style='font-size:44px;margin-bottom:8px;'>⚠️🏪</div>
                <h1 style='color:#ffffff;margin:0;font-size:22px;font-weight:900;'>শপ সাময়িক স্থগিত</h1>
                <p style='color:#fef3c7;margin:6px 0 0 0;font-size:13px;font-weight:bold;'>Vendor Account – Temporarily Suspended</p>
            </div>
            <div style='background-color:#ffffff;padding:28px 24px;border-radius:0 0 12px 12px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);'>
                <h2 style='color:#0f172a;margin-top:0;font-size:17px;'>প্রিয় " . htmlspecialchars($user->name) . ",</h2>
                <p style='font-size:14px;line-height:1.7;color:#334155;'>
                    আপনার ভেন্ডর শপ <strong>'{$shopName}'</strong> সাময়িকভাবে স্থগিত করা হয়েছে। 
                    বিস্তারিত জানতে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।
                </p>
                {$reasonBlock}
                <hr style='border:none;border-top:1px solid #f1f5f9;margin:20px 0 14px 0;'/>
                <div style='font-size:12px;color:#64748b;text-align:center;'>
                    সহায়তা প্রয়োজনে কল করুন: <strong>{$supportPhone}</strong>
                </div>
            </div>
            <div style='text-align:center;margin-top:18px;font-size:12px;color:#94a3b8;'>
                © " . date('Y') . " {$siteTitle}. All rights reserved.
            </div>
        </div>";

        return self::sendMail($user->email, $subject, $bodyHtml);
    }

    /**
     * 2. Send Order Confirmation Email (Order Placed or Confirmed by Admin/Vendor)
     */
    public static function sendOrderConfirmationEmail(Order $order): bool
    {
        $recipientEmail = $order->customer_email ?: ($order->user ? $order->user->email : null);
        if (empty($recipientEmail)) return false;

        self::configureSmtp();

        $order->loadMissing('items');

        $subject = "আপনার অর্ডারটি নিশ্চিত করা হয়েছে (Order #{$order->order_number})";

        $itemsHtml = "";
        if ($order->items && count($order->items) > 0) {
            foreach ($order->items as $item) {
                $itemsHtml .= "
                <tr>
                    <td style='padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px;'>{$item->product_name}</td>
                    <td style='padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center;'>{$item->quantity}</td>
                    <td style='padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right;'>৳{$item->price}</td>
                </tr>";
            }
        }

        $symbol = $order->currency === 'INR' ? '₹' : '৳';
        $finalAmount = $order->currency === 'INR' ? $order->currency_amount : $order->total;

        $bodyHtml = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; color: #1e293b; border-radius: 16px;'>
            <div style='background-color: #09152a; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;'>
                <h1 style='color: #ffffff; margin: 0; font-size: 24px; font-weight: 900;'>Guruz Order Confirmed</h1>
            </div>
            <div style='background-color: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);'>
                <h2 style='color: #10b981; margin-top: 0; font-size: 18px;'>প্রিয় {$order->customer_name}, আপনার অর্ডারটি নিশ্চিত হয়েছে! ✅</h2>
                <p style='font-size: 14px; line-height: 1.6; color: #475569;'>
                    Guruz-এ অর্ডার করার জন্য ধন্যবাদ। আমাদের ভেন্ডর/টিম আপনার অর্ডারটি প্রসেস করছে।
                </p>

                <div style='background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;'>
                    <p style='margin: 4px 0; font-size: 13px;'><strong>অর্ডার নম্বর:</strong> #{$order->order_number}</p>
                    <p style='margin: 4px 0; font-size: 13px;'><strong>পেমেন্ট মেথড:</strong> {$order->payment_method}</p>
                    <p style='margin: 4px 0; font-size: 13px;'><strong>ডেলিভারি ঠিকানা:</strong> {$order->shipping_address}</p>
                </div>

                <table style='width: 100%; border-collapse: collapse; margin-top: 15px;'>
                    <thead>
                        <tr style='background-color: #f1f5f9; text-align: left; font-size: 12px; text-transform: uppercase;'>
                            <th style='padding: 10px;'>প্রোডাক্ট</th>
                            <th style='padding: 10px; text-align: center;'>পরিমাণ</th>
                            <th style='padding: 10px; text-align: right;'>মূল্য</th>
                        </tr>
                    </thead>
                    <tbody>
                        {$itemsHtml}
                    </tbody>
                </table>

                <div style='text-align: right; margin-top: 15px; font-size: 15px; font-weight: bold; color: #0f172a;'>
                    মোট পরিশোধযোগ্য: {$symbol}{$finalAmount}
                </div>

                <div style='text-align: center; margin-top: 25px;'>
                    <a href='" . url('/track?search=' . $order->order_number) . "' style='background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px; display: inline-block;'>অর্ডার ট্র্যাক করুন 📦</a>
                </div>
            </div>
        </div>";

        return self::sendMail($recipientEmail, $subject, $bodyHtml);
    }

    /**
     * 3. Send Order Completed Email (When status set to completed/delivered)
     */
    public static function sendOrderCompletedEmail(Order $order): bool
    {
        $recipientEmail = $order->customer_email ?: ($order->user ? $order->user->email : null);
        if (empty($recipientEmail)) return false;

        self::configureSmtp();

        $subject = "আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে (Order #{$order->order_number})";

        $symbol = $order->currency === 'INR' ? '₹' : '৳';
        $finalAmount = $order->currency === 'INR' ? $order->currency_amount : $order->total;

        $bodyHtml = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; color: #1e293b; border-radius: 16px;'>
            <div style='background-color: #09152a; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;'>
                <h1 style='color: #ffffff; margin: 0; font-size: 24px; font-weight: 900;'>Order Completed</h1>
            </div>
            <div style='background-color: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);'>
                <h2 style='color: #10b981; margin-top: 0; font-size: 18px;'>প্রিয় {$order->customer_name}, আপনার অর্ডারটি ডেলিভারড ও সম্পন্ন হয়েছে! 🛍️</h2>
                <p style='font-size: 14px; line-height: 1.6; color: #475569;'>
                    আপনার <strong>#{$order->order_number}</strong> নম্বর অর্ডারটি সফলভাবে গ্রাহকের কাছে পৌঁছে দিয়ে সম্পন্ন করা হয়েছে। Guruz-এর সাথে থাকার জন্য ধন্যবাদ!
                </p>

                <div style='background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 16px; border-radius: 8px; margin: 20px 0;'>
                    <p style='margin: 4px 0; font-size: 13px; color: #065f46;'><strong>অর্ডার স্ট্যাটাস:</strong> Completed (সম্পন্ন)</p>
                    <p style='margin: 4px 0; font-size: 13px; color: #065f46;'><strong>মোট মূল্য:</strong> {$symbol}{$finalAmount}</p>
                    <p style='margin: 4px 0; font-size: 13px; color: #065f46;'><strong>ডেলিভারি ঠিকানা:</strong> {$order->shipping_address}</p>
                </div>

                <div style='text-align: center; margin-top: 25px;'>
                    <a href='" . url('/') . "' style='background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px; display: inline-block;'>আরও কেনাকাটা করুন 🛒</a>
                </div>
            </div>
        </div>";

        return self::sendMail($recipientEmail, $subject, $bodyHtml);
    }

    /**
     * Send Invoice Email with PDF Download Link to Customer
     */
    public static function sendInvoiceEmail(Order $order): bool
    {
        $recipientEmail = $order->customer_email ?: ($order->user ? $order->user->email : null);
        if (empty($recipientEmail)) {
            Log::info("sendInvoiceEmail: No email found for order #{$order->order_number}");
            return false;
        }

        self::configureSmtp();

        $order->loadMissing(['items', 'shop']);
        $downloadUrl = url("/invoices/{$order->order_number}/download?download=1");
        $viewUrl = url("/invoices/{$order->order_number}/download");

        $subject = "আপনার ইনভয়েস #{$order->order_number} - Guruz eCommerce";

        $bodyHtml = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; color: #1e293b; border-radius: 16px;'>
            <div style='background-color: #7c3aed; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;'>
                <h1 style='color: #ffffff; margin: 0; font-size: 24px; font-weight: 900;'>GURUZ INVOICE</h1>
                <p style='color: #e9d5ff; margin: 5px 0 0 0; font-size: 14px;'>Order #{$order->order_number}</p>
            </div>
            <div style='background-color: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);'>
                <h2 style='color: #0f172a; margin-top: 0; font-size: 18px;'>প্রিয় {$order->customer_name},</h2>
                <p style='font-size: 14px; line-height: 1.6; color: #475569;'>
                    আপনার অর্ডার <strong>#{$order->order_number}</strong>-এর অফিসিয়াল PDF ইনভয়েস তৈরি হয়েছে। নিচে দেয়া বাটন বা লিংকে ক্লিক করে আপনার ইনভয়েস দেখে নিতে বা সেভ করতে পারেন।
                </p>

                <div style='background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0;'>
                    <p style='margin: 4px 0; font-size: 13px;'><strong>মোট পরিমাণ:</strong> Tk. {$order->total}</p>
                    <p style='margin: 4px 0; font-size: 13px;'><strong>পেমেন্ট স্ট্যাটাস:</strong> {$order->payment_status}</p>
                    <p style='margin: 4px 0; font-size: 13px;'><strong>ডেলিভারি ঠিকানা:</strong> {$order->shipping_address}</p>
                </div>

                <div style='text-align: center; margin-top: 25px;'>
                    <a href='{$downloadUrl}' style='background-color: #10b981; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; margin-right: 10px;'>📥 Download PDF Invoice</a>
                    <a href='{$viewUrl}' style='background-color: #6366f1; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;'>👁️ View Web Invoice</a>
                </div>
            </div>
            <div style='text-align: center; margin-top: 20px; font-size: 12px; color: #94a3b8;'>
                © " . date('Y') . " Guruz eCommerce System. All rights reserved.
            </div>
        </div>";

        return self::sendMail($recipientEmail, $subject, $bodyHtml);
    }

    /**
     * Send Birthday Wish Greeting Email to Customer (Supports Bengali, English, Hindi)
     */
    public static function sendBirthdayWishEmail(
        User $user, 
        string $subject, 
        string $messageBody, 
        ?string $couponCode = null, 
        ?string $discountValue = null,
        string $lang = 'bn'
    ): bool {
        if (empty($user->email)) return false;

        self::configureSmtp();

        $appUrl = config('app.url', url('/'));
        $shopUrl = $appUrl . '/products';
        $siteTitle = SiteSetting::get('site_title', 'Guruz BD');
        $supportPhone = SiteSetting::get('support_phone', '01700000000');

        $nlMessage = nl2br(e($messageBody));

        // Determine if messageBody already starts with a greeting/salutation
        $hasGreeting = (bool) preg_match('/^\s*(dear|প্রিয়|প্রিয়|प्रिय|hello|hi|নমস্কার|नमस्ते|welcome)\b/iu', trim($messageBody));

        // Language Dictionary
        $lang = in_array(strtolower($lang), ['bn', 'en', 'hi']) ? strtolower($lang) : 'bn';

        $i18n = [
            'bn' => [
                'banner_title'    => 'শুভ জন্মদিন!',
                'banner_sub'      => "{$siteTitle}-এর পক্ষ থেকে জন্মদিনের শুভেচ্ছা",
                'greeting'        => "প্রিয় {$user->name},",
                'coupon_prefix'   => '🎁 আপনার জন্মদিনের বিশেষ কুপন উপহার',
                'discount_fallback' => 'স্পেশাল বার্থডে ডিসকাউন্ট',
                'discount_suffix' => 'ডিসকাউন্ট উপহার',
                'coupon_hint'     => 'চেকআউট করার সময় কুপন কোডটি ব্যবহার করে ডিসকাউন্ট উপভোগ করুন!',
                'button_text'     => '🛍️ কেনাকাটা শুরু করুন (Shop Now)',
                'support_text'    => "যেকোনো প্রয়োজনে আমাদের সাপোর্ট হেল্পলাইন: <strong>{$supportPhone}</strong>",
                'rights_text'     => 'সর্বস্বত্ব সংরক্ষিত।',
            ],
            'en' => [
                'banner_title'    => 'Happy Birthday!',
                'banner_sub'      => "Warm Birthday Wishes from {$siteTitle}",
                'greeting'        => "Dear {$user->name},",
                'coupon_prefix'   => '🎁 Special Birthday Gift Coupon',
                'discount_fallback' => 'Special Birthday Discount',
                'discount_suffix' => 'Discount Gift',
                'coupon_hint'     => 'Use this coupon code at checkout to claim your birthday discount!',
                'button_text'     => '🛍️ Shop Now',
                'support_text'    => "Need assistance? Our support helpline: <strong>{$supportPhone}</strong>",
                'rights_text'     => 'All rights reserved.',
            ],
            'hi' => [
                'banner_title'    => 'जन्मदिन मुबारक!',
                'banner_sub'      => "{$siteTitle} की ओर से हार्दिक शुभकामनाएं",
                'greeting'        => "प्रिय {$user->name},",
                'coupon_prefix'   => '🎁 आपके जन्मदिन का विशेष उपहार कूपन',
                'discount_fallback' => 'विशेष जन्मदिन छूट',
                'discount_suffix' => 'छूट उपहार',
                'coupon_hint'     => 'चेकआउट करते समय इस कूपন कोड का उपयोग करके छूट का लाभ उठाएं!',
                'button_text'     => '🛍️ अभी खरीदारी करें (Shop Now)',
                'support_text'    => "किसी भी सहायता के लिए हमारी सपोर्ट हेल्पलाइन: <strong>{$supportPhone}</strong>",
                'rights_text'     => 'सर्वाधिकार सुरक्षित।',
            ],
        ];

        $cur = $i18n[$lang];

        $couponHtml = '';
        if (!empty($couponCode)) {
            $discountText = !empty($discountValue) ? "{$discountValue} {$cur['discount_suffix']}" : $cur['discount_fallback'];
            $couponHtml = "
            <div style='background: linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%); border: 2px dashed #c084fc; border-radius: 16px; padding: 20px; text-align: center; margin: 25px 0;'>
                <div style='font-size: 13px; font-weight: bold; color: #7e22ce; text-transform: uppercase; letter-spacing: 0.5px;'>{$cur['coupon_prefix']} ({$discountText})</div>
                <div style='display: inline-block; background-color: #7c3aed; color: #ffffff; font-size: 22px; font-weight: 900; padding: 10px 24px; border-radius: 12px; margin: 12px 0; letter-spacing: 2px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3); font-family: monospace;'>
                    {$couponCode}
                </div>
                <p style='margin: 0; font-size: 12px; color: #6b21a8;'>{$cur['coupon_hint']}</p>
            </div>";
        }

        $greetingHtml = '';
        if (!$hasGreeting) {
            $greetingHtml = "<h2 style='color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 700;'>{$cur['greeting']}</h2>";
        }

        $bodyHtml = "
        <div style='font-family: \"Hind Siliguri\", \"Noto Sans Devanagari\", Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fdf2f8; color: #1e293b;'>
            <div style='background: linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f43f5e 100%); padding: 32px 20px; text-align: center; border-radius: 20px 20px 0 0;'>
                <div style='font-size: 48px; margin-bottom: 8px;'>🎂🎉🎈</div>
                <h1 style='color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; text-shadow: 0 2px 4px rgba(0,0,0,0.2);'>{$cur['banner_title']}</h1>
                <p style='color: #fdf2f8; margin: 6px 0 0 0; font-size: 14px; font-weight: bold;'>{$cur['banner_sub']}</p>
            </div>
            <div style='background-color: #ffffff; padding: 32px 28px; border-radius: 0 0 20px 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.06);'>
                {$greetingHtml}
                
                <div style='font-size: 14px; line-height: 1.8; color: #334155; margin: 16px 0;'>
                    {$nlMessage}
                </div>

                {$couponHtml}

                <div style='text-align: center; margin: 30px 0 10px 0;'>
                    <a href='{$shopUrl}' style='background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 14px 36px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(16,185,129,0.4);'>
                        {$cur['button_text']}
                    </a>
                </div>

                <hr style='border: none; border-top: 1px solid #f1f5f9; margin: 28px 0 18px 0;' />

                <div style='font-size: 12px; color: #64748b; text-align: center;'>
                    {$cur['support_text']}
                </div>
            </div>
            <div style='text-align: center; margin-top: 20px; font-size: 12px; color: #94a3b8;'>
                © " . date('Y') . " {$siteTitle}। {$cur['rights_text']}
            </div>
        </div>";

        return self::sendMail($user->email, $subject, $bodyHtml);
    }

    /**
     * Send Password Reset Email with Link to User
     */
    public static function sendPasswordResetEmail(User $user, string $resetUrl): bool
    {
        if (empty($user->email)) return false;

        self::configureSmtp();

        $subject = "আপনার Guruz অ্যাকাউন্ট পাসওয়ার্ড রিসেট লিংক";

        $bodyHtml = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; color: #1e293b; border-radius: 16px;'>
            <div style='background-color: #ea580c; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;'>
                <h1 style='color: #ffffff; margin: 0; font-size: 24px; font-weight: 900;'>GURUZ ACCOUNT RESET</h1>
            </div>
            <div style='background-color: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);'>
                <h2 style='color: #0f172a; margin-top: 0; font-size: 18px;'>প্রিয় {$user->name},</h2>
                <p style='font-size: 14px; line-height: 1.6; color: #475569;'>
                    আপনার Guruz অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তন করার জন্য রিসেট রিকোয়েস্ট পাওয়া গিয়েছে। নিচে দেয়া বাটন বা লিংকে ক্লিক করে আপনার নতুন পাসওয়ার্ড সেট করুন।
                </p>

                <div style='text-align: center; margin: 30px 0;'>
                    <a href='{$resetUrl}' style='background-color: #f97316; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(249,115,22,0.3);'>🔑 নতুন পাসওয়ার্ড সেট করুন (Reset Password)</a>
                </div>

                <p style='font-size: 12px; color: #64748b; margin-top: 20px;'>
                    বাটন কাজ না করলে এই লিংকটি কপি করে ব্রাউজারে অপেন করুন:<br>
                    <a href='{$resetUrl}' style='color: #ea580c;'>{$resetUrl}</a>
                </p>
                <p style='font-size: 12px; color: #94a3b8; margin-top: 15px;'>
                    যদি আপনি এই রিকোয়েস্ট না করে থাকেন, তবে এই মেসেজটি উপেক্ষা করুন।
                </p>
            </div>
            <div style='text-align: center; margin-top: 20px; font-size: 12px; color: #94a3b8;'>
                © " . date('Y') . " Guruz Marketplace. All rights reserved.
            </div>
        </div>";

        return self::sendMail($user->email, $subject, $bodyHtml);
    }

    /**
     * Send Google Authenticator Secret Key & Emergency Login Code to User's Email
     */
    public static function sendTwoFactorSecretKey($user, string $secretKey, string $backupCode): bool
    {
        $to = $user->email;
        if (empty($to)) return false;

        $subject = "🔐 আপনার ২FA সিক্রেট কী ও লগইন কোড - " . config('app.name', 'Guruz');
        
        $body = "
        <div style='font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b1329; border: 1px solid #7c3aed; border-radius: 20px; overflow: hidden; color: #ffffff;'>
            <div style='background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 30px 24px; text-align: center;'>
                <div style='font-size: 38px; margin-bottom: 8px;'>🔐</div>
                <h1 style='margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;'>Two-Factor Authentication Recovery</h1>
                <p style='margin: 6px 0 0; color: #e0e7ff; font-size: 13px;'>আপনার অ্যাকাউন্টের ২FA সিক্রেট কী এবং ব্যাকআপ কোড</p>
            </div>
            
            <div style='padding: 30px 24px;'>
                <p style='color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-top: 0;'>
                    প্রিয় <strong>" . htmlspecialchars($user->name ?: 'গ্রাহক') . "</strong>,
                </p>
                <p style='color: #cbd5e1; font-size: 14px; line-height: 1.6;'>
                    আপনি <strong>" . htmlspecialchars($user->email) . "</strong> অ্যাকাউন্টের জন্য Google Authenticator ২FA সিক্রেট কী রিকোয়েস্ট করেছেন।
                </p>

                <!-- Secret Key Card -->
                <div style='background: #131d38; border: 1px solid #6366f1; border-radius: 14px; padding: 20px; margin: 20px 0; text-align: center;'>
                    <span style='display: block; font-size: 12px; color: #a5b4fc; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;'>🔑 Google Authenticator Secret Key</span>
                    <div style='background: #060b19; border: 1px dashed #7c3aed; padding: 12px 18px; border-radius: 10px; font-family: monospace; font-size: 18px; font-weight: bold; color: #34d399; letter-spacing: 3px; display: inline-block;'>
                        " . htmlspecialchars($secretKey) . "
                    </div>
                    <p style='color: #94a3b8; font-size: 12px; margin: 10px 0 0;'>এই সিক্রেট কী-টি Google Authenticator অ্যাপে যুক্ত করে নতুন কোড জেনারেট করতে পারবেন।</p>
                </div>

                <!-- Instant 6-digit Code -->
                <div style='background: #1e1b4b; border: 1px solid #a855f7; border-radius: 14px; padding: 18px; margin: 20px 0; text-align: center;'>
                    <span style='display: block; font-size: 12px; color: #d8b4fe; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;'>⚡ এখনই লগইন করার ইনস্ট্যান্ট কোড (Instant Login OTP)</span>
                    <div style='font-size: 30px; font-weight: 900; color: #fbbf24; letter-spacing: 8px; font-family: monospace;'>
                        " . htmlspecialchars($backupCode) . "
                    </div>
                    <p style='color: #cbd5e1; font-size: 12px; margin: 8px 0 0;'>লগইন পেজে সরাসরি এই ৬-ডিজিটের কোডটি দিয়ে এখনই লগইন করতে পারবেন।</p>
                </div>

                <!-- Instructions -->
                <div style='background: #0f172a; border-radius: 12px; padding: 16px; margin: 24px 0; border-left: 4px solid #7c3aed;'>
                    <h4 style='margin: 0 0 10px; color: #c084fc; font-size: 13px; font-weight: bold;'>📱 Google Authenticator অ্যাপে যুক্ত করার নিয়ম:</h4>
                    <ol style='margin: 0; padding-left: 18px; color: #94a3b8; font-size: 12px; line-height: 1.7;'>
                        <li>আপনার মোবাইলে <strong>Google Authenticator</strong> অ্যাপ ওপেন করুন।</li>
                        <li>নিচের ডানদিকের <strong>'+' (Plus)</strong> আইকনে চাপুন।</li>
                        <li><strong>'Enter a setup key'</strong> নির্বাচন করুন।</li>
                        <li>Account Name-এ লিখুন: <code>Guruz (" . htmlspecialchars($user->email) . ")</code></li>
                        <li>Your Key-এ পেস্ট করুন: <code>" . htmlspecialchars($secretKey) . "</code></li>
                        <li>Type of key <strong>'Time based'</strong> রেখে <strong>Add</strong> বাটনে ট্যাপ করুন।</li>
                    </ol>
                </div>

                <p style='color: #64748b; font-size: 12px; margin-bottom: 0; line-height: 1.5;'>
                    ⚠️ <em>আপনি যদি এই রিকোয়েস্ট না করে থাকেন, তবে অবিলম্বে আপনার অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তন করুন।</em>
                </p>
            </div>

            <div style='background: #060b19; padding: 16px; text-align: center; border-top: 1px solid #1e293b; color: #64748b; font-size: 11px;'>
                &copy; " . date('Y') . " " . config('app.name', 'Guruz E-Commerce') . ". সর্বস্বত্ব সংরক্ষিত।
            </div>
        </div>
        ";

        return self::sendMail($to, $subject, $body);
    }

    /**
     * Send HTML raw mail safely
     */
    private static function sendMail(string $to, string $subject, string $htmlContent): bool
    {
        try {
            Mail::html($htmlContent, function ($message) use ($to, $subject) {
                $message->to($to)
                    ->subject($subject);
            });
            return true;
        } catch (\Throwable $e) {
            Log::error("Email sending failed to {$to} via SMTP: " . $e->getMessage());

            // Native PHP mail fallback
            try {
                $headers  = "MIME-Version: 1.0\r\n";
                $headers .= "Content-type: text/html; charset=UTF-8\r\n";
                $headers .= "From: Guruz Support <noreply@" . (request()->getHost() ?: 'guruz.com') . ">\r\n";
                return @mail($to, $subject, $htmlContent, $headers);
            } catch (\Throwable $ex) {
                Log::error("PHP mail fallback failed to {$to}: " . $ex->getMessage());
                return false;
            }
        }
    }
}
