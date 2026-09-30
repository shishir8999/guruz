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
        Schema::table('pages', function (Blueprint $table) {
            $table->string('category')->nullable()->after('slug');
            $table->text('short_description')->nullable()->after('category');
            $table->renameColumn('meta_title', 'seo_title');
            $table->renameColumn('banner_image', 'featured_image');
            $table->string('status')->default('draft')->after('is_published');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->dropColumn('category');
            $table->dropColumn('short_description');
            $table->renameColumn('seo_title', 'meta_title');
            $table->renameColumn('featured_image', 'banner_image');
            $table->dropColumn('status');
        });
    }
};
