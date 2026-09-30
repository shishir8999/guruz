<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisitorLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'ip_address',
        'user_agent',
        'browser',
        'platform',
        'device',
        'country',
        'city',
        'url',
        'referer',
        'user_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
