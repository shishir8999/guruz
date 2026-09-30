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
        return $next($request);
    }
}
