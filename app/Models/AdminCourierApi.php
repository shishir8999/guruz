<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AdminCourierApi extends Model
{
    use HasFactory;

    protected $table = 'admin_courier_apis';

    protected $fillable = [
        'courier_name',
        'is_active',
        'api_key',
        'secret_key',
        'merchant_code',
        'base_url',
        'cod_vault_active',
        'notes',
    ];

    protected $casts = [
        'is_active'        => 'boolean',
        'cod_vault_active' => 'boolean',
    ];
}
