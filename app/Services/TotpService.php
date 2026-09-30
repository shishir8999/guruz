<?php

namespace App\Services;

class TotpService
{
    /**
     * Generate a RFC 4648 compliant 16-character Base32 Secret Key for a user ID.
     */
    public static function generateSecret(int $userId): string
    {
        $base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $hash = md5('guruz_2fa_v2_' . $userId . '_secret_key');
        $secret = '';
        for ($i = 0; $i < 16; $i++) {
            $val = hexdec(substr($hash, $i * 2, 2));
            $secret .= $base32Chars[$val % 32];
        }
        return $secret;
    }

    private static function base32Decode(string $b32)
    {
        $b32 = strtoupper(trim($b32));
        $b32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $b32charsF = array_flip(str_split($b32chars));
        
        $b32 = str_replace('=', '', $b32);
        $binaryString = '';
        foreach (str_split($b32) as $char) {
            if (!isset($b32charsF[$char])) return false;
            $binaryString .= sprintf('%05b', $b32charsF[$char]);
        }
        
        $bytes = [];
        foreach (str_split($binaryString, 8) as $chunk) {
            if (strlen($chunk) === 8) {
                $bytes[] = chr(bindec($chunk));
            }
        }
        return implode('', $bytes);
    }

    public static function generateCode(string $secret, $timeStep = null)
    {
        if ($timeStep === null) {
            $timeStep = floor(time() / 30);
        }

        $secretKey = self::base32Decode($secret);
        if (!$secretKey) return false;

        $time = pack('N*', 0) . pack('N*', $timeStep);
        $hmac = hash_hmac('sha1', $time, $secretKey, true);
        $offset = ord(substr($hmac, -1)) & 0x0F;
        $hashpart = substr($hmac, $offset, 4);

        $value = unpack('N', $hashpart);
        $value = $value[1] & 0x7FFFFFFF;

        $modulo = pow(10, 6);
        return str_pad($value % $modulo, 6, '0', STR_PAD_LEFT);
    }

    public static function verifyCode(string $secret, string $code, int $discrepancy = 1): bool
    {
        $cleanCode = preg_replace('/\D/', '', $code);
        if (strlen($cleanCode) !== 6) return false;

        $currentTimeStep = floor(time() / 30);
        for ($i = -$discrepancy; $i <= $discrepancy; $i++) {
            $validCode = self::generateCode($secret, $currentTimeStep + $i);
            if ($validCode !== false && hash_equals((string)$validCode, (string)$cleanCode)) {
                return true;
            }
        }
        return false;
    }
}
