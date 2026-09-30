<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Session;
use App\Models\SiteSetting;

class CurrencyMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // 1. Check if user manually requested a currency via query param e.g. ?currency=INR or ?currency=BDT
        if ($request->has('currency')) {
            $requestedCurrency = strtoupper($request->query('currency'));
            if (in_array($requestedCurrency, ['BDT', 'INR', 'USD'])) {
                Session::put('user_currency', $requestedCurrency);
                $response = redirect()->to($request->fullUrlWithoutQuery('currency'));
                return $response->withCookie(cookie()->forever('user_currency', $requestedCurrency));
            }
        }

        // 2. Check if user has an explicit currency cookie
        if ($request->hasCookie('user_currency')) {
            $cookieCurr = strtoupper($request->cookie('user_currency'));
            if (in_array($cookieCurr, ['BDT', 'INR', 'USD'])) {
                Session::put('user_currency', $cookieCurr);
            }
        }

        // 3. Auto-detect visitor country if not explicitly set
        if (!Session::has('user_currency')) {
            $countryCode = $this->detectCountryCode($request);

            if ($countryCode === 'IN') {
                Session::put('user_currency', 'INR');
                Session::put('user_country', 'IN');
            } else {
                Session::put('user_currency', 'BDT');
                Session::put('user_country', $countryCode ?? 'BD');
            }
        }

        $response = $next($request);

        // Ensure user_currency cookie is set for client-side JavaScript consistency
        $activeCurrency = Session::get('user_currency', 'BDT');
        if (!$request->hasCookie('user_currency') || $request->cookie('user_currency') !== $activeCurrency) {
            if (method_exists($response, 'withCookie')) {
                $response->withCookie(cookie()->forever('user_currency', $activeCurrency));
            }
        }

        return $response;
    }

    private function detectCountryCode(Request $request): ?string
    {
        // Check Cloudflare / CDN headers
        $cdnCountry = $request->header('CF-IPCountry')
            ?? $request->header('X-Country-Code')
            ?? $request->header('CloudFront-Viewer-Country');

        if ($cdnCountry && strlen($cdnCountry) === 2) {
            return strtoupper($cdnCountry);
        }

        $ip = $request->ip();

        if (empty($ip) || $ip === '127.0.0.1' || $ip === '::1' || str_starts_with($ip, '192.168.')) {
            return 'BD'; // Default for local testing
        }

        return Cache::remember("geoip_country_{$ip}", 86400, function () use ($ip) {
            try {
                $response = Http::timeout(2)->get("http://ip-api.com/json/{$ip}?fields=countryCode");
                if ($response->successful() && isset($response['countryCode'])) {
                    return strtoupper($response['countryCode']);
                }
            } catch (\Throwable $e) {}
            return 'BD';
        });
    }
}
