<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function store(Request $request)
    {
        $request->validate([
            'email'    => 'required|string',
            'password' => 'required|string',
        ]);

        $input = trim($request->email);
        $user = \App\Models\User::where('email', $input)
            ->orWhere('phone', $input)
            ->first();

        if (!$user || !\Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
            return back()->withErrors([
                'email' => 'প্রদত্ত ইমেইল বা পাসওয়ার্ডটি সঠিক নয়।',
            ])->onlyInput('email');
        }

        // Strictly block Super Admin from logging in through public /login route
        if ($user->isAdmin()) {
            return back()->withErrors([
                'email' => 'সুপার অ্যাডমিন অ্যাকাউন্ট নিয়ে লগইন করতে অনুগ্রহ করে সিকিউর /auth পোর্টালে যান।',
            ])->onlyInput('email');
        }

        if ($user->status !== 'active') {
            return back()->withErrors([
                'email' => 'আপনার অ্যাকাউন্টটি স্থগিত বা ব্লক করা হয়েছে। অনুগ্রহ করে সাপোর্টের সাথে যোগাযোগ করুন।',
            ])->onlyInput('email');
        }

        // Check if 2FA is enabled for this Vendor/Customer user
        $twoFactorEnabled = session("2fa_enabled_{$user->id}", false);
        if ($twoFactorEnabled) {
            session([
                '2fa_pending_user_id' => $user->id,
                '2fa_remember' => $request->boolean('remember')
            ]);
            return redirect()->route('login.2fa');
        }

        // Standard login for Customers & Vendors
        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();
        $user->update(['last_login_at' => now()]);

        if ($user->isVendor()) {
            return redirect()->route('seller.dashboard');
        }

        return redirect()->route('account.dashboard');
    }

    public function show2faChallenge()
    {
        $userId = session('2fa_pending_user_id');
        if (!$userId) {
            return redirect()->route('login');
        }

        $user = \App\Models\User::find($userId);

        return Inertia::render('Auth/TwoFactorChallenge', [
            'email' => $user ? $user->email : '',
        ]);
    }

    public function sendSecretToEmail(Request $request)
    {
        $userId = session('2fa_pending_user_id');
        if (!$userId) {
            return redirect()->route('login');
        }

        $user = \App\Models\User::find($userId);
        if (!$user || empty($user->email)) {
            return back()->withErrors(['email' => 'ব্যবহারকারীর কোনো ইমেইল অ্যাড্রেস খুঁজে পাওয়া যায়নি।']);
        }

        $secret = session("2fa_secret_{$userId}", \App\Services\TotpService::generateSecret($userId));

        // Generate an instant 6-digit backup code (valid for 15 minutes)
        $emergencyCode = (string) rand(100000, 999999);
        session([
            "2fa_emergency_code_{$userId}" => $emergencyCode,
            "2fa_emergency_expires_{$userId}" => now()->addMinutes(15),
        ]);

        \App\Services\EmailService::sendTwoFactorSecretKey($user, $secret, $emergencyCode);

        return back()->with('success', "আপনার জিমেইলে ({$user->email}) Google Authenticator সিক্রেট কী এবং ৬-ডিজিটের লগইন ওটিপি পাঠানো হয়েছে! ইনবক্স চেক করুন।");
    }

    public function verify2fa(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $userId = session('2fa_pending_user_id');
        $remember = session('2fa_remember', false);

        if (!$userId) {
            return redirect()->route('login');
        }

        $user = \App\Models\User::find($userId);
        if (!$user) {
            return redirect()->route('login');
        }

        $secret = session("2fa_secret_{$userId}", \App\Services\TotpService::generateSecret($userId));
        $code = trim($request->code);

        // Check emergency email OTP first
        $emergencyCode = session("2fa_emergency_code_{$userId}");
        $emergencyExpires = session("2fa_emergency_expires_{$userId}");
        $isEmergencyValid = $emergencyCode && $emergencyExpires && now()->lt($emergencyExpires) && hash_equals((string)$emergencyCode, (string)$code);

        if (!$isEmergencyValid && !\App\Services\TotpService::verifyCode($secret, $code)) {
            return back()->withErrors(['code' => 'ভুল অথেন্টিকেটর কোড! আপনার Google Authenticator অ্যাপ অথবা জিমেইলে পাওয়া ৬-ডিজিটের কোডটি দিন।']);
        }

        session()->forget([
            '2fa_pending_user_id', 
            '2fa_remember',
            "2fa_emergency_code_{$userId}",
            "2fa_emergency_expires_{$userId}",
        ]);

        Auth::login($user, $remember);
        $request->session()->regenerate();
        $user->update(['last_login_at' => now()]);

        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        if ($user->isVendor()) {
            return redirect()->route('seller.dashboard');
        }

        return redirect()->intended(route('home'));
    }

    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('home');
    }
}
