<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductReview extends Model
{
    protected $fillable = [
        'product_id', 'user_id', 'user_name', 'user_email', 'order_id', 
        'rating', 'comment', 'image_url', 'is_verified', 'status'
    ];

    protected $casts = ['is_verified' => 'boolean'];

    protected $appends = ['reviewer_name', 'reviewer_email'];

    public function getReviewerNameAttribute(): string
    {
        return $this->user_name ?: ($this->user?->name ?? 'কাস্টমার');
    }

    public function getReviewerEmailAttribute(): string
    {
        return $this->user_email ?: ($this->user?->email ?? '');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
