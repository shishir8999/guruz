<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HeroSlide extends Model
{
    protected $fillable = [
        'title_en', 'title_bn',
        'subtitle_en', 'subtitle_bn',
        'cta_label_en', 'cta_label_bn',
        'cta_url',
        'image_url', 'mobile_image_url',
        'bg_color', 'is_active', 'sort_order'
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
