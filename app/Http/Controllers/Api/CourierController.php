<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Courier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CourierController extends Controller
{
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'delivery_fee' => 'required|numeric|min:0',
            'phone' => 'nullable|string|max:20',
            'is_active' => 'boolean',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,svg,webp|max:2048'
        ]);

        $courier = Courier::findOrFail($id);

        if ($request->hasFile('logo')) {
            $path = Storage::disk('public')->putFile('couriers', $request->file('logo'));
            $validated['logo'] = '/storage/' . $path;
        }

        $courier->update($validated);

        return response()->json([
            'message' => 'Courier saved successfully', 
            'data' => $courier
        ], 200);
    }
}
