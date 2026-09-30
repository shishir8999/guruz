<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Staff;
use App\Models\StaffPermission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class StaffController extends Controller
{
    public function index()
    {
        $staffList = Staff::with('user')->get()->map(function ($staff) {
            return [
                'id'          => $staff->id,
                'staff_id'    => 'STF-' . str_pad($staff->id, 4, '0', STR_PAD_LEFT),
                'name'        => $staff->user->name ?? '—',
                'email'       => $staff->user->email ?? '—',
                'phone'       => $staff->user->phone ?? '—',
                'designation' => $staff->position ?? '—',
                'department'  => $staff->department ?? '—',
                'salary'      => $staff->salary ?? 0,
                'status'      => $staff->is_active ? 'Active' : 'Inactive',
            ];
        });

        return Inertia::render('Admin/StaffList', [
            'staffList' => $staffList,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|email',
            'designation' => 'nullable|string|max:255',
            'department'  => 'nullable|string|max:255',
            'salary'      => 'nullable|numeric|min:0',
            'status'      => 'nullable|in:Active,Inactive',
        ]);

        // Find or create user
        $user = User::firstOrCreate(
            ['email' => $request->email],
            [
                'name'     => $request->name,
                'password' => Hash::make(Str::random(12)),
                'phone'    => $request->phone ?? null,
            ]
        );

        // Update user name/phone if user existed
        $user->update(['name' => $request->name]);

        // Create staff record
        $staff = Staff::firstOrNew(['user_id' => $user->id]);
        $staff->user_id    = $user->id;
        $staff->department = $request->department ?? 'General';
        $staff->position   = $request->designation ?? 'Staff';
        $staff->salary     = $request->salary ?? 0;
        $staff->is_active  = ($request->status ?? 'Active') === 'Active';
        $staff->save();

        return back()->with('success', "{$user->name} added as staff.");
    }

    public function update(Request $request, Staff $staff)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|email',
            'designation' => 'nullable|string|max:255',
            'department'  => 'nullable|string|max:255',
            'salary'      => 'nullable|numeric|min:0',
            'status'      => 'nullable|in:Active,Inactive',
        ]);

        // Update user info
        if ($staff->user) {
            $staff->user->update([
                'name'  => $request->name,
                'email' => $request->email,
            ]);
        }

        // Update staff record
        $staff->update([
            'department' => $request->department ?? $staff->department,
            'position'   => $request->designation ?? $staff->position,
            'salary'     => $request->salary ?? $staff->salary,
            'is_active'  => ($request->status ?? 'Active') === 'Active',
        ]);

        return back()->with('success', 'Staff updated successfully.');
    }

    public function destroy(Staff $staff)
    {
        $name = $staff->user->name ?? 'Staff';
        $staff->delete();
        return back()->with('success', "{$name} removed from staff.");
    }

    public function permissionsIndex()
    {
        // Fetch all staff users with their staff details and permissions
        $staffUsers = User::whereHas('staff')->with(['staff', 'staffPermissions'])->get()->map(function ($u) {
            $is_full_access = $u->staffPermissions->contains('permission', 'all');
            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->hasRole('super_admin') ? 'super_admin' : 'admin',
                'is_full_access' => $is_full_access,
                'allowed_modules' => $u->staffPermissions->pluck('permission')->toArray(),
            ];
        });

        return Inertia::render('Admin/StaffPermissions', [
            'staffUsers' => $staffUsers
        ]);
    }

    public function addStaff(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        if (!Hash::check($request->password, auth()->user()->password)) {
            return back()->withErrors(['password' => 'Incorrect password. Staff creation aborted.']);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return back()->withErrors(['email' => 'User not found.']);
        }

        if ($user->staff) {
            return back()->withErrors(['email' => 'User is already a staff member.']);
        }

        // Make them staff and give them admin role
        Staff::create([
            'user_id' => $user->id,
            'department' => 'Admin',
            'position' => 'Staff',
            'is_active' => true
        ]);
        \App\Models\UserRole::firstOrCreate(['user_id' => $user->id, 'role' => 'admin']);

        return back()->with('success', "Added {$user->name} as staff.");
    }

    public function toggleFullAccess(Request $request, User $user)
    {
        $request->validate(['password' => 'required|string']);
        if (!Hash::check($request->password, auth()->user()->password)) {
            return back()->withErrors(['password' => 'Incorrect password.']);
        }

        $hasAll = StaffPermission::where('user_id', $user->id)->where('permission', 'all')->exists();
        if ($hasAll) {
            StaffPermission::where('user_id', $user->id)->where('permission', 'all')->delete();
            $msg = "Revoked full access.";
        } else {
            StaffPermission::create(['user_id' => $user->id, 'permission' => 'all']);
            $msg = "Granted full access.";
        }
        return back()->with('success', $msg);
    }

    public function toggleModule(Request $request, User $user)
    {
        $request->validate([
            'module' => 'required|string',
            'password' => 'required|string'
        ]);

        if (!Hash::check($request->password, auth()->user()->password)) {
            return back()->withErrors(['password' => 'Incorrect password.']);
        }

        $exists = StaffPermission::where('user_id', $user->id)->where('permission', $request->module)->exists();
        if ($exists) {
            StaffPermission::where('user_id', $user->id)->where('permission', $request->module)->delete();
        } else {
            StaffPermission::create(['user_id' => $user->id, 'permission' => $request->module]);
        }
        return back()->with('success', "Module permissions updated.");
    }

    public function attendance()
    {
        $attendanceList = \App\Models\StaffAttendance::latest('date')->get()->map(function ($a) {
            return [
                'id' => $a->id,
                'staff_name' => $a->staff_name,
                'department' => $a->department,
                'status' => $a->status,
                'check_in' => $a->check_in ?? '—',
                'check_out' => $a->check_out ?? '—',
                'notes' => $a->notes ?? '',
            ];
        });

        return Inertia::render('Admin/StaffAttendance', [
            'initialAttendance' => $attendanceList
        ]);
    }

    public function salary()
    {
        $salaries = \App\Models\StaffSalary::latest()->get()->map(function ($s) {
            return [
                'id' => $s->id,
                'name' => $s->name,
                'designation' => $s->designation ?? 'Staff Member',
                'department' => $s->department ?? 'General',
                'salary' => (float)$s->salary,
                'status' => $s->status,
                'paidAt' => $s->paid_at ? $s->paid_at->format('d M Y') : null,
                'paymentMethod' => $s->payment_method,
            ];
        });

        return Inertia::render('Admin/StaffSalary', [
            'initialSalaries' => $salaries
        ]);
    }

    public function leaves()
    {
        $leaves = \App\Models\StaffLeave::latest()->get()->map(function ($l) {
            return [
                'id' => $l->id,
                'staff_name' => $l->staff_name,
                'leave_type' => $l->leave_type,
                'start_date' => $l->start_date ? $l->start_date->format('Y-m-d') : '',
                'end_date' => $l->end_date ? $l->end_date->format('Y-m-d') : '',
                'reason' => $l->reason ?? '',
                'status' => $l->status,
            ];
        });

        return Inertia::render('Admin/StaffLeaves', [
            'initialLeaves' => $leaves
        ]);
    }
}

