<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\ProductAttribute;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class SellerAttributeController extends Controller
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

        $query = ProductAttribute::query();
        if ($shopId) {
            $query->where(function($q) use ($shopId) {
                $q->whereNull('shop_id')->orWhere('shop_id', $shopId);
            });
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $attributes = $query->latest()->get();

        return Inertia::render('Seller/Products/Attributes', [
            'attributes' => $attributes
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $shop = $user ? $user->shop : null;
        $shopId = $shop ? $shop->id : null;

        $request->validate([
            'name'      => 'required|string|max:255',
            'values'    => 'required|array',
            'is_active' => 'boolean'
        ]);

        ProductAttribute::create([
            'shop_id'   => $shopId,
            'name'      => $request->name,
            'type'      => 'text',
            'values'    => $request->values,
            'is_active' => $request->is_active ?? true
        ]);

        return redirect()->back()->with('success', 'Attribute added successfully');
    }

    public function update(Request $request, $id)
    {
        $attribute = ProductAttribute::findOrFail($id);

        $request->validate([
            'name'      => 'nullable|string|max:255',
            'values'    => 'nullable|array',
            'is_active' => 'nullable|boolean'
        ]);

        if ($request->has('name') && $request->filled('name')) {
            $attribute->name = $request->name;
        }
        if ($request->has('values')) {
            $attribute->values = $request->values;
        }
        if ($request->has('is_active')) {
            $attribute->is_active = (bool) $request->is_active;
        }

        $attribute->save();

        return redirect()->back()->with('success', 'Attribute updated successfully');
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'attributes'            => 'required|array',
            'attributes.*.id'       => 'required|exists:product_attributes,id',
            'attributes.*.name'     => 'required|string|max:255',
            'attributes.*.values'   => 'required|array',
            'attributes.*.is_active'=> 'boolean'
        ]);

        $attributesData = $request->input('attributes');

        foreach ($attributesData as $attrData) {
            $attribute = ProductAttribute::find($attrData['id']);
            if ($attribute) {
                $attribute->update([
                    'name'      => $attrData['name'],
                    'values'    => $attrData['values'],
                    'is_active' => $attrData['is_active'] ?? true,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Attributes updated successfully');
    }

    public function destroy($id)
    {
        $attribute = ProductAttribute::find($id);
        if ($attribute) {
            $attribute->delete();
        }
        return redirect()->back()->with('success', 'Attribute deleted successfully');
    }
}
