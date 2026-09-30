<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a public listing of all product categories.
     */
    public function index(Request $request): Response
    {
        $categories = Category::withCount(['products' => function ($q) {
                $q->where('is_active', true);
            }])
            ->orderBy('display_order', 'asc')
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
        ]);
    }
}