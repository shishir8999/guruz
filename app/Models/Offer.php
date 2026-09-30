<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Offer extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'promo_code',
        'discount_percentage',
        'valid_until',
        'status',
    ];

    protected $casts = [
        'valid_until' => 'datetime',
        'discount_percentage' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
