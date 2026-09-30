<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApiKey extends Model
{
    use HasFactory;

    protected $table = 'api_keys';

    protected $fillable = [
        'key_id',
        'name',
        'key_token',
        'key_prefix',
        'key_hash',
        'permissions',
        'scopes',
        'status',
        'is_revoked',
        'last_used',
        'last_used_at',
    ];

    protected $casts = [
        'permissions' => 'array',
        'scopes' => 'array',
    ];
}
