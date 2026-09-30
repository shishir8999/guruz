<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\ShopStaff;
use App\Models\ShopRole;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class SellerModeratorController extends Controller
{
    private function ensureTableColumnsExist()
    {
        try {
            if (!Schema::hasTable('shop_staffs')) {
                Schema::create('shop_staffs', function (Blueprint $table) {
                    $table->id();
                    $table->unsignedBigInteger('shop_id')->nullable();
                    $table->unsignedBigInteger('user_id')->nullable();
                    $table->string('name');
                    $table->string('email');
                    $table->string('phone')->nullable();
                    $table->string('role')->default('Store Manager');
                    $table->string('status')->default('Active');
                    $table->json('permissions')->nullable();
                    $table->string('last_login')->nullable();
                    $table->timestamps();
                });
            }

            if (!Schema::hasTable('shop_roles')) {
                Schema::create('shop_roles', function (Blueprint $table) {
                    $table->id();
                    $table->unsignedBigInteger('shop_id')->nullable();
                    $table->string('name');
                    $table->text('description')->nullable();
                    $table->string('color')->default('indigo');
                    $table->json('permissions')->nullable();
                    $table->timestamps();
                });
            }
        } catch (\Throwable $e) {
            // ignore
        }
    }

    public function index(Request $request): Response
    {
        $this->ensureTableColumnsExist();

        $user = Auth::user();
        $shop = $user ? $user->shop : null;

        if ($user && !$shop) {
            $shop = Shop::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'name'        => ($user->name ?? 'Vendor') . "'s Shop",
                    'slug'        => \Illuminate\Support\Str::slug(($user->name ?? 'Vendor') . "-shop-" . $user->id),
                    'status'      => 'active',
                    'is_approved' => true,
                ]
            );
        }

        $shopId = $shop ? $shop->id : 1;

        // Seed demo roles if empty
        if (ShopRole::count() === 0) {
            ShopRole::create([
                'shop_id'     => $shopId,
                'name'        => 'Store Manager',
                'description' => 'Full access to all seller features except banking and payouts.',
                'color'       => 'indigo',
            ]);

            ShopRole::create([
                'shop_id'     => $shopId,
                'name'        => 'Customer Service',
                'description' => 'Access to Reviews, Returns, Product Comments, and Orders (Read-only).',
                'color'       => 'emerald',
            ]);

            ShopRole::create([
                'shop_id'     => $shopId,
                'name'        => 'Fulfillment Staff',
                'description' => 'Access to Orders for status updates and invoice printing.',
                'color'       => 'amber',
            ]);

            ShopRole::create([
                'shop_id'     => $shopId,
                'name'        => 'Sales Specialist',
                'description' => 'Access to POS Sale, Inventory management, and Product listings.',
                'color'       => 'purple',
            ]);
        }

        // Seed demo staff if empty
        if (ShopStaff::count() === 0) {
            ShopStaff::create([
                'shop_id'    => $shopId,
                'name'       => 'John Doe',
                'email'      => 'john.d@shop.com',
                'phone'      => '+8801700000005',
                'role'       => 'Store Manager',
                'status'     => 'Active',
                'last_login' => '2 hours ago',
            ]);

            ShopStaff::create([
                'shop_id'    => $shopId,
                'name'       => 'Jane Smith',
                'email'      => 'jane.s@shop.com',
                'phone'      => '+8801700000006',
                'role'       => 'Customer Service',
                'status'     => 'Active',
                'last_login' => 'Yesterday',
            ]);

            ShopStaff::create([
                'shop_id'    => $shopId,
                'name'       => 'Mike Johnson',
                'email'      => 'mike.j@shop.com',
                'phone'      => '+8801700000007',
                'role'       => 'Fulfillment Staff',
                'status'     => 'Suspended',
                'last_login' => 'Oct 15, 2023',
            ]);
        }

        $staffList = ShopStaff::latest()
            ->get()
            ->map(function ($staff) {
                return [
                    'id'          => $staff->id,
                    'name'        => $staff->name,
                    'email'       => $staff->email,
                    'phone'       => $staff->phone ?: '+8801700000000',
                    'role'        => $staff->role ?: 'Store Manager',
                    'status'      => $staff->status ?: 'Active',
                    'last_login'  => $staff->last_login ?: ($staff->updated_at ? $staff->updated_at->diffForHumans() : 'Recently'),
                    'permissions' => $staff->permissions ?: [],
                ];
            });

        $rolesList = ShopRole::latest()
            ->get()
            ->map(function ($role) {
                return [
                    'id'          => $role->id,
                    'name'        => $role->name,
                    'description' => $role->description ?: 'Custom staff access permissions.',
                    'color'       => $role->color ?: 'indigo',
                ];
            });

        return Inertia::render('Seller/Moderator', [
            'staffList'   => $staffList,
            'totalStaff'  => $staffList->count(),
            'activeCount' => $staffList->filter(fn($s) => $s['status'] === 'Active')->count(),
            'rolesList'   => $rolesList,
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureTableColumnsExist();

        $validated = $request->validate([
            'name'   => 'required|string|max:255',
            'email'  => 'required|email|max:255',
            'phone'  => 'required|string|max:30',
            'role'   => 'required|string|max:100',
            'status' => 'required|string|in:Active,Suspended',
        ]);

        $user = Auth::user();
        $shop = $user ? $user->shop : null;

        ShopStaff::create([
            'shop_id'    => $shop ? $shop->id : 1,
            'name'       => $validated['name'],
            'email'      => $validated['email'],
            'phone'      => $validated['phone'],
            'role'       => $validated['role'],
            'status'     => $validated['status'],
            'last_login' => 'Just added',
        ]);

        return redirect()->back()->with('success', 'New staff member added successfully!');
    }

    public function update(Request $request, $id)
    {
        $this->ensureTableColumnsExist();

        $validated = $request->validate([
            'name'   => 'required|string|max:255',
            'email'  => 'required|email|max:255',
            'phone'  => 'required|string|max:30',
            'role'   => 'required|string|max:100',
            'status' => 'required|string|in:Active,Suspended',
        ]);

        $staff = ShopStaff::findOrFail($id);
        $staff->update([
            'name'   => $validated['name'],
            'email'  => $validated['email'],
            'phone'  => $validated['phone'],
            'role'   => $validated['role'],
            'status' => $validated['status'],
        ]);

        return redirect()->back()->with('success', 'Staff member updated successfully!');
    }

    public function toggleStatus($id)
    {
        $this->ensureTableColumnsExist();

        $staff = ShopStaff::findOrFail($id);
        $newStatus = $staff->status === 'Active' ? 'Suspended' : 'Active';
        $staff->update(['status' => $newStatus]);

        return redirect()->back()->with('success', "Staff status changed to {$newStatus}.");
    }

    public function destroy($id)
    {
        $this->ensureTableColumnsExist();

        ShopStaff::where('id', $id)->delete();

        return redirect()->back()->with('success', 'Staff member removed permanently.');
    }

    public function storeRole(Request $request)
    {
        $this->ensureTableColumnsExist();

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'required|string|max:500',
            'color'       => 'nullable|string|max:50',
        ]);

        $user = Auth::user();
        $shop = $user ? $user->shop : null;

        ShopRole::create([
            'shop_id'     => $shop ? $shop->id : 1,
            'name'        => $validated['name'],
            'description' => $validated['description'],
            'color'       => $validated['color'] ?? 'indigo',
        ]);

        return redirect()->back()->with('success', 'New role added to system!');
    }

    public function updateRole(Request $request, $id)
    {
        $this->ensureTableColumnsExist();

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'required|string|max:500',
            'color'       => 'nullable|string|max:50',
        ]);

        $role = ShopRole::findOrFail($id);
        $oldName = $role->name;

        $role->update([
            'name'        => $validated['name'],
            'description' => $validated['description'],
            'color'       => $validated['color'] ?? 'indigo',
        ]);

        // Automatically update staff assigned to this role name
        ShopStaff::where('role', $oldName)->update(['role' => $validated['name']]);

        return redirect()->back()->with('success', 'Role definition and assigned staff updated!');
    }

    public function destroyRole($id)
    {
        $this->ensureTableColumnsExist();

        ShopRole::where('id', $id)->delete();

        return redirect()->back()->with('success', 'Role deleted.');
    }
}
