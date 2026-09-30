<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class SellerUnitController extends Controller
{
    public function index(Request $request)
    {
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

        $query = Unit::query();
        if ($shopId) {
            $query->where(function($q) use ($shopId) {
                $q->whereNull('shop_id')->orWhere('shop_id', $shopId);
            });
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $units = $query->latest()->get();

        return Inertia::render('Seller/Products/Unit', [
            'units' => $units
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $shop = $user ? $user->shop : null;
        $shopId = $shop ? $shop->id : null;

        $request->validate([
            'name'       => 'required|string|max:255',
            'short_name' => 'nullable|string|max:50',
            'is_active'  => 'boolean'
        ]);

        $unit = Unit::create([
            'shop_id'    => $shopId,
            'name'       => $request->name,
            'short_name' => $request->short_name ?: $request->name,
            'is_active'  => $request->is_active ?? true
        ]);

        return redirect()->back()->with('success', 'Unit created successfully');
    }

    public function update(Request $request, $id)
    {
        $unit = Unit::findOrFail($id);

        $request->validate([
            'name'       => 'nullable|string|max:255',
            'short_name' => 'nullable|string|max:50',
            'is_active'  => 'nullable|boolean'
        ]);

        if ($request->has('name') && $request->filled('name')) {
            $unit->name = $request->name;
        }
        if ($request->has('short_name')) {
            $unit->short_name = $request->short_name;
        }
        if ($request->has('is_active')) {
            $unit->is_active = (bool) $request->is_active;
        }

        $unit->save();

        return redirect()->back()->with('success', 'Unit updated successfully');
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'units'             => 'required|array',
            'units.*.id'        => 'required|exists:units,id',
            'units.*.name'      => 'required|string|max:255',
            'units.*.is_active' => 'boolean'
        ]);

        $units = $request->input('units');

        foreach ($units as $unitData) {
            $unit = Unit::find($unitData['id']);
            if ($unit) {
                $unit->update([
                    'name'      => $unitData['name'],
                    'is_active' => $unitData['is_active'] ?? true,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Units updated successfully');
    }

    public function destroy($id)
    {
        $unit = Unit::find($id);
        if ($unit) {
            $unit->delete();
        }
        return redirect()->back()->with('success', 'Unit deleted successfully');
    }
}
