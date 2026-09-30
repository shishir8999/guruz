<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ThemeController extends Controller
{
    public function index()
    {
        $activeThemeId = SiteSetting::get('active_theme_id');
        $themes = SiteSetting::get('themes_data');

        return Inertia::render('Admin/ThemesEffectsPage', [
            'initialActiveThemeId' => $activeThemeId,
            'initialThemesData' => $themes ? json_decode($themes, true) : null,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'active_theme_id' => 'nullable|string',
            'themes_data' => 'required|array',
        ]);

        SiteSetting::set('active_theme_id', $request->active_theme_id, 'appearance');
        SiteSetting::set('themes_data', json_encode($request->themes_data), 'appearance');

        return back()->with('success', 'Theme settings updated successfully.');
    }
}
