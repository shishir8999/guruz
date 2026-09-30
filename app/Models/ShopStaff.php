<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShopStaff extends Model
{
    use HasFactory;

    protected $table = 'shop_staffs';

    protected $fillable = [
        'shop_id',
        'user_id',
        'name',
        'email',
        'phone',
        'role',
        'status',
        'permissions',
        'last_login',
    ];

    protected $casts = [
        'permissions' => 'array',
    ];

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }
}
