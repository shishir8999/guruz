<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SellerReviewController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $shop = $user->shop ?? Shop::where('user_id', $user->id)->first();
        $productIds = $shop ? $shop->products()->pluck('id') : collect([]);

        $reviews = ProductReview::with(['product:id,name,primary_image_url,slug', 'user:id,name,email'])
            ->whereIn('product_id', $productIds)
            ->latest()
            ->get()
            ->map(function ($r) {
                return [
                    'id'           => $r->id,
                    'type'         => 'Review',
                    'rating'       => (int)$r->rating,
                    'date'         => $r->created_at ? $r->created_at->format('M d, Y h:i A') : 'N/A',
                    'product_name' => $r->product ? $r->product->name : 'Unknown Product',
                    'product_slug' => $r->product?->slug ?? '',
                    'product_image'=> $r->product?->primary_image_url ?? null,
                    'comment'      => $r->comment,
                    'user_name'    => $r->user_name ?: ($r->user ? $r->user->name : 'Guest Customer'),
                    'user_email'   => $r->user_email ?: ($r->user ? $r->user->email : 'N/A'),
                    'is_guest'     => empty($r->user_id),
                    'status'       => ($r->status === 'approved' || ($r->is_verified && $r->status !== 'pending' && $r->status !== 'rejected')) ? 'Approved' : ($r->status === 'rejected' ? 'Rejected' : 'Pending'),
                    'seller_reply' => null,
                ];
            });

        return Inertia::render('Seller/Reviews', [
            'initialReviews' => $reviews,
        ]);
    }

    public function approve(ProductReview $review)
    {
        return back()->withErrors(['message' => 'ভেন্ডর প্যানেল থেকে রিভিউ অ্যাপ্রুভ করার অনুমতি নেই। শুধুমাত্র সুপার এডমিন রিভিউ অনুমোদন করতে পারবেন।']);
    }

    public function reject(ProductReview $review)
    {
        return back()->withErrors(['message' => 'ভেন্ডর প্যানেল থেকে রিভিউ রিজেক্ট করার অনুমতি নেই। শুধুমাত্র সুপার এডমিন রিভিউ পরিচালনা করতে পারবেন।']);
    }

    public function destroy(ProductReview $review)
    {
        return back()->withErrors(['message' => 'ভেন্ডর প্যানেল থেকে কাস্টমার রিভিউ মুছে ফেলার অনুমতি নেই।']);
    }

    public function reply(Request $request, ProductReview $review)
    {
        return back()->with('success', 'রিপ্লাই সফলভাবে পাঠানো হয়েছে!');
    }
}
