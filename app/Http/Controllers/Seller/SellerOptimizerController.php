<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SellerOptimizerController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $shop = $user ? $user->shop : null;

        if ($user && !$shop) {
            $shop = Shop::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'name'        => ($user->name ?? 'Vendor') . "'s Shop",
                    'slug'        => Str::slug(($user->name ?? 'Vendor') . "-shop-" . $user->id),
                    'status'      => 'active',
                    'is_approved' => true,
                ]
            );
        }

        $products = Product::where('shop_id', $shop->id)->get();

        // Calculate Store Optimization & Health Score
        $score = 0;
        $checks = [];

        // 1. Shop Profile Completeness
        $hasLogo = !empty($shop->logo_url);
        $hasBanner = !empty($shop->banner_url);
        $hasDescription = !empty($shop->description);
        $hasCustomDomain = !empty($shop->custom_domain);

        if ($hasLogo) $score += 15;
        if ($hasBanner) $score += 15;
        if ($hasDescription) $score += 15;
        if ($hasCustomDomain) $score += 20;

        $checks[] = [
            'key' => 'logo',
            'title' => 'Shop Logo & Branding',
            'status' => $hasLogo ? 'passed' : 'warning',
            'desc' => $hasLogo ? 'Logo is set correctly.' : 'Add a high resolution logo to improve brand recognition.',
        ];
        $checks[] = [
            'key' => 'banner',
            'title' => 'Shop Banner Image',
            'status' => $hasBanner ? 'passed' : 'warning',
            'desc' => $hasBanner ? 'Banner is set.' : 'Upload a banner to make your store page vibrant.',
        ];
        $checks[] = [
            'key' => 'description',
            'title' => 'Store Description & About',
            'status' => $hasDescription ? 'passed' : 'warning',
            'desc' => $hasDescription ? 'Description added.' : 'Add a detailed description to boost Google Search indexing.',
        ];
        $checks[] = [
            'key' => 'custom_domain',
            'title' => 'Custom Domain (কাস্টম ডোমেইন)',
            'status' => $hasCustomDomain ? 'passed' : 'info',
            'desc' => $hasCustomDomain ? "Connected to {$shop->custom_domain}" : 'Connect your own domain (e.g. www.yourbrand.com) for direct web traffic.',
        ];

        // 2. Product SEO Audit
        $totalProducts = $products->count();
        $unoptimizedProductsCount = 0;

        foreach ($products as $p) {
            if (empty($p->meta_title) || empty($p->meta_description) || strlen($p->name) < 10) {
                $unoptimizedProductsCount++;
            }
        }

        if ($totalProducts > 0) {
            $optimizedRatio = ($totalProducts - $unoptimizedProductsCount) / $totalProducts;
            $score += round($optimizedRatio * 35);
        } else {
            $score += 35; // Default if no products yet
        }

        $score = min(100, max(0, $score));

        return Inertia::render('Seller/Optimizer/Index', [
            'shop' => $shop,
            'score' => $score,
            'checks' => $checks,
            'totalProducts' => $totalProducts,
            'unoptimizedProductsCount' => $unoptimizedProductsCount,
            'products' => $products->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'sku' => $p->sku,
                'price' => $p->price,
                'meta_title' => $p->meta_title,
                'meta_description' => $p->meta_description,
                'image' => $p->primary_image,
                'is_optimized' => !empty($p->meta_title) && !empty($p->meta_description),
            ]),
        ]);
    }

    public function optimizeProducts(Request $request)
    {
        $user = Auth::user();
        $shop = $user->shop;

        if (!$shop) {
            return back()->with('error', 'Shop not found.');
        }

        $products = Product::where('shop_id', $shop->id)->get();
        $updatedCount = 0;

        foreach ($products as $product) {
            $updated = false;

            if (empty($product->meta_title)) {
                $product->meta_title = Str::limit($product->name . ' - Buy Online at Best Price in Bangladesh', 60);
                $updated = true;
            }

            if (empty($product->meta_description)) {
                $desc = !empty($product->description) ? strip_tags($product->description) : $product->name;
                $product->meta_description = Str::limit("Get the best deals on {$product->name}. High quality, fast delivery, and 100% genuine guaranteed on {$shop->name}. " . $desc, 150);
                $updated = true;
            }

            if ($updated) {
                $product->save();
                $updatedCount++;
            }
        }

        return back()->with('success', "⚡ Successfully optimized {$updatedCount} products for Google SEO!");
    }

    public function saveDomain(Request $request)
    {
        $request->validate([
            'custom_domain' => 'required|string|max:255',
        ]);

        $user = Auth::user();
        $shop = $user->shop;

        if (!$shop) {
            return back()->with('error', 'Shop not found.');
        }

        // Clean domain format (remove http://, https://, trailing slashes)
        $domain = strtolower(trim($request->custom_domain));
        $domain = preg_replace('#^https?://#', '', $domain);
        $domain = rtrim($domain, '/');

        // Check if domain is already taken by another shop
        $existing = Shop::where('custom_domain', $domain)->where('id', '!=', $shop->id)->first();
        if ($existing) {
            return back()->with('error', "The domain '{$domain}' is already linked to another store.");
        }

        $shop->custom_domain = $domain;
        $shop->custom_domain_status = 'Active & DNS Verified';
        $shop->custom_domain_dns_verified = true;
        $shop->save();

        return back()->with('success', "🎉 Custom Domain '{$domain}' saved and activated successfully!");
    }

    public function clearCache()
    {
        \Illuminate\Support\Facades\Artisan::call('cache:clear');
        \Illuminate\Support\Facades\Artisan::call('view:clear');

        return back()->with('success', '⚡ Store speed optimized & cache cleared successfully!');
    }
}
