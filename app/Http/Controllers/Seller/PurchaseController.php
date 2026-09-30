<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class PurchaseController extends Controller
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
                    'slug'        => \Illuminate\Support\Str::slug(($user->name ?? 'Vendor') . "-shop-" . $user->id),
                    'status'      => 'active',
                    'is_approved' => true,
                ]
            );
        }

        $shopId = $shop ? $shop->id : 1;

        $query = Purchase::where('shop_id', $shopId);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('po_number', 'like', "%{$search}%")
                  ->orWhere('supplier_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('supplier')) {
            $query->where('supplier_name', $request->supplier);
        }

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        $purchases = $query->latest()->get();

        $uniqueSuppliers = Purchase::where('shop_id', $shopId)
            ->whereNotNull('supplier_name')
            ->distinct()
            ->pluck('supplier_name');

        return Inertia::render('Seller/Purchases/Index', [
            'purchases' => $purchases,
            'suppliers' => $uniqueSuppliers,
            'filters'   => $request->only(['search', 'supplier', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'supplier_name' => 'required|string|max:255',
            'po_number'     => 'required|string|max:255',
            'total_amount'  => 'required|numeric|min:0',
            'purchase_date' => 'required|date',
            'status'        => 'required|in:Pending,Received,Cancelled'
        ]);

        $user = Auth::user();
        $shop = $user ? $user->shop : null;
        $shopId = $shop ? $shop->id : 1;

        Purchase::create([
            'shop_id'       => $shopId,
            'supplier_name' => $request->supplier_name,
            'po_number'     => $request->po_number,
            'total_amount'  => $request->total_amount,
            'purchase_date' => $request->purchase_date,
            'status'        => $request->status
        ]);

        return redirect()->back()->with('success', 'Purchase record added successfully.');
    }

    public function update(Request $request, $id)
    {
        $purchase = Purchase::findOrFail($id);

        $request->validate([
            'supplier_name' => 'nullable|string|max:255',
            'po_number'     => 'nullable|string|max:255',
            'total_amount'  => 'nullable|numeric|min:0',
            'purchase_date' => 'nullable|date',
            'status'        => 'nullable|in:Pending,Received,Cancelled'
        ]);

        if ($request->has('supplier_name')) $purchase->supplier_name = $request->supplier_name;
        if ($request->has('po_number')) $purchase->po_number = $request->po_number;
        if ($request->has('total_amount')) $purchase->total_amount = $request->total_amount;
        if ($request->has('purchase_date')) $purchase->purchase_date = $request->purchase_date;
        if ($request->has('status')) $purchase->status = $request->status;

        $purchase->save();

        return redirect()->back()->with('success', 'Purchase status updated.');
    }

    public function destroy($id)
    {
        $purchase = Purchase::find($id);
        if ($purchase) {
            $purchase->delete();
        }

        return redirect()->back()->with('success', 'Purchase deleted.');
    }
}
