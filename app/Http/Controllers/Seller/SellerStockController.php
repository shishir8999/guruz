<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class SellerStockController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
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

        $query = Product::where('shop_id', $shopId);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->filled('stock_status')) {
            if ($request->stock_status === 'low') {
                $query->where('stock_quantity', '>', 0)->where('stock_quantity', '<=', 10);
            } elseif ($request->stock_status === 'out') {
                $query->where('stock_quantity', '<=', 0);
            } elseif ($request->stock_status === 'in') {
                $query->where('stock_quantity', '>', 10);
            }
        }

        $allProducts = Product::where('shop_id', $shopId)->get();

        $totalStockSum = $allProducts->sum('stock_quantity');
        $inStockCount  = $allProducts->where('stock_quantity', '>', 10)->count();
        $lowStockCount = $allProducts->where('stock_quantity', '>', 0)->where('stock_quantity', '<=', 10)->count();
        $outOfStockCount = $allProducts->where('stock_quantity', '<=', 0)->count();

        $products = $query->orderBy('stock_quantity', 'asc')->get();

        return Inertia::render('Seller/Stock/Index', [
            'products'        => $products,
            'totalStockSum'   => $totalStockSum,
            'inStockCount'    => $inStockCount,
            'lowStockCount'   => $lowStockCount,
            'outOfStockCount' => $outOfStockCount,
            'filters'         => $request->only(['search', 'stock_status']),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $this->authorizeProductOwner($request, $product);

        $request->validate([
            'stock_quantity' => 'required|integer|min:0',
            'sku'            => 'nullable|string|max:100',
            'price'          => 'nullable|numeric|min:0',
            'sale_price'     => 'nullable|numeric|min:0',
        ]);

        $data = ['stock_quantity' => $request->stock_quantity];

        if ($request->has('sku')) $data['sku'] = $request->sku;
        if ($request->has('price')) $data['price'] = $request->price;
        if ($request->has('sale_price')) $data['sale_price'] = $request->sale_price;

        $product->update($data);

        return back()->with('success', 'Stock updated successfully.');
    }

    public function destroy(Request $request, Product $product)
    {
        $this->authorizeProductOwner($request, $product);
        $product->delete();

        return back()->with('success', 'Product removed from stock list.');
    }

    private function authorizeProductOwner(Request $request, Product $product)
    {
        $shop = $request->user()->shop;
        if ($shop && $product->shop_id !== $shop->id) {
            abort(403, 'Unauthorized action.');
        }
    }
}
