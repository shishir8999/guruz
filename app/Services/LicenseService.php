<?php

namespace App\Services;

use Illuminate\Support\Facades\File;

class LicenseService
{
    private static string $salt = 'GURUZ_COMMERCIAL_V2_SECURE_HMAC_SALT_994x_PROTECT';
    private static string $licenseFilePath = 'framework/license.lic';
    
    // Master developer verification PIN and Email
    private static string $masterSecretPin = '1971';
    public static string $masterOwnerEmail = 'shishirbarai019@gmail.com';

    /**
     * Check if the current environment is local or developer machine
     */
    public static function isLocalhost(?string $host = null): bool
    {
        $domain = $host ?? self::getCurrentDomain();
        
        $localPatterns = [
            'localhost',
            '127.0.0.1',
            '::1',
            '.test',
            '.local',
            '.demo',
            '192.168.',
            '10.',
            '172.16.',
        ];

        foreach ($localPatterns as $pattern) {
            if (str_contains($domain, $pattern)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get clean normalized domain name from request
     */
    public static function getCurrentDomain(): string
    {
        $host = request()->getHost() ?? 'localhost';
        
        // Strip port if present
        if (str_contains($host, ':')) {
            $host = explode(':', $host)[0];
        }

        // Strip www. prefix
        $host = preg_replace('/^www\./i', '', trim(strtolower($host)));

        return $host ?: 'localhost';
    }

    /**
     * Generate a cryptographically signed license key bound to a specific Domain AND Owner Gmail
     */
    public static function generateKey(string $domain, string $ownerEmail): string
    {
        $cleanDomain = self::normalizeDomain($domain);
        $cleanEmail  = strtolower(trim($ownerEmail));
        
        // Mathematical HMAC binding of Target Domain + Owner Gmail + Master Salt
        $payload = "GURUZ_KEY_LOCK|{$cleanDomain}|{$cleanEmail}|" . self::$salt;
        
        $hash = strtoupper(hash_hmac('sha256', $payload, self::$salt));
        
        // Form a distinct 16-character alphanumeric key: GURUZ-XXXX-YYYY-ZZZZ-WWWW
        $part1 = substr($hash, 0, 4);
        $part2 = substr($hash, 8, 4);
        $part3 = substr($hash, 16, 4);
        $part4 = substr($hash, 24, 4);

        return "GURUZ-{$part1}-{$part2}-{$part3}-{$part4}";
    }

    /**
     * Verify if a given key is valid for the specified domain and owner email
     */
    public static function verifyKey(string $key, ?string $domain = null, ?string $ownerEmail = null): bool
    {
        $domain = $domain ?? self::getCurrentDomain();
        
        // Localhost is always allowed for development
        if (self::isLocalhost($domain)) {
            return true;
        }

        $cleanKey = strtoupper(trim($key));

        if (!$ownerEmail) {
            $stored = self::getStoredLicense();
            $ownerEmail = $stored['owner_email'] ?? '';
        }

        if (empty($ownerEmail)) {
            return false;
        }

        $expectedKey = self::generateKey($domain, $ownerEmail);

        return hash_equals($expectedKey, $cleanKey);
    }

    /**
     * Check if the application is currently activated with a valid license
     */
    public static function isActivated(): bool
    {
        $domain = self::getCurrentDomain();

        // Local development is always safe & unrestricted
        if (self::isLocalhost($domain)) {
            return true;
        }

        $savedData = self::getStoredLicense();
        if (!$savedData || empty($savedData['key']) || empty($savedData['owner_email'])) {
            return false;
        }

        return self::verifyKey($savedData['key'], $domain, $savedData['owner_email']);
    }

    /**
     * Save and activate license for the current domain
     */
    public static function activate(string $key, string $ownerEmail, string $clientName = ''): bool
    {
        $domain = self::getCurrentDomain();

        if (!self::verifyKey($key, $domain, $ownerEmail)) {
            return false;
        }

        $data = [
            'domain'        => $domain,
            'owner_email'   => strtolower(trim($ownerEmail)),
            'key'           => strtoupper(trim($key)),
            'client_name'   => trim($clientName) ?: 'Authorized Client',
            'activated_at'  => now()->toDateTimeString(),
        ];

        // 1. Store in encrypted storage file
        $storageFile = storage_path(self::$licenseFilePath);
        $dir = dirname($storageFile);
        if (!File::isDirectory($dir)) {
            File::makeDirectory($dir, 0755, true, true);
        }
        File::put($storageFile, encrypt(json_encode($data)));

        // 2. Store in SiteSettings database if table exists
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('site_settings')) {
                \App\Models\SiteSetting::set('app_license_key', $data['key']);
                \App\Models\SiteSetting::set('app_license_domain', $data['domain']);
                \App\Models\SiteSetting::set('app_license_owner_email', $data['owner_email']);
                \App\Models\SiteSetting::set('app_license_client', $data['client_name']);
                \App\Models\SiteSetting::set('app_license_activated_at', $data['activated_at']);
            }
        } catch (\Throwable $e) {}

        return true;
    }

    /**
     * Retrieve stored license data
     */
    public static function getStoredLicense(): ?array
    {
        // 1. Try reading from encrypted storage file
        $storageFile = storage_path(self::$licenseFilePath);
        if (File::exists($storageFile)) {
            try {
                $decrypted = decrypt(File::get($storageFile));
                $data = json_decode($decrypted, true);
                if (is_array($data) && !empty($data['key'])) {
                    return $data;
                }
            } catch (\Throwable $e) {}
        }

        // 2. Fallback to SiteSettings
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('site_settings')) {
                $dbKey = \App\Models\SiteSetting::get('app_license_key');
                $dbDomain = \App\Models\SiteSetting::get('app_license_domain');
                $dbEmail = \App\Models\SiteSetting::get('app_license_owner_email');
                if ($dbKey && $dbDomain) {
                    return [
                        'key'          => $dbKey,
                        'domain'       => $dbDomain,
                        'owner_email'  => $dbEmail ?: 'authorized@gmail.com',
                        'client_name'  => \App\Models\SiteSetting::get('app_license_client', 'Client'),
                        'activated_at' => \App\Models\SiteSetting::get('app_license_activated_at', ''),
                    ];
                }
            }
        } catch (\Throwable $e) {}

        return null;
    }

    /**
     * Get Master PIN from env or default
     */
    public static function getMasterPin(): string
    {
        return (string) env('MASTER_LICENSE_PIN', self::$masterSecretPin);
    }

    /**
     * Validate master PIN for unlocking the generator
     */
    public static function verifyMasterPin(string $pin): bool
    {
        $correctPin = self::getMasterPin();
        return trim((string)$pin) === trim((string)$correctPin);
    }

    public static function saveGeneratedLog(string $domain, string $ownerEmail, string $key, string $client = ''): void
    {
        try {
            $logs = [];
            $logFile = storage_path('framework/generated_licenses.json');
            if (File::exists($logFile)) {
                $logs = json_decode(File::get($logFile), true) ?: [];
            }

            array_unshift($logs, [
                'domain'       => $domain,
                'owner_email'  => $ownerEmail,
                'key'          => $key,
                'client_name'  => $client ?: 'Authorized Client',
                'generated_at' => now()->toDateTimeString(),
            ]);

            $logs = array_slice($logs, 0, 50);

            $dir = dirname($logFile);
            if (!File::isDirectory($dir)) {
                File::makeDirectory($dir, 0755, true, true);
            }

            File::put($logFile, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        } catch (\Throwable $e) {}
    }

    public static function getGeneratedLogs(): array
    {
        try {
            $logFile = storage_path('framework/generated_licenses.json');
            if (File::exists($logFile)) {
                return json_decode(File::get($logFile), true) ?: [];
            }
        } catch (\Throwable $e) {}
        return [];
    }

    public static function normalizeDomain(string $domain): string
    {
        $domain = trim(strtolower($domain));
        if (str_contains($domain, '://')) {
            $domain = parse_url($domain, PHP_URL_HOST) ?? $domain;
        }
        if (str_contains($domain, ':')) {
            $domain = explode(':', $domain)[0];
        }
        return preg_replace('/^www\./i', '', $domain);
    }
}
