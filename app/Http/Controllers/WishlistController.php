<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $userId = auth()->id();

        if (!$userId) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Add to wishlist if not already exists
        Wishlist::firstOrCreate([
            'user_id'    => $userId,
            'product_id' => $request->product_id,
        ]);

        \Illuminate\Support\Facades\Cache::forget("user_wishlist_ids_{$userId}");

        return response()->json([
            'status' => 'added',
            'is_favorite' => true,
            'message' => 'প্রোডাক্টটি উইশলিস্টে যুক্ত হয়েছে!',
        ], 200);
    }

    public function toggle(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $userId = auth()->id();

        if (!$userId) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $existing = Wishlist::where('user_id', $userId)->where('product_id', $request->product_id)->first();

        if ($existing) {
            $existing->delete();
            \Illuminate\Support\Facades\Cache::forget("user_wishlist_ids_{$userId}");
            return response()->json([
                'status' => 'removed',
                'is_favorite' => false,
                'message' => 'উইশলিস্ট থেকে সরানো হয়েছে!',
            ], 200);
        }

        Wishlist::create([
            'user_id'    => $userId,
            'product_id' => $request->product_id,
        ]);

        \Illuminate\Support\Facades\Cache::forget("user_wishlist_ids_{$userId}");

        return response()->json([
            'status' => 'added',
            'is_favorite' => true,
            'message' => 'উইশলিস্টে যুক্ত করা হয়েছে! ❤️',
        ], 200);
    }
}
