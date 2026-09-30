<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisitorAnalytic extends Model
{
    use HasFactory;

    protected $table = 'visitor_analytics';

    protected $fillable = [
        'ip_address',
        'user_agent',
        'device',
        'browser',
        'os',
        'page_url',
        'referrer',
        'country',
        'city',
        'session_id',
        'user_id',
        'visited_at',
    ];

    protected $casts = [
        'visited_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
