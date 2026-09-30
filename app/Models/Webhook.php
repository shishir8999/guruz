<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Webhook extends Model
{
    use HasFactory;

    protected $table = 'webhooks';

    protected $fillable = [
        'name',
        'url',
        'events',
        'status',
        'last_triggered',
    ];

    protected $casts = [
        'events' => 'array',
    ];
}
