<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HeroSlider;
use App\Services\StorageHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HeroSliderController extends Controller
{
    public function index()
    {
        StorageHelper::syncAll();

        $sliders = HeroSlider::orderBy('sort_order')->get();

        return Inertia::render('Admin/HeroSliderManager', [
            'sliders' => $sliders,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'button_text' => 'nullable|string|max:100',
            'button_link' => 'nullable|string|max:500',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $path = StorageHelper::storePublicly($request->file('image'), 'hero-sliders');

        HeroSlider::create([
            'title' => $request->title,
            'subtitle' => $request->subtitle,
            'button_text' => $request->button_text,
            'button_link' => $request->button_link,
            'image' => '/storage/' . $path,
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => $request->boolean('is_active', true),
        ]);

        \Illuminate\Support\Facades\Cache::forget('home_hero_sliders');

        return redirect()->back()->with('success', 'স্লাইডার সফলভাবে যোগ হয়েছে!');
    }

    public function update(Request $request, $id)
    {
        $slider = HeroSlider::findOrFail($id);

        $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'button_text' => 'nullable|string|max:100',
            'button_link' => 'nullable|string|max:500',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $data = [
            'title' => $request->title,
            'subtitle' => $request->subtitle,
            'button_text' => $request->button_text,
            'button_link' => $request->button_link,
            'sort_order' => $request->sort_order ?? $slider->sort_order,
            'is_active' => $request->boolean('is_active', $slider->is_active),
        ];

        if ($request->hasFile('image')) {
            StorageHelper::deletePublicly($slider->image);
            $path = StorageHelper::storePublicly($request->file('image'), 'hero-sliders');
            $data['image'] = '/storage/' . $path;
        }

        $slider->update($data);
        \Illuminate\Support\Facades\Cache::forget('home_hero_sliders');

        return redirect()->back()->with('success', 'স্লাইডার সফলভাবে আপডেট হয়েছে!');
    }

    public function destroy($id)
    {
        $slider = HeroSlider::findOrFail($id);

        StorageHelper::deletePublicly($slider->image);

        $slider->delete();
        \Illuminate\Support\Facades\Cache::forget('home_hero_sliders');

        return redirect()->back()->with('success', 'স্লাইডার সফলভাবে ডিলিট হয়েছে!');
    }
}
