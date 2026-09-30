<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Shop;
use Illuminate\Support\Str;

class EnsureSellerHasShop
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user && !$user->shop) {
            // Automatically provision a shop for the user so they can access vendor features
            Shop::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'name'        => ($user->name ?? 'Vendor') . "'s Shop",
                    'slug'        => Str::slug(($user->name ?? 'Vendor') . "-shop-" . $user->id),
                    'status'      => 'active',
                    'is_approved' => true,
                ]
            );
            $user->refresh();
        }

        return $next($request);
    }
}
