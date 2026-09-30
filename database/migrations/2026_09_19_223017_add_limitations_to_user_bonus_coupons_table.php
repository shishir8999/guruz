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
        Schema::table('user_bonus_coupons', function (Blueprint $table) {
            if (!Schema::hasColumn('user_bonus_coupons', 'min_order_amount')) {
                $table->decimal('min_order_amount', 10, 2)->default(0.00)->after('value');
            }
            if (!Schema::hasColumn('user_bonus_coupons', 'max_discount_amount')) {
                $table->decimal('max_discount_amount', 10, 2)->nullable()->after('min_order_amount');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_bonus_coupons', function (Blueprint $table) {
            if (Schema::hasColumn('user_bonus_coupons', 'max_discount_amount')) {
                $table->dropColumn('max_discount_amount');
            }
            if (Schema::hasColumn('user_bonus_coupons', 'min_order_amount')) {
                $table->dropColumn('min_order_amount');
            }
        });
    }
};
