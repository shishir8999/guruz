<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShopBadge extends Model
{
    protected $fillable = [
        'shop_id', 'badge', 'label', 'awarded_at', 'expires_at'
    ];

    protected $casts = [
        'awarded_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }
}
