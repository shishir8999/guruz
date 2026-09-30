<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\FooterWidget;
use App\Models\FooterLink;
use App\Models\SiteSetting;

class AdminFooterBuilderController extends Controller
{
    public function index()
    {
        $widgets = FooterWidget::with('links')->orderBy('position')->get();
        
        $settings = [
            'footer_facebook' => SiteSetting::get('footer_facebook', ''),
            'footer_instagram' => SiteSetting::get('footer_instagram', ''),
            'footer_youtube' => SiteSetting::get('footer_youtube', ''),
            'footer_linkedin' => SiteSetting::get('footer_linkedin', ''),
            'footer_tiktok' => SiteSetting::get('footer_tiktok', ''),
            'footer_pinterest' => SiteSetting::get('footer_pinterest', ''),
            'footer_whatsapp' => SiteSetting::get('footer_whatsapp', ''),
            'footer_app_store' => SiteSetting::get('footer_app_store', ''),
            'footer_play_store' => SiteSetting::get('footer_play_store', ''),
            'footer_copyright' => SiteSetting::get('footer_copyright', '© 2026 GURUZ All rights reserved. Secure payments • Genuine products'),
            'footer_payment_methods' => SiteSetting::get('footer_payment_methods', '[]')
        ];

        return Inertia::render('Admin/Appearance/FooterBuilder', [
            'widgets' => $widgets,
            'settings' => $settings
        ]);
    }

    public function storeWidget(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'position' => 'nullable|integer',
            'is_active' => 'boolean'
        ]);

        FooterWidget::create($validated);
        return redirect()->back()->with('success', 'Footer Widget created.');
    }

    public function updateWidget(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'position' => 'nullable|integer',
            'is_active' => 'boolean'
        ]);

        FooterWidget::findOrFail($id)->update($validated);
        return redirect()->back()->with('success', 'Footer Widget updated.');
    }

    public function destroyWidget($id)
    {
        FooterWidget::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Footer Widget deleted.');
    }

    public function storeLink(Request $request)
    {
        $validated = $request->validate([
            'footer_widget_id' => 'required|exists:footer_widgets,id',
            'label' => 'required|string|max:255',
            'url' => 'required|string|max:255',
            'position' => 'nullable|integer',
            'is_active' => 'boolean'
        ]);

        FooterLink::create($validated);
        return redirect()->back()->with('success', 'Footer Link created.');
    }

    public function updateLink(Request $request, $id)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'url' => 'required|string|max:255',
            'position' => 'nullable|integer',
            'is_active' => 'boolean'
        ]);

        FooterLink::findOrFail($id)->update($validated);
        return redirect()->back()->with('success', 'Footer Link updated.');
    }

    public function destroyLink($id)
    {
        FooterLink::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Footer Link deleted.');
    }

    public function updateSettings(Request $request)
    {
        $keys = [
            'footer_facebook', 'footer_instagram', 'footer_youtube', 'footer_linkedin',
            'footer_tiktok', 'footer_pinterest', 'footer_whatsapp', 'footer_app_store',
            'footer_play_store', 'footer_copyright'
        ];

        foreach ($keys as $key) {
            if ($request->has($key)) {
                SiteSetting::set($key, $request->input($key));
            }
        }

        // Handle JSON array of payment methods
        if ($request->has('footer_payment_methods')) {
            SiteSetting::set('footer_payment_methods', json_encode($request->input('footer_payment_methods')));
        }

        return redirect()->back()->with('success', 'Footer settings updated.');
    }
}
