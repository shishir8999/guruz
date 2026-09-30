<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('commission_rate',    5,  2)->nullable()->after('total');
            $table->decimal('commission_amount',  12, 2)->nullable()->after('commission_rate');
            $table->decimal('courier_charge',     12, 2)->nullable()->after('commission_amount');
            $table->decimal('vendor_net_earning', 12, 2)->nullable()->after('courier_charge');
            $table->timestamp('commission_settled_at')->nullable()->after('vendor_net_earning');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'commission_rate',
                'commission_amount',
                'courier_charge',
                'vendor_net_earning',
                'commission_settled_at',
            ]);
        });
    }
};
