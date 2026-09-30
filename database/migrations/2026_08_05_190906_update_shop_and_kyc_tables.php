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
        /* Schema::table('shops', function (Blueprint $table) {
            $table->dropColumn([
                'nid_front_url',
                'nid_back_url',
                'trade_license_url',
                'bank_statement_url',
            ]);
        }); */

        Schema::create('vendor_kycs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('nid_number')->nullable();
            $table->string('nid_front_image')->nullable();
            $table->string('nid_back_image')->nullable();
            $table->string('trade_license_number')->nullable();
            $table->string('trade_license_image')->nullable();
            $table->string('bank_statement_image')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('account_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('branch_name')->nullable();
            $table->string('routing_number')->nullable();
            $table->string('status')->default('Pending'); // Pending, Approved, Rejected
            $table->text('rejection_reason')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_kycs');

        Schema::table('shops', function (Blueprint $table) {
            $table->string('nid_front_url')->nullable();
            $table->string('nid_back_url')->nullable();
            $table->string('trade_license_url')->nullable();
            $table->string('bank_statement_url')->nullable();
        });
    }
};
