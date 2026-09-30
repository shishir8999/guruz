<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\LicenseService;

class VerifyLicense
{
    /**
     * Routes that can be accessed without a license
     * (Admin panel is accessible so admin/developer can configure and generate keys,
     * but the entire front view / store is strictly locked until activated)
     */
    protected array $except = [
        'activate-license',
        'activate-license/*',
        'admin',
        'admin/*',
        'auth',
        'auth/*',
        'login',
        'logout',
        'register',
        'system/*',
        'clear-cache',
        'up',
        '_debugbar/*',
    ];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Allow activation endpoints and admin panel
        foreach ($this->except as $pattern) {
            if ($request->is($pattern)) {
                return $next($request);
            }
        }

        // 2. Verify if current domain has an active, valid license
        if (!LicenseService::isActivated()) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Software License Verification Required. The source code is locked.',
                    'domain'  => LicenseService::getCurrentDomain(),
                    'activate_url' => url('/activate-license'),
                ], 403);
            }

            return redirect()->to('/activate-license');
        }

        return $next($request);
    }
}
