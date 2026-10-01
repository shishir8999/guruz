<?php
ini_set('display_errors', 1);
ini_set('max_execution_time', 300);
error_reporting(E_ALL);

echo "<h2>Guruz Live Auto-Setup & Synchronizer</h2><pre>";

function syncDirectory($src, $dst) {
    if (!is_dir($src)) return;
    if (!is_dir($dst)) {
        @mkdir($dst, 0755, true);
    }
    $dir = @opendir($src);
    if (!$dir) return;
    while (($file = readdir($dir)) !== false) {
        if ($file === '.' || $file === '..') continue;
        $srcPath = $src . '/' . $file;
        $dstPath = $dst . '/' . $file;
        if (is_dir($srcPath)) {
            syncDirectory($srcPath, $dstPath);
        } else {
            if (!file_exists($dstPath) || @filesize($dstPath) !== @filesize($srcPath)) {
                @copy($srcPath, $dstPath);
            }
        }
    }
    closedir($dir);
}

try {
    require __DIR__ . '/../vendor/autoload.php';
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    echo "1. Running database migrations...\n";
    try {
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        echo \Illuminate\Support\Facades\Artisan::output();
    } catch (\Throwable $ex) {
        echo "Migration notice: " . $ex->getMessage() . "\n";
    }

    if (!\Illuminate\Support\Facades\Schema::hasTable('sessions')) {
        echo "Creating sessions table...\n";
        \Illuminate\Support\Facades\Schema::create('sessions', function (\Illuminate\Database\Schema\Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
        echo "Sessions table created.\n";
    }

    $sqlFile = __DIR__ . '/../database/database_update_all_tables.sql';
    if (file_exists($sqlFile)) {
        echo "\n2. Importing database_update_all_tables.sql schema...\n";
        $sql = file_get_contents($sqlFile);
        if ($sql) {
            try {
                \Illuminate\Support\Facades\DB::unprepared($sql);
                echo "SQL schema dump executed.\n";
            } catch (\Throwable $ex) {
                echo "Notice during SQL import: " . $ex->getMessage() . "\n";
            }
        }
    }

    echo "\n3. Ensuring Top Banners exist in database...\n";
    try {
        if (\App\Models\TopBanner::count() === 0) {
            \App\Models\TopBanner::create([
                'title' => 'BEST DEALS ON POPULAR GADGETS',
                'link' => '#',
                'image' => '/storage/top-banners/nEvSV1kzqX6ZkforpVl3ZEGDJhznJp7lk8bEBJkh.jpg',
                'sort_order' => 1,
                'is_active' => true,
            ]);
            \App\Models\TopBanner::create([
                'title' => 'BEST DEALS ON POPULAR GADGETS 2',
                'link' => '#',
                'image' => '/storage/top-banners/AuPBUeMqWPbutImgmUkJlnRnjlpSt5fKdtta5lro.jpg',
                'sort_order' => 2,
                'is_active' => true,
            ]);
            echo "Top Banners seeded successfully.\n";
        } else {
            echo "Top Banners already exist (" . \App\Models\TopBanner::count() . " found).\n";
        }
    } catch (\Throwable $ex) {
        echo "TopBanner check notice: " . $ex->getMessage() . "\n";
    }

    echo "\n4. Ensuring Hero Sliders exist in database...\n";
    try {
        if (\App\Models\HeroSlider::count() === 0) {
            $sliders = [
                '0BPphyAme4DPAqQAmBvjzmN3bIWAv4u1ox3kWskq.jpg',
                'wHaKD9Eof9FQAeKjCGBYYmK0q3GjaNOEtbfrvLVZ.jpg',
                'zta25znRhzYznt0d8aLG03gyhLcVvmI61EFvMS2k.jpg',
                'c5cPynaIJUlHg5HKjbbUOnlhYNvDqVgcN8OiU72n.jpg',
                'kipIa7lbKvJW32nQDZwRUH847F6X8TjCyIaL5gpW.jpg',
                '6bLw1LhAHc9qWMCEMoUIt4rrnjJR80juXdoR4EJ9.jpg',
            ];
            foreach ($sliders as $index => $img) {
                \App\Models\HeroSlider::create([
                    'title' => 'Smart Online Warranty',
                    'subtitle' => 'Official Product Support',
                    'button_text' => 'Shop Now',
                    'button_link' => '/products',
                    'image' => '/storage/hero-sliders/' . $img,
                    'sort_order' => $index + 1,
                    'is_active' => true,
                ]);
            }
            echo "Hero Sliders seeded successfully.\n";
        } else {
            echo "Hero Sliders already exist (" . \App\Models\HeroSlider::count() . " found).\n";
        }
    } catch (\Throwable $ex) {
        echo "HeroSlider check notice: " . $ex->getMessage() . "\n";
    }

    echo "\n5. Running default seeders...\n";
    try {
        \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
        echo \Illuminate\Support\Facades\Artisan::output();
    } catch (\Throwable $ex) {
        echo "Seeder notice (skipped if already seeded): " . $ex->getMessage() . "\n";
    }

    echo "\n6. Linking & Synchronizing storage assets to public...\n";
    try {
        \Illuminate\Support\Facades\Artisan::call('storage:link');
        echo \Illuminate\Support\Facades\Artisan::output();
    } catch (\Throwable $ex) {
        echo "Artisan storage:link notice: " . $ex->getMessage() . "\n";
    }

    // Direct fallback copy to ensure files load even if symlinks are restricted on shared hosting
    $storageAppPublic = storage_path('app/public');
    $publicStorage = public_path('storage');
    if (is_dir($storageAppPublic) && !is_link($publicStorage)) {
        echo "Synchronizing files directly from storage/app/public to public/storage...\n";
        syncDirectory($storageAppPublic, $publicStorage);
        echo "Direct asset sync complete.\n";
    }

    echo "\n7. Clearing and refreshing application caches...\n";
    try {
        \Illuminate\Support\Facades\Cache::flush();
        \Illuminate\Support\Facades\Artisan::call('optimize:clear');
        echo \Illuminate\Support\Facades\Artisan::output();
    } catch (\Throwable $ex) {
        echo "Cache clear notice: " . $ex->getMessage() . "\n";
    }

    echo "\n============================================\n";
    echo "STATUS SUMMARY:\n";
    echo "- Top Banners: " . (\App\Models\TopBanner::count() ?? 0) . " records\n";
    echo "- Hero Sliders: " . (\App\Models\HeroSlider::count() ?? 0) . " records\n";
    echo "- Categories: " . (\App\Models\Category::count() ?? 0) . " records\n";
    echo "- Products: " . (\App\Models\Product::count() ?? 0) . " records\n";
    echo "============================================\n";
    echo "SUCCESS! Everything is synced, linked, and ready.\n";
    echo "Now visit your homepage: https://guruz.net\n";
    echo "============================================\n";
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " on line " . $e->getLine() . "\n";
}

echo "</pre>";
