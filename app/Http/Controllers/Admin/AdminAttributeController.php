<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductAttribute;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminAttributeController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/AttributesPage', [
            'attributes' => ProductAttribute::latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'   => 'required|string|max:100',
            'type'   => 'nullable|string|max:50',
            'values' => 'nullable|array',
        ]);
        ProductAttribute::create($data);
        return back()->with('success', 'Attribute created.');
    }

    public function update(Request $request, ProductAttribute $attribute)
    {
        if ($request->has('_toggle')) {
            $attribute->update(['is_active' => !$attribute->is_active]);
            return back()->with('success', 'Attribute status updated.');
        }

        $data = $request->validate([
            'name'   => 'required|string|max:100',
            'type'   => 'nullable|string|max:50',
            'values' => 'nullable|array',
        ]);
        $attribute->update($data);
        return back()->with('success', 'Attribute updated.');
    }

    public function destroy(ProductAttribute $attribute)
    {
        $attribute->delete();
        return back()->with('success', 'Attribute deleted.');
    }
}
