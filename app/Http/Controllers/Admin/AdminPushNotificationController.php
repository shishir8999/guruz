<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PushNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPushNotificationController extends Controller
{
    public function index()
    {
        if (PushNotification::count() === 0) {
            PushNotification::insert([
                [
                    'title'         => 'Flash Sale Starts in 1 Hour!',
                    'message'       => 'Get ready for up to 50% off on all electronics. Don\'t miss out!',
                    'target'        => 'All App Users',
                    'status'        => 'sent',
                    'sent_count'    => 145230,
                    'scheduled_for' => '2026-08-10 09:00 AM',
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ],
                [
                    'title'         => 'Your Cart is Waiting',
                    'message'       => 'You left some items in your cart. Complete your purchase now and get 5% off.',
                    'target'        => 'Cart Abandoners',
                    'status'        => 'active',
                    'sent_count'    => 1250,
                    'scheduled_for' => 'Automated',
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ],
                [
                    'title'         => 'Exclusive Weekend Offer',
                    'message'       => 'Shop this weekend and earn double loyalty points on every order.',
                    'target'        => 'Premium Members',
                    'status'        => 'scheduled',
                    'sent_count'    => 0,
                    'scheduled_for' => '2026-08-15 10:00 AM',
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ],
                [
                    'title'         => 'App Update Available',
                    'message'       => 'Update your app to enjoy the latest features and a faster shopping experience.',
                    'target'        => 'Outdated App Versions',
                    'status'        => 'draft',
                    'sent_count'    => 0,
                    'scheduled_for' => null,
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]
            ]);
        }

        $notifications = PushNotification::orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Marketing/Notifications', [
            'notifications' => $notifications,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'         => 'required|string|max:255',
            'message'       => 'required|string',
            'target'        => 'required|string|max:100',
            'status'        => 'required|in:sent,active,scheduled,draft',
            'scheduled_for' => 'nullable|string|max:100',
        ]);

        PushNotification::create([
            'title'         => $request->title,
            'message'       => $request->message,
            'target'        => $request->target,
            'status'        => $request->status,
            'sent_count'    => $request->status === 'sent' ? rand(5000, 50000) : 0,
            'scheduled_for' => $request->scheduled_for ?: ($request->status === 'active' ? 'Automated' : null),
        ]);

        return back()->with('success', 'নতুন পুশ নোটিফিকেশন তৈরি সফল হয়েছে!');
    }

    public function update(Request $request, PushNotification $pushNotification)
    {
        $request->validate([
            'title'         => 'required|string|max:255',
            'message'       => 'required|string',
            'target'        => 'required|string|max:100',
            'status'        => 'required|in:sent,active,scheduled,draft',
            'scheduled_for' => 'nullable|string|max:100',
        ]);

        $pushNotification->update([
            'title'         => $request->title,
            'message'       => $request->message,
            'target'        => $request->target,
            'status'        => $request->status,
            'scheduled_for' => $request->scheduled_for ?: ($request->status === 'active' ? 'Automated' : null),
        ]);

        return back()->with('success', 'পুশ নোটিফিকেশন আপডেট সফল হয়েছে!');
    }

    public function destroy(PushNotification $pushNotification)
    {
        $pushNotification->delete();
        return back()->with('success', 'পুশ নোটিফিকেশন ডিলিট সফল হয়েছে!');
    }
}
