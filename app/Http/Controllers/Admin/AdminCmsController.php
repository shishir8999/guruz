<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FlashSale;
use App\Models\HeroSlide;
use App\Models\NoticeMarquee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminCmsController extends Controller
{
    public function index()
    {
        $slides   = HeroSlide::orderBy('sort_order')->get();
        $marquees = NoticeMarquee::orderBy('sort_order')->get();

        return Inertia::render('Admin/Cms', [
            'slides'   => $slides,
            'marquees' => $marquees,
        ]);
    }

    public function storeSlide(Request $request)
    {
        $request->validate([
            'title_en'  => 'required|string|max:255',
            'title_bn'  => 'nullable|string|max:255',
            'image_url' => 'required|string',
            'cta_url'   => 'nullable|string',
        ]);

        HeroSlide::create($request->all());

        return back()->with('success', 'Hero slide created successfully.');
    }

    public function destroySlide(HeroSlide $slide)
    {
        $slide->delete();
        return back()->with('success', 'Hero slide deleted.');
    }

    public function storeMarquee(Request $request)
    {
        $request->validate([
            'text_en' => 'required|string',
            'text_bn' => 'nullable|string',
        ]);

        NoticeMarquee::create($request->all());

        return back()->with('success', 'Notice marquee added.');
    }

    public function flashSales()
    {
        $flashSales = FlashSale::with('products.product')->orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/FlashSales', [
            'flashSales' => $flashSales,
        ]);
    }

    public function storeFlashSale(Request $request)
    {
        $request->validate([
            'title_en'  => 'required|string|max:255',
            'starts_at' => 'required|date',
            'ends_at'   => 'required|date|after:starts_at',
        ]);

        FlashSale::create($request->all());

        return back()->with('success', 'Flash sale created.');
    }
}
