<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class NewPasswordController extends Controller
{
    /**
     * Display the password reset view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]);
    }

    /**
     * Handle an incoming new password request.
     */
    public function store(Request $request)
    {
        $request->validate([
            'email'    => 'required',
            'password' => 'required|confirmed|min:6',
        ]);

        $input = trim($request->email);
        $user = \App\Models\User::where('email', $input)
            ->orWhere('phone', 'like', "%{$input}%")
            ->first();

        if (!$user) {
            return back()->withInput($request->only('email'))
                ->withErrors(['email' => 'এই ইমেইল বা ফোন নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি।']);
        }

        // Update password (User model cast 'password' => 'hashed' automatically hashes raw password string cleanly)
        $user->password = $request->password;
        $user->setRememberToken(Str::random(60));
        $user->save();

        // Clean up reset tokens
        try {
            \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $user->email)->delete();
        } catch (\Throwable $e) {}

        event(new PasswordReset($user));

        return redirect()->route('login')->with('status', 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! আপনার নতুন পাসওয়ার্ড দিয়ে এখন লগইন করুন।');
    }
}
