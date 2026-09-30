<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SellerMarketingPixel extends Model
{
    use HasFactory;

    protected $table = 'seller_marketing_pixels';

    protected $fillable = [
        'shop_id',
        'facebook_pixel_id',
        'facebook_capi_token',
        'facebook_test_code',
        'ga4_measurement_id',
        'gtm_container_id',
        'google_ads_conversion_id',
        'google_ads_conversion_label',
        'tiktok_pixel_id',
        'snapchat_pixel_id',
        'custom_facebook_script',
        'custom_google_script',
        'custom_tiktok_script',
        'custom_header_script',
        'track_pageview',
        'track_add_to_cart',
        'track_purchase',
    ];

    protected $casts = [
        'track_pageview'    => 'boolean',
        'track_add_to_cart' => 'boolean',
        'track_purchase'    => 'boolean',
    ];

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }
}
