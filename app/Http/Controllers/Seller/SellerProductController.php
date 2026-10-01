<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PayoutRequest;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\SellerWallet;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\StorageHelper;
use App\Services\ImageProcessingService;

class SellerProductController extends Controller
{
    private function getShop(): Shop
    {
        $user = auth()->user();
        $shop = Shop::where('user_id', $user->id)->first();

        if (!$shop) {
            $isAdmin = in_array($user->role ?? '', ['admin', 'super_admin', 'superadmin']) || ($user->hasRole && $user->hasRole('admin'));
            $shop = Shop::create([
                'user_id' => $user->id,
                'name'    => ($user->name ?? 'Vendor') . "'s Shop",
                'slug'    => \Illuminate\Support\Str::slug(($user->name ?? 'Vendor') . "-shop-" . $user->id),
                'status'  => $isAdmin ? 'active' : 'pending',
            ]);
        }

        return $shop;
    }

    // ─── Products List ────────────────────────────────

    public function index(Request $request): Response
    {
        $shop = $this->getShop();

        $query = Product::with(['category:id,name'])
            ->where('shop_id', $shop->id);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('sku', 'like', "%{$s}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'out_of_stock') {
                $query->where('stock_quantity', '<=', 0);
            } elseif ($request->status === 'draft' || $request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $totalProducts  = Product::where('shop_id', $shop->id)->count();
        $activeListings = Product::where('shop_id', $shop->id)->where('is_active', true)->count();
        $outOfStock     = Product::where('shop_id', $shop->id)->where('stock_quantity', '<=', 0)->count();

        $products   = $query->latest()->paginate(20)->withQueryString();
        $categories = Category::orderBy('display_order')->get(['id', 'name']);

        return Inertia::render('Seller/Products/Index', [
            'products'   => $products,
            'stats'      => [
                'total_products'  => $totalProducts,
                'active_listings' => $activeListings,
                'out_of_stock'    => $outOfStock,
            ],
            'categories' => $categories,
            'shop'       => $shop,
            'filters'    => $request->only(['search', 'status']),
        ]);
    }

    // ─── Create Product Form ──────────────────────────

    public function create()
    {
        $shop = $this->getShop();
        if ($shop->status === 'pending') {
            $shop->update(['status' => 'active']);
        }

        $categories = Category::orderBy('display_order')->get(['id', 'name']);
        $brands = \App\Models\Brand::orderBy('name')->get(['id', 'name']);
        $units = \App\Models\Unit::orderBy('name')->get(['id', 'name']);
        
        $attributes = \App\Models\ProductAttribute::where(function($q) use ($shop) {
            $q->whereNull('shop_id')->orWhere('shop_id', $shop->id);
        })->whereNull('product_id')->get();

        return Inertia::render('Seller/Products/Create', [
            'categories' => $categories,
            'brands'     => $brands,
            'units'      => $units,
            'attributes' => $attributes,
        ]);
    }

    // ─── Store New Product ────────────────────────────

    public function store(Request $request)
    {
        $shop = $this->getShop();
        $shop->loadMissing('kyc');
        $user = auth()->user();

        $isKycApproved = ($shop->kyc && strtolower($shop->kyc->status) === 'approved')
            || in_array($user->role ?? '', ['admin', 'super_admin', 'superadmin'])
            || ($user->hasRole && $user->hasRole('admin'));

        $data = $request->validate([
            'name'               => 'required|string|max:255',
            'description'        => 'nullable|string',
            'specification'      => 'nullable|string',
            'price'              => 'required|numeric|min:0',
            'sale_price'         => 'nullable|numeric|min:0',
            'purchase_price'     => 'nullable|numeric|min:0',
            'stock_quantity'     => 'required|integer|min:0',
            'sku'                => 'nullable|string|max:255',
            'category_id'        => 'nullable|exists:categories,id',
            'brand_id'           => 'nullable|exists:brands,id',
            'unit_id'            => 'nullable|exists:units,id',
            'weight'             => 'nullable|numeric|min:0',
            'warranty'           => 'nullable|string',
            'video_url'          => 'nullable|string',
            'meta_title'         => 'nullable|string',
            'meta_description'   => 'nullable|string',
            'is_retail'          => 'boolean',
            'is_wholesale'       => 'boolean',
            'is_active'          => 'boolean',
            'is_featured'        => 'boolean',
            'colors'             => 'nullable|array',
            'sizes'              => 'nullable|array',
            'materials'          => 'nullable|array',
            'tags'               => 'nullable|array',
            'images'             => 'nullable|array|max:10',
            'images.*'           => 'file|image|max:2048',
            'main_image'         => 'nullable|file|image|max:2048',
            'product_attributes' => 'nullable|array',
            'product_attributes.*.name' => 'required|string',
            'product_attributes.*.values' => 'required|string',
        ]);

        $slug = Str::slug($data['name']) . '-' . Str::random(6);
        
        $unitName = null;
        if (!empty($data['unit_id'])) {
            $unitName = \App\Models\Unit::find($data['unit_id'])?->name;
        }

        $formattedAttributes = [];
        if (!empty($data['product_attributes'])) {
            foreach ($data['product_attributes'] as $attr) {
                $formattedAttributes[] = [
                    'name' => $attr['name'],
                    'values' => array_map('trim', explode(',', $attr['values']))
                ];
            }
        }

        $product = Product::create([
            'shop_id'          => $shop->id,
            'slug'             => $slug,
            'name'             => $data['name'],
            'sku'              => $data['sku'] ?? null,
            'description'      => $data['description'] ?? '',
            'specification'    => $data['specification'] ?? '',
            'price'            => $data['price'],
            'sale_price'       => $data['sale_price'] ?? null,
            'purchase_price'   => $data['purchase_price'] ?? null,
            'stock_quantity'   => $data['stock_quantity'],
            'category_id'      => $data['category_id'] ?? null,
            'brand_id'         => $data['brand_id'] ?? null,
            'unit'             => $unitName,
            'weight'           => $data['weight'] ?? null,
            'warranty_type'    => $data['warranty'] ?? null,
            'video_url'        => $data['video_url'] ?? null,
            'meta_title'       => $data['meta_title'] ?? null,
            'meta_description' => $data['meta_description'] ?? null,
            'is_retail'        => $data['is_retail'] ?? true,
            'is_wholesale'     => $data['is_wholesale'] ?? false,
            'colors'           => $data['colors'] ?? [],
            'sizes'            => $data['sizes'] ?? [],
            'materials'        => $data['materials'] ?? [],
            'tags'             => $data['tags'] ?? [],
            'attributes'       => json_encode($formattedAttributes),
            'is_active'        => $isKycApproved ? ($data['is_active'] ?? true) : false,
            'status'           => ($isKycApproved && ($data['is_active'] ?? true)) ? 'published' : 'draft',
            'is_featured'      => $data['is_featured'] ?? false,
        ]);

        // Upload main image
        if ($request->hasFile('main_image')) {
            $url = $this->processAndStoreImage($request->file('main_image'));
            $product->update(['primary_image_url' => $url]);
        }

        // Upload gallery images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $i => $file) {
                $url = $this->processAndStoreImage($file);
                ProductImage::create([
                    'product_id' => $product->id,
                    'url'        => $url,
                    'sort_order' => $i,
                    'is_primary' => false,
                ]);
            }
        }

        // Notify all followers of this shop with a single bulk insert
        try {
            $followers = \App\Models\ShopFollower::where('shop_id', $shop->id)->pluck('user_id');
            $notifications = [];
            $now = now();
            foreach ($followers as $followerId) {
                $notifications[] = [
                    'user_id'    => $followerId,
                    'type'       => 'new_product',
                    'title'      => "নতুন পণ্য যুক্ত হয়েছে: {$product->name}",
                    'body'       => "আপনার প্রিয় শপ \"{$shop->name}\" একটি নতুন পণ্য যুক্ত করেছে!",
                    'link'       => "/products/{$product->slug}",
                    'icon'       => '🛍️',
                    'is_read'    => false,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            if (!empty($notifications)) {
                \App\Models\Notification::insert($notifications);
            }
        } catch (\Throwable $e) {}

        if (!$isKycApproved) {
            return redirect()->route('seller.products.index')->with('warning', 'পণ্যটি ড্রাফট হিসেবে সেভ হয়েছে। আপনার শপের কেওয়াইসি (KYC) সুপার অ্যাডমিন দ্বারা ভেরিফাই ও অ্যাপ্রুভ না হওয়া পর্যন্ত পণ্যটি পাবলিক হবে না।');
        }

        return redirect()->route('seller.products.index')->with('success', 'পণ্য সফলভাবে প্রকাশ করা হয়েছে!');
    }

    // ─── Edit Product Form ────────────────────────────

    public function edit(Product $product): Response
    {
        $user = auth()->user();
        $shop = $this->getShop();
        if ($user->role !== 'admin' && $user->role !== 'superadmin') {
            abort_if($product->shop_id !== $shop->id, 403);
        }

        $product->load('images');
        $categories = Category::orderBy('display_order')->get(['id', 'name']);
        $brands = \App\Models\Brand::orderBy('name')->get(['id', 'name']);
        $units = \App\Models\Unit::orderBy('name')->get(['id', 'name']);
        if (!empty($product->unit) && empty($product->unit_id)) {
            $matchedUnit = $units->first(function ($u) use ($product) {
                return strtolower(trim($u->name)) === strtolower(trim($product->unit));
            });
            if ($matchedUnit) {
                $product->unit_id = $matchedUnit->id;
            }
        }

        $attributes = \App\Models\ProductAttribute::where(function($q) use ($shop) {
            $q->whereNull('shop_id')->orWhere('shop_id', $shop->id);
        })->whereNull('product_id')->get();

        return Inertia::render('Seller/Products/Edit', [
            'product'    => $product,
            'categories' => $categories,
            'brands'     => $brands,
            'units'      => $units,
            'attributes' => $attributes,
        ]);
    }

    // ─── Update Product ───────────────────────────────

    public function update(Request $request, Product $product)
    {
        $user = auth()->user();
        $shop = $this->getShop();
        if ($user->role !== 'admin' && $user->role !== 'superadmin') {
            abort_if($product->shop_id !== $shop->id, 403);
        }

        $shop->loadMissing('kyc');
        $isKycApproved = ($shop->kyc && strtolower($shop->kyc->status) === 'approved')
            || in_array($user->role ?? '', ['admin', 'super_admin', 'superadmin'])
            || ($user->hasRole && $user->hasRole('admin'));

        // Quick toggle status handling
        if ($request->has('is_active') && !$request->has('name')) {
            if (!$isKycApproved && $request->is_active) {
                return back()->with('error', 'আপনার কেওয়াইসি (KYC) এখনও অ্যাপ্রুভ হয়নি। কেওয়াইসি ভেরিফিকেশন সম্পন্ন ও অ্যাপ্রুভ হওয়ার পূর্বে পণ্য অ্যাক্টিভ/পাবলিক করা যাবে না।');
            }

            $product->update([
                'is_active' => (bool)$request->is_active,
                'status'    => $request->is_active ? 'published' : 'draft',
            ]);
            return back()->with('success', 'Product status updated!');
        }

        $data = $request->validate([
            'name'               => 'required|string|max:255',
            'description'        => 'nullable|string',
            'specification'      => 'nullable|string',
            'price'              => 'required|numeric|min:0',
            'sale_price'         => 'nullable|numeric|min:0',
            'purchase_price'     => 'nullable|numeric|min:0',
            'stock'              => 'nullable|integer|min:0',
            'stock_quantity'     => 'nullable|integer|min:0',
            'sku'                => 'nullable|string|max:255',
            'category_id'        => 'nullable|exists:categories,id',
            'brand_id'           => 'nullable|exists:brands,id',
            'unit_id'            => 'nullable|exists:units,id',
            'weight'             => 'nullable|numeric|min:0',
            'warranty'           => 'nullable|string',
            'video_url'          => 'nullable|string',
            'meta_title'         => 'nullable|string',
            'meta_description'   => 'nullable|string',
            'is_retail'          => 'nullable|boolean',
            'is_wholesale'       => 'nullable|boolean',
            'is_active'          => 'nullable|boolean',
            'is_featured'        => 'nullable|boolean',
            'colors'             => 'nullable|array',
            'sizes'              => 'nullable|array',
            'materials'          => 'nullable|array',
            'tags'               => 'nullable|array',
            'main_image'         => 'nullable|file|image|max:2048',
            'images'             => 'nullable|array|max:10',
            'images.*'           => 'file|image|max:2048',
        ]);

        $stock = $data['stock_quantity'] ?? $data['stock'] ?? $product->stock_quantity;

        $unitName = $product->unit;
        if (!empty($data['unit_id'])) {
            $unitName = \App\Models\Unit::find($data['unit_id'])?->name ?? $product->unit;
        }

        $product->update([
            'name'             => $data['name'],
            'description'      => $data['description'] ?? '',
            'specification'    => $data['specification'] ?? '',
            'price'            => $data['price'],
            'sale_price'       => $data['sale_price'] ?? null,
            'purchase_price'   => $data['purchase_price'] ?? null,
            'stock_quantity'   => $stock,
            'sku'              => $data['sku'] ?? $product->sku,
            'category_id'      => $data['category_id'] ?? null,
            'brand_id'         => $data['brand_id'] ?? null,
            'unit'             => $unitName,
            'weight'           => $data['weight'] ?? null,
            'warranty_type'    => array_key_exists('warranty', $data) ? $data['warranty'] : $product->warranty_type,
            'video_url'        => $data['video_url'] ?? null,
            'meta_title'       => $data['meta_title'] ?? null,
            'meta_description' => $data['meta_description'] ?? null,
            'is_retail'        => $data['is_retail'] ?? true,
            'is_wholesale'     => $data['is_wholesale'] ?? false,
            'colors'           => $data['colors'] ?? $product->colors ?? [],
            'sizes'            => $data['sizes'] ?? $product->sizes ?? [],
            'materials'        => $data['materials'] ?? $product->materials ?? [],
            'tags'             => $data['tags'] ?? $product->tags ?? [],
            'is_active'        => $isKycApproved ? ($data['is_active'] ?? true) : false,
            'status'           => ($isKycApproved && ($data['is_active'] ?? true)) ? 'published' : 'draft',
            'is_featured'      => $data['is_featured'] ?? false,
        ]);

        if ($request->hasFile('main_image')) {
            $url = $this->processAndStoreImage($request->file('main_image'));
            $product->update(['primary_image_url' => $url]);
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $i => $file) {
                $url = $this->processAndStoreImage($file);
                ProductImage::create([
                    'product_id' => $product->id,
                    'url'        => $url,
                    'sort_order' => $i,
                    'is_primary' => false,
                ]);
            }
        }

        if (!$isKycApproved && ($data['is_active'] ?? true)) {
            return redirect()->route('seller.products.index')->with('warning', 'পণ্য আপডেট হয়েছে, তবে কেওয়াইসি পেন্ডিং থাকায় পণ্যটি ড্রাফট মোডে রাখা হয়েছে। কেওয়াইসি অ্যাপ্রুভ হলে এটি স্বয়ংক্রিয়ভাবে পাবলিক হবে।');
        }

        return redirect()->route('seller.products.index')->with('success', 'পণ্য সফলভাবে আপডেট করা হয়েছে!');
    }

    // ─── Delete Product ───────────────────────────────

    public function destroy(Product $product)
    {
        $user = auth()->user();
        $shop = $this->getShop();
        if ($user->role !== 'admin' && $user->role !== 'superadmin') {
            abort_if($product->shop_id !== $shop->id, 403);
        }

        $product->delete();
        return back()->with('success', 'Product deleted successfully!');
    }

    private function processAndStoreImage($file, string $folder = 'products'): string
    {
        return ImageProcessingService::processProductImage($file, $folder);
    }
}
