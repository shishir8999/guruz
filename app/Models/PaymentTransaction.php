<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentTransaction extends Model
{
    protected $fillable = [
        'order_id', 'gateway', 'transaction_id',
        'gateway_transaction_id', 'amount', 'currency',
        'status', 'gateway_response',
    ];

    protected $casts = [
        'gateway_response' => 'array',
        'amount'           => 'decimal:2',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
