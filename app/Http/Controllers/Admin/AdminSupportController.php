<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class AdminSupportController extends Controller
{
    public function floatingWidget(Request $request)
    {
        $settings = SiteSetting::whereIn('group', ['floating_widget', 'social_proof', 'live_visitors'])
            ->pluck('value', 'key')
            ->toArray();

        return Inertia::render('Admin/Support/FloatingWidget', [
            'initial_tab' => $request->query('tab', 'support_widget'),
            'widget_settings' => [
                'enabled'        => $settings['widget_enabled']        ?? '1',
                'color'          => $settings['widget_color']          ?? '#4f46e5',
                'position'       => $settings['widget_position']       ?? 'bottom-right',
                'greeting'       => $settings['widget_greeting']       ?? '২৪/৭ কাস্টমার সাপোর্ট — যেকোনো প্রয়োজনে আমরা আপনার সাথে আছি!',
                'whatsapp'       => $settings['widget_whatsapp']       ?? '+8801982708789',
                'messenger'      => $settings['widget_messenger']      ?? 'guruzbd',
                'phone'          => $settings['widget_phone']          ?? '01700000000',
                'email'          => $settings['widget_email']          ?? 'support@guruz.com.bd',
                'whatsapp_icon'  => $settings['widget_whatsapp_icon']  ?? null,
                'messenger_icon' => $settings['widget_messenger_icon'] ?? null,
                'livechat_icon'  => $settings['widget_livechat_icon']  ?? null,
            ],
            'social_proof_settings' => [
                'enabled'          => $settings['social_proof_enabled']          ?? '1',
                'interval_seconds' => (int) ($settings['social_proof_interval_seconds'] ?? 20),
                'duration_seconds' => (int) ($settings['social_proof_duration_seconds'] ?? 6),
            ],
            'live_visitor_settings' => [
                'mode'        => $settings['live_visitor_mode']        ?? 'virtual',
                'label_text'  => $settings['live_visitor_label_text']  ?? 'LIVE',
                'prefix_text' => $settings['live_visitor_prefix_text'] ?? '🔴',
                'suffix_text' => $settings['live_visitor_suffix_text'] ?? '',
                'min_count'   => (int) ($settings['live_visitor_min_count']  ?? 250),
                'max_count'   => (int) ($settings['live_visitor_max_count']  ?? 500),
                'base_count'  => (int) ($settings['live_visitor_base_count'] ?? 350),
            ],
        ]);
    }

    public function updateFloatingWidget(Request $request)
    {
        $request->validate([
            'greeting'       => 'nullable|string|max:500',
            'color'          => 'nullable|string|max:30',
            'position'       => 'nullable|string|max:50',
            'whatsapp'       => 'nullable|string|max:50',
            'messenger'      => 'nullable|string|max:200',
            'phone'          => 'nullable|string|max:50',
            'email'          => 'nullable|string|max:100',
            'whatsapp_icon'  => 'nullable|image|max:2048',
            'messenger_icon' => 'nullable|image|max:2048',
            'livechat_icon'  => 'nullable|image|max:2048',
            // Social Proof
            'social_proof_enabled'          => 'nullable|string',
            'social_proof_interval_seconds' => 'nullable|numeric|min:2|max:3600',
            'social_proof_duration_seconds' => 'nullable|numeric|min:2|max:60',
            // Live Visitor
            'live_visitor_mode'             => 'nullable|string|in:virtual,real',
            'live_visitor_label_text'       => 'nullable|string|max:100',
            'live_visitor_prefix_text'      => 'nullable|string|max:50',
            'live_visitor_suffix_text'      => 'nullable|string|max:50',
            'live_visitor_min_count'        => 'nullable|numeric|min:1',
            'live_visitor_max_count'        => 'nullable|numeric|min:1',
            'live_visitor_base_count'       => 'nullable|numeric|min:1',
        ]);

        // 1. Support Widget
        if ($request->has('enabled')) {
            SiteSetting::set('widget_enabled', (string)$request->input('enabled', '1'), 'floating_widget');
        }
        if ($request->has('color')) {
            SiteSetting::set('widget_color', (string)$request->input('color', '#4f46e5'), 'floating_widget');
        }
        if ($request->has('position')) {
            SiteSetting::set('widget_position', (string)$request->input('position', 'bottom-right'), 'floating_widget');
        }
        if ($request->has('greeting')) {
            SiteSetting::set('widget_greeting', (string)$request->input('greeting'), 'floating_widget');
        }
        if ($request->has('whatsapp')) {
            SiteSetting::set('widget_whatsapp', (string)$request->input('whatsapp', ''), 'floating_widget');
        }
        if ($request->has('messenger')) {
            SiteSetting::set('widget_messenger', (string)$request->input('messenger', ''), 'floating_widget');
        }
        if ($request->has('phone')) {
            SiteSetting::set('widget_phone', (string)$request->input('phone', ''), 'floating_widget');
        }
        if ($request->has('email')) {
            SiteSetting::set('widget_email', (string)$request->input('email', ''), 'floating_widget');
        }

        // Handle Icon / Logo uploads
        if ($request->hasFile('whatsapp_icon')) {
            $path = \App\Services\StorageHelper::storePublicly($request->file('whatsapp_icon'), 'uploads/support');
            SiteSetting::set('widget_whatsapp_icon', '/storage/' . $path, 'floating_widget');
        }
        if ($request->hasFile('messenger_icon')) {
            $path = \App\Services\StorageHelper::storePublicly($request->file('messenger_icon'), 'uploads/support');
            SiteSetting::set('widget_messenger_icon', '/storage/' . $path, 'floating_widget');
        }
        if ($request->hasFile('livechat_icon')) {
            $path = \App\Services\StorageHelper::storePublicly($request->file('livechat_icon'), 'uploads/support');
            SiteSetting::set('widget_livechat_icon', '/storage/' . $path, 'floating_widget');
        }

        // 2. Social Proof Toast Settings
        if ($request->has('social_proof_enabled')) {
            SiteSetting::set('social_proof_enabled', (string)$request->input('social_proof_enabled', '1'), 'social_proof');
        }
        if ($request->has('social_proof_interval_seconds')) {
            SiteSetting::set('social_proof_interval_seconds', (string)$request->input('social_proof_interval_seconds', '20'), 'social_proof');
        }
        if ($request->has('social_proof_duration_seconds')) {
            SiteSetting::set('social_proof_duration_seconds', (string)$request->input('social_proof_duration_seconds', '6'), 'social_proof');
        }

        // Sync to live_visitor_widget json for backward compatibility
        $widgetConfig = [
            'is_active'                => $request->input('social_proof_enabled', '1') === '1',
            'interval_seconds'         => (int) $request->input('social_proof_interval_seconds', 20),
            'display_duration_seconds' => (int) $request->input('social_proof_duration_seconds', 6),
            'visitor_base_count'       => (int) $request->input('live_visitor_base_count', 350),
        ];
        SiteSetting::set('live_visitor_widget', json_encode($widgetConfig), 'appearance');

        // 3. Live Visitors Counter Settings
        if ($request->has('live_visitor_mode')) {
            SiteSetting::set('live_visitor_mode', (string)$request->input('live_visitor_mode', 'virtual'), 'live_visitors');
        }
        if ($request->has('live_visitor_label_text')) {
            SiteSetting::set('live_visitor_label_text', (string)$request->input('live_visitor_label_text', 'LIVE'), 'live_visitors');
        }
        if ($request->has('live_visitor_prefix_text')) {
            SiteSetting::set('live_visitor_prefix_text', (string)$request->input('live_visitor_prefix_text', '🔴'), 'live_visitors');
        }
        if ($request->has('live_visitor_suffix_text')) {
            SiteSetting::set('live_visitor_suffix_text', (string)$request->input('live_visitor_suffix_text', ''), 'live_visitors');
        }
        if ($request->has('live_visitor_min_count')) {
            SiteSetting::set('live_visitor_min_count', (string)$request->input('live_visitor_min_count', '250'), 'live_visitors');
        }
        if ($request->has('live_visitor_max_count')) {
            SiteSetting::set('live_visitor_max_count', (string)$request->input('live_visitor_max_count', '500'), 'live_visitors');
        }
        if ($request->has('live_visitor_base_count')) {
            SiteSetting::set('live_visitor_base_count', (string)$request->input('live_visitor_base_count', '350'), 'live_visitors');
        }

        // Clear settings cache immediately so changes reflect everywhere in 0ms!
        Cache::forget('all_site_settings_map');
        Cache::forget('public_recent_purchases_feed');

        return back()->with('success', 'সমস্ত সেটিংস সফলভাবে আপডেট ও সেভ হয়েছে!');
    }
}

