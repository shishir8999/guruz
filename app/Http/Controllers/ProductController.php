<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function home(): Response
    {
        $categories = \Illuminate\Support\Facades\Cache::remember('all_categories_sorted', 600, function() {
            return Category::orderBy('display_order')->get();
        });

        $featuredProducts = Product::published()
            ->with(['shop:id,name,slug,logo_url,rating', 'category:id,name,slug'])
            ->where('is_featured', true)
            ->latest()
            ->limit(10)
            ->get();

        $latestProducts = Product::published()
            ->with(['shop:id,name,slug,logo_url,rating', 'category:id,name,slug'])
            ->latest()
            ->limit(20)
            ->get();

        $shops = Shop::where('status', 'active')
            ->withCount('followers')
            ->latest()
            ->limit(12)
            ->get();

        $heroSliders = \Illuminate\Support\Facades\Cache::remember('home_hero_sliders', 600, function() {
            return \App\Models\HeroSlider::where('is_active', true)->orderBy('sort_order')->get();
        });

        $topBanners = \Illuminate\Support\Facades\Cache::remember('home_top_banners', 600, function() {
            return \App\Models\TopBanner::where('is_active', true)->orderBy('sort_order')->get();
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
                $products = Product::published()
                    ->with(['shop', 'category'])
                    ->whereIn('id', $guruzSpecialProductsIds)
                    ->get();
                
                foreach ($guruzSpecialProductsIds as $id) {
                    $p = $products->firstWhere('id', $id);
                    if ($p) {
                        $guruzSpecialProducts[] = $p;
                    }
                }
            }

            // Fallback if no specific products picked
            if (count($guruzSpecialProducts) === 0) {
                $guruzSpecialProducts = Product::published()
                    ->with(['shop', 'category'])
                    ->latest()
                    ->limit(4)
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
                $q->published()->with(['shop', 'category']);
            }])
            ->where('is_active', true)
            ->where(function($query) {
                $query->whereNull('ends_at')
                      ->orWhere('ends_at', '>', now());
            })
            ->latest('starts_at')
            ->first();

        $brands = \Illuminate\Support\Facades\Cache::remember('home_brands', 600, function() {
            return \App\Models\Brand::where('is_active', true)
                ->orderByDesc('is_featured')
                ->latest()
                ->limit(24)
                ->get(['id', 'name', 'slug', 'logo_url']);
        });
        $marqueeSpeed = (int) \App\Models\SiteSetting::get('marquee_speed', '20');

        $flashSaleProducts = Product::published()
            ->with(['shop:id,name,slug,logo_url,rating', 'category:id,name,slug'])
            ->where('is_flash_sale', true)
            ->latest()
            ->get();

        return Inertia::render('Home', [
            'categories'       => $categories,
            'featuredProducts' => $featuredProducts,
            'latestProducts'   => $latestProducts,
            'flashSaleProducts'=> $flashSaleProducts,
            'shops'            => $shops,
            'brands'           => $brands,
            'heroSliders'      => $heroSliders,
            'topBanners'       => $topBanners,
            'textBanner'       => $textBanner,
            'guruzSpecial'     => $guruzSpecial,
            'activeFlashSale'  => $activeFlashSale,
            'marqueeSpeed'     => $marqueeSpeed,
        ]);
    }

    public function index(Request $request): Response
    {
        $query = Product::published()
            ->with(['shop:id,name,slug,logo_url,rating', 'category:id,name,slug']);

        $section = $request->input('section');
        $sectionTitle = 'সব পণ্য (All Products)';
        $sectionSubtitle = 'Browse verified products across Bangladesh';

        if ($section === 'guruz-special' || $section === 'eid-special') {
            $guruzSpecialProductsIds = json_decode(\App\Models\SiteSetting::get('guruz_special_products', '[]'), true);
            $titleBn = \App\Models\SiteSetting::get('guruz_special_title_bn', 'GURUZ স্পেশাল');
            $subBn = \App\Models\SiteSetting::get('guruz_special_sub_bn', 'সেরা অফার ও বিশেষ আকর্ষণ সমাহার!');
            $sectionTitle = $titleBn;
            $sectionSubtitle = $subBn;

            if (is_array($guruzSpecialProductsIds) && count($guruzSpecialProductsIds) > 0) {
                $query->whereIn('id', $guruzSpecialProductsIds);
            } else {
                $query->where('is_featured', true);
            }
        } elseif ($section === 'flash-sale') {
            $sectionTitle = 'ফ্ল্যাশ সেল (Flash Sale)';
            $sectionSubtitle = 'সীমিত সময়ের বিশেষ ডিসকাউন্ট ধামাকা!';
            
            $activeFlashSale = \App\Models\FlashSale::where('is_active', true)
                ->where(function($q) {
                    $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
                })
                ->where(function($q) {
                    $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
                })
                ->latest('starts_at')
                ->first();
                
            $fsProductIds = [];
            if ($activeFlashSale) {
                $fsProductIds = \App\Models\FlashSaleProduct::where('flash_sale_id', $activeFlashSale->id)->pluck('product_id')->toArray();
            }

            $query->where(function($q) use ($fsProductIds) {
                $q->where('is_flash_sale', true);
                if (!empty($fsProductIds)) {
                    $q->orWhereIn('id', $fsProductIds);
                }
                $q->orWhere(function($sub) {
                    $sub->whereNotNull('sale_price')->whereColumn('sale_price', '<', 'price');
                });
            });
        } elseif ($section === 'verified' || $section === 'guruz-verified') {
            $sectionTitle = 'গুরুজ ভেরিফাইড (Guruz Verified)';
            $sectionSubtitle = '১০০% অরিজিনাল ও ভেরিফাইড কোয়ালিটি প্রডাক্ট';
            $query->where('is_featured', true);
        } elseif ($section === 'new-arrivals') {
            $sectionTitle = 'New Arrivals (নতুন প্রডাক্ট)';
            $sectionSubtitle = 'সাম্প্রতিক সময়ে যুক্ত হওয়া নতুন গ্যাজেট ও কালেকশন';
            $query->latest();
        } elseif ($section === 'for-you') {
            $sectionTitle = 'For You (আপনার জন্য সাজানো)';
            $sectionSubtitle = 'আপনার পছন্দের সেরা ট্রেন্ডিং ও টপ রেটেড পণ্যসমূহ';
            $query->orderByDesc('rating')->orderByDesc('id');
        }

        if ($request->filled('category')) {
            $categoryObj = Category::where('slug', $request->category)->first();
            if ($categoryObj) {
                $sectionTitle = $categoryObj->name;
                $sectionSubtitle = 'Explore products in ' . $categoryObj->name;
            }
            $query->whereHas('category', fn($q) => $q->where('slug', $request->category));
        }

        if ($request->filled('brand')) {
            $brandTerm = trim((string) $request->brand);
            $brandObj = \App\Models\Brand::where('slug', $brandTerm)
                ->orWhere('name', 'like', "%{$brandTerm}%")
                ->first();

            $brandDisplayName = $brandObj ? $brandObj->name : ucfirst($brandTerm);
            $sectionTitle = $brandDisplayName . ' ব্র্যান্ড';
            $sectionSubtitle = $brandDisplayName . ' ব্র্যান্ডের সকল অথেনটিক পণ্য ও অ্যাক্সেসরিজ';

            $query->where(function ($q) use ($brandObj, $brandTerm) {
                if ($brandObj) {
                    $q->where('brand_id', $brandObj->id);
                }
                $q->orWhereHas('brand', function ($b) use ($brandTerm) {
                    $b->where('slug', $brandTerm)->orWhere('name', 'like', "%{$brandTerm}%");
                })->orWhere('name', 'like', "%{$brandTerm}%");
            });
        }

        if ($request->filled('search') || $request->filled('q')) {
            $search = $request->input('search', $request->input('q'));
            $sectionTitle = 'Search Results for: "' . $search . '"';
            
            // Clean and split the search term into tokens for fuzzy matching
            $tokens = array_filter(explode(' ', trim(preg_replace('/\s+/', ' ', $search))));

            if (!empty($tokens)) {
                $query->where(function ($q) use ($tokens) {
                    foreach ($tokens as $token) {
                        $q->where(function ($subQ) use ($token) {
                            $subQ->where('name', 'like', "%{$token}%")
                                 ->orWhere('sku', 'like', "%{$token}%")
                                 ->orWhere('description', 'like', "%{$token}%")
                                 ->orWhereHas('category', fn($c) => $c->where('name', 'like', "%{$token}%"))
                                 ->orWhereHas('brand', fn($b) => $b->where('name', 'like', "%{$token}%"));
                        });
                    }
                });
            }
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        match ($request->input('sort', 'newest')) {
            'price_asc'  => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'popular'    => $query->orderByDesc('stock_quantity'),
            'rating'     => $query->orderByDesc('rating'),
            default      => $query->latest(),
        };

        $products   = $query->paginate(24)->withQueryString();
        $categories = \Illuminate\Support\Facades\Cache::remember('all_categories_sorted', 600, fn() => Category::orderBy('display_order')->get());

        return Inertia::render('Products/Index', [
            'products'        => $products,
            'categories'      => $categories,
            'filters'         => $request->only(['section', 'category', 'brand', 'search', 'min_price', 'max_price', 'sort']),
            'sectionTitle'    => $sectionTitle,
            'sectionSubtitle' => $sectionSubtitle,
        ]);
    }

    public function suggestions(Request $request)
    {
        $search = $request->input('q', '');
        $tokens = array_filter(explode(' ', trim(preg_replace('/\s+/', ' ', $search))));

        if (empty($tokens)) {
            return response()->json(['categories' => [], 'products' => []]);
        }

        // Fuzzy match categories (top 3)
        $categoriesQuery = Category::query();
        foreach ($tokens as $token) {
            $categoriesQuery->where('name', 'like', "%{$token}%");
        }
        $categories = $categoriesQuery->limit(3)->get(['id', 'name', 'slug', 'image_url']);

        // Fuzzy match products (top 5)
        $productsQuery = Product::published();
        foreach ($tokens as $token) {
            $productsQuery->where(function ($subQ) use ($token) {
                $subQ->where('name', 'like', "%{$token}%")
                     ->orWhere('sku', 'like', "%{$token}%")
                     ->orWhere('description', 'like', "%{$token}%")
                     ->orWhereHas('category', fn($c) => $c->where('name', 'like', "%{$token}%"))
                     ->orWhereHas('brand', fn($b) => $b->where('name', 'like', "%{$token}%"));
            });
        }
        $products = $productsQuery->limit(5)->get(['id', 'name', 'slug', 'price', 'sale_price', 'primary_image_url']);

        return response()->json([
            'categories' => $categories,
            'products'   => $products,
        ]);
    }

    public function imageSearch(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:10240',
        ]);

        $file = $request->file('image');
        $filename = strtolower($file->getClientOriginalName());

        $categoryMatches = [
            'spark' => 'cable',
            'cable' => 'cable',
            'wire'  => 'cable',
            'router' => 'router',
            'wifi'   => 'router',
            'phone'  => 'phone',
            'mobile' => 'phone',
            'watch'  => 'watch',
            'audio'  => 'headphone',
            'headphone' => 'headphone',
            'earphone'  => 'headphone',
            'charger'   => 'charger',
            'power'     => 'charger',
            'laptop'    => 'laptop',
            'computer'  => 'laptop',
        ];

        $matchedKeyword = '';

        foreach ($categoryMatches as $key => $term) {
            if (str_contains($filename, $key)) {
                $matchedKeyword = $term;
                break;
            }
        }

        if (!$matchedKeyword) {
            $matchingCategory = Category::where(function($q) use ($filename) {
                $q->where('name', 'like', "%{$filename}%")
                  ->orWhere('slug', 'like', "%{$filename}%");
            })->first();

            if ($matchingCategory) {
                $matchedKeyword = $matchingCategory->slug;
            } else {
                $firstCat = Category::orderBy('display_order')->first();
                $matchedKeyword = $firstCat ? $firstCat->name : 'cable';
            }
        }

        return response()->json([
            'success'      => true,
            'query'        => $matchedKeyword,
            'redirect_url' => '/products?search=' . urlencode($matchedKeyword),
        ]);
    }

    public function show(string $slug): Response
    {
        $product = Product::published()
            ->with([
                'shop:id,name,slug,logo_url,rating',
                'category:id,name,slug',
                'images',
                'variants',
                'reviews' => function($q) {
                    $q->where(function($sub) {
                        $sub->where('status', 'approved')
                            ->orWhere(function($sub2) {
                                $sub2->where('is_verified', true)->whereNotIn('status', ['pending', 'rejected']);
                            });
                    })
                    ->with('user:id,name,avatar_url')
                    ->latest();
                },
            ])
            ->where(function($q) use ($slug) {
                $q->where('slug', $slug)->orWhere('id', $slug);
            })
            ->firstOrFail();

        $relatedProducts = Product::published()
            ->with(['shop:id,name,slug'])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->inRandomOrder()
            ->limit(4)
            ->get();

        $reviewsLoaded = $product->reviews;
        $reviewCount = $reviewsLoaded->count();
        $reviewStats = [
            'average'   => $reviewCount > 0 ? round($reviewsLoaded->avg('rating'), 1) : 5.0,
            'total'     => $reviewCount,
            'breakdown' => [
                5 => $reviewsLoaded->where('rating', 5)->count(),
                4 => $reviewsLoaded->where('rating', 4)->count(),
                3 => $reviewsLoaded->where('rating', 3)->count(),
                2 => $reviewsLoaded->where('rating', 2)->count(),
                1 => $reviewsLoaded->where('rating', 1)->count(),
            ],
        ];

        return Inertia::render('Products/Show', [
            'product'         => $product,
            'relatedProducts' => $relatedProducts,
            'reviewStats'     => $reviewStats,
        ]);
    }

    public function category(string $slug, Request $request): Response
    {
        $request->merge(['category' => $slug]);
        return $this->index($request);
    }

    public function storeReview(Request $request, Product $product)
    {
        $request->validate([
            'rating'     => 'required|integer|between:1,5',
            'comment'    => 'required|string|max:2000',
            'user_name'  => 'nullable|string|max:100',
            'user_email' => 'nullable|email|max:150',
        ]);

        $user = auth()->user();
        $userId = $user?->id;
        $userName = $request->input('user_name') ?: ($user?->name ?: 'কাস্টমার');
        $userEmail = $request->input('user_email') ?: ($user?->email ?: null);

        \App\Models\ProductReview::create([
            'product_id'  => $product->id,
            'user_id'     => $userId,
            'user_name'   => $userName,
            'user_email'  => $userEmail,
            'rating'      => (int)$request->rating,
            'comment'     => $request->comment,
            'is_verified' => false,
            'status'      => 'pending',
        ]);

        // Notify Super Admins
        try {
            $admins = \App\Models\User::whereIn('role', ['admin', 'super_admin', 'superadmin'])->get();
            if ($admins->isEmpty()) {
                $firstAdmin = \App\Models\User::find(1);
                if ($firstAdmin) $admins = collect([$firstAdmin]);
            }
            foreach ($admins as $admin) {
                \App\Models\Notification::create([
                    'user_id' => $admin->id,
                    'type'    => 'new_review',
                    'title'   => 'নতুন কাস্টমার রিভিউ এসেছে!',
                    'body'    => "পণ্য '{$product->name}' এর জন্য একটি নতুন রিভিউ অনুমোদন অপেক্ষায় রয়েছে।",
                    'link'    => '/admin/reviews-qna',
                    'icon'    => 'star',
                    'is_read' => false,
                ]);
            }
            \Illuminate\Support\Facades\Cache::forget('admin_nav_counts');
        } catch (\Throwable $e) {}

        return back()->with('success', 'আপনার রিভিউ সফলভাবে সাবমিট হয়েছে! সুপার অ্যাডমিন অনুমোদনের পর এটি প্রদর্শিত হবে।');
    }
}
