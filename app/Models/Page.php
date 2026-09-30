<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Page extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'title_bn',
        'slug',
        'category',
        'short_description',
        'subtitle_en',
        'subtitle_bn',
        'content',
        'content_bn',
        'seo_title',
        'meta_description',
        'status',
        'featured_image',
    ];
}
