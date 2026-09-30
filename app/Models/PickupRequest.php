<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PickupRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'request_number',
        'shop_id',
        'user_id',
        'vendor_name',
        'phone',
        'courier_name',
        'pickup_address',
        'parcel_count',
        'estimated_weight',
        'notes',
        'cod_amount',
        'is_cod_collected',
        'status',
        'courier_consignment_id',
        'admin_notes',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
