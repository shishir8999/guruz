<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminProfileController extends Controller
{
    public function me()
    {
        $user = auth()->user();
        $profile = $user->profile;

        return Inertia::render('Admin/Profile/AdminProfile', [
            'profile' => [
                'full_name' => $profile->full_name ?? $user->name ?? 'Admin',
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'designation' => $profile->designation ?? 'Super Admin',
                'department' => $profile->department ?? 'IT & Operations',
                'address' => $profile->address ?? '',
                'facebook' => $profile->facebook ?? '',
                'linkedin' => $profile->linkedin ?? '',
                'twitter' => $profile->twitter ?? '',
                'avatar_url' => $user->avatar_url ? asset('storage/' . $user->avatar_url) : null,
            ]
        ]);
    }

    public function updateMe(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'avatar' => 'nullable|image|max:2048',
            'designation' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'facebook' => 'nullable|string|max:255',
            'linkedin' => 'nullable|string|max:255',
            'twitter' => 'nullable|string|max:255',
        ]);

        $user = auth()->user();
        
        $user->name = $request->full_name;
        $user->phone = $request->phone;
        
        if ($request->hasFile('avatar')) {
            $path = \App\Services\StorageHelper::storePublicly($request->file('avatar'), 'avatars');
            $user->avatar_url = $path;
        }

        $user->save();

        // Update or create profile
        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'full_name' => $request->full_name,
                'address' => $request->address,
                'designation' => $request->designation,
                'department' => $request->department,
                'facebook' => $request->facebook,
                'linkedin' => $request->linkedin,
                'twitter' => $request->twitter,
            ]
        );

        return back()->with('success', 'Profile updated successfully!');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $user = auth()->user();
        $user->password = $request->password;
        $user->save();

        return back()->with('success', 'পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!');
    }
}
