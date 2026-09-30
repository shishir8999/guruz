<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'shop_id', 'category_id', 'brand_id',
        'name', 'slug', 'sku',
        'product_type',
        'price', 'sale_price', 'purchase_price',
        'stock_quantity',
        'description', 'specification',
        'weight', 'warranty_type', 'unit',
        'primary_image_url',
        'attributes',
        'colors', 'sizes', 'materials', 'tags',
        'video_url', 'meta_title', 'meta_description',
        'rating', 'total_reviews',
        'is_featured', 'is_active', 'is_retail', 'is_wholesale', 'is_flash_sale',
        'min_vip_level',
    ];

    protected $casts = [
        'attributes'     => 'array',
        'colors'         => 'array',
        'sizes'          => 'array',
        'materials'      => 'array',
        'tags'           => 'array',
        'price'          => 'decimal:2',
        'sale_price'     => 'decimal:2',
        'purchase_price' => 'decimal:2',
        'weight'         => 'decimal:2',
        'rating'         => 'float',
        'is_featured'    => 'boolean',
        'is_active'      => 'boolean',
        'is_retail'      => 'boolean',
        'is_wholesale'   => 'boolean',
        'is_flash_sale'  => 'boolean',
    ];

    // ─── Scopes ──────────────────────────────────────

    public function scopePublished($query)
    {
        return $query->where('is_active', true);
    }

    // ─── Relations ───────────────────────────────────

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class)->withDefault();
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(ProductQuestion::class);
    }
}
