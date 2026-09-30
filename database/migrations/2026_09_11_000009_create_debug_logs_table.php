<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('debug_logs', function (Blueprint $table) {
            $table->id();
            $table->string('type')->default('info'); // error, warning, info, debug
            $table->text('message');
            $table->json('context')->nullable();
            $table->string('channel')->default('laravel.log');
            $table->string('file_path')->nullable();
            $table->integer('line_number')->nullable();
            $table->string('ip_address')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['type', 'channel']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('debug_logs');
    }
};
