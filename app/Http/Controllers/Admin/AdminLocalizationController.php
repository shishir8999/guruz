<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Language;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminLocalizationController extends Controller
{
    public function languages()
    {
        if (Language::count() === 0) {
            Language::insert([
                [
                    'name'       => 'English',
                    'code'       => 'en',
                    'is_default' => true,
                    'status'     => 'Active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'name'       => 'Bengali',
                    'code'       => 'bn',
                    'is_default' => false,
                    'status'     => 'Active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'name'       => 'Arabic',
                    'code'       => 'ar',
                    'is_default' => false,
                    'status'     => 'Inactive',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        $languages = Language::orderBy('id', 'asc')->get();

        return Inertia::render('Admin/Localization/LanguageManager', [
            'languages' => $languages
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'       => 'required|string|max:255',
            'code'       => 'required|string|max:10|unique:languages,code',
            'status'     => 'required|in:Active,Inactive',
            'is_default' => 'boolean',
        ]);

        if ($request->boolean('is_default')) {
            Language::query()->update(['is_default' => false]);
        }

        Language::create([
            'name'       => $request->name,
            'code'       => strtolower($request->code),
            'status'     => $request->status,
            'is_default' => $request->boolean('is_default'),
        ]);

        return back()->with('success', 'নতুন ভাষা সফলভাবে যুক্ত করা হয়েছে!');
    }

    public function update(Request $request, Language $language)
    {
        $request->validate([
            'name'       => 'required|string|max:255',
            'code'       => 'required|string|max:10|unique:languages,code,' . $language->id,
            'status'     => 'required|in:Active,Inactive',
            'is_default' => 'boolean',
        ]);

        if ($request->boolean('is_default') && !$language->is_default) {
            Language::query()->update(['is_default' => false]);
        }

        $language->update([
            'name'       => $request->name,
            'code'       => strtolower($request->code),
            'status'     => $request->status,
            'is_default' => $request->boolean('is_default'),
        ]);

        return back()->with('success', 'ভাষা সেটিংস আপডেট সফল হয়েছে!');
    }

    public function toggleStatus(Language $language)
    {
        if ($language->is_default) {
            return back()->with('error', 'ডিফোল্ট ভাষা ডিঅ্যাক্টিভ করা যাবে না!');
        }

        $newStatus = $language->status === 'Active' ? 'Inactive' : 'Active';
        $language->update(['status' => $newStatus]);

        return back()->with('success', "ভাষার স্ট্যাটাস '{$newStatus}' করা হয়েছে!");
    }

    public function destroy(Language $language)
    {
        if ($language->is_default) {
            return back()->with('error', 'ডিফোল্ট ভাষা ডিলিট করা সম্ভব নয়!');
        }

        $language->delete();
        return back()->with('success', 'ভাষা সফলভাবে মুছে ফেলা হয়েছে!');
    }
}
