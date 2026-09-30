<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class RoleManagementController extends Controller
{
    /**
     * Securely updates a user's basic role (customer, vendor, admin)
     */
    public function assignRoleSecure(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|in:customer,vendor,admin',
            'password' => 'required|string'
        ]);

        // Verify the current admin's password
        if (!Hash::check($request->password, auth()->user()->password)) {
            return back()->withErrors(['password' => 'Incorrect password. Role change aborted.']);
        }

        $hasRole = UserRole::where('user_id', $user->id)->where('role', $request->role)->exists();
        if ($hasRole) {
            // Toggle off
            UserRole::where('user_id', $user->id)->where('role', $request->role)->delete();
            $action = 'removed';
        } else {
            // Toggle on
            UserRole::create(['user_id' => $user->id, 'role' => $request->role]);
            $action = 'assigned';
        }

        return back()->with('success', "Role '{$request->role}' {$action} successfully.");
    }
}
