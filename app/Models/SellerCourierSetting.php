<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SellerCourierSetting extends Model
{
    use HasFactory;

    protected $table = 'seller_courier_settings';

    protected $fillable = [
        'shop_id',
        'courier_name',
        'is_enabled',
        'api_key',
        'secret_key',
        'merchant_id',
        'zone_id',
        'pickup_address',
        'admin_approval_required',
        'vault_collection_enabled',
        'notes',
    ];

    protected $casts = [
        'is_enabled'               => 'boolean',
        'admin_approval_required' => 'boolean',
        'vault_collection_enabled' => 'boolean',
    ];

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }
}
