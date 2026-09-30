<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SellerNotice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminSellerNoticeController extends Controller
{
    public function index()
    {
        if (SellerNotice::count() === 0) {
            SellerNotice::insert([
                [
                    'title'        => 'Important: Changes to Commission Rates',
                    'content'      => 'We are updating seller commission rates starting next month. Please review updated policy terms in seller portal.',
                    'body'         => 'We are updating seller commission rates starting next month. Please review updated policy terms in seller portal.',
                    'type'         => 'Policy Update',
                    'target'       => 'All Sellers',
                    'status'       => 'published',
                    'views'        => 425,
                    'is_active'    => 1,
                    'published_at' => now()->subDays(7),
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ],
                [
                    'title'        => 'Upcoming Mega Sale - Enroll Now!',
                    'title'        => 'Upcoming Mega Sale - Enroll Now!',
                    'content'      => 'Enroll your featured products in the upcoming Mega Sale campaign to double your shop visibility.',
                    'body'         => 'Enroll your featured products in the upcoming Mega Sale campaign to double your shop visibility.',
                    'type'         => 'Promotion',
                    'target'       => 'Top Rated Sellers',
                    'status'       => 'published',
                    'views'        => 120,
                    'is_active'    => 1,
                    'published_at' => now()->subDays(3),
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ],
                [
                    'title'        => 'System Maintenance Scheduled',
                    'content'      => 'Routine system database optimization and maintenance will be carried out at midnight.',
                    'body'         => 'Routine system database optimization and maintenance will be carried out at midnight.',
                    'type'         => 'System Alert',
                    'target'       => 'All Sellers',
                    'status'       => 'scheduled',
                    'views'        => 0,
                    'is_active'    => 1,
                    'published_at' => now()->addDays(2),
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ],
                [
                    'title'        => 'New Packaging Guidelines',
                    'content'      => 'Standard eco-friendly packaging rules for all orders.',
                    'body'         => 'Standard eco-friendly packaging rules for all orders.',
                    'type'         => 'Guideline',
                    'target'       => 'New Sellers',
                    'status'       => 'draft',
                    'views'        => 0,
                    'is_active'    => 0,
                    'published_at' => null,
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ]
            ]);
        }

        $notices = SellerNotice::orderBy('created_at', 'desc')->get()->map(function($n) {
            $n->type = $n->type ?: 'Policy Update';
            $n->target = $n->target ?: 'All Sellers';
            $n->status = $n->status ?: 'published';
            $n->content = $n->content ?: ($n->body ?: '');
            return $n;
        });

        return Inertia::render('Admin/Marketing/SellerNotices', [
            'notices' => $notices,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'   => 'required|string|max:255',
            'content' => 'nullable|string',
            'type'    => 'required|string|max:100',
            'target'  => 'required|string|max:100',
            'status'  => 'required|in:published,scheduled,draft',
        ]);

        SellerNotice::create([
            'title'        => $request->title,
            'content'      => $request->content,
            'body'         => $request->content,
            'type'         => $request->type,
            'target'       => $request->target,
            'status'       => $request->status,
            'views'        => 0,
            'is_active'    => $request->status === 'published' ? 1 : 0,
            'published_at' => $request->status === 'published' ? now() : null,
        ]);

        return back()->with('success', 'নতুন নোটিশ তৈরি সফল হয়েছে!');
    }

    public function update(Request $request, SellerNotice $sellerNotice)
    {
        $request->validate([
            'title'   => 'required|string|max:255',
            'content' => 'nullable|string',
            'type'    => 'required|string|max:100',
            'target'  => 'required|string|max:100',
            'status'  => 'required|in:published,scheduled,draft',
        ]);

        $sellerNotice->update([
            'title'        => $request->title,
            'content'      => $request->content,
            'body'         => $request->content,
            'type'         => $request->type,
            'target'       => $request->target,
            'status'       => $request->status,
            'is_active'    => $request->status === 'published' ? 1 : 0,
            'published_at' => $request->status === 'published' && !$sellerNotice->published_at ? now() : $sellerNotice->published_at,
        ]);

        return back()->with('success', 'নোটিশ আপডেট সফল হয়েছে!');
    }

    public function destroy(SellerNotice $sellerNotice)
    {
        $sellerNotice->delete();
        return back()->with('success', 'নোটিশ ডিলিট সফল হয়েছে!');
    }
}
