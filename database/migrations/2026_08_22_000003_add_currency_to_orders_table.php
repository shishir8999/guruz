<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'currency')) {
                $table->string('currency', 10)->default('BDT')->after('total');
            }
            if (!Schema::hasColumn('orders', 'exchange_rate')) {
                $table->decimal('exchange_rate', 10, 4)->default(1.0000)->after('currency');
            }
            if (!Schema::hasColumn('orders', 'currency_amount')) {
                $table->decimal('currency_amount', 12, 2)->nullable()->after('exchange_rate');
            }
            if (!Schema::hasColumn('orders', 'country')) {
                $table->string('country', 50)->default('Bangladesh')->after('shipping_address');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'currency')) {
                $table->dropColumn(['currency', 'exchange_rate', 'currency_amount', 'country']);
            }
        });
    }
};
