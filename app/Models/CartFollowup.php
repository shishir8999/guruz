<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartFollowup extends Model
{
    use HasFactory;

    protected $table = 'cart_followups';

    protected $fillable = [
        'code',
        'user_id',
        'customer_name',
        'email',
        'phone',
        'cart_value',
        'stage',
        'status',
        'last_contacted_at',
        'notes',
    ];

    protected $casts = [
        'cart_value' => 'decimal:2',
        'last_contacted_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
