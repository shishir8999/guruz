<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Ensure essential framework storage directories always exist
        $requiredStorageDirs = [
            storage_path('framework/sessions'),
            storage_path('framework/views'),
            storage_path('framework/cache/data'),
            storage_path('logs'),
        ];

        foreach ($requiredStorageDirs as $dir) {
            if (!is_dir($dir)) {
                @mkdir($dir, 0775, true);
            }
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (app()->environment('production') || request()->server('HTTP_X_FORWARDED_PROTO') === 'https' || request()->isSecure()) {
            URL::forceScheme('https');
        }

        // Disable Vite Hot Reloading port in Production / cPanel
        if (!app()->environment('local')) {
            app(\Illuminate\Foundation\Vite::class)->useHotFile(storage_path('framework/no_hot_file'));
        }

        View::composer('app', function ($view) {
            $integrations = \App\Models\SiteSetting::where('group', 'integrations')->pluck('value', 'key')->toArray();
            $view->with('integrations', $integrations);
        });

        // Automatically track user device, IP, location and login count upon any login
        \Illuminate\Support\Facades\Event::listen(\Illuminate\Auth\Events\Login::class, function ($event) {
            if (isset($event->user) && $event->user instanceof \App\Models\User) {
                try {
                    $event->user->recordLogin(request());
                } catch (\Throwable $e) {}
            }
        });

        // Automatically track logout count upon any logout
        \Illuminate\Support\Facades\Event::listen(\Illuminate\Auth\Events\Logout::class, function ($event) {
            if (isset($event->user) && $event->user instanceof \App\Models\User) {
                try {
                    $event->user->recordLogout();
                } catch (\Throwable $e) {}
            }
        });
    }
}
