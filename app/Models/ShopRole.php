<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShopRole extends Model
{
    use HasFactory;

    protected $table = 'shop_roles';

    protected $fillable = [
        'shop_id',
        'name',
        'description',
        'color',
        'permissions',
    ];

    protected $casts = [
        'permissions' => 'array',
    ];

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }
}
