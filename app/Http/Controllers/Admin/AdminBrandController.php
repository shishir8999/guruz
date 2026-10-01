<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Services\StorageHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminBrandController extends Controller
{
    public function index()
    {
        StorageHelper::syncAll();

        return Inertia::render('Admin/BrandsPage', [
            'brands' => Brand::latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'slug'        => 'nullable|string|max:150',
            'logo'        => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'logo_url'    => 'nullable|string|max:500',
            'is_featured' => 'nullable|boolean',
            'is_active'   => 'nullable|boolean',
        ]);

        if ($request->hasFile('logo')) {
            $path = StorageHelper::storePublicly($request->file('logo'), 'brands');
            $data['logo_url'] = '/storage/' . $path;
        } elseif (!empty($data['logo_url'])) {
            $url = trim($data['logo_url']);
            if (!str_starts_with($url, 'http://') && !str_starts_with($url, 'https://')) {
                if (str_starts_with($url, 'brands/')) {
                    $url = '/storage/' . $url;
                } elseif (str_starts_with($url, 'storage/')) {
                    $url = '/' . $url;
                } elseif (!str_starts_with($url, '/')) {
                    $url = '/' . $url;
                }
            }
            $data['logo_url'] = $url;
        }

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']) . '-' . Str::random(4);
        } else {
            $data['slug'] = Str::slug($data['slug']);
        }

        if (isset($data['is_featured'])) {
            $data['is_active'] = $data['is_featured'];
        } elseif (isset($data['is_active'])) {
            $data['is_featured'] = $data['is_active'];
        } else {
            $data['is_featured'] = true;
            $data['is_active'] = true;
        }

        Brand::create($data);
        \Illuminate\Support\Facades\Cache::forget('home_brands');
        \Illuminate\Support\Facades\Cache::forget('all_brands');

        return back()->with('success', 'Brand created.');
    }

    public function update(Request $request, Brand $brand)
    {
        if ($request->has('_toggle')) {
            $newVal = !($brand->is_featured || $brand->is_active);
            $brand->update([
                'is_featured' => $newVal,
                'is_active'   => $newVal,
            ]);
            \Illuminate\Support\Facades\Cache::forget('home_brands');
            \Illuminate\Support\Facades\Cache::forget('all_brands');
            return back()->with('success', 'Brand status updated.');
        }

        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'slug'        => 'nullable|string|max:150',
            'logo'        => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'logo_url'    => 'nullable|string|max:500',
            'is_featured' => 'nullable|boolean',
            'is_active'   => 'nullable|boolean',
        ]);

        if ($request->hasFile('logo')) {
            StorageHelper::deletePublicly($brand->logo_url);
            $path = StorageHelper::storePublicly($request->file('logo'), 'brands');
            $data['logo_url'] = '/storage/' . $path;
        } elseif (!empty($data['logo_url'])) {
            $url = trim($data['logo_url']);
            if (!str_starts_with($url, 'http://') && !str_starts_with($url, 'https://')) {
                if (str_starts_with($url, 'brands/')) {
                    $url = '/storage/' . $url;
                } elseif (str_starts_with($url, 'storage/')) {
                    $url = '/' . $url;
                } elseif (!str_starts_with($url, '/')) {
                    $url = '/' . $url;
                }
            }
            $data['logo_url'] = $url;
        }

        if (!empty($data['slug'])) {
            $data['slug'] = Str::slug($data['slug']);
        }

        if (isset($data['is_featured'])) {
            $data['is_active'] = $data['is_featured'];
        } elseif (isset($data['is_active'])) {
            $data['is_featured'] = $data['is_active'];
        }

        $brand->update($data);
        \Illuminate\Support\Facades\Cache::forget('home_brands');
        \Illuminate\Support\Facades\Cache::forget('all_brands');

        return back()->with('success', 'Brand updated.');
    }

    public function destroy(Brand $brand)
    {
        StorageHelper::deletePublicly($brand->logo_url);
        $brand->delete();
        \Illuminate\Support\Facades\Cache::forget('home_brands');
        \Illuminate\Support\Facades\Cache::forget('all_brands');

        return back()->with('success', 'Brand deleted.');
    }
}
