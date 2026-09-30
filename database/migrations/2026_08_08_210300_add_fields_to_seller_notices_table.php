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
        Schema::table('seller_notices', function (Blueprint $table) {
            if (!Schema::hasColumn('seller_notices', 'content')) {
                $table->text('content')->nullable();
            }
            if (!Schema::hasColumn('seller_notices', 'target')) {
                $table->string('target')->default('All Sellers');
            }
            if (!Schema::hasColumn('seller_notices', 'status')) {
                $table->string('status')->default('published');
            }
            if (!Schema::hasColumn('seller_notices', 'views')) {
                $table->unsignedBigInteger('views')->default(0);
            }
            if (!Schema::hasColumn('seller_notices', 'published_at')) {
                $table->timestamp('published_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seller_notices', function (Blueprint $table) {
            $table->dropColumn(['content', 'target', 'status', 'views', 'published_at']);
        });
    }
};
