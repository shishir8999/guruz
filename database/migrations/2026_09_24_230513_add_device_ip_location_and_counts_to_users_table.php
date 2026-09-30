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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'last_login_ip')) {
                $table->string('last_login_ip', 64)->nullable()->after('last_login_at');
            }
            if (!Schema::hasColumn('users', 'last_login_device')) {
                $table->string('last_login_device', 191)->nullable()->after('last_login_ip');
            }
            if (!Schema::hasColumn('users', 'last_login_location')) {
                $table->string('last_login_location', 191)->nullable()->after('last_login_device');
            }
            if (!Schema::hasColumn('users', 'login_count')) {
                $table->unsignedInteger('login_count')->default(0)->after('last_login_location');
            }
            if (!Schema::hasColumn('users', 'logout_count')) {
                $table->unsignedInteger('logout_count')->default(0)->after('login_count');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'last_login_ip',
                'last_login_device',
                'last_login_location',
                'login_count',
                'logout_count',
            ]);
        });
    }
};
