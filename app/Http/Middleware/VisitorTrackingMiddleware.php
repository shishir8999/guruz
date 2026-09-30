<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VisitorTrackingMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Don't track if it's an API request, static asset, or backend/auth routes
        if ($request->is('api/*') || $request->is('admin/*') || $request->is('seller/*') || $request->is('auth*') || $request->is('login') || $request->is('register')) {
            return $next($request);
        }

        try {
            $agent = new \Jenssegers\Agent\Agent();
            $agent->setUserAgent($request->header('User-Agent'));

            // Check if we already logged this IP in the last 15 minutes to prevent spam
            $recentlyLogged = \App\Models\VisitorLog::where('ip_address', $request->ip())
                ->where('created_at', '>=', now()->subMinutes(15))
                ->exists();

            if (!$recentlyLogged) {
                \App\Models\VisitorLog::create([
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->header('User-Agent'),
                    'browser' => $agent->browser(),
                    'platform' => $agent->platform(),
                    'device' => $agent->isDesktop() ? 'desktop' : ($agent->isTablet() ? 'tablet' : 'mobile'),
                    'url' => $request->fullUrl(),
                    'referer' => $request->header('referer'),
                    'user_id' => auth()->id(),
                ]);
            }

            if (auth()->check()) {
                $authUser = auth()->user();
                if ($authUser instanceof \App\Models\User && (!$authUser->last_login_device || !$authUser->last_login_ip || !$authUser->last_login_location)) {
                    $resolvedIp = \App\Models\User::resolveClientIp($request);
                    $authUser->update([
                        'last_login_ip'       => $authUser->last_login_ip ?: $resolvedIp,
                        'last_login_device'   => $authUser->last_login_device ?: \App\Models\User::resolveClientDevice($request),
                        'last_login_location' => $authUser->last_login_location ?: \App\Models\User::resolveClientLocation($resolvedIp, $request),
                        'login_count'         => max(1, (int)($authUser->login_count ?? 1)),
                    ]);
                }
            }
        } catch (\Exception $e) {
            // Silently fail if something goes wrong with tracking
        }

        return $next($request);
    }
}
