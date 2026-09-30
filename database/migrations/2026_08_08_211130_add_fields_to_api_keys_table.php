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
        Schema::table('api_keys', function (Blueprint $table) {
            if (!Schema::hasColumn('api_keys', 'key_id')) {
                $table->string('key_id')->nullable();
            }
            if (!Schema::hasColumn('api_keys', 'key_token')) {
                $table->string('key_token')->nullable();
            }
            if (!Schema::hasColumn('api_keys', 'permissions')) {
                $table->json('permissions')->nullable();
            }
            if (!Schema::hasColumn('api_keys', 'status')) {
                $table->string('status')->default('Active');
            }
            if (!Schema::hasColumn('api_keys', 'last_used')) {
                $table->string('last_used')->default('Never');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('api_keys', function (Blueprint $table) {
            $table->dropColumn(['key_id', 'key_token', 'permissions', 'status', 'last_used']);
        });
    }
};
