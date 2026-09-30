<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DebugLog extends Model
{
    use HasFactory;

    protected $table = 'debug_logs';

    protected $fillable = [
        'type',
        'message',
        'context',
        'channel',
        'file_path',
        'line_number',
        'ip_address',
        'user_id',
    ];

    protected $casts = [
        'context' => 'array',
        'line_number' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
