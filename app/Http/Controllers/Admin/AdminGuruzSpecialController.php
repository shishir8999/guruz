<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminGuruzSpecialController extends Controller
{
    public function index()
    {
        // Get Settings
        $enabled = SiteSetting::get('guruz_special_enabled', '1') === '1';
        $titleEn = SiteSetting::get('guruz_special_title_en', 'Guruz Special');
        $titleBn = SiteSetting::get('guruz_special_title_bn', 'GURUZ স্পেশাল');
        $subEn = SiteSetting::get('guruz_special_sub_en', 'Hand-picked deals for the season');
        $subBn = SiteSetting::get('guruz_special_sub_bn', 'সেরা অফার ও বিশেষ আকর্ষণ সমাহার!');
        $emoji = SiteSetting::get('guruz_special_emoji', '✨');
        $gradFrom = SiteSetting::get('guruz_special_grad_from', '#7c3aed');
        $gradTo = SiteSetting::get('guruz_special_grad_to', '#db2777');

        // Fetch Selected Products IDs
        $selectedProductIds = json_decode(SiteSetting::get('guruz_special_products', '[]'), true);
        
        // Fetch all active products for the selection pool
        $allProducts = Product::where('is_active', true)
            ->select('id', 'name', 'price', 'sale_price', 'primary_image_url as image')
            ->orderBy('id', 'desc')
            ->get();
        
        // Split them into selected and available based on saved IDs
        $selectedProducts = [];
        $availableProducts = [];

        // Add selected products in the exact order they were saved
        if (is_array($selectedProductIds) && count($selectedProductIds) > 0) {
            foreach ($selectedProductIds as $id) {
                $product = $allProducts->firstWhere('id', $id);
                if ($product) {
                    $selectedProducts[] = $product;
                }
            }
        }

        // Add the rest to available
        foreach ($allProducts as $product) {
            if (!in_array($product->id, $selectedProductIds ?? [])) {
                $availableProducts[] = $product;
            }
        }

        return Inertia::render('Admin/GuruzSpecialPage', [
            'initialEnabled' => $enabled,
            'initialTitleEn' => $titleEn,
            'initialTitleBn' => $titleBn,
            'initialSubEn' => $subEn,
            'initialSubBn' => $subBn,
            'initialEmoji' => $emoji,
            'initialGradFrom' => $gradFrom,
            'initialGradTo' => $gradTo,
            'initialSelectedProducts' => $selectedProducts,
            'initialAvailableProducts' => $availableProducts,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'enabled' => 'boolean',
            'titleEn' => 'required|string',
            'titleBn' => 'required|string',
            'subEn' => 'nullable|string',
            'subBn' => 'nullable|string',
            'emoji' => 'nullable|string',
            'gradFrom' => 'required|string',
            'gradTo' => 'required|string',
            'selectedProducts' => 'array',
            'selectedProducts.*' => 'integer',
        ]);

        SiteSetting::set('guruz_special_enabled', $request->input('enabled') ? '1' : '0');
        SiteSetting::set('guruz_special_title_en', $request->input('titleEn'));
        SiteSetting::set('guruz_special_title_bn', $request->input('titleBn'));
        SiteSetting::set('guruz_special_sub_en', $request->input('subEn') ?? '');
        SiteSetting::set('guruz_special_sub_bn', $request->input('subBn') ?? '');
        SiteSetting::set('guruz_special_emoji', $request->input('emoji') ?? '');
        SiteSetting::set('guruz_special_grad_from', $request->input('gradFrom'));
        SiteSetting::set('guruz_special_grad_to', $request->input('gradTo'));
        
        $selectedProductIds = $request->input('selectedProducts', []);
        SiteSetting::set('guruz_special_products', json_encode($selectedProductIds));

        return back()->with('success', 'Guruz Special section settings saved successfully.');
    }
}
