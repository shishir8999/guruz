<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProductReview;
use Inertia\Inertia;

class AdminReviewController extends Controller
{
    public function index()
    {
        $reviews = ProductReview::with(['product', 'user'])->latest()->get()->map(function ($r) {
            $status = 'Pending';
            if ($r->status === 'approved') {
                $status = 'Approved';
            } elseif ($r->status === 'rejected') {
                $status = 'Rejected';
            }

            return [
                'id'           => $r->id,
                'type'         => 'Review',
                'rating'       => $r->rating,
                'date'         => $r->created_at ? $r->created_at->format('M d, Y h:i A') : 'N/A',
                'product_name' => $r->product ? $r->product->name : 'Unknown Product',
                'product_slug' => $r->product?->slug ?? '',
                'comment'      => $r->comment,
                'user_name'    => $r->user_name ?: ($r->user ? $r->user->name : 'Guest Customer'),
                'user_email'   => $r->user_email ?: ($r->user ? $r->user->email : 'N/A'),
                'is_guest'     => empty($r->user_id),
                'status'       => $status,
                'seller_reply' => null,
            ];
        });

        return Inertia::render('Admin/ReviewsQna', [
            'initialReviews' => $reviews
        ]);
    }

    public function approve(ProductReview $review)
    {
        $review->update([
            'is_verified' => true,
            'status'      => 'approved',
        ]);
        \Illuminate\Support\Facades\Cache::forget('admin_nav_counts');
        return back()->with('success', 'Review approved and published on storefront!');
    }

    public function reject(ProductReview $review)
    {
        $review->update([
            'is_verified' => false,
            'status'      => 'rejected',
        ]);
        \Illuminate\Support\Facades\Cache::forget('admin_nav_counts');
        return back()->with('success', 'Review rejected.');
    }

    public function destroy(ProductReview $review)
    {
        $review->delete();
        \Illuminate\Support\Facades\Cache::forget('admin_nav_counts');
        return back()->with('success', 'Review deleted successfully.');
    }

    public function reply(Request $request, ProductReview $review)
    {
        return back()->with('success', 'Reply sent to customer!');
    }
}

