<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Delete fake demo orders created automatically by SalesController
        $fakeOrderIds = DB::table('orders')
            ->where(function ($q) {
                $q->where('order_number', 'like', 'INV-S%')
                  ->orWhere('order_number', 'like', 'INV-2026%')
                  ->orWhereIn('customer_name', ['Rahim Uddin', 'Kabir Hossain', 'Walk-in Customer']);
            })
            ->pluck('id');

        if ($fakeOrderIds->isNotEmpty()) {
            DB::table('order_items')->whereIn('order_id', $fakeOrderIds)->delete();
            DB::table('orders')->whereIn('id', $fakeOrderIds)->delete();
        }

        // 2. Delete auto-generated fake reviews from SellerCommentController
        DB::table('product_reviews')
            ->where('comment', 'like', '%অসাধারণ প্রোডাক্ট! সাউন্ড কোয়ালিটি ও ব্যাটারি ব্যাকআপ খুবই ভালো%')
            ->delete();

        // 3. Delete auto-generated fake products from SellerCommentController
        DB::table('products')
            ->where('name', 'Premium Wireless Headphones')
            ->where('slug', 'like', 'premium-wireless-headphones-%')
            ->delete();

        // 4. Ensure any non-approved review is properly marked as pending and not verified
        if (Schema::hasTable('product_reviews')) {
            DB::table('product_reviews')
                ->where('status', '!=', 'approved')
                ->orWhereNull('status')
                ->update([
                    'status'      => 'pending',
                    'is_verified' => false,
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reverse needed for cleanup
    }
};
