<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use App\Services\StorageHelper;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class AdminCategoryController extends Controller
{
    public function index()
    {
        StorageHelper::syncAll();

        $categories = Category::orderBy('display_order')->get()->map(function ($cat) {
            $imageUrl = $cat->image_url;
            if ($imageUrl && !str_starts_with($imageUrl, 'http')) {
                $imageUrl = str_starts_with($imageUrl, '/') ? $imageUrl : '/' . $imageUrl;
            }

            return [
                'id'        => $cat->id,
                'icon'      => (empty($cat->icon) || $cat->icon === '?') ? '📦' : $cat->icon,
                'image_url' => $imageUrl,
                'name_en'   => $cat->name,
                'name_bn'   => $cat->name,
                'slug'      => $cat->slug,
                'order'     => $cat->display_order ?? 0,
                'active'    => (bool) $cat->is_featured,
            ];
        });

        return Inertia::render('Admin/CategoriesPage', [
            'initialCategories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name_en' => 'required|string|max:255',
            'image'   => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $path = StorageHelper::storePublicly($request->file('image'), 'categories');
            $imageUrl = '/storage/' . $path;
        }

        Category::create([
            'name'          => $request->name_en,
            'slug'          => $request->slug ?: Str::slug($request->name_en),
            'icon'          => $request->icon ?? '📦',
            'image_url'     => $imageUrl,
            'display_order' => (Category::max('display_order') ?? 0) + 1,
            'is_featured'   => true,
        ]);

        Cache::forget('home_categories');

        return back()->with('success', 'Category added successfully!');
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name_en' => 'required|string|max:255',
            'image'   => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
        ]);

        $imageUrl = $category->image_url;
        if ($request->hasFile('image')) {
            StorageHelper::deletePublicly($category->image_url);
            $path = StorageHelper::storePublicly($request->file('image'), 'categories');
            $imageUrl = '/storage/' . $path;
        }

        $category->update([
            'name'      => $request->name_en,
            'slug'      => $request->slug ?: Str::slug($request->name_en),
            'icon'      => $request->icon ?? '📦',
            'image_url' => $imageUrl,
        ]);

        Cache::forget('home_categories');

        return back()->with('success', 'Category updated successfully!');
    }

    public function toggle(Category $category)
    {
        $category->update([
            'is_featured' => !$category->is_featured
        ]);

        Cache::forget('home_categories');

        return back();
    }

    public function destroy(Category $category)
    {
        StorageHelper::deletePublicly($category->image_url);
        $category->delete();

        Cache::forget('home_categories');

        return back()->with('success', 'Category deleted successfully!');
    }
}
