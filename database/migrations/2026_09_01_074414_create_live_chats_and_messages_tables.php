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
        if (!Schema::hasTable('live_chat_threads')) {
            Schema::create('live_chat_threads', function (Blueprint $table) {
                $table->id();
                $table->string('session_id')->unique()->index();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('customer_name')->default('ভিজিটর');
                $table->string('customer_phone')->nullable();
                $table->string('customer_email')->nullable();
                $table->string('ip_address')->nullable();
                $table->string('user_agent')->nullable();
                $table->string('current_page')->nullable();
                $table->string('status')->default('open'); // open, closed
                $table->text('last_message')->nullable();
                $table->timestamp('last_message_at')->nullable();
                $table->unsignedInteger('unread_admin_count')->default(0);
                $table->unsignedInteger('unread_user_count')->default(0);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('live_chat_messages')) {
            Schema::create('live_chat_messages', function (Blueprint $table) {
                $table->id();
                $table->foreignId('live_chat_thread_id')->constrained('live_chat_threads')->cascadeOnDelete();
                $table->string('sender_type')->default('customer'); // customer, admin
                $table->foreignId('sender_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('sender_name')->default('কাস্টমার');
                $table->text('message');
                $table->string('attachment_url')->nullable();
                $table->string('attachment_type')->nullable(); // image, file
                $table->boolean('is_read')->default(false);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('live_chat_messages');
        Schema::dropIfExists('live_chat_threads');
    }
};
