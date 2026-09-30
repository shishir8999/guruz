<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TopBanner;
use App\Services\StorageHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TopBannerController extends Controller
{
    public function index()
    {
        StorageHelper::syncAll();

        $banners = TopBanner::orderBy('sort_order')->get();
        
        $textBanner = [
            'badge' => \App\Models\SiteSetting::get('top_banner_badge', 'BEAUTY GUIDE'),
            'text' => \App\Models\SiteSetting::get('top_banner_text', 'AUTHENTIC BEAUTY & TECH SHOPPING IN BANGLADESH'),
            'btn_text' => \App\Models\SiteSetting::get('top_banner_btn_text', 'কিনতে যান'),
            'btn_link' => \App\Models\SiteSetting::get('top_banner_btn_link', '/shop'),
            'is_active' => \App\Models\SiteSetting::get('top_banner_is_active', '1') === '1',
        ];

        return Inertia::render('Admin/TopBannerManager', [
            'banners' => $banners,
            'textBanner' => $textBanner,
        ]);
    }

    public function updateTextBanner(Request $request)
    {
        $request->validate([
            'badge' => 'nullable|string|max:50',
            'text' => 'nullable|string|max:255',
            'btn_text' => 'nullable|string|max:50',
            'btn_link' => 'nullable|string|max:500',
            'is_active' => 'nullable|boolean',
        ]);

        \App\Models\SiteSetting::set('top_banner_badge', $request->badge, 'appearance');
        \App\Models\SiteSetting::set('top_banner_text', $request->text, 'appearance');
        \App\Models\SiteSetting::set('top_banner_btn_text', $request->btn_text, 'appearance');
        \App\Models\SiteSetting::set('top_banner_btn_link', $request->btn_link, 'appearance');
        \App\Models\SiteSetting::set('top_banner_is_active', $request->boolean('is_active') ? '1' : '0', 'appearance');

        \Illuminate\Support\Facades\Cache::forget('home_top_banners');

        return redirect()->back()->with('success', 'টপ ব্যানার (টেক্সট) সফলভাবে আপডেট হয়েছে!');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'link' => 'nullable|string|max:500',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $path = StorageHelper::storePublicly($request->file('image'), 'top-banners');

        TopBanner::create([
            'title' => $request->title,
            'link' => $request->link,
            'image' => '/storage/' . $path,
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => $request->boolean('is_active', true),
        ]);

        \Illuminate\Support\Facades\Cache::forget('home_top_banners');

        return redirect()->back()->with('success', 'টপ ব্যানার সফলভাবে যোগ হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $banner = TopBanner::findOrFail($id);

        $request->validate([
            'title' => 'nullable|string|max:255',
            'link' => 'nullable|string|max:500',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $data = [
            'title' => $request->title,
            'link' => $request->link,
            'sort_order' => $request->sort_order ?? $banner->sort_order,
            'is_active' => $request->boolean('is_active', $banner->is_active),
        ];

        if ($request->hasFile('image')) {
            StorageHelper::deletePublicly($banner->image);
            $path = StorageHelper::storePublicly($request->file('image'), 'top-banners');
            $data['image'] = '/storage/' . $path;
        }

        $banner->update($data);

        \Illuminate\Support\Facades\Cache::forget('home_top_banners');

        return redirect()->back()->with('success', 'টপ ব্যানার সফলভাবে আপডেট হয়েছে!');
    }

    public function destroy($id)
    {
        $banner = TopBanner::findOrFail($id);

        StorageHelper::deletePublicly($banner->image);

        $banner->delete();

        \Illuminate\Support\Facades\Cache::forget('home_top_banners');

        return redirect()->back()->with('success', 'টপ ব্যানার সফলভাবে ডিলিট হয়েছে!');
    }
}
