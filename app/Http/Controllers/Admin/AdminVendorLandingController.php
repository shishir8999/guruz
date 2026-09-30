<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VendorLandingSection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminVendorLandingController extends Controller
{
    public function index()
    {
        if (VendorLandingSection::count() === 0) {
            VendorLandingSection::insert([
                [
                    'section_id'   => '#VLP-001',
                    'name'         => 'Hero Banner Area',
                    'content_type' => 'Header Block',
                    'visibility'   => 'Visible',
                    'status'       => 'Active',
                    'position'     => 1,
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ],
                [
                    'section_id'   => '#VLP-002',
                    'name'         => 'Why Sell With Us',
                    'content_type' => 'Feature Grid',
                    'visibility'   => 'Visible',
                    'status'       => 'Active',
                    'position'     => 2,
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ],
                [
                    'section_id'   => '#VLP-003',
                    'name'         => 'Vendor Success Stories',
                    'content_type' => 'Testimonials',
                    'visibility'   => 'Hidden',
                    'status'       => 'Draft',
                    'position'     => 3,
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ],
                [
                    'section_id'   => '#VLP-004',
                    'name'         => 'How It Works Pipeline',
                    'content_type' => 'Steps Process',
                    'visibility'   => 'Visible',
                    'status'       => 'Active',
                    'position'     => 4,
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ],
                [
                    'section_id'   => '#VLP-005',
                    'name'         => 'Trust & Security Info',
                    'content_type' => 'Text & Icons',
                    'visibility'   => 'Visible',
                    'status'       => 'Active',
                    'position'     => 5,
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ],
            ]);
        }

        $sections = VendorLandingSection::orderBy('position', 'asc')->get();

        $cmsSettings = [
            'hero_title'        => \App\Models\SiteSetting::get('vlp_hero_title', 'আপনার পণ্য বিক্রি করুন প্রতিটি গ্রাহকের কাছে'),
            'hero_subtitle'     => \App\Models\SiteSetting::get('vlp_hero_subtitle', 'একটি প্ল্যাটফর্ম যেখানে আপনি অনলাইনে, ইন-পারসন এবং সব জায়গায় বিক্রি করতে পারবেন। Guruz সেলার হয়ে আপনার ব্যবসা বাড়ান!'),
            'hero_bg_color'     => \App\Models\SiteSetting::get('vlp_hero_bg_color', '#0a0a1a'),
            'hero_accent_color' => \App\Models\SiteSetting::get('vlp_hero_accent_color', '#10b981'),
            'button_text'       => \App\Models\SiteSetting::get('vlp_button_text', 'সেলার হিসেবে যোগ দিন'),
            'logo_url'          => \App\Models\SiteSetting::get('vlp_logo_url', ''),
            'benefits_json'     => \App\Models\SiteSetting::get('vlp_benefits_json', ''),
            'steps_json'        => \App\Models\SiteSetting::get('vlp_steps_json', ''),
            'faqs_json'         => \App\Models\SiteSetting::get('vlp_faqs_json', ''),
        ];

        return Inertia::render('Admin/Appearance/VendorLandingPage', [
            'sections' => $sections,
            'cms'      => $cmsSettings,
        ]);
    }

    public function updateCms(Request $request)
    {
        $validated = $request->validate([
            'hero_title'        => 'required|string|max:500',
            'hero_subtitle'     => 'required|string|max:1000',
            'hero_bg_color'     => 'nullable|string|max:50',
            'hero_accent_color' => 'nullable|string|max:50',
            'button_text'       => 'required|string|max:100',
            'logo_url'          => 'nullable|string|max:500',
            'benefits_json'     => 'nullable|string',
            'steps_json'        => 'nullable|string',
            'faqs_json'         => 'nullable|string',
        ]);

        foreach ($validated as $key => $val) {
            \App\Models\SiteSetting::set('vlp_' . $key, $val, 'vendor_landing');
        }

        return back()->with('success', 'ভেন্ডর ল্যান্ডিং পেজের কনটেন্ট, কালার ও টেক্সট সফলভাবে আপডেট করা হয়েছে!');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'         => 'required|string|max:255',
            'content_type' => 'required|string|max:255',
            'visibility'   => 'required|in:Visible,Hidden',
            'status'       => 'required|in:Active,Draft',
            'description'  => 'nullable|string',
            'position'     => 'nullable|integer',
        ]);

        $count = VendorLandingSection::count() + 1;
        $sectionId = '#VLP-' . str_pad($count, 3, '0', STR_PAD_LEFT);

        VendorLandingSection::create([
            'section_id'   => $sectionId,
            'name'         => $request->name,
            'content_type' => $request->content_type,
            'visibility'   => $request->visibility,
            'status'       => $request->status,
            'description'  => $request->description,
            'position'     => $request->position ?: $count,
        ]);

        return back()->with('success', 'নতুন ভেন্ডর ল্যান্ডিং সেকশন সফলভাবে যুক্ত হয়েছে!');
    }

    public function update(Request $request, VendorLandingSection $section)
    {
        $request->validate([
            'name'         => 'required|string|max:255',
            'content_type' => 'required|string|max:255',
            'visibility'   => 'required|in:Visible,Hidden',
            'status'       => 'required|in:Active,Draft',
            'description'  => 'nullable|string',
            'position'     => 'nullable|integer',
        ]);

        $section->update([
            'name'         => $request->name,
            'content_type' => $request->content_type,
            'visibility'   => $request->visibility,
            'status'       => $request->status,
            'description'  => $request->description,
            'position'     => $request->position ?: $section->position,
        ]);

        return back()->with('success', 'ভেন্ডর ল্যান্ডিং সেকশন আপডেট সফল হয়েছে!');
    }

    public function toggleStatus(VendorLandingSection $section)
    {
        $newStatus = $section->status === 'Active' ? 'Draft' : 'Active';
        $section->update(['status' => $newStatus]);

        return back()->with('success', "সেকশন স্ট্যাটাস '{$newStatus}' করা হয়েছে!");
    }

    public function destroy(VendorLandingSection $section)
    {
        $section->delete();
        return back()->with('success', 'ভেন্ডর ল্যান্ডিং সেকশন মুছে ফেলা হয়েছে!');
    }
}
