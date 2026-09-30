<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $addIndexSafely = function ($table, $columns, $indexName) {
            if (Schema::hasTable($table)) {
                $existingIndexes = collect(\Illuminate\Support\Facades\DB::select("SHOW INDEX FROM `{$table}`"))->pluck('Key_name')->unique()->toArray();
                if (!in_array($indexName, $existingIndexes)) {
                    Schema::table($table, function (Blueprint $tableBlueprint) use ($columns, $indexName) {
                        $tableBlueprint->index($columns, $indexName);
                    });
                }
            }
        };

        $addIndexSafely('payment_gateways', ['code', 'is_active'], 'idx_gw_code_active');
        $addIndexSafely('customer_wallets', ['user_id'], 'idx_wallets_user_id');
        $addIndexSafely('customer_wallet_transactions', ['customer_wallet_id', 'type'], 'idx_cwt_wallet_type');
        $addIndexSafely('orders', ['user_id', 'status'], 'idx_orders_user_status');
        $addIndexSafely('orders', ['order_number'], 'idx_orders_order_number');
        $addIndexSafely('order_items', ['order_id', 'product_id'], 'idx_order_items_lookup');
        $addIndexSafely('site_settings', ['key'], 'idx_settings_key');
        $addIndexSafely('coupons', ['code', 'is_active'], 'idx_coupons_code_active');
        $addIndexSafely('offers', ['user_id', 'status'], 'idx_offers_user_status');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
