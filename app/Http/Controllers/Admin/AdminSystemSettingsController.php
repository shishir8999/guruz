<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Models\VendorKyc;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;

class AdminSystemSettingsController extends Controller
{
    public function settings()
    {
        $settings = [
            'site_logo'                => SiteSetting::get('site_logo', ''),
            'site_favicon'             => SiteSetting::get('site_favicon', ''),
            'site_title'               => SiteSetting::get('site_title', 'Guruz BD'),
            'support_phone'            => SiteSetting::get('support_phone', '01700000000'),
            'support_email'            => SiteSetting::get('support_email', 'support@guruzbd.com'),
            'coupon_system_enabled'    => SiteSetting::get('coupon_system_enabled', 'true') === 'true',
            'marquee_speed'            => SiteSetting::get('marquee_speed', '20'),
            'marquee_speed_shops'      => SiteSetting::get('marquee_speed_shops', '20'),
            'marquee_speed_categories' => SiteSetting::get('marquee_speed_categories', '20'),
            'marquee_speed_brands'     => SiteSetting::get('marquee_speed_brands', '20'),
        ];

        return Inertia::render('Admin/Settings', [
            'settings' => $settings,
        ]);
    }

    public function updateSettings(Request $request)
    {
        $request->validate([
            'site_logo'                => 'nullable',
            'site_favicon'             => 'nullable',
            'site_title'               => 'required|string|max:255',
            'support_phone'            => 'nullable|string|max:50',
            'support_email'            => 'nullable|string|email',
            'coupon_system_enabled'    => 'nullable|boolean',
            'marquee_speed'            => 'nullable|string|max:10',
            'marquee_speed_shops'      => 'nullable|string|max:10',
            'marquee_speed_categories' => 'nullable|string|max:10',
            'marquee_speed_brands'     => 'nullable|string|max:10',
        ]);

        if ($request->hasFile('site_logo')) {
            $file = $request->file('site_logo');
            $ext = $file->getClientOriginalExtension() ?: 'png';
            $filename = 'logo_' . time() . '_' . uniqid() . '.' . $ext;

            // Direct public upload
            $uploadPath = public_path('uploads/logos');
            if (!file_exists($uploadPath)) {
                @mkdir($uploadPath, 0777, true);
            }
            $file->move($uploadPath, $filename);

            // Auto-trim transparent whitespace if PNG
            if (strtolower($ext) === 'png' && function_exists('imagecreatefrompng')) {
                try {
                    $targetFile = $uploadPath . '/' . $filename;
                    $im = @imagecreatefrompng($targetFile);
                    if ($im) {
                        $w = imagesx($im);
                        $h = imagesy($im);
                        $top = $h; $bottom = 0; $left = $w; $right = 0;
                        for ($x = 0; $x < $w; $x++) {
                            for ($y = 0; $y < $h; $y++) {
                                $rgba = imagecolorat($im, $x, $y);
                                $alpha = ($rgba >> 24) & 0x7F;
                                if ($alpha < 120) {
                                    if ($x < $left) $left = $x;
                                    if ($x > $right) $right = $x;
                                    if ($y < $top) $top = $y;
                                    if ($y > $bottom) $bottom = $y;
                                }
                            }
                        }
                        if ($left < $right && $top < $bottom) {
                            $pad = 4;
                            $left = max(0, $left - $pad);
                            $top = max(0, $top - $pad);
                            $right = min($w - 1, $right + $pad);
                            $bottom = min($h - 1, $bottom + $pad);
                            $cw = $right - $left + 1;
                            $ch = $bottom - $top + 1;
                            $trimmed = imagecreatetruecolor($cw, $ch);
                            imagealphablending($trimmed, false);
                            imagesavealpha($trimmed, true);
                            $trans = imagecolorallocatealpha($trimmed, 255, 255, 255, 127);
                            imagefilledrectangle($trimmed, 0, 0, $cw, $ch, $trans);
                            imagecopy($trimmed, $im, 0, 0, $left, $top, $cw, $ch);
                            imagepng($trimmed, $targetFile);
                            imagedestroy($trimmed);
                        }
                        imagedestroy($im);
                    }
                } catch (\Throwable $e) {}
            }

            // Mirror to public/storage/logos and storage/app/public/logos
            $storagePublic = public_path('storage/logos');
            if (!file_exists($storagePublic)) {
                @mkdir($storagePublic, 0777, true);
            }
            @copy($uploadPath . '/' . $filename, $storagePublic . '/' . $filename);

            $storageApp = storage_path('app/public/logos');
            if (!file_exists($storageApp)) {
                @mkdir($storageApp, 0777, true);
            }
            @copy($uploadPath . '/' . $filename, $storageApp . '/' . $filename);

            SiteSetting::set('site_logo', '/uploads/logos/' . $filename, 'general');
        } else if ($request->filled('site_logo') && is_string($request->site_logo)) {
            SiteSetting::set('site_logo', $request->site_logo, 'general');
        }

        if ($request->hasFile('site_favicon')) {
            $file = $request->file('site_favicon');
            $ext = $file->getClientOriginalExtension() ?: 'png';
            $filename = 'favicon_' . time() . '_' . uniqid() . '.' . $ext;

            $uploadPath = public_path('uploads/favicons');
            if (!file_exists($uploadPath)) {
                @mkdir($uploadPath, 0777, true);
            }
            $file->move($uploadPath, $filename);

            $storagePublic = public_path('storage/favicons');
            if (!file_exists($storagePublic)) {
                @mkdir($storagePublic, 0777, true);
            }
            @copy($uploadPath . '/' . $filename, $storagePublic . '/' . $filename);

            SiteSetting::set('site_favicon', '/uploads/favicons/' . $filename, 'general');
        } else if ($request->filled('site_favicon') && is_string($request->site_favicon)) {
            SiteSetting::set('site_favicon', $request->site_favicon, 'general');
        }

        SiteSetting::set('site_title', $request->site_title, 'general');
        SiteSetting::set('support_phone', $request->support_phone, 'general');
        SiteSetting::set('support_email', $request->support_email, 'general');
        
        if ($request->has('coupon_system_enabled')) {
            SiteSetting::set('coupon_system_enabled', $request->boolean('coupon_system_enabled') ? 'true' : 'false', 'marketing');
        }

        if ($request->has('marquee_speed')) {
            SiteSetting::set('marquee_speed', (string) $request->marquee_speed, 'general');
        }
        if ($request->has('marquee_speed_shops')) {
            SiteSetting::set('marquee_speed_shops', (string) $request->marquee_speed_shops, 'general');
        }
        if ($request->has('marquee_speed_categories')) {
            SiteSetting::set('marquee_speed_categories', (string) $request->marquee_speed_categories, 'general');
        }
        if ($request->has('marquee_speed_brands')) {
            SiteSetting::set('marquee_speed_brands', (string) $request->marquee_speed_brands, 'general');
        }

        return back()->with('success', 'ওয়েবসাইট লোগো, সেটিংস ও অটো স্ক্রোল স্পিড আপডেট হয়েছে!');
    }

    public function integrations()
    {
        $settings = SiteSetting::whereIn('group', ['gateways', 'couriers', 'sms', 'integrations'])->pluck('value', 'key');

        return Inertia::render('Admin/Integrations/IntegrationsDashboard', [
            'integrations' => $settings,
        ]);
    }

    public function updateIntegrations(Request $request)
    {
        \Log::info('updateIntegrations request payload', $request->all());
        foreach ($request->except('_token') as $key => $value) {
            SiteSetting::set($key, $value, 'integrations');
        }

        return back()->with('success', 'Integration settings updated.');
    }

    public function vendorKyc()
    {
        $pendingKyc = VendorKyc::with(['shop', 'user'])->orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/VendorKyc', [
            'pendingKyc' => $pendingKyc,
        ]);
    }

    public function approveKyc(VendorKyc $kyc)
    {
        $kyc->update([
            'status'      => 'Approved',
            'reviewed_at' => now(),
            'reviewed_by' => auth()->id(),
            'rejection_reason' => null,
        ]);

        if ($kyc->shop) {
            $kyc->shop->update(['status' => 'active']);
            if ($kyc->user_id) {
                \App\Models\UserRole::firstOrCreate(['user_id' => $kyc->user_id, 'role' => 'vendor']);
            }
            $productUpdates = ['is_active' => true];
            if (\Illuminate\Support\Facades\Schema::hasColumn('products', 'status')) {
                $productUpdates['status'] = 'published';
            }
            \App\Models\Product::where('shop_id', $kyc->shop_id)->update($productUpdates);
        }

        \Illuminate\Support\Facades\Cache::forget('home_featured_products');
        \Illuminate\Support\Facades\Cache::forget('home_latest_products');
        \Illuminate\Support\Facades\Cache::forget('home_flash_sale_products');
        \Illuminate\Support\Facades\Cache::forget('home_active_shops');

        return back()->with('success', 'Vendor KYC Approved, Shop Activated & Products Published!');
    }

    public function rejectKyc(Request $request, VendorKyc $kyc)
    {
        $kyc->update([
            'status'           => 'Rejected',
            'rejection_reason' => $request->input('reason', 'Documents incomplete.'),
            'reviewed_at'      => now(),
            'reviewed_by'      => auth()->id(),
        ]);

        if ($kyc->shop) {
            $kyc->shop->update(['status' => 'rejected']);
            $productUpdates = ['is_active' => false];
            if (\Illuminate\Support\Facades\Schema::hasColumn('products', 'status')) {
                $productUpdates['status'] = 'draft';
            }
            \App\Models\Product::where('shop_id', $kyc->shop_id)->update($productUpdates);
        }

        \Illuminate\Support\Facades\Cache::forget('home_featured_products');
        \Illuminate\Support\Facades\Cache::forget('home_latest_products');
        \Illuminate\Support\Facades\Cache::forget('home_flash_sale_products');
        \Illuminate\Support\Facades\Cache::forget('home_active_shops');

        return back()->with('success', 'Vendor KYC Rejected & Products Hidden.');
    }

    public function updatePromotionalLabels(Request $request)
    {
        $request->validate([
            'flash_sale' => 'required|string|max:255',
            'featured'   => 'required|string|max:255',
            'special'    => 'required|string|max:255',
        ]);

        SiteSetting::set('promo_label_flash_sale', $request->flash_sale, 'promotions');
        SiteSetting::set('promo_label_featured', $request->featured, 'promotions');
        SiteSetting::set('promo_label_special', $request->special, 'promotions');

        \Illuminate\Support\Facades\Cache::forget('all_site_settings_map');

        return back()->with('success', 'প্রমোশনাল সেকশনের টেক্সট সফলভাবে আপডেট করা হয়েছে!');
    }

    public function systemConfig()
    {
        $settings = SiteSetting::where('group', 'system')->pluck('value', 'key');
        return Inertia::render('Admin/System/SystemConfig', [
            'config' => $settings,
        ]);
    }

    public function updateSystemConfig(Request $request)
    {
        foreach ($request->except('_token') as $key => $value) {
            $val = is_bool($value) ? ($value ? 'true' : 'false') : $value;
            SiteSetting::set($key, $val, 'system');
        }

        return back()->with('success', 'System Config updated successfully.');
    }

    public function optimize()
    {
        try {
            Artisan::call('cache:clear');
            Artisan::call('config:clear');
            Artisan::call('route:clear');
            Artisan::call('view:clear');
            return back()->with('success', 'System Optimization completed successfully! All caches cleared.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Optimization failed: ' . $e->getMessage());
        }
    }

    public function featureLimits()
    {
        $limits = SiteSetting::where('group', 'feature_limits')->pluck('value', 'key');
        return Inertia::render('Admin/System/FeatureLimits', [
            'limits' => $limits,
        ]);
    }

    public function updateFeatureLimits(Request $request)
    {
        foreach ($request->except('_token') as $key => $value) {
            $val = is_bool($value) ? ($value ? 'true' : 'false') : $value;
            SiteSetting::set($key, $val, 'feature_limits');
        }

        return back()->with('success', 'Feature Limits saved successfully.');
    }

    public function birthdayWishes()
    {
        $settings = SiteSetting::where('group', 'birthday_wishes')->pluck('value', 'key');
        return Inertia::render('Admin/Marketing/BirthdayWishes', [
            'settings' => $settings,
        ]);
    }

    public function updateBirthdayWishes(Request $request)
    {
        foreach ($request->except('_token') as $key => $value) {
            $val = is_bool($value) ? ($value ? 'true' : 'false') : $value;
            SiteSetting::set($key, $val, 'birthday_wishes');
        }

        return back()->with('success', 'Birthday Wishes settings updated successfully.');
    }
}
