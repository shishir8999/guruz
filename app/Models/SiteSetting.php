<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SiteSetting extends Model
{
    protected $fillable = ['key', 'value', 'group'];

    public static function get(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return ($setting && !is_null($setting->value) && $setting->value !== '') ? $setting->value : $default;
    }

    public static function set(string $key, $value, string $group = 'general')
    {
        $result = static::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'group' => $group]
        );

        // Instantly purge site settings cache so admin edits take effect live
        Cache::forget('all_site_settings_map');

        return $result;
    }
}
