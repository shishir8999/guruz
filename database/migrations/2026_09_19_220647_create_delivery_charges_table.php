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
        if (!Schema::hasTable('delivery_charges')) {
            Schema::create('delivery_charges', function (Blueprint $table) {
                $table->id();
                $table->string('code', 50)->unique(); // inside_dhaka, outside_dhaka
                $table->string('title', 100); // ঢাকার ভিতরে, ঢাকার বাইরে
                $table->string('title_en', 100)->nullable(); // Inside Dhaka, Outside Dhaka
                $table->decimal('charge', 10, 2)->default(0.00); // 80.00, 120.00
                $table->string('estimated_days', 100)->nullable(); // ২-৩ কার্যদিবস
                $table->boolean('is_default')->default(false);
                $table->boolean('is_active')->default(true);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });

            // Insert initial default rates: Inside Dhaka = 80, Outside Dhaka = 120
            \Illuminate\Support\Facades\DB::table('delivery_charges')->insert([
                [
                    'code' => 'inside_dhaka',
                    'title' => 'ঢাকার ভিতরে',
                    'title_en' => 'Inside Dhaka',
                    'charge' => 80.00,
                    'estimated_days' => '২-৩ দিন',
                    'is_default' => true,
                    'is_active' => true,
                    'sort_order' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'code' => 'outside_dhaka',
                    'title' => 'ঢাকার বাইরে',
                    'title_en' => 'Outside Dhaka',
                    'charge' => 120.00,
                    'estimated_days' => '৩-৫ দিন',
                    'is_default' => false,
                    'is_active' => true,
                    'sort_order' => 2,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_charges');
    }
};
