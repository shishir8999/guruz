<?php
// One-click Laravel Cache Cleaner Script for cPanel
header('Content-Type: text/html; charset=utf-8');

echo '<div style="font-family:sans-serif; padding:30px; background:#0f172a; color:#f8fafc; border-radius:12px; max-width:650px; margin:40px auto; border:1px solid #334155;">';
echo '<h2 style="color:#38bdf8; margin-top:0;">🧹 Guruz cPanel Cache Cleaner</h2>';

function deleteFolderFiles($dir) {
    if (!is_dir($dir)) return 0;
    $count = 0;
    $files = array_diff(scandir($dir), array('.', '..', '.gitignore'));
    foreach ($files as $file) {
        $path = $dir . '/' . $file;
        if (is_dir($path)) {
            $count += deleteFolderFiles($path);
            @rmdir($path);
        } else {
            if (@unlink($path)) $count++;
        }
    }
    return $count;
}

// 1. Clear Bootstrap Cache
$bootstrapCacheDir = __DIR__ . '/bootstrap/cache';
$bCount = deleteFolderFiles($bootstrapCacheDir);
echo "<p style='color:#4ade80;'>✓ Bootstrap Cache Cleared ({$bCount} files deleted)</p>";

// 2. Clear Views Cache
$viewsDir = __DIR__ . '/storage/framework/views';
$vCount = deleteFolderFiles($viewsDir);
echo "<p style='color:#4ade80;'>✓ Blade View Cache Cleared ({$vCount} files deleted)</p>";

// 3. Clear Framework Cache
$cacheDir = __DIR__ . '/storage/framework/cache/data';
$cCount = deleteFolderFiles($cacheDir);
echo "<p style='color:#4ade80;'>✓ App Framework Cache Cleared ({$cCount} files deleted)</p>";

// 4. Remove public/hot if exists
$hotFile = __DIR__ . '/public/hot';
if (file_exists($hotFile)) {
    @unlink($hotFile);
    echo "<p style='color:#fbbf24;'>✓ Public Hot File Removed</p>";
} else {
    echo "<p style='color:#94a3b8;'>• Public Hot File not present</p>";
}

echo '<hr style="border:0; border-top:1px solid #334155; margin:20px 0;">';
echo '<h3 style="color:#4ade80; margin-bottom:5px;">✅ All Laravel Server Caches Successfully Cleared!</h3>';
echo '<p style="color:#cbd5e1; font-size:14px;">এখন আপনার ওয়েবসাইটে গিয়ে <strong>Ctrl + F5</strong> দিয়ে রিলোড দিন।</p>';
echo '</div>';
