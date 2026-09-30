<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NoticeMarquee extends Model
{
    protected $table = 'notice_marquees';

    protected $fillable = [
        'text_en', 'text_bn', 'link_url', 'bg_color', 'text_color', 'is_active', 'sort_order'
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'sort_order' => 'integer',
    ];
}
