<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorKyc extends Model
{
    protected $table = 'vendor_kycs';

    protected $fillable = [
        'shop_id', 'user_id',
        'nid_number', 'nid_front_image', 'nid_back_image',
        'trade_license_number', 'trade_license_image',
        'bank_statement_image',
        'bank_name', 'account_name', 'account_number', 'branch_name', 'routing_number',
        'status', 'rejection_reason', 'reviewed_at', 'reviewed_by'
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
