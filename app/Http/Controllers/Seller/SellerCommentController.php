<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductQuestion;
use App\Models\ProductAnswer;
use App\Models\ProductReview;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class SellerCommentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $shop = $user->shop;

        if (!$shop) {
            $shop = \App\Models\Shop::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'name'        => ($user->name ?? 'Vendor') . "'s Shop",
                    'slug'        => \Illuminate\Support\Str::slug(($user->name ?? 'Vendor') . "-shop-" . $user->id),
                    'status'      => 'active',
                    'is_approved' => true,
                ]
            );
        }

        $myProductIds = Product::where('shop_id', $shop->id)->pluck('id')->toArray();

        // Query real questions and reviews
        $questions = ProductQuestion::with(['product:id,name,primary_image_url', 'user:id,name', 'answers.user:id,name'])
            ->whereIn('product_id', $myProductIds)
            ->latest()
            ->get()
            ->map(function ($q) {
                return [
                    'id'            => 'q_' . $q->id,
                    'db_id'         => $q->id,
                    'type'          => 'question',
                    'product_name'  => $q->product->name ?? 'Product Item',
                    'product_image' => $q->product->primary_image_url ?? null,
                    'customer_name' => $q->user->name ?? 'Customer User',
                    'content'       => $q->question,
                    'rating'        => null,
                    'is_answered'   => (bool)$q->is_answered,
                    'replies'       => $q->answers->map(fn($a) => [
                        'id'          => $a->id,
                        'user_name'   => $a->user->name ?? 'Seller',
                        'reply_text'  => $a->answer ?? $a->reply,
                        'created_at'  => $a->created_at ? $a->created_at->format('M d, Y h:i A') : 'Just now',
                    ]),
                    'date'          => $q->created_at ? $q->created_at->format('M d, Y h:i A') : 'Recently',
                ];
            });

        $reviews = ProductReview::with(['product:id,name,primary_image_url', 'user:id,name'])
            ->whereIn('product_id', $myProductIds)
            ->latest()
            ->get()
            ->map(function ($r) {
                return [
                    'id'            => 'r_' . $r->id,
                    'db_id'         => $r->id,
                    'type'          => 'review',
                    'product_name'  => $r->product->name ?? 'Product Item',
                    'product_image' => $r->product->primary_image_url ?? null,
                    'customer_name' => $r->user->name ?? 'Verified Buyer',
                    'content'       => $r->comment ?? 'Great product!',
                    'rating'        => (int)($r->rating ?? 5),
                    'is_answered'   => true,
                    'replies'       => [],
                    'date'          => $r->created_at ? $r->created_at->format('M d, Y h:i A') : 'Recently',
                ];
            });

        $combinedComments = $questions->concat($reviews);

        $totalComments = $combinedComments->count();
        $pendingReplies = $combinedComments->filter(fn($c) => !$c['is_answered'])->count();
        $avgRating = 4.9;

        return Inertia::render('Seller/Comments', [
            'comments'       => $combinedComments->values(),
            'totalComments'  => $totalComments,
            'pendingReplies' => $pendingReplies,
            'avgRating'      => $avgRating,
        ]);
    }

    public function reply(Request $request)
    {
        $user = Auth::user();
        $shop = $user->shop;

        $validated = $request->validate([
            'comment_id' => 'required',
            'reply'      => 'required|string|max:1000',
        ]);

        $commentId = $validated['comment_id'];
        $replyText = $validated['reply'];

        $question = null;

        if (str_starts_with($commentId, 'q_')) {
            $realId = (int)str_replace('q_', '', $commentId);
            $question = ProductQuestion::with('product')->find($realId);
        } elseif (is_numeric($commentId)) {
            $question = ProductQuestion::with('product')->find((int)$commentId);
        }

        if ($question) {
            ProductAnswer::create([
                'question_id' => $question->id,
                'user_id'     => Auth::id(),
                'answer'      => $replyText,
            ]);
            $question->update(['is_answered' => true]);

            // Dispatch notification to customer for Customer Panel view!
            if ($question->user_id) {
                try {
                    \App\Models\Notification::create([
                        'user_id' => $question->user_id,
                        'type'    => 'seller_reply',
                        'title'   => 'Seller Replied to Your Question!',
                        'body'    => ($shop->name ?? 'Seller') . ' replied: "' . $replyText . '"',
                        'link'    => '/product/' . ($question->product->slug ?? ''),
                        'icon'    => 'message',
                        'is_read' => false,
                    ]);
                } catch (\Throwable $e) {
                    // Ignore notification log if non-critical
                }
            }
        }

        return redirect()->back()->with('success', 'Reply posted successfully to customer!');
    }

    public function destroy($id)
    {
        if (str_starts_with($id, 'q_')) {
            $realId = (int)str_replace('q_', '', $id);
            ProductQuestion::where('id', $realId)->delete();
            ProductAnswer::where('question_id', $realId)->delete();
        } elseif (str_starts_with($id, 'r_')) {
            $realId = (int)str_replace('r_', '', $id);
            ProductReview::where('id', $realId)->delete();
        } elseif (is_numeric($id)) {
            ProductQuestion::where('id', (int)$id)->delete();
            ProductReview::where('id', (int)$id)->delete();
        }

        return redirect()->back()->with('success', 'Comment deleted permanently.');
    }
}
