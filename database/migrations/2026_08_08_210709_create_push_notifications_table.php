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
        Schema::create('push_notifications', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('message')->nullable();
            $table->string('target')->default('All App Users'); // All App Users, Cart Abandoners, Premium Members, Outdated App Versions
            $table->enum('status', ['sent', 'active', 'scheduled', 'draft'])->default('draft');
            $table->unsignedBigInteger('sent_count')->default(0);
            $table->string('scheduled_for')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('push_notifications');
    }
};
