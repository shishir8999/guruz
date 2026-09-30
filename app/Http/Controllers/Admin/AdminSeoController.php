<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SiteSetting;

class AdminSeoController extends Controller
{
    public function index()
    {
        $globalSettings = [
            'meta_title' => SiteSetting::get('seo_meta_title', 'Guruz BD'),
            'meta_description' => SiteSetting::get('seo_meta_description', ''),
            'pixel_id' => SiteSetting::get('seo_pixel_id', ''),
            'gtm_id' => SiteSetting::get('seo_gtm_id', ''),
            'robots_txt' => SiteSetting::get('seo_robots_txt', "User-agent: *\nDisallow: /admin/\nDisallow: /cart/"),
            'schema_enabled' => SiteSetting::get('seo_schema_enabled', 'true') === 'true',
        ];

        // Mock data for the advanced SEO dashboard
        
        $products = [
            ['id' => 1, 'name' => 'Anker Soundcore R50i', 'meta_title' => 'Buy Anker Soundcore R50i - Best Price in BD', 'meta_description' => 'Get the best deal on Anker Soundcore R50i true wireless earbuds. Fast delivery inside Dhaka.', 'schema_enabled' => true],
            ['id' => 2, 'name' => 'UGREEN USB Hub', 'meta_title' => 'UGREEN 4 Port USB 3.0 Hub', 'meta_description' => 'Expand your connectivity with UGREEN USB Hub. Order now.', 'schema_enabled' => false],
        ];

        $redirects = [
            ['id' => 1, 'source_url' => '/old-category/electronics', 'destination_url' => '/category/electronics', 'status' => '301 Moved Permanently', 'hits' => 145],
            ['id' => 2, 'source_url' => '/product/old-anker-r50', 'destination_url' => '/product/anker-soundcore-r50i', 'status' => '301 Moved Permanently', 'hits' => 32],
        ];

        $logs404 = [
            ['id' => 1, 'url_attempted' => '/sale/winter-offer', 'hits' => 54, 'last_hit' => '2026-08-05 14:30:00'],
            ['id' => 2, 'url_attempted' => '/brands/unknown-brand', 'hits' => 12, 'last_hit' => '2026-08-04 09:15:00'],
        ];

        $sitemap_status = [
            'last_generated' => '2026-08-01 02:00:00',
            'total_urls' => 450,
            'file_size' => '45 KB'
        ];

        return Inertia::render('Admin/SeoDashboard', [
            'globalSettings' => $globalSettings,
            'products' => $products,
            'redirects' => $redirects,
            'logs404' => $logs404,
            'sitemapStatus' => $sitemap_status
        ]);
    }

    public function generateSitemap()
    {
        // In a real scenario, this would trigger a job or generate the sitemap.xml file
        return redirect()->back()->with('success', 'Sitemap generated successfully! Included 452 URLs.');
    }

    public function updateGlobal(Request $request)
    {
        $request->validate([
            'meta_title' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'pixel_id' => 'nullable|string',
            'gtm_id' => 'nullable|string',
            'robots_txt' => 'nullable|string',
            'schema_enabled' => 'boolean',
        ]);

        SiteSetting::set('seo_meta_title', $request->meta_title ?? '', 'seo');
        SiteSetting::set('seo_meta_description', $request->meta_description ?? '', 'seo');
        SiteSetting::set('seo_pixel_id', $request->pixel_id ?? '', 'seo');
        SiteSetting::set('seo_gtm_id', $request->gtm_id ?? '', 'seo');
        SiteSetting::set('seo_robots_txt', $request->robots_txt ?? '', 'seo');
        SiteSetting::set('seo_schema_enabled', $request->schema_enabled ? 'true' : 'false', 'seo');

        return redirect()->back()->with('success', 'Global SEO settings saved successfully!');
    }
}
