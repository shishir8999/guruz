<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Shop;
use App\Models\SiteSetting;
use App\Models\VisitorLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PublicFeedController extends Controller
{
    /**
     * Get Live Visitors Count
     * Supports both 'virtual' (dynamic natural simulation) and 'real' (actual DB tracking).
     */
    public function getLiveVisitors(): JsonResponse
    {
        $mode = SiteSetting::get('live_visitor_mode', 'virtual'); // 'virtual' | 'real'
        $minCount = (int) SiteSetting::get('live_visitor_min_count', 250);
        $maxCount = (int) SiteSetting::get('live_visitor_max_count', 500);
        $baseCount = (int) SiteSetting::get('live_visitor_base_count', ($minCount + $maxCount) / 2);

        if ($mode === 'real') {
            // Count distinct visitors active within the last 5 minutes
            $realCount = VisitorLog::where('created_at', '>=', now()->subMinutes(5))
                ->distinct('ip_address')
                ->count('ip_address');

            $count = max(1, $realCount);
        } else {
            // Virtual natural fluctuation within the admin-defined min-max range
            $min = min($minCount, $maxCount);
            $max = max($minCount, $maxCount);

            if ($min === $max) {
                $count = $min;
            } else {
                $minuteSeed = (int) (time() / 15);
                srand($minuteSeed);
                $count = rand($min, $max);
            }
        }

        return response()->json([
            'success' => true,
            'mode'    => $mode,
            'min'     => $minCount,
            'max'     => $maxCount,
            'count'   => $count,
        ]);
    }

    /**
     * Get Recent Purchases Social Proof Feed
     * Returns recent customer purchases containing:
     * - Customer Name & City
     * - Shop Name
     * - Product Name & Image & Link
     * - Time Ago in Bengali
     */
    public function getRecentPurchases(): JsonResponse
    {
        $purchases = Cache::remember('public_recent_purchases_feed', 60, function () {
            $feed = [];

            // 1. Fetch latest real order items from DB
            $realOrderItems = OrderItem::with(['order', 'product.shop', 'product.images'])
                ->whereHas('order')
                ->whereHas('product')
                ->latest()
                ->take(15)
                ->get();

            foreach ($realOrderItems as $item) {
                if (!$item->product) continue;

                $order = $item->order;
                $product = $item->product;
                $shopName = $product->shop->name ?? $product->shop_name ?? 'Spark Cables';
                $customerName = $order->customer_name ?? 'সম্মানিত গ্রাহক';
                $city = $order->shipping_city ?? 'ঢাকা';

                $timeAgo = $order->created_at ? $this->formatBengaliTimeAgo($order->created_at) : 'কিছু সময় পূর্বে';

                $feed[] = [
                    'id'            => 'real_' . $item->id,
                    'customer_name' => $customerName,
                    'city'          => $city,
                    'shop_name'     => $shopName,
                    'product_name'  => $product->name,
                    'product_image' => $this->resolveProductImage($product),
                    'product_url'   => '/product/' . ($product->slug ?? $product->id),
                    'time_ago'      => $timeAgo,
                    'is_real'       => true,
                ];
            }

            // 2. If real orders are few, enrich with authentic catalog products & registered shops
            if (count($feed) < 10) {
                $sampleCustomers = [
                    ['name' => 'করিম আহমেদ', 'city' => 'ঢাকা'],
                    ['name' => 'তানভীর রহমান', 'city' => 'চট্টগ্রাম'],
                    ['name' => 'শফিকুল ইসলাম', 'city' => 'সিলেট'],
                    ['name' => 'মেহেদী হাসান', 'city' => 'রাজশাহী'],
                    ['name' => 'আরিফুল হক', 'city' => 'খুলনা'],
                    ['name' => 'ফারহানা ইয়াসমিন', 'city' => 'কুমিল্লা'],
                    ['name' => 'রাকিবুল হাসান', 'city' => 'বরিশাল'],
                    ['name' => 'সাদিয়া সুলতানা', 'city' => 'বগুড়া'],
                    ['name' => 'কামরুল হাসান', 'city' => 'রংপুর'],
                    ['name' => 'আফরোজা বেগম', 'city' => 'ময়মনসিংহ'],
                    ['name' => 'মাহমুদ আলম', 'city' => 'নারায়ণগঞ্জ'],
                    ['name' => 'নাসরিন আক্তার', 'city' => 'গাজীপুর'],
                ];

                $catalogProducts = Product::with(['shop', 'images'])->where('is_active', true)->latest()->take(15)->get();
                $allShops = Shop::where('is_active', true)->pluck('name')->toArray();
                if (empty($allShops)) {
                    $allShops = ['Spark Cables', 'Guruz BD Official', 'Cable World', 'Power Tech BD'];
                }

                $timeOptions = [
                    '১ মিনিট পূর্বে', '২ মিনিট পূর্বে', '৩ মিনিট পূর্বে', '৪ মিনিট পূর্বে',
                    '৫ মিনিট পূর্বে', '৭ মিনিট পূর্বে', '১০ মিনিট পূর্বে', '১২ মিনিট পূর্বে', '১৫ মিনিট পূর্বে'
                ];

                $idx = 0;
                foreach ($catalogProducts as $prod) {
                    $cust = $sampleCustomers[$idx % count($sampleCustomers)];
                    $shopName = $prod->shop->name ?? $allShops[$idx % count($allShops)];
                    $time = $timeOptions[$idx % count($timeOptions)];

                    $feed[] = [
                        'id'            => 'catalog_' . $prod->id,
                        'customer_name' => $cust['name'],
                        'city'          => $cust['city'],
                        'shop_name'     => $shopName,
                        'product_name'  => $prod->name,
                        'product_image' => $this->resolveProductImage($prod),
                        'product_url'   => '/product/' . ($prod->slug ?? $prod->id),
                        'time_ago'      => $time,
                        'is_real'       => false,
                    ];
                    $idx++;
                }
            }

            return $feed;
        });

        return response()->json([
            'success' => true,
            'data'    => $purchases,
        ]);
    }

    /**
     * Resolve product image reliably
     */
    private function resolveProductImage(?Product $product): ?string
    {
        if (!$product) return null;

        // 1. primary_image_url
        if (!empty($product->primary_image_url)) {
            $url = trim($product->primary_image_url);
            if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://') || str_starts_with($url, '/')) {
                return $url;
            }
            return '/storage/' . ltrim($url, '/');
        }

        // 2. product images relationship (ProductImage)
        $firstImg = $product->relationLoaded('images')
            ? $product->images->first()
            : $product->images()->first();
        if ($firstImg && !empty($firstImg->url)) {
            $url = trim($firstImg->url);
            if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://') || str_starts_with($url, '/')) {
                return $url;
            }
            return '/storage/' . ltrim($url, '/');
        }

        // 3. thumbnail / image attributes if exist
        foreach (['thumbnail', 'image', 'photo'] as $attr) {
            if (!empty($product->$attr)) {
                $url = trim($product->$attr);
                if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://') || str_starts_with($url, '/')) {
                    return $url;
                }
                return '/storage/' . ltrim($url, '/');
            }
        }

        // 4. Shop logo fallback
        if ($product->shop) {
            $shopLogo = $product->shop->logo_url ?? $product->shop->logo ?? null;
            if (!empty($shopLogo)) {
                $url = trim($shopLogo);
                if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://') || str_starts_with($url, '/')) {
                    return $url;
                }
                return '/' . ltrim($url, '/');
            }
        }

        return null;
    }

    private function formatBengaliTimeAgo($datetime): string
    {
        $diffMinutes = max(1, (int) now()->diffInMinutes($datetime));

        if ($diffMinutes < 60) {
            return $this->enToBnNumber($diffMinutes) . ' মিনিট পূর্বে';
        }

        $diffHours = (int) now()->diffInHours($datetime);
        if ($diffHours < 24) {
            return $this->enToBnNumber($diffHours) . ' ঘণ্টা পূর্বে';
        }

        $diffDays = (int) now()->diffInDays($datetime);
        return $this->enToBnNumber($diffDays) . ' দিন পূর্বে';
    }

    private function enToBnNumber($number): string
    {
        $en = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        $bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return str_replace($en, $bn, (string) $number);
    }
}

