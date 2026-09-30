<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('product_attributes', 'product_id')) {
            DB::statement("ALTER TABLE product_attributes MODIFY product_id BIGINT UNSIGNED NULL;");
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('product_attributes', 'product_id')) {
            DB::statement("ALTER TABLE product_attributes MODIFY product_id BIGINT UNSIGNED NOT NULL;");
        }
    }
};
