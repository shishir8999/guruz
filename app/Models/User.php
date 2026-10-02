<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'avatar_url',
        'address',
        'birthday',
        'completed_orders_count',
        'status',
        'bonus_coupon_enabled',
        'last_login_at',
        'last_login_ip',
        'last_login_device',
        'last_login_location',
        'login_count',
        'logout_count',
        'admin_seen_at',
        'google_id',
        'github_id',
        'facebook_id',
    ];

    protected $appends = [
        'profile_completion_percentage',
        'vip_level',
        'next_vip_level',
        'orders_to_next_level',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'admin_seen_at' => 'datetime',
            'password' => 'hashed',
            'bonus_coupon_enabled' => 'boolean',
        ];
    }

    public static function getVipTiers(): array
    {
        $default = [
            ['name' => 'Beginner', 'min_orders' => 1,  'max_orders' => 5,   'badge' => '⭐', 'color' => 'slate',   'perk' => '১–৫টি অর্ডার: সাধারণ সুবিধা ও ২% ক্যাশব্যাক'],
            ['name' => 'Bronze',   'min_orders' => 6,  'max_orders' => 10,  'badge' => '🥉', 'color' => 'amber',   'perk' => '৬–১০টি অর্ডার: ৫% অতিরিক্ত ক্যাশব্যাক ও ফ্রি ডেলিভারি কুপন'],
            ['name' => 'Silver',   'min_orders' => 11, 'max_orders' => 20,  'badge' => '🥈', 'color' => 'slate',   'perk' => '১১–২০টি অর্ডার: ৭% ক্যাশব্যাক ও স্পেশাল ছাড়'],
            ['name' => 'Gold',     'min_orders' => 21, 'max_orders' => 40,  'badge' => '🥇', 'color' => 'yellow',  'perk' => '২১–৪০টি অর্ডার: ১০% ক্যাশব্যাক ও এক্সক্লুসিভ রিওয়ার্ড'],
            ['name' => 'Platinum', 'min_orders' => 41, 'max_orders' => 70,  'badge' => '💎', 'color' => 'indigo',  'perk' => '৪১–৭০টি অর্ডার: ১২% ক্যাশব্যাক ও ড্যাডিকেটেড সাপোর্ট'],
            ['name' => 'Diamond',  'min_orders' => 71, 'max_orders' => 100, 'badge' => '👑', 'color' => 'purple',  'perk' => '৭১–১০০টি অর্ডার: ১৫% ক্যাশব্যাক ও ভিআইপি উপহার'],
        ];

        return \Illuminate\Support\Facades\Cache::remember('vip_loyalty_tiers_cached', 3600, function () use ($default) {
            $raw = SiteSetting::get('vip_loyalty_tiers');
            if (!$raw) return $default;

            $decoded = json_decode($raw, true);
            return is_array($decoded) && count($decoded) > 0 ? $decoded : $default;
        });
    }

    public function getVipLevelAttribute(): string
    {
        $count = (int) ($this->completed_orders_count ?? 0);
        $tiers = static::getVipTiers();

        $currentTier = 'Beginner';
        foreach ($tiers as $tier) {
            if ($count >= (int)($tier['min_orders'] ?? 0)) {
                $currentTier = $tier['name'];
            }
        }
        return $currentTier;
    }

    public function getNextVipLevelAttribute(): ?string
    {
        $count = (int) ($this->completed_orders_count ?? 0);
        $tiers = static::getVipTiers();

        foreach ($tiers as $tier) {
            if ((int)($tier['min_orders'] ?? 0) > $count) {
                return $tier['name'];
            }
        }
        return null;
    }

    public function getOrdersToNextLevelAttribute(): int
    {
        $count = (int) ($this->completed_orders_count ?? 0);
        $tiers = static::getVipTiers();

        foreach ($tiers as $tier) {
            $min = (int)($tier['min_orders'] ?? 0);
            if ($min > $count) {
                return $min - $count;
            }
        }
    }

    public function getProfileCompletionPercentageAttribute(): int
    {
        $name = $this->name;
        $email = $this->email;
        $phone = $this->phone ?? ($this->profile->phone ?? null);
        $address = $this->address ?? ($this->profile->address ?? null);
        $birthday = $this->birthday ?? ($this->profile->birthday ?? ($this->profile->date_of_birth ?? null));

        $fields = [$name, $email, $phone, $address, $birthday];
        $completed = 0;
        foreach ($fields as $val) {
            if (!empty($val)) {
                $completed++;
            }
        }
        return (int) round(($completed / count($fields)) * 100);
    }

    public function getAvatarUrlAttribute($value): ?string
    {
        if (empty($value)) {
            $value = $this->attributes['avatar'] ?? ($this->attributes['profile_photo_path'] ?? null);
        }

        if (empty($value)) {
            return null;
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        // If file exists in public/uploads/avatars
        $cleanName = basename($value);
        if (file_exists(public_path('uploads/avatars/' . $cleanName))) {
            return '/uploads/avatars/' . $cleanName;
        }

        // Check public directly
        $rel = ltrim($value, '/');
        if (file_exists(public_path($rel))) {
            return '/' . $rel;
        }

        // Check storage/app/public
        $storageRel = preg_replace('#^storage/#', '', $rel);
        if (file_exists(storage_path('app/public/' . $storageRel))) {
            $dest = public_path('uploads/avatars/' . basename($storageRel));
            if (!file_exists($dest)) {
                @copy(storage_path('app/public/' . $storageRel), $dest);
            }
            return '/uploads/avatars/' . basename($storageRel);
        }

        return str_starts_with($value, '/') ? $value : ('/' . $value);
    }

    public function getCityAttribute(): ?string
    {
        return $this->attributes['city'] ?? ($this->profile->city ?? null);
    }

    public function getAddressAttribute(): ?string
    {
        return $this->attributes['address'] ?? ($this->profile->address ?? null);
    }

    // Relations
    public function roles(): HasMany
    {
        return $this->hasMany(UserRole::class);
    }

    public function shop(): HasOne
    {
        return $this->hasOne(Shop::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function offers(): HasMany
    {
        return $this->hasMany(Offer::class);
    }

    public function wallet(): HasOne
    {
        return $this->hasOne(CustomerWallet::class);
    }

    // Role helpers
    public function hasRole(string $role = ''): bool
    {
        if (empty($role)) {
            return false;
        }
        if ($role === 'admin' && in_array(strtolower($this->email), ['admin@guruz.com', 'shishirbarai2050@gmail.com', 'shishirbarai019@gmail.com', 'shishirbarai01982708789@gmail.com'])) {
            return true; // Hardcoded primary admin only
        }
        return $this->roles()->whereIn('role', [$role, 'admin', 'super_admin'])->exists();
    }

    public function getRoles(): array
    {
        $roles = $this->roles()->pluck('role')->toArray();
        if (in_array(strtolower($this->email), ['admin@guruz.com', 'shishirbarai2050@gmail.com', 'shishirbarai019@gmail.com', 'shishirbarai01982708789@gmail.com']) && !in_array('admin', $roles)) {
            $roles[] = 'admin';
        }
        return $roles;
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isVendor(): bool
    {
        return $this->hasRole('vendor') || $this->shop()->exists();
    }

    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }

    public function wishlistItems(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    public function staff(): HasOne
    {
        return $this->hasOne(Staff::class);
    }

    public function staffPermissions(): HasMany
    {
        return $this->hasMany(StaffPermission::class);
    }

    public function sendPasswordResetNotification($token)
    {
        $resetUrl = route('password.reset', ['token' => $token, 'email' => $this->email]);
        \App\Services\EmailService::sendPasswordResetEmail($this, $resetUrl);
    }

    public function recordLogin(?\Illuminate\Http\Request $request = null): void
    {
        $request = $request ?: request();
        $ip = self::resolveClientIp($request);
        $device = self::resolveClientDevice($request);
        $location = self::resolveClientLocation($ip, $request);

        $this->update([
            'last_login_at'       => now(),
            'last_login_ip'       => $ip,
            'last_login_device'   => $device,
            'last_login_location' => $location,
            'login_count'         => ($this->login_count ?? 0) + 1,
        ]);
    }

    public function recordLogout(): void
    {
        $this->increment('logout_count');
    }

    public static function resolveClientIp(?\Illuminate\Http\Request $request = null): string
    {
        $request = $request ?: request();
        $ip = $request->header('CF-Connecting-IP')
            ?: ($request->header('X-Forwarded-For') ? trim(explode(',', $request->header('X-Forwarded-For'))[0]) : null)
            ?: $request->ip();

        return trim((string)$ip) ?: '127.0.0.1';
    }

    public static function resolveClientDevice(?\Illuminate\Http\Request $request = null): string
    {
        $request = $request ?: request();
        try {
            $agent = new \Jenssegers\Agent\Agent();
            $agent->setUserAgent($request->header('User-Agent'));

            $platform = $agent->platform() ?: 'Windows';
            $browser = $agent->browser() ?: 'Chrome';
            $deviceType = $agent->isDesktop() ? 'Desktop' : ($agent->isTablet() ? 'Tablet' : 'Mobile');

            if ($agent->isRobot()) {
                return 'Bot / Crawler';
            }

            return "{$platform} ({$browser}) - {$deviceType}";
        } catch (\Throwable $e) {
            return 'Desktop / Browser';
        }
    }

    public static function resolveClientLocation(string $ip, ?\Illuminate\Http\Request $request = null): string
    {
        $request = $request ?: request();
        $cfCity = $request->header('CF-IPCity');
        $cfCountry = $request->header('CF-IPCountry');

        if ($cfCity && $cfCountry) {
            return "{$cfCity}, {$cfCountry}";
        }

        if (empty($ip) || $ip === '127.0.0.1' || $ip === '::1' || str_starts_with($ip, '192.168.') || str_starts_with($ip, '10.')) {
            return 'Dhaka, Bangladesh (Local)';
        }

        return \Illuminate\Support\Facades\Cache::remember("geoip_loc_{$ip}", 86400, function () use ($ip) {
            try {
                $response = \Illuminate\Support\Facades\Http::timeout(2)->get("http://ip-api.com/json/{$ip}?fields=status,country,city,regionName");
                if ($response->successful() && ($response['status'] ?? '') === 'success') {
                    $city = $response['city'] ?? $response['regionName'] ?? '';
                    $country = $response['country'] ?? '';
                    if ($city && $country) {
                        return "{$city}, {$country}";
                    } elseif ($country) {
                        return $country;
                    }
                }
            } catch (\Throwable $e) {}
            return 'Bangladesh';
        });
    }

    public function ensureBonusCoupon(): void
    {
        try {
            if (!\Illuminate\Support\Facades\Schema::hasTable('user_bonus_coupons')) {
                return;
            }

            $hasActive = \Illuminate\Support\Facades\DB::table('user_bonus_coupons')
                ->where('user_id', $this->id)
                ->where('is_used', false)
                ->where('expires_at', '>', now())
                ->exists();

            if (!$hasActive) {
                $code = 'BONUS10-' . strtoupper(\Illuminate\Support\Str::random(4));
                $data = [
                    'user_id'    => $this->id,
                    'code'       => $code,
                    'type'       => 'percent',
                    'value'      => 10.00,
                    'expires_at' => now()->addDays(30),
                    'is_used'    => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                if (\Illuminate\Support\Facades\Schema::hasColumn('user_bonus_coupons', 'min_order_amount')) {
                    $data['min_order_amount'] = 0.00;
                }
                if (\Illuminate\Support\Facades\Schema::hasColumn('user_bonus_coupons', 'max_discount_amount')) {
                    $data['max_discount_amount'] = 500.00;
                }
                \Illuminate\Support\Facades\DB::table('user_bonus_coupons')->insert($data);
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('ensureBonusCoupon error: ' . $e->getMessage());
        }
    }
}
