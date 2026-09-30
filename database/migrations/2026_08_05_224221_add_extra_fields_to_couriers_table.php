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
        Schema::table('couriers', function (Blueprint $table) {
            $table->string('logo')->nullable();
            $table->decimal('delivery_fee', 8, 2)->default(60);
            $table->string('phone')->nullable();
            $table->string('code')->unique()->nullable();
            $table->string('email')->nullable();
            $table->string('tracking_url_template')->nullable();
            $table->decimal('per_kg_fee', 8, 2)->default(15);
            $table->decimal('cod_fee_percent', 5, 2)->default(1);
            $table->integer('sort_order')->default(0);
            $table->text('coverage_areas')->nullable();
            $table->text('notes')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('couriers', function (Blueprint $table) {
            $table->dropColumn([
                'logo', 'delivery_fee', 'phone', 'code', 'email', 
                'tracking_url_template', 'per_kg_fee', 'cod_fee_percent', 
                'sort_order', 'coverage_areas', 'notes'
            ]);
        });
    }
};
