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
        if (!Schema::hasColumn('pickup_requests', 'order_id')) {
            Schema::table('pickup_requests', function (Blueprint $table) {
                $table->unsignedBigInteger('order_id')->nullable()->after('id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('pickup_requests', 'order_id')) {
            Schema::table('pickup_requests', function (Blueprint $table) {
                $table->dropColumn('order_id');
            });
        }
    }
};
