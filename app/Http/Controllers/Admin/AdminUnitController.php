<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminUnitController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/UnitsPage', [
            'units' => Unit::latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:100|unique:units,name',
            'short_name' => 'nullable|string|max:20',
        ]);
        $unit = Unit::create($data);
        if ($request->wantsJson() || $request->ajax() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
            return response()->json(['success' => true, 'unit' => $unit]);
        }
        return back()->with('success', 'Unit created.');
    }

    public function update(Request $request, Unit $unit)
    {
        if ($request->has('_toggle')) {
            $unit->update(['is_active' => !$unit->is_active]);
            return back()->with('success', 'Unit status updated.');
        }

        $data = $request->validate([
            'name'       => 'required|string|max:100|unique:units,name,' . $unit->id,
            'short_name' => 'nullable|string|max:20',
        ]);
        $unit->update($data);
        return back()->with('success', 'Unit updated.');
    }

    public function destroy(Unit $unit)
    {
        $unit->delete();
        return back()->with('success', 'Unit deleted.');
    }
}
