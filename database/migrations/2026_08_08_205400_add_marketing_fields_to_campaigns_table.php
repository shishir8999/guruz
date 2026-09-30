<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            if (!Schema::hasColumn('campaigns', 'title')) {
                $table->string('title')->nullable();
            }
            if (!Schema::hasColumn('campaigns', 'banner')) {
                $table->string('banner')->nullable();
            }
            if (!Schema::hasColumn('campaigns', 'audience')) {
                $table->string('audience')->default('All Customers');
            }
            if (!Schema::hasColumn('campaigns', 'views')) {
                $table->unsignedBigInteger('views')->default(0);
            }
            if (!Schema::hasColumn('campaigns', 'conversion')) {
                $table->string('conversion')->default('0%');
            }
            if (!Schema::hasColumn('campaigns', 'start_date')) {
                $table->date('start_date')->nullable();
            }
            if (!Schema::hasColumn('campaigns', 'end_date')) {
                $table->date('end_date')->nullable();
            }
        });

        // Make legacy columns nullable if they exist
        try {
            DB::statement('ALTER TABLE campaigns MODIFY COLUMN name VARCHAR(255) NULL');
        } catch (\Throwable $e) {}
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn(['title', 'banner', 'audience', 'views', 'conversion', 'start_date', 'end_date']);
        });
    }
};
