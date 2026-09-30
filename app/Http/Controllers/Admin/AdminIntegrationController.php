<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminIntegrationController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Integrations/IntegrationsDashboard', [
            'integrations' => [
                'fb_pixel' => ['status' => 'Connected', 'id' => '1234567890'],
                'gtm' => ['status' => 'Not Connected', 'id' => ''],
                'ga4' => ['status' => 'Not Connected', 'id' => ''],
                'tiktok_pixel' => ['status' => 'Not Connected', 'id' => ''],
                'snapchat_pixel' => ['status' => 'Not Connected', 'id' => ''],
            ]
        ]);
    }
}
