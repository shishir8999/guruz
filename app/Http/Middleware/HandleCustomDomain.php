<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Shop;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleCustomDomain
{
    /**
     * Handle an incoming request for Custom Domains.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $host = strtolower($request->getHost());

        // Skip default local and main platform domains
        $platformDomains = ['localhost', '127.0.0.1', 'guruz.com', 'www.guruz.com'];
        if (in_array($host, $platformDomains)) {
            return $next($request);
        }

        try {
            // Find shop by custom domain
            $shop = Shop::where('custom_domain', $host)
                ->orWhere('custom_domain', 'www.' . $host)
                ->orWhere('custom_domain', preg_replace('/^www\./', '', $host))
                ->first();

            if ($shop && $request->is('/')) {
                // Serve shop page directly for custom domain homepage
                $products = \App\Models\Product::with('category')->where('shop_id', $shop->id)->where('is_active', true)->latest()->get();
                return response()->view('app', [
                    'page' => \Inertia\Inertia::render('Shop/Show', [
                        'shop' => $shop,
                        'products' => $products,
                    ])->toResponse($request)->getData()
                ]);
            }
        } catch (\Throwable $e) {
            // fallback
        }

        return $next($request);
    }
}
