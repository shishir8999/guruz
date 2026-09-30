<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShopAccountTransaction extends Model
{
    use HasFactory;

    protected $table = 'shop_account_transactions';

    protected $fillable = [
        'shop_id',
        'user_id',
        'transaction_number',
        'type', // 'credit', 'debit', 'expense', 'commission'
        'category', // 'sales', 'payout', 'admin_commission', 'shop_expense', 'refund'
        'title',
        'reference_id',
        'amount',
        'balance_after',
        'status', // 'completed', 'pending'
        'notes',
    ];

    protected $casts = [
        'amount'        => 'float',
        'balance_after' => 'float',
    ];

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }
}
