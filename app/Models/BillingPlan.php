<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillingPlan extends Model
{
    protected $fillable = [
        'name',
        'price',
        'billing_cycle',
        'max_products',
        'max_staff',
        'features',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'float',
        'max_products' => 'integer',
        'max_staff' => 'integer',
        'features' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
