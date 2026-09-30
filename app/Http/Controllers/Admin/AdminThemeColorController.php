<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SiteSetting;

class AdminThemeColorController extends Controller
{
    /**
     * Display the Theme Color settings page.
     */
    public function index()
    {
        $settings = [
            'primary_color' => SiteSetting::get('theme_primary_color', '#16a34a'),
            'primary_dark' => SiteSetting::get('theme_primary_dark', '#15803d'),
            'primary_text' => SiteSetting::get('theme_primary_text', '#ffffff'),
            'accent_color' => SiteSetting::get('theme_accent_color', '#22c9a3'),
            'badge_bg' => SiteSetting::get('theme_badge_bg', '#f97316'),
            'sale_bg' => SiteSetting::get('theme_sale_bg', '#ef4444'),
            'navy_color' => SiteSetting::get('theme_navy_color', '#0f2033'),
            
            'header_bg' => SiteSetting::get('theme_header_bg', '#0f2033'),
            'header_text' => SiteSetting::get('theme_header_text', '#ffffff'),
            
            'search_bg' => SiteSetting::get('theme_search_bg', '#383333'),
            'search_text' => SiteSetting::get('theme_search_text', '#ffffff'),
            
            'announcement_bg' => SiteSetting::get('theme_announcement_bg', '#16a34a'),
            'announcement_text' => SiteSetting::get('theme_announcement_text', '#ffffff'),
            
            'notice_from' => SiteSetting::get('theme_notice_from', '#fbbf24'),
            'notice_via' => SiteSetting::get('theme_notice_via', '#f97316'),
            'notice_to' => SiteSetting::get('theme_notice_to', '#f43f5e'),
            'notice_text' => SiteSetting::get('theme_notice_text', '#ffffff'),
            
            'footer_bg' => SiteSetting::get('theme_footer_bg', '#0f2033'),
            'footer_text' => SiteSetting::get('theme_footer_text', '#ffffff'),
            
            'page_bg' => SiteSetting::get('theme_page_bg', '#ffffff'),
            'page_text' => SiteSetting::get('theme_page_text', '#0a0f1c'),
            'card_bg' => SiteSetting::get('theme_card_bg', '#ffffff'),
            'card_text' => SiteSetting::get('theme_card_text', '#0a0f1c'),
            'popover_bg' => SiteSetting::get('theme_popover_bg', '#ffffff'),
            'popover_text' => SiteSetting::get('theme_popover_text', '#0a0f1c'),
            
            'secondary_bg' => SiteSetting::get('theme_secondary_bg', '#f1f5f9'),
            'secondary_text' => SiteSetting::get('theme_secondary_text', '#0f2033'),
            'accent_bg' => SiteSetting::get('theme_accent_bg', '#f1f5f9'),
            'accent_text' => SiteSetting::get('theme_accent_text', '#1e293b'),
            
            'muted_bg' => SiteSetting::get('theme_muted_bg', '#f1f5f9'),
            'muted_text' => SiteSetting::get('theme_muted_text', '#64748b'),
            
            'border_color' => SiteSetting::get('theme_border_color', '#e2e8f0'),
            'input_border' => SiteSetting::get('theme_input_border', '#e2e8f0'),
            'focus_ring' => SiteSetting::get('theme_focus_ring', '#94a3b8'),
            
            'danger_bg' => SiteSetting::get('theme_danger_bg', '#ef4444'),
            'danger_text' => SiteSetting::get('theme_danger_text', '#ffffff'),
            
            'sidebar_bg' => SiteSetting::get('theme_sidebar_bg', '#242628'),
            'sidebar_text' => SiteSetting::get('theme_sidebar_text', '#ffffff'),
            'sidebar_active_bg' => SiteSetting::get('theme_sidebar_active_bg', '#1e293b'),
            'sidebar_active_text' => SiteSetting::get('theme_sidebar_active_text', '#f8fafc'),
            'sidebar_hover_bg' => SiteSetting::get('theme_sidebar_hover_bg', '#f1f5f9'),
            'sidebar_hover_text' => SiteSetting::get('theme_sidebar_hover_text', '#1e293b'),
            'sidebar_border' => SiteSetting::get('theme_sidebar_border', '#e2e8f0'),
        ];

        return Inertia::render('Admin/Appearance/ThemeColorPage', [
            'settings' => $settings,
        ]);
    }

    /**
     * Save the updated theme color settings.
     */
    public function update(Request $request)
    {
        $keys = [
            'primary_color', 'primary_dark', 'primary_text', 'accent_color', 'badge_bg', 'sale_bg', 'navy_color',
            'header_bg', 'header_text',
            'search_bg', 'search_text',
            'announcement_bg', 'announcement_text',
            'notice_from', 'notice_via', 'notice_to', 'notice_text',
            'footer_bg', 'footer_text',
            'page_bg', 'page_text', 'card_bg', 'card_text', 'popover_bg', 'popover_text',
            'secondary_bg', 'secondary_text', 'accent_bg', 'accent_text',
            'muted_bg', 'muted_text',
            'border_color', 'input_border', 'focus_ring',
            'danger_bg', 'danger_text',
            'sidebar_bg', 'sidebar_text', 'sidebar_active_bg', 'sidebar_active_text', 'sidebar_hover_bg', 'sidebar_hover_text', 'sidebar_border'
        ];

        $rules = [];
        foreach ($keys as $key) {
            $rules[$key] = 'required|string|max:20';
        }

        $request->validate($rules);

        foreach ($keys as $key) {
            SiteSetting::set('theme_' . $key, $request->$key, 'appearance');
        }

        return redirect()->back()->with('success', 'Theme colors updated successfully.');
    }
}
