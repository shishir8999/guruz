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
            $table->string('title_bn')->nullable();
            $table->string('subtitle_en')->nullable();
            $table->string('subtitle_bn')->nullable();
            $table->longText('content_bn')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->dropColumn(['title_bn', 'subtitle_en', 'subtitle_bn', 'content_bn']);
        });
    }
};
