<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('customer_wallets')) {
            Schema::table('customer_wallets', function (Blueprint $table) {
                if (!Schema::hasColumn('customer_wallets', 'total_earned')) {
                    $table->decimal('total_earned', 12, 2)->default(0.00)->after('balance');
                }
                if (!Schema::hasColumn('customer_wallets', 'total_spent')) {
                    $table->decimal('total_spent', 12, 2)->default(0.00)->after('total_earned');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('customer_wallets')) {
            Schema::table('customer_wallets', function (Blueprint $table) {
                if (Schema::hasColumn('customer_wallets', 'total_earned')) {
                    $table->dropColumn('total_earned');
                }
                if (Schema::hasColumn('customer_wallets', 'total_spent')) {
                    $table->dropColumn('total_spent');
                }
            });
        }
    }
};
