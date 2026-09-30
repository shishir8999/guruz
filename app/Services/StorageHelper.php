<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class StorageHelper
{
    /**
     * Store an uploaded file to the public disk AND copy directly into public/storage.
     * This guarantees that images work on cPanel even if symlinks are disabled or broken.
     *
     * @param UploadedFile $file
     * @param string $folder
     * @return string The relative path in public storage (e.g. 'hero-sliders/abc.jpg')
     */
    public static function storePublicly(UploadedFile $file, string $folder): string
    {
        $path = $file->store($folder, 'public');

        self::syncToPublicFolder($path);

        return $path;
    }

    /**
     * Copy a specific file from storage/app/public to public/storage
     *
     * @param string $relativePath
     */
    public static function syncToPublicFolder(string $relativePath): void
    {
        try {
            $relativePath = ltrim(str_replace('/storage/', '', $relativePath), '/\\');
            $storageFile = storage_path('app/public/' . $relativePath);
            $publicFile = public_path('storage/' . $relativePath);

            // 1. Copy to public/storage
            if (file_exists($storageFile)) {
                if (!file_exists($publicFile) || filesize($publicFile) !== filesize($storageFile)) {
                    $dir = dirname($publicFile);
                    if (!is_dir($dir)) {
                        @mkdir($dir, 0777, true);
                    }
                    @copy($storageFile, $publicFile);
                    @chmod($publicFile, 0644);
                }

                // 2. If public_html exists as sibling (common in cPanel hosting)
                $altBase = dirname(base_path()) . '/public_html/storage';
                if (is_dir(dirname($altBase)) && realpath(dirname($altBase)) !== realpath(public_path())) {
                    $altPublic = $altBase . '/' . $relativePath;
                    if (!file_exists($altPublic) || filesize($altPublic) !== filesize($storageFile)) {
                        @mkdir(dirname($altPublic), 0777, true);
                        @copy($storageFile, $altPublic);
                        @chmod($altPublic, 0644);
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning("StorageHelper syncToPublicFolder error: " . $e->getMessage());
        }
    }

    /**
     * Delete a file from both storage/app/public and public/storage
     *
     * @param string|null $pathWithOrWithoutPrefix (e.g. '/storage/hero-sliders/abc.jpg')
     */
    public static function deletePublicly(?string $pathWithOrWithoutPrefix): void
    {
        if (empty($pathWithOrWithoutPrefix)) {
            return;
        }

        $relativePath = ltrim(str_replace('/storage/', '', $pathWithOrWithoutPrefix), '/\\');

        try {
            if (Storage::disk('public')->exists($relativePath)) {
                Storage::disk('public')->delete($relativePath);
            }

            $publicFile = public_path('storage/' . $relativePath);
            if (file_exists($publicFile) && is_file($publicFile) && !is_link(public_path('storage'))) {
                @unlink($publicFile);
            }
        } catch (\Throwable $e) {
            Log::warning("StorageHelper deletePublicly error: " . $e->getMessage());
        }
    }

    /**
     * Recursively sync ALL files from storage/app/public to public/storage.
     * Restores any previously uploaded files on cPanel where symlinks don't work.
     *
     * @return int Number of files copied
     */
    public static function syncAll(): int
    {
        $source = storage_path('app/public');
        $dest = public_path('storage');
        $count = 0;

        if (!is_dir($source)) {
            return 0;
        }

        // If public/storage is a symlink pointing to storage/app/public, no need to copy
        if (is_link($dest)) {
            $linkTarget = @readlink($dest);
            if ($linkTarget && (realpath($linkTarget) === realpath($source))) {
                return 0;
            }
        }

        if (!is_dir($dest)) {
            @mkdir($dest, 0777, true);
        }

        try {
            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($source, \RecursiveDirectoryIterator::SKIP_DOTS),
                \RecursiveIteratorIterator::SELF_FIRST
            );

            foreach ($iterator as $item) {
                $subPath = substr($item->getPathname(), strlen($source) + 1);
                $targetPath = $dest . DIRECTORY_SEPARATOR . $subPath;

                if ($item->isDir()) {
                    if (!is_dir($targetPath)) {
                        @mkdir($targetPath, 0777, true);
                    }
                } else {
                    if (!file_exists($targetPath) || filesize($targetPath) !== $item->getSize()) {
                        @mkdir(dirname($targetPath), 0777, true);
                        @copy($item->getPathname(), $targetPath);
                        @chmod($targetPath, 0644);
                        $count++;
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning("StorageHelper syncAll error: " . $e->getMessage());
        }

        return $count;
    }
}
