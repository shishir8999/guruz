<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Table already exists — add missing columns if needed
        Schema::table('product_attributes', function (Blueprint $table) {
            if (!Schema::hasColumn('product_attributes', 'type')) {
                $table->string('type')->default('text')->after('name');
            }
            if (!Schema::hasColumn('product_attributes', 'values')) {
                $table->json('values')->nullable()->after('type');
            }
            if (!Schema::hasColumn('product_attributes', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('values');
            }
        });
    }

    public function down(): void
    {
        // Do not drop — table pre-existed
    }
};
