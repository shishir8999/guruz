<?php
// cPanel System Diagnostic Script for Laravel
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Guruz cPanel System Diagnostic</title>
    <style>
        body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; max-width: 800px; margin: auto; }
        .card { background: #1e293b; padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem; border: 1px solid #334155; }
        .pass { color: #4ade80; font-weight: bold; }
        .fail { color: #f87171; font-weight: bold; }
        .warn { color: #fbbf24; font-weight: bold; }
        h1 { color: #38bdf8; }
        code { background: #0f172a; padding: 2px 6px; border-radius: 4px; color: #f472b6; }
    </style>
</head>
<body>
    <h1>🔍 Guruz cPanel Diagnostic Report</h1>
    
    <div class="card">
        <h3>1. PHP Version Check</h3>
        <?php $phpVersion = phpversion(); ?>
        <p>Current PHP Version: <code><?php echo $phpVersion; ?></code></p>
        <?php if (version_compare($phpVersion, '8.2.0', '>=')): ?>
            <p class="pass">✓ PASS: PHP 8.2+ is enabled!</p>
        <?php else: ?>
            <p class="fail">❌ FAIL: Laravel 11 requires PHP 8.2 or 8.3! Please change PHP Version in cPanel -> MultiPHP Manager to PHP 8.2.</p>
        <?php endif; ?>
    </div>

    <div class="card">
        <h3>2. Environment File (.env) Check</h3>
        <?php 
        $envPath = __DIR__ . '/.env';
        if (file_exists($envPath)): 
        ?>
            <p class="pass">✓ PASS: .env file exists.</p>
            <?php
            $envContent = file_get_contents($envPath);
            if (str_contains($envContent, 'APP_KEY=base64:')):
                echo '<p class="pass">✓ PASS: APP_KEY is specified in .env.</p>';
            else:
                echo '<p class="fail">❌ FAIL: APP_KEY is missing or empty in .env!</p>';
            endif;
            ?>
        <?php else: ?>
            <p class="fail">❌ FAIL: .env file does NOT exist in cPanel folder! Please create a .env file.</p>
        <?php endif; ?>
    </div>

    <div class="card">
        <h3>3. File Permissions Check</h3>
        <?php
        $storageWritable = is_writable(__DIR__ . '/storage');
        $cacheWritable = is_writable(__DIR__ . '/bootstrap/cache');
        ?>
        <p>Storage Folder Writable: <?php echo $storageWritable ? '<span class="pass">✓ YES (775/755)</span>' : '<span class="fail">❌ NO (Permission Denied)</span>'; ?></p>
        <p>Bootstrap Cache Writable: <?php echo $cacheWritable ? '<span class="pass">✓ YES (775/755)</span>' : '<span class="fail">❌ NO (Permission Denied)</span>'; ?></p>
    </div>

    <div class="card">
        <h3>4. Database Connection Check</h3>
        <?php
        if (file_exists($envPath)) {
            preg_match('/DB_HOST=(.*)/', $envContent, $dbHost);
            preg_match('/DB_DATABASE=(.*)/', $envContent, $dbName);
            preg_match('/DB_USERNAME=(.*)/', $envContent, $dbUser);
            preg_match('/DB_PASSWORD=(.*)/', $envContent, $dbPass);

            $host = trim($dbHost[1] ?? '127.0.0.1');
            $database = trim($dbName[1] ?? '');
            $username = trim($dbUser[1] ?? '');
            $password = trim($dbPass[1] ?? '');

            try {
                $pdo = new PDO("mysql:host={$host};dbname={$database}", $username, $password, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
                echo '<p class="pass">✓ PASS: Database Connected Successfully!</p>';
            } catch (Exception $e) {
                echo '<p class="fail">❌ FAIL: Database Connection Failed: ' . htmlspecialchars($e->getMessage()) . '</p>';
            }
        } else {
            echo '<p class="warn">⚠️ SKIPPED: .env file required for database check.</p>';
        }
        ?>
    </div>

</body>
</html>
