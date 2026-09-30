<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayoutRequest extends Model
{
    protected $fillable = [
        'shop_id',
        'amount',
        'payment_method',
        'account_details',
        'admin_notes',
        'status',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}
