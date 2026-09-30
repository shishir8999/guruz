<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LiveChatMessage extends Model
{
    protected $table = 'live_chat_messages';

    protected $fillable = [
        'live_chat_thread_id',
        'sender_type',
        'sender_id',
        'sender_name',
        'message',
        'attachment_url',
        'attachment_type',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function thread(): BelongsTo
    {
        return $this->belongsTo(LiveChatThread::class, 'live_chat_thread_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
