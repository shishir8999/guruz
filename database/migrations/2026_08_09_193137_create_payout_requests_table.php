<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('payout_requests')) {
            Schema::create('payout_requests', function (Blueprint $table) {
                $table->id();
                $table->string('seller_name');
                $table->decimal('amount', 10, 2);
                $table->string('payment_method');
                $table->string('account_details');
                $table->enum('status', ['Pending', 'Completed', 'Rejected'])->default('Pending');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('payout_requests');
    }
};
