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
        Schema::table('audit_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('audit_logs', 'user')) {
                $table->string('user')->default('Super Admin');
            }
            if (!Schema::hasColumn('audit_logs', 'module')) {
                $table->string('module')->default('System');
            }
            if (!Schema::hasColumn('audit_logs', 'details')) {
                $table->text('details')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropColumn(['user', 'module', 'details']);
        });
    }
};
