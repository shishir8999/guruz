<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $categories = Cache::remember('home_categories', 3600, function () {
            return Category::orderBy('display_order', 'asc')->get();
        });
        
        $featuredProducts = Cache::remember('home_featured_products', 3600, function () {
            return Product::with(['shop', 'category'])
                ->where('is_active', true)
                ->where('is_featured', true)
                ->limit(24)
                ->get();
        });

        $latestProducts = Cache::remember('home_latest_products', 1800, function () {
            return Product::with(['shop', 'category'])
                ->where('is_active', true)
                ->orderBy('created_at', 'desc')
                ->limit(36)
                ->get();
        });

        $shops = Cache::remember('home_active_shops', 3600, function () {
            return Shop::where('status', 'active')
                ->limit(12)
                ->get();
        });

        $heroSliders = Cache::remember('home_hero_sliders', 3600, function () {
            return \App\Models\HeroSlider::where('is_active', true)
                ->orderBy('sort_order')
                ->get();
        });

        $topBanners = Cache::remember('home_top_banners', 3600, function () {
            return \App\Models\TopBanner::where('is_active', true)
                ->orderBy('sort_order')
                ->get();
        });

        $textBanner = [
            'badge' => \App\Models\SiteSetting::get('top_banner_badge', 'BEAUTY GUIDE'),
            'text' => \App\Models\SiteSetting::get('top_banner_text', 'AUTHENTIC BEAUTY & TECH SHOPPING IN BANGLADESH'),
            'btn_text' => \App\Models\SiteSetting::get('top_banner_btn_text', 'কিনতে যান'),
            'btn_link' => \App\Models\SiteSetting::get('top_banner_btn_link', '/shop'),
            'is_active' => \App\Models\SiteSetting::get('top_banner_is_active', '1') === '1',
        ];

        // Fetch Guruz Special Data
        $guruzSpecialEnabled = \App\Models\SiteSetting::get('guruz_special_enabled', '1') === '1';
        $guruzSpecialProductsIds = json_decode(\App\Models\SiteSetting::get('guruz_special_products', '[]'), true);
        $guruzSpecialProducts = [];
        
        if ($guruzSpecialEnabled) {
            if (is_array($guruzSpecialProductsIds) && count($guruzSpecialProductsIds) > 0) {
                $products = \App\Models\Product::with(['shop', 'category'])
                    ->whereIn('id', $guruzSpecialProductsIds)
                    ->where('is_active', true)
                    ->get();
                
                // Sort to maintain saved order
                foreach ($guruzSpecialProductsIds as $id) {
                    $p = $products->firstWhere('id', $id);
                    if ($p) {
                        $guruzSpecialProducts[] = $p;
                    }
                }
            }

            // Fallback if no specific products picked
            if (count($guruzSpecialProducts) === 0) {
                $guruzSpecialProducts = \App\Models\Product::with(['shop', 'category'])
                    ->where('is_active', true)
                    ->latest()
                    ->limit(12)
                    ->get()
                    ->all();
            }
        }

        $guruzSpecial = [
            'enabled' => $guruzSpecialEnabled,
            'title_en' => \App\Models\SiteSetting::get('guruz_special_title_en', 'Guruz Special'),
            'title_bn' => \App\Models\SiteSetting::get('guruz_special_title_bn', 'GURUZ স্পেশাল'),
            'sub_en' => \App\Models\SiteSetting::get('guruz_special_sub_en', 'Hand-picked deals for the season'),
            'sub_bn' => \App\Models\SiteSetting::get('guruz_special_sub_bn', 'সেরা অফার ও বিশেষ আকর্ষণ সমাহার!'),
            'emoji' => \App\Models\SiteSetting::get('guruz_special_emoji', '✨'),
            'grad_from' => \App\Models\SiteSetting::get('guruz_special_grad_from', '#7c3aed'),
            'grad_to' => \App\Models\SiteSetting::get('guruz_special_grad_to', '#db2777'),
            'products' => $guruzSpecialProducts,
        ];

        // Fetch Active Flash Sale
        $activeFlashSale = \App\Models\FlashSale::with(['products.product' => function($q) {
                $q->with(['shop', 'category']);
            }])
            ->where('is_active', true)
            ->where(function($query) {
                $query->whereNull('ends_at')
                      ->orWhere('ends_at', '>', now());
            })
            ->latest('starts_at')
            ->first();

        // Fetch Flash Sale Products (Marked as Flash Sale on creation/editing)
        $flashSaleProducts = Cache::remember('home_flash_sale_products', 1800, function () {
            return Product::with(['shop', 'category'])
                ->where('is_active', true)
                ->where('is_flash_sale', true)
                ->latest()
                ->get();
        });

        return Inertia::render('Home', [
            'categories' => $categories,
            'featuredProducts' => $featuredProducts,
            'latestProducts' => $latestProducts,
            'flashSaleProducts' => $flashSaleProducts,
            'shops' => $shops,
            'heroSliders' => $heroSliders,
            'topBanners' => $topBanners,
            'textBanner' => $textBanner,
            'guruzSpecial' => $guruzSpecial,
            'activeFlashSale' => $activeFlashSale,
        ]);
    }
}
