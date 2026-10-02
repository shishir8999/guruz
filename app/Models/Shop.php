<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Shop extends Model
{
    protected $fillable = [
        'user_id', 'name', 'slug', 'description', 'logo_url', 'banner_url',
        'address', 'city', 'phone', 'email', 'website',
        'custom_domain', 'custom_domain_status', 'custom_domain_dns_verified',
        'status', // pending, approved, suspended, rejected
        'commission_rate', 'is_featured',
    ];

    protected $casts = [
        'commission_rate' => 'decimal:2',
        'rating' => 'float',
        'is_featured' => 'boolean',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function wallet(): HasOne
    {
        return $this->hasOne(SellerWallet::class);
    }

    public function badges(): HasMany
    {
        return $this->hasMany(ShopBadge::class);
    }

    public function followers(): HasMany
    {
        return $this->hasMany(ShopFollower::class);
    }

    public function kyc(): HasOne
    {
        return $this->hasOne(VendorKyc::class, 'shop_id');
    }

    public function getIsKycApprovedAttribute(): bool
    {
        return $this->kyc && strtolower($this->kyc->status ?? '') === 'approved';
    }

    public function getLogoAttribute(): ?string
    {
        return $this->logo_url;
    }

    public function getRatingAttribute($value): float
    {
        return $value !== null && $value !== '' ? (float) $value : 5.0;
    }

    public function getIsApprovedAttribute(): bool
    {
        if ($this->owner && (in_array($this->owner->role ?? '', ['admin', 'super_admin', 'superadmin']) || (method_exists($this->owner, 'hasRole') && $this->owner->hasRole('admin')))) {
            return true;
        }

        return in_array(strtolower($this->status ?? ''), ['active', 'approved'])
            && ($this->kyc && strtolower($this->kyc->status ?? '') === 'approved');
    }
}
