<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminCampaignController extends Controller
{
    public function index()
    {
        // Ensure name column is nullable if present
        try {
            DB::statement('ALTER TABLE campaigns MODIFY COLUMN name VARCHAR(255) NULL');
        } catch (\Throwable $e) {}

        if (Campaign::count() === 0) {
            Campaign::insert([
                [
                    'name'       => 'Eid Mega Sale 2026',
                    'title'      => 'Eid Mega Sale 2026',
                    'banner'     => 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600',
                    'status'     => 'live',
                    'audience'   => 'All Customers',
                    'views'      => 45230,
                    'conversion' => '12.4%',
                    'start_date' => '2026-03-10',
                    'end_date'   => '2026-03-25',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'name'       => 'Summer Clearance',
                    'title'      => 'Summer Clearance',
                    'banner'     => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
                    'status'     => 'draft',
                    'audience'   => 'Inactive Customers',
                    'views'      => 0,
                    'conversion' => '0%',
                    'start_date' => '2026-06-01',
                    'end_date'   => '2026-06-15',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'name'       => 'New Year Flash Sale',
                    'title'      => 'New Year Flash Sale',
                    'banner'     => 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=600',
                    'status'     => 'completed',
                    'audience'   => 'Premium Members',
                    'views'      => 125000,
                    'conversion' => '24.8%',
                    'start_date' => '2025-12-25',
                    'end_date'   => '2026-01-05',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'name'       => 'Back to School 2026',
                    'title'      => 'Back to School 2026',
                    'banner'     => 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600',
                    'status'     => 'scheduled',
                    'audience'   => 'All Customers',
                    'views'      => 0,
                    'conversion' => '0%',
                    'start_date' => '2026-08-15',
                    'end_date'   => '2026-09-05',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
        }

        $campaigns = Campaign::orderBy('created_at', 'desc')->get()->map(function($c) {
            $c->title = $c->title ?: ($c->name ?: 'Untitled Campaign');
            $c->banner = $c->banner ?: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600';
            $c->audience = $c->audience ?: 'All Customers';
            $c->conversion = $c->conversion ?: '0%';
            return $c;
        });

        return Inertia::render('Admin/Marketing/Campaigns', [
            'campaigns' => $campaigns,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'      => 'required|string|max:255',
            'status'     => 'required|in:live,scheduled,draft,completed',
            'audience'   => 'required|string|max:255',
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date',
            'banner'     => 'nullable',
        ]);

        $bannerPath = null;
        if ($request->hasFile('banner')) {
            $path = \App\Services\StorageHelper::storePublicly($request->file('banner'), 'campaigns');
            $bannerPath = '/storage/' . $path;
        } else if ($request->filled('banner') && is_string($request->banner)) {
            $bannerPath = $request->banner;
        } else {
            $bannerPath = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600';
        }

        Campaign::create([
            'name'       => $request->title,
            'title'      => $request->title,
            'status'     => $request->status,
            'audience'   => $request->audience,
            'start_date' => $request->start_date,
            'end_date'   => $request->end_date,
            'banner'     => $bannerPath,
            'views'      => 0,
            'conversion' => '0%',
        ]);

        return back()->with('success', 'নতুন ক্যাম্পেইন তৈরি সফল হয়েছে!');
    }

    public function update(Request $request, Campaign $campaign)
    {
        $request->validate([
            'title'      => 'required|string|max:255',
            'status'     => 'required|in:live,scheduled,draft,completed',
            'audience'   => 'required|string|max:255',
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date',
            'banner'     => 'nullable',
        ]);

        $data = [
            'name'       => $request->title,
            'title'      => $request->title,
            'status'     => $request->status,
            'audience'   => $request->audience,
            'start_date' => $request->start_date,
            'end_date'   => $request->end_date,
        ];

        if ($request->hasFile('banner')) {
            $path = \App\Services\StorageHelper::storePublicly($request->file('banner'), 'campaigns');
            $data['banner'] = '/storage/' . $path;
        } else if ($request->filled('banner') && is_string($request->banner)) {
            $data['banner'] = $request->banner;
        }

        $campaign->update($data);

        return back()->with('success', 'ক্যাম্পেইন আপডেট সফল হয়েছে!');
    }

    public function destroy(Campaign $campaign)
    {
        $campaign->delete();
        return back()->with('success', 'ক্যাম্পেইন ডিলিট সফল হয়েছে!');
    }
}
