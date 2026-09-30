<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\CustomerWallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class CustomerAccountController extends Controller
{
    public function index(): Response
    {
        $user   = auth()->user()->load('profile');
        
        $recent_orders = Order::where('user_id', $user->id)
            ->latest()
            ->limit(5)
            ->get(['id', 'order_number', 'total', 'status', 'created_at']);
            
        // Calculate items_count manually or ensure it's fetched if Dashboard needs it.
        // Actually we can add withCount('items') to get it perfectly.
        $recent_orders = Order::where('user_id', $user->id)
            ->withCount('items')
            ->latest()
            ->limit(5)
            ->get(['id', 'order_number', 'total', 'status', 'created_at']);

        $wallet = CustomerWallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0, 'total_earned' => 0, 'total_spent' => 0]
        );
        
        $stats = [
            'total_orders' => Order::where('user_id', $user->id)->count(),
            'in_progress'  => Order::where('user_id', $user->id)->whereIn('status', ['pending', 'processing', 'shipped'])->count(),
            'delivered'    => Order::where('user_id', $user->id)->where('status', 'delivered')->count(),
            'total_spent'  => $wallet->total_spent,
        ];
        
        // Let's add some VIP logic to user object on the fly so dashboard can show it.
        $totalOrders = $stats['total_orders'];
        if ($totalOrders < 5) {
            $user->vip_level = 'Bronze';
            $user->next_vip_level = 'Silver';
            $user->completed_orders_count = $totalOrders;
            $user->orders_to_next_level = 5 - $totalOrders;
        } elseif ($totalOrders < 15) {
            $user->vip_level = 'Silver';
            $user->next_vip_level = 'Gold';
            $user->completed_orders_count = $totalOrders;
            $user->orders_to_next_level = 15 - $totalOrders;
        } else {
            $user->vip_level = 'Gold';
            $user->next_vip_level = null;
            $user->completed_orders_count = $totalOrders;
            $user->orders_to_next_level = 0;
        }
        
        // Active coupons
        $coupons = \App\Models\Coupon::where('is_active', true)
            ->where(function($query) {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->latest()
            ->limit(3)
            ->get()
            ->map(function($c) {
                return [
                    'code' => $c->code,
                    'discount' => $c->value,
                    'valid_till' => $c->expires_at ? $c->expires_at->format('d/m/Y') : 'Unlimited',
                ];
            });

        return Inertia::render('Account/Dashboard', [
            'user'          => $user,
            'stats'         => $stats,
            'recent_orders' => $recent_orders,
            'coupons'       => $coupons,
            'wallet'        => $wallet,
        ]);
    }

    public function profile(): Response
    {
        $user = auth()->user()->load('profile');
        return Inertia::render('Account/Profile', ['user' => $user]);
    }

    public function updateProfile(Request $request)
    {
        $user = auth()->user();

        $request->validate([
            'name'     => 'required|string|max:255',
            'phone'    => 'nullable|string|max:50',
            'city'     => 'nullable|string|max:100',
            'address'  => 'nullable|string|max:500',
            'birthday' => 'nullable|string|max:20',
        ]);

        $userData = [
            'name'  => $request->name,
            'phone' => $request->phone,
        ];
        if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'birthday')) {
            $userData['birthday'] = $request->birthday;
        }
        if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'city')) {
            $userData['city'] = $request->city;
        }
        if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'address')) {
            $userData['address'] = $request->address;
        }

        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $uploadDir = public_path('uploads/avatars');
            if (!file_exists($uploadDir)) {
                @mkdir($uploadDir, 0755, true);
            }
            $filename = 'avatar_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($uploadDir, $filename);

            try {
                $storageDir = storage_path('app/public/avatars');
                if (!file_exists($storageDir)) {
                    @mkdir($storageDir, 0755, true);
                }
                @copy($uploadDir . DIRECTORY_SEPARATOR . $filename, $storageDir . DIRECTORY_SEPARATOR . $filename);
            } catch (\Throwable $e) {}

            $avatarUrl = '/uploads/avatars/' . $filename;
            $userData['avatar_url'] = $avatarUrl;
            $userData['avatar'] = $avatarUrl;
            if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'profile_photo_path')) {
                $userData['profile_photo_path'] = $avatarUrl;
            }
        }

        $user->update($userData);

        if (method_exists($user, 'profile')) {
            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'full_name'     => $request->name,
                    'phone'         => $request->phone,
                    'city'          => $request->city,
                    'address'       => $request->address,
                    'date_of_birth' => $request->birthday,
                ]
            );
        }

        return back()->with('success', 'প্রোফাইল সফলভাবে আপডেট হয়েছে!');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password'         => 'required|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, auth()->user()->password)) {
            return back()->withErrors(['current_password' => 'বর্তমান পাসওয়ার্ড ভুল।']);
        }

        auth()->user()->update(['password' => Hash::make($request->password)]);
        return back()->with('success', 'পাসওয়ার্ড পরিবর্তন হয়েছে!');
    }

    public function orders(Request $request): Response
    {
        $query = Order::with(['items.product'])
            ->where('user_id', auth()->id());

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Account/Orders', [
            'orders'  => $orders,
            'filters' => $request->only(['status']),
        ]);
    }

    public function wallet(): Response
    {
        $wallet = CustomerWallet::firstOrCreate(
            ['user_id' => auth()->id()],
            ['balance' => 0, 'total_earned' => 0, 'total_spent' => 0]
        );

        $transactions = $wallet->transactions()
            ->latest()
            ->paginate(20);

        return Inertia::render('Account/Wallet', [
            'wallet'       => $wallet,
            'transactions' => $transactions,
        ]);
    }

    public function wishlist(): Response
    {
        $wishlist = auth()->user()
            ->wishlistItems()
            ->with(['product' => fn($q) => $q->with(['shop:id,name', 'images'])])
            ->latest()
            ->paginate(20);

        return Inertia::render('Account/Wishlist', ['wishlist' => $wishlist]);
    }

    public function toggleWishlist(Request $request)
    {
        $request->validate(['product_id' => 'required|exists:products,id']);
        $user = auth()->user();

        $existing = $user->wishlistItems()->where('product_id', $request->product_id)->first();

        if ($existing) {
            $existing->delete();
            return back()->with('success', 'উইশলিস্ট থেকে সরানো হয়েছে।');
        }

        $user->wishlistItems()->create(['product_id' => $request->product_id]);
        return back()->with('success', 'উইশলিস্টে যোগ করা হয়েছে!');
    }
}
