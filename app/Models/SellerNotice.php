<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SellerNotice extends Model
{
    use HasFactory;

    protected $table = 'seller_notices';

    protected $fillable = [
        'title',
        'body',
        'content',
        'type',
        'target',
        'status',
        'views',
        'is_active',
        'published_at',
        'expires_at',
    ];

    protected $casts = [
        'is_active'    => 'boolean',
        'published_at' => 'datetime',
        'expires_at'   => 'datetime',
    ];
}
