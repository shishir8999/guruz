<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cart_followups', function (Blueprint $table) {
            $table->id();
            $table->string('code')->nullable(); // e.g. #CF-1001
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('customer_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->decimal('cart_value', 12, 2)->default(0);
            $table->string('stage')->default('1st Email Sent'); // 1st Email Sent, 2nd Email Sent, Final Notice, Recovered
            $table->string('status')->default('In Progress'); // In Progress, Success, Failed
            $table->dateTime('last_contacted_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'stage']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cart_followups');
    }
};
