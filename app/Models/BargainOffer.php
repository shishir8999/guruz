<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BargainOffer extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'user_id',
        'product_id',
        'offer_type', // 'bargain' or 'beginner'
        'offer_title',
        'customer_name',
        'customer_phone',
        'original_price',
        'offered_price',
        'discount_percent',
        'status', // 'pending', 'accepted', 'rejected', 'active'
        'expires_at',
    ];

    protected $casts = [
        'original_price'   => 'decimal:2',
        'offered_price'    => 'decimal:2',
        'discount_percent' => 'decimal:2',
        'expires_at'       => 'datetime',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
