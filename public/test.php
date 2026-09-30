<?php
// Simple standalone PHP test file in public folder
header('Content-Type: text/html; charset=utf-8');
echo "<div style='font-family:sans-serif; padding:20px; background:#dcfce7; color:#166534; border-radius:10px; max-width:600px; margin:40px auto;'>";
echo "<h2>✅ Public PHP Server Working!</h2>";
echo "<p>PHP Version: <strong>" . PHP_VERSION . "</strong></p>";
echo "<p>Server Software: <strong>" . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "</strong></p>";
echo "<p>Document Root: <strong>" . ($_SERVER['DOCUMENT_ROOT'] ?? 'Unknown') . "</strong></p>";
echo "</div>";
