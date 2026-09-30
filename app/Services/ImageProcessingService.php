<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

/**
 * ImageProcessingService
 *
 * Handles automatic white/light background removal and image quality
 * enhancement for product images using PHP's GD library (no API needed).
 */
class ImageProcessingService
{
    /**
     * Process a product image:
     *  1. Remove white / near-white background (flood-fill from corners)
     *  2. Auto-crop transparent margins
     *  3. Add clean white padding (square canvas)
     *  4. Sharpen
     *  5. Convert to high-quality WebP
     *  6. Store in public disk and sync to public/storage
     *
     * @param  UploadedFile|string  $source  UploadedFile or absolute file path
     * @param  string               $folder  Storage sub-folder, e.g. 'products'
     * @param  int                  $tolerance  BG colour tolerance 0–255 (default 30)
     * @return string  Public URL of the processed image
     */
    public static function processProductImage(
        $source,
        string $folder = 'products',
        int $tolerance = 30
    ): string {
        try {
            // ── 1. Load into GD ──────────────────────────────────────────────
            $tmpPath = ($source instanceof UploadedFile)
                ? $source->getRealPath()
                : $source;

            $mime = mime_content_type($tmpPath);
            $gdSrc = self::loadGdImage($tmpPath, $mime);

            if (!$gdSrc) {
                throw new \RuntimeException('GD could not load image.');
            }

            $w = imagesx($gdSrc);
            $h = imagesy($gdSrc);

            // ── 2. Create RGBA canvas ─────────────────────────────────────────
            $canvas = imagecreatetruecolor($w, $h);
            imagesavealpha($canvas, true);
            imagealphablending($canvas, false);
            $transparent = imagecolorallocatealpha($canvas, 0, 0, 0, 127);
            imagefill($canvas, 0, 0, $transparent);
            imagealphablending($canvas, true);
            imagecopy($canvas, $gdSrc, 0, 0, 0, 0, $w, $h);
            imagedestroy($gdSrc);

            // ── 3. Flood-fill background removal from all 4 corners ───────────
            imagesavealpha($canvas, true);
            imagealphablending($canvas, false);

            $corners = [[0, 0], [$w - 1, 0], [0, $h - 1], [$w - 1, $h - 1]];
            foreach ($corners as [$cx, $cy]) {
                $rgb = imagecolorat($canvas, $cx, $cy);
                $r   = ($rgb >> 16) & 0xFF;
                $g   = ($rgb >>  8) & 0xFF;
                $b   =  $rgb        & 0xFF;
                // Only flood-fill if the corner pixel is near-white/light
                if (self::isNearWhite($r, $g, $b, 240)) {
                    self::floodFillTransparent($canvas, $cx, $cy, $w, $h, $r, $g, $b, $tolerance);
                }
            }

            // ── 4. Auto-crop transparent edges ───────────────────────────────
            $canvas = self::autoCropTransparent($canvas);
            if (!$canvas) {
                throw new \RuntimeException('Auto-crop returned null.');
            }

            $cw = imagesx($canvas);
            $ch = imagesy($canvas);

            // ── 5. Create square white canvas with 5% padding ────────────────
            $maxSide  = max($cw, $ch);
            $pad      = (int) round($maxSide * 0.05);
            $squareSz = $maxSide + $pad * 2;

            $output = imagecreatetruecolor($squareSz, $squareSz);
            imagesavealpha($output, true);
            imagealphablending($output, false);
            $white = imagecolorallocate($output, 255, 255, 255);
            imagefill($output, 0, 0, $white);
            imagealphablending($output, true);

            $offsetX = (int) round(($squareSz - $cw) / 2);
            $offsetY = (int) round(($squareSz - $ch) / 2);
            imagecopy($output, $canvas, $offsetX, $offsetY, 0, 0, $cw, $ch);
            imagedestroy($canvas);

            // ── 6. Scale down to max 1200px ───────────────────────────────────
            if ($squareSz > 1200) {
                $scaled = imagecreatetruecolor(1200, 1200);
                $wh = imagecolorallocate($scaled, 255, 255, 255);
                imagefill($scaled, 0, 0, $wh);
                imagecopyresampled($scaled, $output, 0, 0, 0, 0, 1200, 1200, $squareSz, $squareSz);
                imagedestroy($output);
                $output = $scaled;
            }

            // ── 7. Sharpen ────────────────────────────────────────────────────
            $sharpen = [
                [-1, -1, -1],
                [-1, 17, -1],
                [-1, -1, -1],
            ];
            $divisor = array_sum(array_merge(...$sharpen));  // = 9
            imageconvolution($output, $sharpen, $divisor, 0);

            // ── 8. Encode as WebP and store ───────────────────────────────────
            ob_start();
            imagewebp($output, null, 85);
            $webpData = ob_get_clean();
            imagedestroy($output);

            $filename = uniqid('pimg_') . '-' . time() . '.webp';
            $path     = $folder . '/' . $filename;

            Storage::disk('public')->put($path, $webpData);
            StorageHelper::syncToPublicFolder($path);

            return Storage::url($path);

        } catch (\Throwable $e) {
            Log::warning('ImageProcessingService: BG removal failed — falling back to simple store. Error: ' . $e->getMessage());
            // Fallback: store original without processing
            if ($source instanceof UploadedFile) {
                $path = StorageHelper::storePublicly($source, $folder);
                return Storage::url($path);
            }
            throw $e;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private static function loadGdImage(string $path, string $mime)
    {
        return match (true) {
            str_contains($mime, 'jpeg') || str_contains($mime, 'jpg') => imagecreatefromjpeg($path),
            str_contains($mime, 'png')                                 => imagecreatefrompng($path),
            str_contains($mime, 'webp')                                => imagecreatefromwebp($path),
            str_contains($mime, 'gif')                                 => imagecreatefromgif($path),
            str_contains($mime, 'bmp')                                 => imagecreatefrombmp($path),
            default => @imagecreatefromstring(file_get_contents($path)),
        };
    }

    /**
     * Iterative 4-directional flood-fill that sets pixels matching
     * the seed colour (within tolerance) to fully transparent.
     */
    private static function floodFillTransparent(
        $img,
        int $seedX, int $seedY,
        int $w, int $h,
        int $seedR, int $seedG, int $seedB,
        int $tolerance
    ): void {
        $stack = [[$seedX, $seedY]];
        $visited = [];

        while (!empty($stack)) {
            [$x, $y] = array_pop($stack);

            if ($x < 0 || $x >= $w || $y < 0 || $y >= $h) continue;

            $key = $x . '_' . $y;
            if (isset($visited[$key])) continue;
            $visited[$key] = true;

            $rgb = imagecolorat($img, $x, $y);
            $a   = ($rgb >> 24) & 0x7F;

            // Already transparent — skip
            if ($a === 127) continue;

            $r = ($rgb >> 16) & 0xFF;
            $g = ($rgb >>  8) & 0xFF;
            $b =  $rgb        & 0xFF;

            if (!self::withinTolerance($r, $g, $b, $seedR, $seedG, $seedB, $tolerance)) continue;

            // Set transparent
            $tc = imagecolorallocatealpha($img, 0, 0, 0, 127);
            imagesetpixel($img, $x, $y, $tc);

            $stack[] = [$x + 1, $y];
            $stack[] = [$x - 1, $y];
            $stack[] = [$x, $y + 1];
            $stack[] = [$x, $y - 1];
        }
    }

    /** Remove all-transparent rows/columns from edges */
    private static function autoCropTransparent($img)
    {
        $w = imagesx($img);
        $h = imagesy($img);

        $top    = 0;
        $bottom = $h - 1;
        $left   = 0;
        $right  = $w - 1;

        // top
        for ($y = 0; $y < $h; $y++) {
            if (!self::rowIsTransparent($img, $y, $w)) { $top = $y; break; }
        }
        // bottom
        for ($y = $h - 1; $y >= 0; $y--) {
            if (!self::rowIsTransparent($img, $y, $w)) { $bottom = $y; break; }
        }
        // left
        for ($x = 0; $x < $w; $x++) {
            if (!self::colIsTransparent($img, $x, $h)) { $left = $x; break; }
        }
        // right
        for ($x = $w - 1; $x >= 0; $x--) {
            if (!self::colIsTransparent($img, $x, $h)) { $right = $x; break; }
        }

        $cw = $right  - $left  + 1;
        $ch = $bottom - $top   + 1;

        if ($cw <= 0 || $ch <= 0) return $img;

        $cropped = imagecreatetruecolor($cw, $ch);
        imagesavealpha($cropped, true);
        imagealphablending($cropped, false);
        $t = imagecolorallocatealpha($cropped, 0, 0, 0, 127);
        imagefill($cropped, 0, 0, $t);
        imagecopy($cropped, $img, 0, 0, $left, $top, $cw, $ch);
        imagedestroy($img);

        return $cropped;
    }

    private static function rowIsTransparent($img, int $y, int $w): bool
    {
        for ($x = 0; $x < $w; $x++) {
            $a = (imagecolorat($img, $x, $y) >> 24) & 0x7F;
            if ($a < 127) return false;
        }
        return true;
    }

    private static function colIsTransparent($img, int $x, int $h): bool
    {
        for ($y = 0; $y < $h; $y++) {
            $a = (imagecolorat($img, $x, $y) >> 24) & 0x7F;
            if ($a < 127) return false;
        }
        return true;
    }

    private static function isNearWhite(int $r, int $g, int $b, int $threshold = 235): bool
    {
        return $r >= $threshold && $g >= $threshold && $b >= $threshold;
    }

    private static function withinTolerance(
        int $r, int $g, int $b,
        int $sr, int $sg, int $sb,
        int $tol
    ): bool {
        return abs($r - $sr) <= $tol
            && abs($g - $sg) <= $tol
            && abs($b - $sb) <= $tol
            && self::isNearWhite($r, $g, $b, 200 - $tol);
    }
}
