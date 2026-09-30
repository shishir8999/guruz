<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Artisan;
use Ifsnop\Mysqldump\Mysqldump;
use ZipArchive;

class AdminBackupController extends Controller
{
    private $backupDisk = 'local';
    private $backupDir = 'backups';

    public function index()
    {
        $storageDir = Storage::disk($this->backupDisk)->path($this->backupDir);
        if (!File::isDirectory($storageDir)) {
            File::makeDirectory($storageDir, 0755, true, true);
        }

        $files = Storage::disk($this->backupDisk)->files($this->backupDir);
        $backups = [];

        foreach ($files as $file) {
            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            if ($ext === 'sql' || $ext === 'zip') {
                $isFull = ($ext === 'zip');
                $sizeInBytes = Storage::disk($this->backupDisk)->size($file);
                
                $backups[] = [
                    'name' => basename($file),
                    'path' => $file,
                    'type' => $isFull ? 'full' : 'db',
                    'size' => $this->humanFilesize($sizeInBytes),
                    'size_raw' => $sizeInBytes,
                    'date' => date('Y-m-d H:i:s', Storage::disk($this->backupDisk)->lastModified($file)),
                ];
            }
        }

        // Sort descending by date
        usort($backups, function ($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });

        // Collect platform statistics
        $stats = [
            'total_products' => \App\Models\Product::count(),
            'total_users'    => \App\Models\User::count(),
            'total_orders'   => \App\Models\Order::count(),
            'total_backups'  => count($backups),
        ];

        return Inertia::render('Admin/System/DatabaseBackup', [
            'backups' => $backups,
            'stats'   => $stats,
        ]);
    }

    public function create(Request $request)
    {
        set_time_limit(600);
        ini_set('memory_limit', '1024M');

        try {
            $type = $request->input('type', 'full'); // 'full' or 'db'
            $storagePath = Storage::disk($this->backupDisk)->path($this->backupDir);
            
            if (!File::isDirectory($storagePath)) {
                File::makeDirectory($storagePath, 0755, true, true);
            }

            $timestamp = date('Y_m_d_H_i_s');

            // 1. Generate MySQL Dump
            $tempSqlFile = $storagePath . '/temp_dump_' . $timestamp . '.sql';

            $host = config('database.connections.mysql.host', '127.0.0.1');
            $port = config('database.connections.mysql.port', '3306');
            $dbName = config('database.connections.mysql.database');
            $user = config('database.connections.mysql.username', 'root');
            $pass = config('database.connections.mysql.password', '');

            $dsn = "mysql:host={$host};port={$port};dbname={$dbName}";
            
            $dumpSettings = [
                'add-drop-table'     => true,
                'single-transaction' => true,
                'skip-definer'       => true,
                'lock-tables'        => false,
            ];

            $dump = new Mysqldump($dsn, $user, $pass, $dumpSettings);
            $dump->start($tempSqlFile);

            // If user only requested Database backup
            if ($type === 'db') {
                $finalSqlName = 'db_backup_' . $timestamp . '.sql';
                File::move($tempSqlFile, $storagePath . '/' . $finalSqlName);

                return back()->with('success', 'ডাটাবেজ ব্যাকআপ সফলভাবে সম্পন্ন হয়েছে: ' . $finalSqlName);
            }

            // 2. Full Backup (.zip) with Database + Media Files + Metadata
            $zipName = 'full_backup_' . $timestamp . '.zip';
            $zipPath = $storagePath . '/' . $zipName;

            $zip = new ZipArchive();
            if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
                if (File::exists($tempSqlFile)) {
                    File::delete($tempSqlFile);
                }
                return back()->with('error', 'জিপ ব্যাকআপ ফাইল তৈরি করতে ব্যর্থ হয়েছে।');
            }

            // A. Add database dump
            $zip->addFile($tempSqlFile, 'database.sql');

            // B. Add metadata manifest
            $manifest = [
                'type'            => 'full_site_backup',
                'created_at'      => now()->toDateTimeString(),
                'app_name'        => config('app.name'),
                'app_version'     => '2.0',
                'laravel_version' => app()->version(),
                'stats'           => [
                    'products' => \App\Models\Product::count(),
                    'users'    => \App\Models\User::count(),
                    'orders'   => \App\Models\Order::count(),
                ],
            ];
            $zip->addFromString('metadata.json', json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            // C. Add Storage Public Media (products, reviews, hero-sliders, etc.)
            $storagePublic = storage_path('app/public');
            if (File::isDirectory($storagePublic)) {
                $this->addDirectoryToZip($zip, $storagePublic, 'media/storage');
            }

            // D. Add Public Uploads (avatars, logos, favicons, chat, etc.)
            $publicUploads = public_path('uploads');
            if (File::isDirectory($publicUploads)) {
                $this->addDirectoryToZip($zip, $publicUploads, 'media/uploads');
            }

            $zip->close();

            // Clean up temporary sql dump
            if (File::exists($tempSqlFile)) {
                File::delete($tempSqlFile);
            }

            return back()->with('success', 'সম্পূর্ণ সাইটের ফুল ব্যাকআপ (ডাটাবেজ + মিডিয়া ছবি) সফলভাবে তৈরি হয়েছে: ' . $zipName);

        } catch (\Throwable $e) {
            if (isset($tempSqlFile) && File::exists($tempSqlFile)) {
                File::delete($tempSqlFile);
            }
            return back()->with('error', 'ব্যাকআপ তৈরিতে সমস্যা হয়েছে: ' . $e->getMessage());
        }
    }

    public function download($filename)
    {
        $filename = basename($filename);
        $path = $this->backupDir . '/' . $filename;
        if (Storage::disk($this->backupDisk)->exists($path)) {
            return Storage::disk($this->backupDisk)->download($path);
        }
        return back()->with('error', 'ব্যাকআপ ফাইলটি পাওয়া যায়নি।');
    }

    public function restore(Request $request)
    {
        set_time_limit(600);
        ini_set('memory_limit', '1024M');

        $tempExtractDir = null;

        try {
            $filePath = '';

            if ($request->hasFile('backup_file')) {
                $request->validate([
                    'backup_file' => 'required|file'
                ]);
                
                $file = $request->file('backup_file');
                $filePath = $file->getRealPath();
                $extension = strtolower($file->getClientOriginalExtension());
            } elseif ($request->has('filename')) {
                $filename = basename($request->input('filename'));
                $storagePath = Storage::disk($this->backupDisk)->path($this->backupDir . '/' . $filename);
                if (!File::exists($storagePath)) {
                    return back()->with('error', 'সার্ভারে ব্যাকআপ ফাইলটি খুঁজে পাওয়া যায়নি।');
                }
                $filePath = $storagePath;
                $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
            } else {
                return back()->with('error', 'কোনো ব্যাকআপ ফাইল সিলেক্ট করা হয়নি।');
            }

            if ($extension === 'zip') {
                // Extract Zip
                $zip = new ZipArchive();
                if ($zip->open($filePath) !== true) {
                    return back()->with('error', 'জিপ ব্যাকআপ ফাইলটি খোলা সম্ভব হয়নি বা ফাইলটি নষ্ট।');
                }

                $tempExtractDir = storage_path('app/temp_restore_' . uniqid());
                if (!File::isDirectory($tempExtractDir)) {
                    File::makeDirectory($tempExtractDir, 0755, true, true);
                }

                $zip->extractTo($tempExtractDir);
                $zip->close();

                $sqlFile = $tempExtractDir . '/database.sql';
                if (!File::exists($sqlFile)) {
                    File::deleteDirectory($tempExtractDir);
                    return back()->with('error', 'জিপ ব্যাকআপ ফাইলের ভেতর database.sql পাওয়া যায়নি।');
                }

                // 1. Restore Database SQL
                $this->executeSqlDump($sqlFile);

                // 2. Restore Media Files
                $extractedStorage = $tempExtractDir . '/media/storage';
                if (File::isDirectory($extractedStorage)) {
                    File::copyDirectory($extractedStorage, storage_path('app/public'));
                    File::copyDirectory($extractedStorage, public_path('storage'));
                }

                $extractedUploads = $tempExtractDir . '/media/uploads';
                if (File::isDirectory($extractedUploads)) {
                    File::copyDirectory($extractedUploads, public_path('uploads'));
                }

                // Clean up temp folder
                File::deleteDirectory($tempExtractDir);

            } elseif ($extension === 'sql') {
                // Restore Database SQL only
                $this->executeSqlDump($filePath);
            } else {
                return back()->with('error', 'শুধুমাত্র .zip অথবা .sql ব্যাকআপ ফাইল গ্রহণযোগ্য।');
            }

            // 3. CRITICAL SMART STEP: Run migrations to auto-apply any NEW features developed in code!
            Artisan::call('migrate', ['--force' => true]);

            // 4. Ensure storage symlink exists
            if (!file_exists(public_path('storage'))) {
                Artisan::call('storage:link');
            }

            // 5. Clear and refresh all application caches
            Artisan::call('cache:clear');
            Artisan::call('route:clear');
            Artisan::call('view:clear');
            Artisan::call('config:clear');

            return back()->with('success', 'ওয়েবসাইট সফলভাবে রিস্টোর হয়েছে! পুরোনো সকল ডাটা ও মিডিয়া ছবি ফেরত এসেছে এবং নতুন ফিচারের ডাটাবেজ মাইগ্রেশন স্বয়ংক্রিয়ভাবে আপডেট করা হয়েছে।');

        } catch (\Throwable $e) {
            if ($tempExtractDir && File::isDirectory($tempExtractDir)) {
                File::deleteDirectory($tempExtractDir);
            }
            return back()->with('error', 'রিস্টোর করতে সমস্যা হয়েছে: ' . $e->getMessage());
        }
    }

    public function destroy($filename)
    {
        $filename = basename($filename);
        $path = $this->backupDir . '/' . $filename;
        if (Storage::disk($this->backupDisk)->exists($path)) {
            Storage::disk($this->backupDisk)->delete($path);
            return back()->with('success', 'ব্যাকআপ ফাইলটি সফলভাবে ডিলিট করা হয়েছে।');
        }
        return back()->with('error', 'ব্যাকআপ ফাইলটি পাওয়া যায়নি।');
    }

    private function executeSqlDump(string $filePath): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        $tables = DB::select('SHOW TABLES');
        $dbName = config('database.connections.mysql.database');
        $key = 'Tables_in_' . $dbName;
        
        foreach ($tables as $table) {
            if (isset($table->{$key})) {
                DB::statement('DROP TABLE IF EXISTS `' . $table->{$key} . '`');
            }
        }
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $sql = file_get_contents($filePath);
        DB::unprepared($sql);
    }

    private function addDirectoryToZip(ZipArchive $zip, string $dirPath, string $zipSubDir): void
    {
        $realBase = realpath($dirPath);
        if (!$realBase) return;

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($realBase, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::LEAVES_ONLY
        );

        foreach ($iterator as $file) {
            if (!$file->isDir()) {
                $filePath = $file->getRealPath();
                $relativePath = substr($filePath, strlen($realBase) + 1);
                $relativePath = str_replace('\\', '/', $relativePath);
                $zip->addFile($filePath, $zipSubDir . '/' . $relativePath);
            }
        }
    }

    private function humanFilesize($bytes, $decimals = 2) {
        $size = array('B','kB','MB','GB','TB','PB','EB','ZB','YB');
        $factor = floor((strlen($bytes) - 1) / 3);
        return sprintf("%.{$decimals}f", $bytes / pow(1024, $factor)) . @$size[$factor];
    }
}
