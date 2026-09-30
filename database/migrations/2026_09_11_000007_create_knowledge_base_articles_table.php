<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('knowledge_base_articles', function (Blueprint $table) {
            $table->id();
            $table->string('code')->nullable(); // e.g. #KB-3001
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category')->default('General');
            $table->longText('content')->nullable();
            $table->unsignedInteger('views_count')->default(0);
            $table->string('status')->default('Published'); // Published, Draft, Archived
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'category']);
            $table->index('slug');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_base_articles');
    }
};
