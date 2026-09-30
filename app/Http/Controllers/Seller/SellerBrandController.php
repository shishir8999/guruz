<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Str;

class SellerBrandController extends Controller
{
    private function ensureColumnsExist()
    {
        try {
            if (Schema::hasTable('brands')) {
                if (!Schema::hasColumn('brands', 'is_active')) {
                    Schema::table('brands', function (Blueprint $table) {
                        $table->boolean('is_active')->default(true)->after('is_featured');
                    });
                }
            }
        } catch (\Throwable $e) {
            // ignore
        }
    }

    public function index(Request $request)
    {
        $this->ensureColumnsExist();

        $user = Auth::user();
        $shop = $user ? $user->shop : null;

        if ($user && !$shop) {
            $shop = \App\Models\Shop::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'name'        => ($user->name ?? 'Vendor') . "'s Shop",
                    'slug'        => \Illuminate\Support\Str::slug(($user->name ?? 'Vendor') . "-shop-" . $user->id),
                    'status'      => 'active',
                    'is_approved' => true,
                ]
            );
        }

        $shopId = $shop ? $shop->id : null;

        $query = Brand::query();
        if ($shopId) {
            $query->where(function($q) use ($shopId) {
                $q->whereNull('shop_id')->orWhere('shop_id', $shopId);
            });
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $brands = $query->latest()->get();

        return Inertia::render('Seller/Products/Brand', [
            'brands' => $brands
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureColumnsExist();

        $user = Auth::user();
        $shop = $user ? $user->shop : null;
        $shopId = $shop ? $shop->id : null;

        $request->validate([
            'name'        => 'required|string|max:255',
            'is_featured' => 'boolean',
            'is_active'   => 'boolean',
            'logo'        => 'nullable|image|max:10240',
            'logo_url'    => 'nullable|string'
        ]);

        $logoUrl = $request->logo_url;
        if ($request->hasFile('logo')) {
            $path = \App\Services\StorageHelper::storePublicly($request->file('logo'), 'brands');
            $logoUrl = '/storage/' . $path;
        }

        Brand::create([
            'shop_id'     => $shopId,
            'name'        => $request->name,
            'slug'        => Str::slug($request->name) . '-' . uniqid(),
            'is_featured' => $request->is_featured ?? false,
            'is_active'   => $request->is_active ?? true,
            'logo_url'    => $logoUrl
        ]);

        return redirect()->back()->with('success', 'Brand added successfully');
    }

    public function update(Request $request, $id)
    {
        $this->ensureColumnsExist();

        $brand = Brand::findOrFail($id);

        $request->validate([
            'name'        => 'nullable|string|max:255',
            'is_featured' => 'nullable|boolean',
            'is_active'   => 'nullable|boolean',
            'logo'        => 'nullable|image|max:10240',
            'logo_url'    => 'nullable|string'
        ]);

        if ($request->has('name') && $request->filled('name')) {
            $brand->name = $request->name;
            $brand->slug = Str::slug($request->name);
        }
        if ($request->has('is_featured')) {
            $brand->is_featured = (bool) $request->is_featured;
        }
        if ($request->has('is_active')) {
            $brand->is_active = (bool) $request->is_active;
        }
        if ($request->hasFile('logo')) {
            if ($brand->logo_url && str_contains($brand->logo_url, '/storage/')) {
                \App\Services\StorageHelper::deletePublicly($brand->logo_url);
            }
            $path = \App\Services\StorageHelper::storePublicly($request->file('logo'), 'brands');
            $brand->logo_url = '/storage/' . $path;
        } elseif ($request->filled('logo_url')) {
            $brand->logo_url = $request->logo_url;
        }

        $brand->save();

        return redirect()->back()->with('success', 'Brand updated successfully');
    }

    public function bulkUpdate(Request $request)
    {
        $this->ensureColumnsExist();

        $request->validate([
            'brands'               => 'required|array',
            'brands.*.id'          => 'required|exists:brands,id',
            'brands.*.name'        => 'required|string|max:255',
            'brands.*.is_featured' => 'boolean',
            'brands.*.is_active'   => 'boolean',
        ]);

        $brandsData = $request->input('brands');

        foreach ($brandsData as $brandData) {
            $brand = Brand::find($brandData['id']);
            if ($brand) {
                $brand->update([
                    'name'        => $brandData['name'],
                    'slug'        => Str::slug($brandData['name']),
                    'is_featured' => $brandData['is_featured'] ?? false,
                    'is_active'   => $brandData['is_active'] ?? true,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Brands updated successfully');
    }

    public function destroy($id)
    {
        $brand = Brand::find($id);
        if ($brand) {
            $brand->delete();
        }
        return redirect()->back()->with('success', 'Brand deleted successfully');
    }
}
