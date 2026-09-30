<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorSupportTicket extends Model
{
    use HasFactory;

    protected $table = 'vendor_support_tickets';

    protected $fillable = [
        'ticket_number',
        'shop_id',
        'user_id',
        'subject',
        'category',
        'priority',
        'status',
        'is_read',
        'admin_seen_at',
        'description',
        'admin_reply',
        'attachment_url',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'admin_seen_at' => 'datetime',
    ];

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
