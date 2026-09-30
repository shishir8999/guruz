<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemNotificationController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/UserNotifications', [
            'notifications' => SystemNotification::orderByDesc('created_at')->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        SystemNotification::create([
            'title' => $request->title,
            'message' => $request->message,
            'active' => true,
        ]);

        return back()->with('success', 'Notification created and broadcasted!');
    }

    public function toggle(SystemNotification $notification)
    {
        $notification->update(['active' => !$notification->active]);
        return back()->with('success', 'Notification status updated!');
    }

    public function destroy(SystemNotification $notification)
    {
        $notification->delete();
        return back()->with('success', 'Notification deleted successfully!');
    }

    public function toggleAll(Request $request)
    {
        $active = $request->input('active', true);
        SystemNotification::query()->update(['active' => $active]);
        return back()->with('success', $active ? 'All notifications enabled!' : 'All notifications disabled!');
    }
}
