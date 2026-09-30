<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\CurrencyMiddleware::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \App\Http\Middleware\VisitorTrackingMiddleware::class,
        ]);
        $middleware->alias([
            'seller.shop' => \App\Http\Middleware\EnsureSellerHasShop::class,
        ]);
        $middleware->validateCsrfTokens(except: [
            'auth',
            'auth/*',
            'admin/finance/gateway-settings*',
            'payment/sslcommerz/*',
            'api/sslcommerz/*',
            'payment/bangla-qr/*',
            'api/bangla-qr/*',
            'payment/eps/*',
            'api/eps/*',
            'api/live-chat/*',
            'api/admin/*',
            'api/shops/*',
        ]);
        $middleware->redirectGuestsTo(fn (\Illuminate\Http\Request $request) => $request->is('admin*') ? '/auth' : '/login');
        $middleware->redirectUsersTo(function () {
            if (auth()->check()) {
                if (auth()->user()->isAdmin()) {
                    return '/admin';
                } elseif (auth()->user()->isVendor()) {
                    return '/seller';
                }
                return '/account';
            }
            return '/';
        });
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
