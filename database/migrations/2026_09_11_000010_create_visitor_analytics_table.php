<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visitor_analytics', function (Blueprint $table) {
            $table->id();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('device')->default('Desktop'); // Desktop, Mobile, Tablet
            $table->string('browser')->nullable();
            $table->string('os')->nullable();
            $table->string('page_url')->nullable();
            $table->string('referrer')->nullable();
            $table->string('country')->default('Bangladesh');
            $table->string('city')->nullable();
            $table->string('session_id')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('visited_at')->nullable();
            $table->timestamps();

            $table->index(['visited_at', 'device']);
            $table->index('ip_address');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visitor_analytics');
    }
};
