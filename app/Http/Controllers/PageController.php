<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Inertia\Inertia;
use App\Models\Page;

class PageController extends Controller
{
    public function show($slug)
    {
        $page = Page::where('slug', $slug)->where('status', 'publish')->first();
        if (!$page) {
            abort(404);
        }
        return Inertia::render('PageView', ['page' => $page]);
    }
}
