<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminCmsPageController extends Controller
{
    public function editBySlug($slug)
    {
        $page = \App\Models\CmsPage::firstOrCreate(
            ['slug' => $slug],
            [
                'title' => ucwords(str_replace('-', ' ', $slug)),
                'content' => '',
                'is_published' => true,
            ]
        );

        return Inertia::render('Admin/Appearance/EditCmsPage', ['page' => $page]);
    }

    public function index()
    {
        $pages = \Illuminate\Support\Facades\DB::table('cms_pages')
            ->select('id', 'title', 'slug', 'is_published as status', 'updated_at as last_updated', 'content', 'meta_title', 'meta_description', 'banner_image')
            ->get()
            ->map(function ($page) {
                $page->status = $page->status ? 'Published' : 'Draft';
                $page->last_updated = \Carbon\Carbon::parse($page->last_updated)->format('Y-m-d');
                return (array) $page;
            });

        return Inertia::render('Admin/Appearance/CmsPages', ['pages' => $pages]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:cms_pages',
            'content' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'is_published' => 'boolean',
            'banner_image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('banner_image')) {
            $path = \App\Services\StorageHelper::storePublicly($request->file('banner_image'), 'cms_banners');
            $validated['banner_image'] = '/storage/' . $path;
        }

        \App\Models\CmsPage::create($validated);

        return redirect()->back()->with('success', 'Page created successfully.');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:cms_pages,slug,' . $id,
            'content' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'is_published' => 'boolean',
            'banner_image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('banner_image')) {
            $path = \App\Services\StorageHelper::storePublicly($request->file('banner_image'), 'cms_banners');
            $validated['banner_image'] = '/storage/' . $path;
        }

        \App\Models\CmsPage::findOrFail($id)->update($validated);

        return redirect()->back()->with('success', 'Page updated successfully.');
    }

    public function destroy($id)
    {
        \App\Models\CmsPage::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Page deleted successfully.');
    }
}
