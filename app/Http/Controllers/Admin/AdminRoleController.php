<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminRoleController extends Controller
{
    public function index()
    {
        $defaultRoles = [
            ['id' => 1, 'name' => 'Super Admin', 'description' => 'Full access to all system modules', 'permissions' => ['dashboard', 'users', 'staff', 'roles', 'finance', 'commerce', 'cms', 'settings']],
            ['id' => 2, 'name' => 'Store Manager', 'description' => 'Manages products, orders, and vendors', 'permissions' => ['dashboard', 'commerce', 'cms']],
            ['id' => 3, 'name' => 'Support Executive', 'description' => 'Handles customer queries and order tracking', 'permissions' => ['dashboard', 'users', 'commerce']],
        ];

        $raw = SiteSetting::get('admin_roles_data');
        $roles = ($raw && json_decode($raw, true)) ? json_decode($raw, true) : $defaultRoles;

        return Inertia::render('Admin/RolesAndPermissions', [
            'initialRoles' => $roles,
        ]);
    }

    public function updateRoles(Request $request)
    {
        $request->validate([
            'roles' => 'required|array',
        ]);

        SiteSetting::set('admin_roles_data', json_encode($request->input('roles')));

        return back()->with('success', 'Roles and permissions updated successfully.');
    }
}
