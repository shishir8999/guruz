<?php
ini_set('display_errors', 1);
ini_set('max_execution_time', 300);
error_reporting(E_ALL);

echo "<h2>Database Setup & Migration</h2><pre>";

try {
    require __DIR__ . '/../vendor/autoload.php';
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    echo "1. Running migrations...\n";
    \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
    echo \Illuminate\Support\Facades\Artisan::output();

    if (!\Illuminate\Support\Facades\Schema::hasTable('sessions')) {
        echo "Creating sessions table explicitly...\n";
        \Illuminate\Support\Facades\Schema::create('sessions', function (\Illuminate\Database\Schema\Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
        echo "sessions table created successfully.\n";
    }

    $sqlFile = __DIR__ . '/../database/database_update_all_tables.sql';
    if (file_exists($sqlFile)) {
        echo "\n2. Importing database_update_all_tables.sql schema...\n";
        $sql = file_get_contents($sqlFile);
        if ($sql) {
            try {
                \Illuminate\Support\Facades\DB::unprepared($sql);
                echo "SQL schema import completed successfully.\n";
            } catch (\Throwable $ex) {
                echo "Notice: " . $ex->getMessage() . "\n";
            }
        }
    }

    echo "\n3. Running seeders (Admin & Default Data)...\n";
    \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
    echo \Illuminate\Support\Facades\Artisan::output();

    echo "\n4. Linking storage...\n";
    \Illuminate\Support\Facades\Artisan::call('storage:link');
    echo \Illuminate\Support\Facades\Artisan::output();

    echo "\n5. Clearing caches...\n";
    \Illuminate\Support\Facades\Artisan::call('optimize:clear');
    echo \Illuminate\Support\Facades\Artisan::output();

    echo "\n============================================\n";
    echo "SUCCESS! All database tables, seeders, and links are ready.\n";
    echo "Now visit your homepage: https://guruz.net\n";
    echo "============================================\n";
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " on line " . $e->getLine() . "\n";
}

echo "</pre>";
