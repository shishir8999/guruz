<?php

namespace App\Http\Controllers;

use App\Models\WarrantyClaim;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class WarrantyClaimController extends Controller
{
    public function create()
    {
        $user = auth()->user();

        return Inertia::render('WarrantyClaim', [
            'initialUser' => $user ? [
                'name'  => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ] : null,
        ]);
    }

    public function store(Request $request)
    {
        // Auto-fix URL prefix if user omitted https://
        if ($request->filled('google_drive_link')) {
            $link = trim($request->input('google_drive_link'));
            if (!preg_match('~^(?:f|ht)tps?://~i', $link)) {
                $request->merge(['google_drive_link' => 'https://' . $link]);
            }
        }

        $request->validate([
            'customer_name'   => 'required|string|max:255',
            'mobile_number'   => 'required|string|max:20',
            'email'           => 'nullable|email|max:255',
            'order_id'        => 'nullable|string|max:100',
            'product_name'    => 'required|string|max:255',
            'brand_name'      => 'nullable|string|max:255',
            'product_model'   => 'nullable|string|max:255',
            'purchase_date'   => 'nullable|date',
            'issue_category'  => 'required|string|max:255',
            'problem_details' => 'required|string',
            'google_drive_link' => 'nullable|url|max:500',
            'video_file'      => 'nullable|file|mimes:mp4,mov,avi,mkv,webm|max:512000', // max 500MB
        ]);

        $videoPath = null;
        if ($request->hasFile('video_file')) {
            $path = $request->file('video_file')->store('warranty_videos', 'public');
            $videoPath = asset('storage/' . $path);
        }

        $claimNumber = 'WRN-' . strtoupper(Str::random(4)) . '-' . rand(1000, 9999);

        WarrantyClaim::create([
            'claim_number'     => $claimNumber,
            'user_id'          => auth()->id(),
            'customer_name'    => $request->customer_name,
            'mobile_number'    => $request->mobile_number,
            'email'            => $request->email,
            'order_id'         => $request->order_id,
            'product_name'     => $request->product_name,
            'brand_name'       => $request->brand_name,
            'product_model'    => $request->product_model,
            'purchase_date'    => $request->purchase_date,
            'issue_category'   => $request->issue_category,
            'problem_details'  => $request->problem_details,
            'video_path'       => $videoPath,
            'google_drive_link'=> $request->google_drive_link,
            'status'           => 'pending',
            'admin_seen_at'    => null,
        ]);

        \Illuminate\Support\Facades\Cache::forget('admin_nav_counts');

        return back()->with([
            'success' => 'আপনার ওয়ারেন্টি ক্লেইম সফলভাবে জমা দেওয়া হয়েছে!',
            'claim_number' => $claimNumber,
        ]);
    }

    // Admin List
    public function adminIndex()
    {
        $claims = WarrantyClaim::latest()->paginate(20);

        $claims->getCollection()->transform(function ($claim) {
            $claim->is_unseen = empty($claim->admin_seen_at);
            return $claim;
        });

        $unseenCount = WarrantyClaim::whereNull('admin_seen_at')->whereIn('status', ['pending', 'under_review'])->count();

        return Inertia::render('Admin/WarrantyClaimsPage', [
            'claims' => $claims,
            'unseenCount' => $unseenCount,
        ]);
    }

    // Mark single claim as seen
    public function markSeen(Request $request, $id)
    {
        $claim = WarrantyClaim::findOrFail($id);
        if (empty($claim->admin_seen_at)) {
            $claim->update(['admin_seen_at' => now()]);
            \Illuminate\Support\Facades\Cache::forget('admin_nav_counts');
        }

        if ($request->header('X-Inertia')) {
            return back();
        }

        return response()->json(['success' => true]);
    }

    // Mark all claims as seen
    public function markAllSeen()
    {
        WarrantyClaim::whereNull('admin_seen_at')->update(['admin_seen_at' => now()]);
        \Illuminate\Support\Facades\Cache::forget('admin_nav_counts');

        return back()->with('success', 'সকল ওয়ারেন্টি ক্লেইম পঠিত হিসেবে চিহ্নিত করা হয়েছে!');
    }

    // Admin Status Update
    public function adminUpdate(Request $request, $id)
    {
        $claim = WarrantyClaim::findOrFail($id);
        $request->validate([
            'status' => 'required|string|in:pending,under_review,approved,rejected',
            'admin_notes' => 'nullable|string',
            'google_drive_link' => 'nullable|url|max:500',
        ]);

        $data = [
            'status' => $request->status,
            'admin_notes' => $request->admin_notes,
            'admin_seen_at' => now(),
        ];

        if ($request->has('google_drive_link')) {
            $data['google_drive_link'] = $request->google_drive_link;
        }

        $claim->update($data);
        \Illuminate\Support\Facades\Cache::forget('admin_nav_counts');

        return back()->with('success', 'Warranty claim status updated successfully!');
    }

    // Admin Delete
    public function adminDestroy($id)
    {
        $claim = WarrantyClaim::findOrFail($id);
        $claim->delete();
        \Illuminate\Support\Facades\Cache::forget('admin_nav_counts');

        return back()->with('success', 'Warranty claim deleted successfully!');
    }
}
