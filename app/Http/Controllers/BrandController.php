<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    /**
     * Display a public listing of all verified brands.
     */
    public function index(Request $request): Response
    {
        $brands = Brand::where('is_active', true)
            ->withCount(['products' => function ($q) {
                $q->where('is_active', true);
            }])
            ->orderByDesc('is_featured')
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'slug', 'logo_url', 'is_featured']);

        return Inertia::render('Brands/Index', [
            'brands' => $brands,
        ]);
    }
}