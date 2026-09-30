<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Exception;
use Illuminate\Support\Facades\Log;

class GoogleController extends Controller
{
    public function redirectToGoogle()
    {
        $clientId = config('services.google.client_id');
        if (empty($clientId) || $clientId === 'your-google-client-id') {
            return redirect()->route('login')->withErrors(['email' => 'গুগল দিয়ে লগইন করার জন্য cPanel-এর .env ফাইলে GOOGLE_CLIENT_ID বসানো হয়নি।']);
        }

        $redirectUrl = url('/auth/google/callback');
        return Socialite::driver('google')->redirectUrl($redirectUrl)->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $redirectUrl = url('/auth/google/callback');
            $googleUser = Socialite::driver('google')->redirectUrl($redirectUrl)->user();
            
            $finduser = User::where('google_id', $googleUser->id)
                            ->orWhere('email', $googleUser->email)
                            ->first();
                            
            if ($finduser) {
                // If user exists, update their google_id and avatar if missing
                if (!$finduser->google_id) {
                    $finduser->update([
                        'google_id' => $googleUser->id,
                        'avatar' => $googleUser->avatar
                    ]);
                }
                
                Auth::login($finduser);
                return redirect()->route('home');
            } else {
                // Completely new user
                $newUser = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id'=> $googleUser->id,
                    'avatar' => $googleUser->avatar,
                    'password' => null
                ]);

                // Assign default customer role
                UserRole::create(['user_id' => $newUser->id, 'role' => 'customer']);

                // Add WELCOME coupon to user_bonus_coupons table
                if (\Illuminate\Support\Facades\Schema::hasTable('user_bonus_coupons')) {
                    try {
                        $enabled = \App\Models\SiteSetting::get('welcome_coupon_enabled', 'true') === 'true';
                        if ($enabled) {
                            $validHours = max(1, (int) \App\Models\SiteSetting::get('welcome_coupon_valid_hours', '72'));
                            $discount = (float) \App\Models\SiteSetting::get('welcome_coupon_discount', '10.00');
                            $type = \App\Models\SiteSetting::get('welcome_coupon_type', 'percentage');
                            $minOrder = (float) \App\Models\SiteSetting::get('welcome_coupon_min_order', '0');
                            $maxDiscount = (float) \App\Models\SiteSetting::get('welcome_coupon_max_discount', '0');
                            $prefix = \App\Models\SiteSetting::get('welcome_coupon_prefix', 'WELCOME10');

                            DB::table('user_bonus_coupons')->insert([
                                'user_id'             => $newUser->id,
                                'code'                => $prefix . '-' . strtoupper(\Illuminate\Support\Str::random(4)),
                                'type'                => $type === 'fixed' ? 'fixed' : 'percent',
                                'value'               => $discount,
                                'min_order_amount'    => $minOrder,
                                'max_discount_amount' => $maxDiscount > 0 ? $maxDiscount : null,
                                'expires_at'          => now()->addHours($validHours),
                                'is_used'             => false,
                                'created_at'          => now(),
                                'updated_at'          => now(),
                            ]);
                        }
                    } catch (\Throwable $e) {}
                }

                event(new Registered($newUser));

                Auth::login($newUser);

                // Redirect with registered => true so the popups show
                return redirect()->route('home')->with('registered', true);
            }
        } catch (Exception $e) {
            Log::error('Google OAuth Error: ' . $e->getMessage());
            return redirect()->route('login')->withErrors(['email' => 'Failed to login with Google. Please try again.']);
        }
    }
}
