<?php

// 1. Check PHP Version
if (version_compare(PHP_VERSION, '8.2.0', '<')) {
    die('<div style="font-family:sans-serif;padding:30px;background:#fee2e2;color:#991b1b;border:2px solid #ef4444;border-radius:10px;max-width:600px;margin:50px auto;">' .
        '<h2>⚠️ cPanel PHP Version Action Required</h2>' .
        '<p>আপনার cPanel সার্ভারে বর্তমান PHP ভার্সন: <strong>' . PHP_VERSION . '</strong></p>' .
        '<p>Laravel 11 চালানোর জন্য অবশ্যই <strong>PHP 8.2</strong> অথবা <strong>PHP 8.3</strong> প্রয়োজন।</p>' .
        '<hr style="border:0;border-top:1px solid #fca5a5;margin:15px 0;">' .
        '<strong>সমাধান:</strong> cPanel-এ গিয়ে <strong>Select PHP Version</strong> অপশন থেকে PHP Version টি <strong>8.2</strong> বা <strong>8.3</strong> সেট করুন।' .
        '</div>');
}

// 2. Stripper for www subdomain
$host = isset($_SERVER['HTTP_HOST']) ? strtolower($_SERVER['HTTP_HOST']) : '';
if (substr($host, 0, 4) === 'www.') {
    $cleanHost = preg_replace('/^www\./i', '', $host);
    header("Location: https://" . $cleanHost . ($_SERVER['REQUEST_URI'] ?? '/'), true, 301);
    exit();
}

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

// 3. Auto-heal required storage directories if missing
$storageBase = __DIR__ . '/storage';
$requiredDirs = [
    $storageBase . '/framework/sessions',
    $storageBase . '/framework/views',
    $storageBase . '/framework/cache/data',
    $storageBase . '/framework/testing',
    $storageBase . '/app/public',
    $storageBase . '/logs',
    __DIR__ . '/bootstrap/cache',
];
foreach ($requiredDirs as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0777, true);
    }
}

if (file_exists(__DIR__.'/vendor/autoload.php')) {
    require __DIR__.'/vendor/autoload.php';
}

(require_once __DIR__.'/bootstrap/app.php')
    ->handleRequest(Request::capture());
