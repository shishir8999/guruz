<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warranty_claims', function (Blueprint $table) {
            $table->id();
            $table->string('claim_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_name');
            $table->string('mobile_number');
            $table->string('email')->nullable();
            $table->string('order_id')->nullable();
            $table->string('product_name');
            $table->string('brand_name')->nullable();
            $table->string('product_model')->nullable();
            $table->date('purchase_date')->nullable();
            $table->string('issue_category');
            $table->text('problem_details');
            $table->string('video_path')->nullable();
            $table->string('google_drive_link')->nullable();
            $table->string('status')->default('pending'); // pending, under_review, approved, rejected
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warranty_claims');
    }
};
