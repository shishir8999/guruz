<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\FlashSale;
use Carbon\Carbon;

class AdminFlashSaleController extends Controller
{
    public function index()
    {
        $campaigns = FlashSale::withCount('products')->get()->map(function ($campaign) {
            return [
                'id' => $campaign->id,
                'title_en' => $campaign->title_en,
                'title_bn' => $campaign->title_bn,
                'end_date' => $campaign->ends_at ? $campaign->ends_at->format('n/j/Y, g:i:s A') : '',
                'product_count' => $campaign->products_count,
                'active' => $campaign->is_active,
            ];
        });

        return Inertia::render('Admin/FlashSalesPage', [
            'initialCampaigns' => $campaigns
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title_en' => 'required|string|max:255',
            'title_bn' => 'nullable|string|max:255',
            'end_date' => 'nullable|date',
            'active' => 'boolean'
        ]);

        FlashSale::create([
            'title_en' => $request->title_en,
            'title_bn' => $request->title_bn,
            'ends_at' => $request->end_date ? Carbon::parse($request->end_date) : null,
            'is_active' => $request->active ?? true
        ]);

        return back()->with('success', 'Flash sale created successfully.');
    }

    public function toggle(FlashSale $flashSale)
    {
        $flashSale->update([
            'is_active' => !$flashSale->is_active
        ]);

        return back()->with('success', 'Flash sale status updated.');
    }

    public function destroy(FlashSale $flashSale)
    {
        $flashSale->delete();

        return back()->with('success', 'Flash sale deleted successfully.');
    }
}
