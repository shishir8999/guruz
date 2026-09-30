<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPageController extends Controller
{
    public function editBySlug($slug)
    {
        $page = \App\Models\Page::firstOrCreate(
            ['slug' => $slug],
            [
                'title' => ucwords(str_replace('-', ' ', $slug)),
                'content' => '',
                'status' => 'publish',
            ]
        );

        $pages = \Illuminate\Support\Facades\DB::table('pages')
            ->select('id', 'title', 'title_bn', 'slug', 'category', 'status', 'updated_at as last_updated', 'content', 'content_bn', 'seo_title', 'meta_description', 'featured_image', 'short_description', 'subtitle_en', 'subtitle_bn')
            ->get()
            ->map(function ($p) {
                $p->status = ucfirst($p->status);
                $p->last_updated = \Carbon\Carbon::parse($p->last_updated)->format('Y-m-d');
                return (array) $p;
            });

        return Inertia::render('Admin/Appearance/Pages', [
            'pages' => $pages,
            'initialSlug' => $slug
        ]);
    }

    public function index()
    {
        $pages = \Illuminate\Support\Facades\DB::table('pages')
            ->select('id', 'title', 'title_bn', 'slug', 'category', 'status', 'updated_at as last_updated', 'content', 'content_bn', 'seo_title', 'meta_description', 'featured_image', 'short_description', 'subtitle_en', 'subtitle_bn')
            ->get()
            ->map(function ($page) {
                $page->status = ucfirst($page->status);
                $page->last_updated = \Carbon\Carbon::parse($page->last_updated)->format('Y-m-d');
                return (array) $page;
            });

        return Inertia::render('Admin/Appearance/Pages', [
            'pages' => $pages,
            'initialSlug' => null
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'title_bn' => 'nullable|string|max:255',
            'slug' => 'required|string|max:255|unique:pages',
            'category' => 'nullable|string|max:255',
            'short_description' => 'nullable|string',
            'subtitle_en' => 'nullable|string',
            'subtitle_bn' => 'nullable|string',
            'content' => 'nullable|string',
            'content_bn' => 'nullable|string',
            'seo_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'status' => 'required|in:publish,draft,Publish,Draft',
            'featured_image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('featured_image')) {
            $path = \App\Services\StorageHelper::storePublicly($request->file('featured_image'), 'cms_banners');
            $validated['featured_image'] = '/storage/' . $path;
        }

        \App\Models\Page::create($validated);

        return redirect()->back()->with('success', 'Page created successfully.');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'title_bn' => 'nullable|string|max:255',
            'slug' => 'required|string|max:255|unique:pages,slug,' . $id,
            'category' => 'nullable|string|max:255',
            'short_description' => 'nullable|string',
            'subtitle_en' => 'nullable|string',
            'subtitle_bn' => 'nullable|string',
            'content' => 'nullable|string',
            'content_bn' => 'nullable|string',
            'seo_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'status' => 'required|in:publish,draft,Publish,Draft',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('featured_image')) {
            $path = \App\Services\StorageHelper::storePublicly($request->file('featured_image'), 'cms_banners');
            $validated['featured_image'] = '/storage/' . $path;
        }

        \App\Models\Page::findOrFail($id)->update($validated);

        return redirect()->back()->with('success', 'Page updated successfully.');
    }

    public function destroy($id)
    {
        \App\Models\Page::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Page deleted successfully.');
    }
}
