<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class WarehouseController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $shop = $user ? $user->shop : null;

        if ($user && !$shop) {
            $shop = Shop::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'name'        => ($user->name ?? 'Vendor') . "'s Shop",
                    'slug'        => Str::slug(($user->name ?? 'Vendor') . "-shop-" . $user->id),
                    'status'      => 'active',
                    'is_approved' => true,
                ]
            );
        }

        $shopId = $shop ? $shop->id : 1;

        $warehouses = Warehouse::where('shop_id', $shopId)->latest()->get();


        return Inertia::render('Seller/Warehouses/Index', [
            'warehouses' => $warehouses
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'           => 'required|string|max:255',
            'address'        => 'nullable|string|max:500',
            'contact_number' => 'nullable|string|max:50',
            'is_active'      => 'nullable|boolean'
        ]);

        $user = Auth::user();
        $shop = $user ? $user->shop : null;
        $shopId = $shop ? $shop->id : 1;

        Warehouse::create([
            'shop_id'        => $shopId,
            'name'           => $request->name,
            'address'        => $request->address,
            'contact_number' => $request->contact_number,
            'is_active'      => $request->boolean('is_active', true)
        ]);

        return redirect()->back()->with('success', 'Warehouse location added successfully.');
    }

    public function update(Request $request, $id)
    {
        $warehouse = Warehouse::findOrFail($id);

        $request->validate([
            'name'           => 'nullable|string|max:255',
            'address'        => 'nullable|string|max:500',
            'contact_number' => 'nullable|string|max:50',
            'is_active'      => 'nullable|boolean'
        ]);

        if ($request->has('name')) $warehouse->name = $request->name;
        if ($request->has('address')) $warehouse->address = $request->address;
        if ($request->has('contact_number')) $warehouse->contact_number = $request->contact_number;
        if ($request->has('is_active')) $warehouse->is_active = $request->boolean('is_active');

        $warehouse->save();

        return redirect()->back()->with('success', 'Warehouse updated successfully.');
    }

    public function destroy($id)
    {
        $warehouse = Warehouse::find($id);
        if ($warehouse) {
            $warehouse->delete();
        }

        return redirect()->back()->with('success', 'Warehouse location deleted.');
    }
}
