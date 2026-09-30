<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WarrantyClaim extends Model
{
    use HasFactory;

    protected $fillable = [
        'claim_number',
        'user_id',
        'customer_name',
        'mobile_number',
        'email',
        'order_id',
        'product_name',
        'brand_name',
        'product_model',
        'purchase_date',
        'issue_category',
        'problem_details',
        'video_path',
        'google_drive_link',
        'status',
        'admin_notes',
        'admin_seen_at',
    ];

    protected $casts = [
        'admin_seen_at' => 'datetime',
        'purchase_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
