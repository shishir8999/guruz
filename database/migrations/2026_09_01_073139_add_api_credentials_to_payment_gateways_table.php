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
        Schema::table('payment_gateways', function (Blueprint $table) {
            $table->string('gateway_type')->default('manual')->after('is_active'); // 'manual' or 'automated_api'
            $table->string('environment')->default('live')->after('gateway_type'); // 'sandbox' or 'live'
            $table->text('api_key')->nullable()->after('environment');
            $table->text('secret_key')->nullable()->after('api_key');
            $table->text('app_key')->nullable()->after('secret_key');
            $table->text('app_secret')->nullable()->after('app_key');
            $table->string('merchant_id')->nullable()->after('app_secret');
            $table->text('token_id')->nullable()->after('merchant_id');
            $table->text('webhook_secret')->nullable()->after('token_id');
            $table->string('callback_url')->nullable()->after('webhook_secret');
            $table->json('extra_config')->nullable()->after('callback_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_gateways', function (Blueprint $table) {
            $table->dropColumn([
                'gateway_type',
                'environment',
                'api_key',
                'secret_key',
                'app_key',
                'app_secret',
                'merchant_id',
                'token_id',
                'webhook_secret',
                'callback_url',
                'extra_config'
            ]);
        });
    }
};
