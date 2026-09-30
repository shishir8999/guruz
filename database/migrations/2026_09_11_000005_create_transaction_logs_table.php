<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaction_logs', function (Blueprint $table) {
            $table->id();
            $table->string('txn_id')->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name')->nullable();
            $table->decimal('amount', 12, 2)->default(0);
            $table->string('type')->default('Credit'); // Credit, Debit
            $table->string('method')->default('bKash'); // bKash, Nagad, Visa, Mastercard, Upay, Bank Transfer
            $table->string('status')->default('Completed'); // Completed, Pending, Failed, Refunded
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->dateTime('transaction_date')->nullable();
            $table->timestamps();

            $table->index(['status', 'method']);
            $table->index('txn_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_logs');
    }
};
