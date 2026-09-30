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
        Schema::table('shops', function (Blueprint $table) {
            $table->string('nid_front_url')->nullable()->after('status');
            $table->string('nid_back_url')->nullable()->after('nid_front_url');
            $table->string('trade_license_url')->nullable()->after('nid_back_url');
            $table->string('bank_statement_url')->nullable()->after('trade_license_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shops', function (Blueprint $table) {
            $table->dropColumn([
                'nid_front_url',
                'nid_back_url',
                'trade_license_url',
                'bank_statement_url',
            ]);
        });
    }
};
