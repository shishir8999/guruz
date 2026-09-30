<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Shop;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

use App\Services\StorageHelper;
use App\Services\ImageProcessingService;

class AdminProductController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'description'    => 'nullable|string',
            'price'          => 'required|numeric|min:0',
            'sale_price'     => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'sku'            => 'nullable|string|max:255|unique:products,sku',
            'shop_id'        => 'nullable|exists:shops,id',
            'category_id'    => 'nullable|exists:categories,id',
            'brand_id'       => 'nullable|exists:brands,id',
            'min_vip_level'  => 'nullable|string|in:beginner,bronze,silver,gold,platinum,diamond',
            'is_flash_sale'  => 'nullable|boolean',
            'is_featured'    => 'nullable|boolean',
            'primary_image'  => 'nullable|image|max:10240',
            'gallery.*'      => 'nullable|image|max:10240',
            'warranty'       => 'nullable|string',
        ]);

        $slug = Str::slug($data['name']) . '-' . Str::random(6);

        if (empty($data['shop_id'])) {
            $shop = Shop::first();
            if ($shop) {
                $data['shop_id'] = $shop->id;
            }
        }

        $product = Product::create([
            'shop_id'        => $data['shop_id'],
            'category_id'    => $data['category_id'] ?? null,
            'brand_id'       => $data['brand_id'] ?? null,
            'name'           => $data['name'],
            'slug'           => $slug,
            'sku'            => $data['sku'] ?? ('SKU-' . strtoupper(Str::random(8))),
            'description'    => $data['description'] ?? '',
            'price'          => $data['price'],
            'sale_price'     => $data['sale_price'] ?? null,
            'stock_quantity' => $data['stock_quantity'],
            'warranty_type'  => $request->input('warranty') ?? null,
            'is_active'      => true,
            'is_featured'    => $request->boolean('is_featured'),
            'is_flash_sale'  => $request->boolean('is_flash_sale'),
            'min_vip_level'  => $data['min_vip_level'] ?? null,
        ]);

        if ($request->hasFile('primary_image')) {
            $url = ImageProcessingService::processProductImage($request->file('primary_image'), 'products');
            $product->update(['primary_image_url' => $url]);
        }

        if ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $index => $file) {
                $url = ImageProcessingService::processProductImage($file, 'products/gallery');
                ProductImage::create([
                    'product_id' => $product->id,
                    'url'        => $url,
                    'sort_order' => $index,
                ]);
            }
        }

        // Guruz Special assignment
        if ($request->boolean('is_guruz_special')) {
            $specialIds = json_decode(\App\Models\SiteSetting::get('guruz_special_products', '[]'), true) ?: [];
            if (!in_array($product->id, $specialIds)) {
                $specialIds[] = $product->id;
                \App\Models\SiteSetting::set('guruz_special_products', json_encode(array_values(array_unique($specialIds))));
                \Illuminate\Support\Facades\Cache::forget('home_guruz_special_products');
            }
        }

        return redirect()->route('admin.products')->with('success', 'Product created successfully!');
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'description'    => 'nullable|string',
            'price'          => 'required|numeric|min:0',
            'sale_price'     => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'sku'            => 'nullable|string|max:255|unique:products,sku,' . $product->id,
            'shop_id'        => 'nullable|exists:shops,id',
            'category_id'    => 'nullable|exists:categories,id',
            'brand_id'       => 'nullable|exists:brands,id',
            'min_vip_level'  => 'nullable|string|in:beginner,bronze,silver,gold,platinum,diamond',
            'is_flash_sale'  => 'nullable|boolean',
            'is_featured'    => 'nullable|boolean',
            'primary_image'  => 'nullable|image|max:10240',
            'gallery.*'      => 'nullable|image|max:10240',
            'deleted_gallery_ids' => 'nullable|array',
            'remove_primary_image' => 'nullable|boolean',
            'is_guruz_special' => 'nullable|boolean',
            'warranty'       => 'nullable|string',
        ]);

        $slug = Str::slug($data['name']) . '-' . Str::random(6);

        if (empty($data['shop_id'])) {
            $shop = Shop::first();
            if ($shop) {
                $data['shop_id'] = $shop->id;
            }
        }

        $product->update([
            'shop_id'        => $data['shop_id'],
            'category_id'    => $data['category_id'] ?? null,
            'brand_id'       => $data['brand_id'] ?? null,
            'name'           => $data['name'],
            'sku'            => $data['sku'] ?? $product->sku,
            'description'    => $data['description'] ?? '',
            'price'          => $data['price'],
            'sale_price'     => $data['sale_price'] ?? null,
            'stock_quantity' => $data['stock_quantity'],
            'warranty_type'  => $request->has('warranty') ? $request->input('warranty') : $product->warranty_type,
            'min_vip_level'  => $data['min_vip_level'] ?? null,
            'is_featured'    => $request->has('is_featured') ? $request->boolean('is_featured') : $product->is_featured,
            'is_flash_sale'  => $request->has('is_flash_sale') ? $request->boolean('is_flash_sale') : $product->is_flash_sale,
        ]);

        // Primary Image Handling (Upload new or Remove existing)
        if ($request->hasFile('primary_image')) {
            if ($product->primary_image_url) {
                StorageHelper::deletePublicly($product->primary_image_url);
            }
            $url = ImageProcessingService::processProductImage($request->file('primary_image'), 'products');
            $product->update(['primary_image_url' => $url]);
        } elseif ($request->boolean('remove_primary_image')) {
            if ($product->primary_image_url) {
                StorageHelper::deletePublicly($product->primary_image_url);
            }
            $product->update(['primary_image_url' => null]);
        }

        // Deleted Gallery Images Handling
        $deletedGalleryIds = $request->input('deleted_gallery_ids', []);
        if (is_array($deletedGalleryIds) && count($deletedGalleryIds) > 0) {
            $imagesToDelete = ProductImage::where('product_id', $product->id)->whereIn('id', $deletedGalleryIds)->get();
            foreach ($imagesToDelete as $img) {
                StorageHelper::deletePublicly($img->url);
                $img->delete();
            }
        }

        // New Gallery Images Upload
        if ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $index => $file) {
                $url = ImageProcessingService::processProductImage($file, 'products/gallery');
                ProductImage::create([
                    'product_id' => $product->id,
                    'url'        => $url,
                    'sort_order' => $product->images()->count() + $index,
                ]);
            }
        }

        // Guruz Special Sync
        if ($request->has('is_guruz_special')) {
            $specialIds = json_decode(\App\Models\SiteSetting::get('guruz_special_products', '[]'), true) ?: [];
            $isSpecial = $request->boolean('is_guruz_special');
            if ($isSpecial && !in_array($product->id, $specialIds)) {
                $specialIds[] = $product->id;
            } elseif (!$isSpecial && in_array($product->id, $specialIds)) {
                $specialIds = array_diff($specialIds, [$product->id]);
            }
            \App\Models\SiteSetting::set('guruz_special_products', json_encode(array_values(array_unique($specialIds))));
            \Illuminate\Support\Facades\Cache::forget('home_guruz_special_products');
        }

        return redirect()->route('admin.products')->with('success', 'Product updated successfully.');
    }

    public function toggleGuruzSpecial(Product $product)
    {
        $specialIds = json_decode(\App\Models\SiteSetting::get('guruz_special_products', '[]'), true) ?: [];
        $key = array_search($product->id, $specialIds);

        if ($key !== false) {
            unset($specialIds[$key]);
            $isAdded = false;
        } else {
            $specialIds[] = $product->id;
            $isAdded = true;
        }

        \App\Models\SiteSetting::set('guruz_special_products', json_encode(array_values(array_unique($specialIds))));
        \Illuminate\Support\Facades\Cache::forget('home_guruz_special_products');

        $msg = $isAdded 
            ? "«{$product->name}» গুরুজ স্পেশাল সেকশনে যুক্ত করা হয়েছে।" 
            : "«{$product->name}» গুরুজ স্পেশাল থেকে সরানো হয়েছে।";

        return back()->with('success', $msg);
    }

    public function destroy(Product $product)
    {
        $name = $product->name;
        $product->delete();

        return back()->with('success', "{$name} deleted successfully.");
    }
}
