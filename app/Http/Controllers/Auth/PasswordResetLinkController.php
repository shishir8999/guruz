<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request by sending an actual email link.
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required',
        ]);

        $emailInput = trim($request->email);
        $user = \App\Models\User::where('email', $emailInput)
            ->orWhere('phone', 'like', "%{$emailInput}%")
            ->first();

        if (!$user) {
            return back()->withInput($request->only('email'))
                ->withErrors(['email' => 'এই ইমেইল বা মোবাইল নম্বরে কোনো নিবন্ধিত অ্যাকাউন্ট পাওয়া যায়নি।']);
        }

        $token = Password::broker()->createToken($user);
        $resetUrl = route('password.reset', ['token' => $token, 'email' => $user->email]);

        // Attempt to send email via Gmail SMTP
        try {
            \App\Services\EmailService::configureSmtp();
            $mailSent = \App\Services\EmailService::sendPasswordResetEmail($user, $resetUrl);

            if ($mailSent) {
                return back()->with('status', "আপনার জিমেইল ({$user->email})-এ পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে! অনুগ্রহ করে ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন।");
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Password reset email error: ' . $e->getMessage());
        }

        // Fallback when Google SMTP returns Bad Credentials
        return back()->with('status', "পাসওয়ার্ড রিসেট লিংক তৈরি হয়েছে। রিসেট করতে নিচের বোতামে ক্লিক করুন:")
            ->with('reset_url', $resetUrl)
            ->withErrors(['email' => 'গুগল মেইল সার্ভার আপনার জিমেইল অ্যাপ পাসওয়ার্ড রিজেক্ট করেছে (535 Bad Credentials)। নতুন App Password তৈরি করুন অথবা নিচের বাটন দিয়ে পাসওয়ার্ড রিসেট করুন।']);
    }

    public function sendMobileOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
        ]);

        $phone = preg_replace('/\D/', '', $request->phone);
        if (str_starts_with($phone, '880')) {
            $phone = '0' . substr($phone, 3);
        }

        $user = \App\Models\User::where('phone', 'like', "%{$phone}%")->first();
        if (!$user && strlen($phone) >= 10) {
            $last10 = substr($phone, -10);
            $user = \App\Models\User::where('phone', 'like', "%{$last10}%")->first();
        }

        if (!$user) {
            return back()->withInput($request->only('phone'))
                ->withErrors(['phone' => 'এই মোবাইল নম্বরে কোনো নিবন্ধিত অ্যাকাউন্ট পাওয়া যায়নি।']);
        }

        $otp = rand(100000, 999999);
        session([
            'reset_otp_code' => (string)$otp,
            'reset_otp_user_id' => $user->id,
            'reset_otp_phone' => $user->phone,
            'reset_otp_expires_at' => now()->addMinutes(10)->timestamp
        ]);

        // Send real SMS if SMS Gateway is configured
        \App\Services\SmsService::send($user->phone, "আপনার Guruz অ্যাকাউন্ট পাসওয়ার্ড রিসেট OTP কোড: {$otp}");

        return back()->with('status', "আপনার মোবাইল নম্বর ({$user->phone})-এ ৬-ডিজিটের OTP কোড পাঠানো হয়েছে! (টেস্টিং OTP: {$otp})")
            ->with('otp_sent', true)
            ->with('demo_otp', (string)$otp)
            ->with('otp_phone', $user->phone);
    }

    public function verifyMobileOtp(Request $request)
    {
        $request->validate([
            'otp' => 'required|string',
        ]);

        $savedOtp = session('reset_otp_code');
        $userId = session('reset_otp_user_id');
        $expiresAt = session('reset_otp_expires_at');

        if (!$savedOtp || !$userId || time() > $expiresAt) {
            return back()->withErrors(['otp' => 'OTP কোডের মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে আবার নতুন OTP পাঠান।']);
        }

        // Keep only numbers
        $cleanOtp = preg_replace('/\D/', '', $request->otp);

        if (trim($cleanOtp) !== (string)$savedOtp) {
            return back()->withErrors(['otp' => 'ভুল OTP কোড! সঠিক ৬-সংখ্যার কোডটি লিখুন।']);
        }

        $user = \App\Models\User::find($userId);
        if (!$user) {
            return back()->withErrors(['otp' => 'ব্যবহারকারী পাওয়া যায়নি।']);
        }

        $token = Password::broker()->createToken($user);
        $resetUrl = route('password.reset', ['token' => $token, 'email' => $user->email]);

        session()->forget(['reset_otp_code', 'reset_otp_user_id', 'reset_otp_phone', 'reset_otp_expires_at']);

        return redirect($resetUrl)->with('status', '✓ মোবাইল নম্বর ওটিপি ভেরিফিকেশন সফল হয়েছে! এখন আপনার নতুন পাসওয়ার্ড দিন:');
    }
}
