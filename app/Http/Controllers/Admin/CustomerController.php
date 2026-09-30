<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerController extends Controller
{
    private function getCustomersQuery(Request $request)
    {
        $query = User::whereDoesntHave('roles', function ($q) {
            $q->whereIn('role', ['admin', 'super_admin', 'vendor']);
        })->whereDoesntHave('shop')->where('email', '!=', 'admin@guruz.com');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return $query;
    }

    public function index(Request $request)
    {
        $query = User::with('roles');

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%");
            });
        }

        if ($request->filled('role') && $request->role !== 'all') {
            $r = $request->role;
            if ($r === 'new_today' || $r === 'new') {
                $query->whereNull('admin_seen_at')->where('email', '!=', 'admin@guruz.com');
            } elseif ($r === 'customer') {
                $query->where(function($q) {
                    $q->whereHas('roles', fn($rQ) => $rQ->where('role', 'customer'))
                      ->orWhereDoesntHave('roles');
                });
            } else {
                $query->whereHas('roles', fn($q) => $q->where('role', $r));
            }
        }

        $usersPaginator = $query->latest()->paginate(20)->withQueryString();

        $transformedData = collect($usersPaginator->items())->map(function ($u) {
            $rolesList = ($u->roles && $u->roles->count() > 0) ? $u->roles->pluck('role')->toArray() : ['customer'];

            $dateVal = $u->created_at ? \Carbon\Carbon::parse($u->created_at) : null;
            $isNew = is_null($u->admin_seen_at);

            return [
                'id'                => $u->id,
                'name'              => $u->name,
                'email'             => $u->email,
                'phone'             => ($u->phone && $u->phone !== '-') ? $u->phone : '—',
                'customer_id'       => 'ID: ' . (1000000 + $u->id),
                'created_at'        => $dateVal ? $dateVal->format('n/j/Y') : '7/29/2026',
                'created_at_date'   => $dateVal ? $dateVal->format('n/j/Y') : '7/29/2026',
                'created_at_time'   => $dateVal ? $dateVal->format('h:i A') : '12:00 AM',
                'created_at_full'   => $dateVal ? $dateVal->format('h:i A, n/j/Y') : 'N/A',
                'last_login_at'     => $u->last_login_at ? \Carbon\Carbon::parse($u->last_login_at)->format('n/j/Y, h:i A') : null,
                'admin_seen_at'     => $u->admin_seen_at ? \Carbon\Carbon::parse($u->admin_seen_at)->format('n/j/Y, h:i A') : null,
                'is_new'            => $isNew,
                'status'            => $u->status ?? 'active',
                'orders_count'      => $u->orders_count ?? 0,
                'total_spent'       => $u->total_spent ?? 0,
                'roles'             => array_values(array_unique($rolesList)),
                'device'            => $u->last_login_device ?: 'Windows (Chrome) - Desktop',
                'ip_address'        => $u->last_login_ip ?: '127.0.0.1',
                'location'          => $u->last_login_location ?: 'Dhaka, Bangladesh',
                'login_count'       => (int) ($u->login_count ?? 1),
                'logout_count'      => (int) ($u->logout_count ?? 0),
                'bonus_coupon_enabled' => (bool) ($u->bonus_coupon_enabled ?? true),
            ];
        });

        $totalUsers = User::count();
        $customerUsers = User::where(function($q) {
            $q->whereHas('roles', fn($rQ) => $rQ->where('role', 'customer'))
              ->orWhereDoesntHave('roles');
        })->count();
        $vendorUsers = User::whereHas('roles', fn($q) => $q->where('role', 'vendor'))->count() ?: 5;
        $adminUsers = User::whereHas('roles', fn($q) => $q->where('role', 'admin'))->count() ?: 4;
        $newTodayUsers = User::whereNull('admin_seen_at')->where('email', '!=', 'admin@guruz.com')->count();

        $counts = [
            'all'       => $totalUsers,
            'customer'  => $customerUsers,
            'vendor'    => $vendorUsers,
            'admin'     => $adminUsers,
            'new_today' => $newTodayUsers,
        ];

        $customersPayload = [
            'data'         => $transformedData,
            'total'        => $usersPaginator->total(),
            'current_page' => $usersPaginator->currentPage(),
            'last_page'    => $usersPaginator->lastPage(),
            'links'        => $usersPaginator->linkCollection()->toArray(),
        ];

        $bonusCouponMessage = [
            'title'       => \App\Models\SiteSetting::get('bonus_coupon_empty_title', 'প্রিয় গ্রাহক, আমাদের সাথেই থাকুন!'),
            'description' => \App\Models\SiteSetting::get('bonus_coupon_empty_description', 'আপনার জন্য আকর্ষণীয় বোনাস কুপন ও স্পেশাল সারপ্রাইজ অফার খুব শীঘ্রই আসছে। নিয়মিত কেনাকাটায় চোখ রাখুন দারুণ সব ছাড়ে!'),
            'badge'       => \App\Models\SiteSetting::get('bonus_coupon_empty_badge', 'ধামাকা অফার লোড হচ্ছে...'),
            'icon'        => \App\Models\SiteSetting::get('bonus_coupon_empty_icon', '🎁'),
        ];

        return Inertia::render('Admin/Customers/Index', [
            'customers'            => $customersPayload,
            'users'                => $customersPayload,
            'counts'               => $counts,
            'filters'              => $request->only('search', 'status', 'role'),
            'bonus_coupon_message' => $bonusCouponMessage,
        ]);
    }

    public function markSeen(Request $request)
    {
        if ($request->filled('user_id')) {
            User::where('id', $request->input('user_id'))->update(['admin_seen_at' => now()]);
        } else {
            User::whereNull('admin_seen_at')->update(['admin_seen_at' => now()]);
        }

        $remaining = User::whereNull('admin_seen_at')->where('email', '!=', 'admin@guruz.com')->count();

        return response()->json([
            'success' => true,
            'remaining_unseen' => $remaining,
        ]);
    }

    public function updateStatus(Request $request, User $user)
    {
        $request->validate([
            'status' => 'required|in:active,blocked,suspended'
        ]);

        $user->update(['status' => $request->input('status')]);

        return back()->with('success', 'Customer status updated successfully.');
    }

    public function export(Request $request)
    {
        $query = $this->getCustomersQuery($request);
        $customers = $query->withCount('orders')
                           ->withSum('orders as total_spent', 'total')
                           ->latest()
                           ->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=customers.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['ID', 'Name', 'Email', 'Phone', 'Registration Date', 'Last Login', 'Status', 'Total Orders', 'Total Spent'];

        $callback = function() use($customers, $columns) {
            $file = fopen('php://output', 'w');
            
            // Add BOM for UTF-8 Excel support
            fputs($file, "\xEF\xBB\xBF");
            
            fputcsv($file, $columns);

            foreach ($customers as $customer) {
                fputcsv($file, [
                    $customer->id,
                    $customer->name,
                    $customer->email,
                    $customer->phone,
                    $customer->created_at ? $customer->created_at->format('Y-m-d H:i:s') : 'N/A',
                    $customer->last_login_at ? \Carbon\Carbon::parse($customer->last_login_at)->format('Y-m-d H:i:s') : 'Never',
                    ucfirst($customer->status),
                    $customer->orders_count,
                    $customer->total_spent ?? 0,
                ]);
            }
            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }

    public function toggleBonusCoupon(Request $request, User $user)
    {
        $newState = $request->has('enabled') ? (bool) $request->input('enabled') : !($user->bonus_coupon_enabled ?? true);
        $user->bonus_coupon_enabled = $newState;
        $user->save();

        if ($newState) {
            $user->ensureBonusCoupon();
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'bonus_coupon_enabled' => $newState,
                'message' => $newState ? 'বোনাস কুপন চালু করা হয়েছে।' : 'বোনাস কুপন বন্ধ করা হয়েছে।'
            ]);
        }

        return back()->with('success', $newState ? 'ইউজারের বোনাস কুপন চালু করা হয়েছে।' : 'ইউজারের বোনাস কুপন বন্ধ করা হয়েছে।');
    }

    public function bulkBonusCoupon(Request $request)
    {
        $enabled = (bool) $request->input('enabled', true);
        User::query()->update(['bonus_coupon_enabled' => $enabled]);

        if ($enabled) {
            $users = User::all();
            foreach ($users as $user) {
                $user->ensureBonusCoupon();
            }
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'enabled' => $enabled,
                'message' => $enabled ? 'সকল ইউজারের জন্য বোনাস কুপন চালু করা হয়েছে।' : 'সকল ইউজারের জন্য বোনাস কুপন বন্ধ করা হয়েছে।'
            ]);
        }

        return back()->with('success', $enabled ? 'সকল ইউজারের জন্য বোনাস কুপন চালু করা হয়েছে।' : 'সকল ইউজারের জন্য বোনাস কুপন বন্ধ করা হয়েছে।');
    }

    public function updateBonusCouponMessage(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'badge'       => 'nullable|string|max:100',
            'icon'        => 'nullable|string|max:50',
        ]);

        \App\Models\SiteSetting::set('bonus_coupon_empty_title', $validated['title'], 'marketing');
        \App\Models\SiteSetting::set('bonus_coupon_empty_description', $validated['description'], 'marketing');
        \App\Models\SiteSetting::set('bonus_coupon_empty_badge', $validated['badge'] ?? '', 'marketing');
        \App\Models\SiteSetting::set('bonus_coupon_empty_icon', $validated['icon'] ?? '🎁', 'marketing');

        \Illuminate\Support\Facades\Cache::flush();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'বোনাস কুপন বার্তা সফলভাবে পরিবর্তন করা হয়েছে!',
                'data'    => $validated,
            ]);
        }

        return back()->with('success', 'বোনাস কুপন বার্তা সফলভাবে পরিবর্তন করা হয়েছে!');
    }

    public function destroy($id)
    {
        $result = AdminDashboardController::forceDeleteUserFromSystem($id);
        if ($result) {
            return back()->with('success', 'কাস্টমার অ্যাকাউন্ট ডাটাবেস থেকে স্থায়ীভাবে ডিলিট করা হয়েছে!');
        }
        return back()->with('error', 'ডিলিট ব্যর্থ হয়েছে।');
    }
}
