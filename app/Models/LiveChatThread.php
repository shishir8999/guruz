<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LiveChatThread extends Model
{
    protected $table = 'live_chat_threads';

    protected $fillable = [
        'session_id',
        'user_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'ip_address',
        'user_agent',
        'current_page',
        'status',
        'last_message',
        'last_message_at',
        'unread_admin_count',
        'unread_user_count',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
        'unread_admin_count' => 'integer',
        'unread_user_count' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(LiveChatMessage::class, 'live_chat_thread_id')->orderBy('created_at', 'asc');
    }
}
