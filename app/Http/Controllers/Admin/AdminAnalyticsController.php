<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminAnalyticsController extends Controller
{
    public function visitors(Request $request)
    {
        $dateRange = $request->query('range', 'this_week');

        $queryStart = match($dateRange) {
            'today' => now()->startOfDay(),
            'this_week' => now()->startOfWeek(),
            'this_month' => now()->startOfMonth(),
            'this_year' => now()->startOfYear(),
            default => now()->startOfWeek(),
        };
        $queryEnd = now()->endOfDay();

        $logs = \App\Models\VisitorLog::whereBetween('created_at', [$queryStart, $queryEnd]);

        $totalPageViews = $logs->count();
        $uniqueVisitors = (clone $logs)->distinct('ip_address')->count('ip_address');

        // Traffic Trend
        $trafficTrend = (clone $logs)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as views, COUNT(DISTINCT ip_address) as visitors')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // Device Breakdown
        $mobile = (clone $logs)->where('device', 'mobile')->count();
        $desktop = (clone $logs)->where('device', 'desktop')->count();
        $tablet = (clone $logs)->where('device', 'tablet')->count();
        
        $totalDevices = $mobile + $desktop + $tablet;
        $deviceBreakdown = [
            'mobile' => $totalDevices > 0 ? round(($mobile / $totalDevices) * 100) : 0,
            'desktop' => $totalDevices > 0 ? round(($desktop / $totalDevices) * 100) : 0,
            'tablet' => $totalDevices > 0 ? round(($tablet / $totalDevices) * 100) : 0,
        ];

        // Top Pages
        $topPages = (clone $logs)
            ->selectRaw('url as path, COUNT(*) as views')
            ->groupBy('url')
            ->orderByDesc('views')
            ->take(5)
            ->get()
            ->map(function($page) {
                // Remove base url to just show path
                $path = str_replace(config('app.url'), '', $page->path);
                return ['path' => $path ?: '/', 'views' => $page->views];
            });

        $analytics = [
            'overview' => [
                'total_page_views' => $totalPageViews,
                'unique_visitors' => $uniqueVisitors,
                'bounce_rate' => 'N/A', // Complex to calculate accurately without session tracking
                'avg_session_duration' => 'N/A'
            ],
            'traffic_trend' => $trafficTrend,
            'device_breakdown' => $deviceBreakdown,
            'top_pages' => $topPages
        ];

        return Inertia::render('Admin/VisitorAnalytics', [
            'analytics' => $analytics,
            'currentRange' => $dateRange
        ]);
    }
}
