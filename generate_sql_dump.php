<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$sql = "-- ============================================================\n";
$sql .= "-- GURUZ E-Commerce MySQL Database Dump for cPanel Import\n";
$sql .= "-- Generated: " . date('Y-m-d H:i:s') . "\n";
$sql .= "-- MySQL Version Compatibility: 5.7+ / 8.0+ / MariaDB 10.3+\n";
$sql .= "-- ============================================================\n\n";
$sql .= "SET FOREIGN_KEY_CHECKS = 0;\n";
$sql .= "SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';\n";
$sql .= "SET time_zone = '+06:00';\n\n";

$tables = [
    'users',
    'shops',
    'categories',
    'brands',
    'products',
    'product_images',
    'product_variants',
    'orders',
    'order_items',
    'warranty_claims',
    'vendor_kycs',
    'payout_requests',
    'coupons',
    'reviews',
    'wishlists',
    'customer_wallets',
    'seller_wallets',
    'site_settings',
    'hero_sliders',
    'top_banners',
    'footer_widgets',
    'footer_links',
    'subscribers',
    'pages',
    'staff_permissions',
    'system_notifications',
    'visitor_logs',
    'units',
    'product_attributes',
    'purchases',
    'warehouses',
];

$driver = DB::connection()->getDriverName();

foreach ($tables as $table) {
    if (!Schema::hasTable($table)) {
        continue;
    }

    $sql .= "-- --------------------------------------------------------\n";
    $sql .= "-- Table structure for `$table`\n";
    $sql .= "-- --------------------------------------------------------\n";
    $sql .= "DROP TABLE IF EXISTS `$table`;\n";

    if ($driver === 'sqlite') {
        // SQLite create table query
        $row = DB::selectOne("SELECT sql FROM sqlite_master WHERE type='table' AND name=?", [$table]);
        if ($row && isset($row->sql)) {
            $createSql = $row->sql;
            // Clean up SQLite syntax to standard MySQL
            $createSql = preg_replace('/"([^"]+)"/', '`$1`', $createSql);
            $createSql = str_replace('autoincrement', 'AUTO_INCREMENT', $createSql);
            $sql .= $createSql . ";\n\n";
        }
    } else {
        $row = DB::selectOne("SHOW CREATE TABLE `$table`");
        $propName = 'Create Table';
        if (isset($row->$propName)) {
            $sql .= $row->$propName . ";\n\n";
        }
    }

    // Insert Rows
    $rows = DB::table($table)->get();
    if ($rows->count() > 0) {
        $sql .= "-- Dumping data for table `$table`\n";
        foreach ($rows as $r) {
            $array = (array)$r;
            $keys = array_map(fn($k) => "`$k`", array_keys($array));
            $values = array_map(function($v) {
                if (is_null($v)) return 'NULL';
                return DB::getPdo()->quote($v);
            }, array_values($array));

            $sql .= "INSERT INTO `$table` (" . implode(', ', $keys) . ") VALUES (" . implode(', ', $values) . ");\n";
        }
        $sql .= "\n";
    }
}

$sql .= "SET FOREIGN_KEY_CHECKS = 1;\n";

file_put_contents(__DIR__ . '/guruz_database.sql', $sql);
file_put_contents(__DIR__ . '/public/guruz_database.sql', $sql);

echo "✅ MySQL Database dump created successfully at 'guruz_database.sql' (" . strlen($sql) . " bytes)\n";
