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
        Schema::table('products', function (Blueprint $table) {
            $table->string('product_type')->default('single')->after('name');
            $table->decimal('purchase_price', 10, 2)->nullable()->after('price');
            $table->boolean('is_retail')->default(true)->after('is_active');
            $table->boolean('is_wholesale')->default(false)->after('is_retail');
            $table->text('specification')->nullable()->after('description');
            $table->decimal('weight', 8, 2)->nullable()->after('stock_quantity');
            $table->string('warranty_type')->nullable()->after('weight');
            $table->string('unit')->nullable()->after('brand_id');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'product_type', 'purchase_price', 'is_retail', 'is_wholesale', 
                'specification', 'weight', 'warranty_type', 'unit'
            ]);
            $table->dropSoftDeletes();
        });
    }
};
