<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courier_logs', function (Blueprint $table) {
            $table->id();
            $table->string('courier'); // Steadfast, Pathao, RedX, Paperfly
            $table->string('endpoint');
            $table->string('status')->default('Success'); // Success, Failed
            $table->integer('status_code')->default(200);
            $table->longText('payload')->nullable();
            $table->longText('response')->nullable();
            $table->string('tracking_id')->nullable();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->timestamps();

            $table->index(['courier', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_logs');
    }
};
