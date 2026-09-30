<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentGateway extends Model
{
    protected $fillable = [
        'code',
        'name',
        'name_bn',
        'logo_url',
        'is_active',
        'gateway_type',
        'environment',
        'api_key',
        'secret_key',
        'app_key',
        'app_secret',
        'merchant_id',
        'token_id',
        'webhook_secret',
        'callback_url',
        'extra_config',
        'account_number',
        'account_type',
        'qr_image_url',
        'bank_name',
        'branch_name',
        'account_holder_name',
        'routing_number',
        'instructions',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'extra_config' => 'array',
    ];

    /**
     * Get the full accessible URL of the logo.
     */
    public function getFormattedLogoUrlAttribute(): ?string
    {
        if (empty($this->logo_url)) {
            return null;
        }

        if (str_starts_with($this->logo_url, 'http://') || str_starts_with($this->logo_url, 'https://')) {
            return $this->logo_url;
        }

        $clean = ltrim(str_replace(['public/', 'storage/'], '', $this->logo_url), '/');
        return asset('storage/' . $clean);
    }

    /**
     * Get the full accessible URL of the QR code image.
     */
    public function getFormattedQrImageUrlAttribute(): ?string
    {
        if (empty($this->qr_image_url)) {
            return null;
        }

        if (str_starts_with($this->qr_image_url, 'http://') || str_starts_with($this->qr_image_url, 'https://')) {
            return $this->qr_image_url;
        }

        $clean = ltrim(str_replace(['public/', 'storage/'], '', $this->qr_image_url), '/');
        return asset('storage/' . $clean);
    }
}
