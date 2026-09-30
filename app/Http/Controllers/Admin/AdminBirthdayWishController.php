<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\EmailService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminBirthdayWishController extends Controller
{
    /**
     * Display Birthday Wishes Dashboard & Customer Greeting Hub
     */
    public function index(Request $request)
    {
        $todayMonthDay = now()->format('m-d');
        $search = trim($request->input('q', ''));
        $filter = $request->input('filter', 'all'); // 'today', 'upcoming', 'all'

        $query = User::query();

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('id', $search);
            });
        }

        if ($filter === 'today') {
            $query->where(function ($q) use ($todayMonthDay) {
                $q->whereRaw("DATE_FORMAT(birthday, '%m-%d') = ?", [$todayMonthDay])
                  ->orWhereRaw("DATE_FORMAT(created_at, '%m-%d') = ?", [$todayMonthDay]);
            });
        }

        // Fetch users
        $customers = $query->latest()
            ->take(100)
            ->get(['id', 'name', 'email', 'phone', 'birthday', 'created_at'])
            ->map(function ($u) use ($todayMonthDay) {
                $isBirthdayToday = false;
                if ($u->birthday) {
                    $isBirthdayToday = Carbon::parse($u->birthday)->format('m-d') === $todayMonthDay;
                } else {
                    $isBirthdayToday = Carbon::parse($u->created_at)->format('m-d') === $todayMonthDay;
                }

                return [
                    'id'                => $u->id,
                    'name'              => $u->name,
                    'email'             => $u->email,
                    'phone'             => $u->phone ?: 'N/A',
                    'birthday'          => $u->birthday ? Carbon::parse($u->birthday)->format('d M Y') : null,
                    'is_birthday_today' => $isBirthdayToday,
                    'created_at'        => Carbon::parse($u->created_at)->format('d M Y'),
                ];
            });

        $settings = SiteSetting::where('group', 'birthday_wishes')->pluck('value', 'key')->toArray();

        // Recent Birthday Wishes Log
        $recentLogs = Notification::where('type', 'birthday')
            ->with('user:id,name,email')
            ->latest()
            ->take(15)
            ->get()
            ->map(function ($n) {
                return [
                    'id'         => $n->id,
                    'user_id'    => $n->user_id,
                    'user_name'  => $n->user ? $n->user->name : 'Customer #' . $n->user_id,
                    'user_email' => $n->user ? $n->user->email : 'N/A',
                    'title'      => $n->title,
                    'body'       => $n->body,
                    'created_at' => Carbon::parse($n->created_at)->diffForHumans(),
                ];
            });

        return Inertia::render('Admin/BirthdayWishes', [
            'dbCustomers' => $customers,
            'settings'    => $settings,
            'recentLogs'  => $recentLogs,
            'todayDate'   => now()->translatedFormat('d F Y'),
        ]);
    }

    /**
     * Send Birthday Wish to Selected Customers via Multi-Channels (In-App, Email/Gmail, SMS, WhatsApp)
     */
    public function send(Request $request)
    {
        $request->validate([
            'user_ids'        => 'required|array|min:1',
            'user_ids.*'      => 'required|integer',
            'subject'         => 'required|string|max:255',
            'message'         => 'required|string',
            'channels'        => 'required|array|min:1',
            'language'        => 'nullable|string|in:bn,en,hi',
            'coupon_code'     => 'nullable|string|max:50',
            'discount_value'  => 'nullable|string|max:50',
            'validity_days'   => 'nullable|integer|min:1|max:365',
        ]);

        $userIds       = $request->input('user_ids', []);
        $rawSubject    = $request->input('subject');
        $rawMessage    = $request->input('message');
        $channels      = $request->input('channels', ['in_app', 'email']);
        $language      = $request->input('language', 'bn');
        $couponCode    = trim($request->input('coupon_code', ''));
        $discountValue = trim($request->input('discount_value', ''));
        $validityDays  = (int) $request->input('validity_days', 7);

        $users = User::whereIn('id', $userIds)->get();

        if ($users->isEmpty()) {
            return back()->with('error', 'কোনো সঠিক কাস্টমার পাওয়া যায়নি!');
        }

        $sentInApp = 0;
        $sentEmail = 0;
        $sentSms   = 0;

        foreach ($users as $user) {
            // Replace placeholders
            $replacements = [
                '{{name}}'           => $user->name,
                '{customer_name}'    => $user->name,
                '{{id}}'             => '#' . $user->id,
                '{customer_id}'      => '#' . $user->id,
                '{{email}}'          => $user->email,
                '{customer_email}'   => $user->email,
                '{{coupon_code}}'    => $couponCode ?: 'BDAYGIFT',
                '{coupon_code}'      => $couponCode ?: 'BDAYGIFT',
                '{{discount_value}}' => $discountValue ?: '15%',
                '{discount_value}'   => $discountValue ?: '15%',
            ];

            $parsedSubject = str_replace(array_keys($replacements), array_values($replacements), $rawSubject);
            $parsedMessage = str_replace(array_keys($replacements), array_values($replacements), $rawMessage);

            // 1. In-App Notification (Customer Dashboard/Account/Header Bell)
            if (in_array('in_app', $channels)) {
                try {
                    Notification::create([
                        'user_id' => $user->id,
                        'type'    => 'birthday',
                        'title'   => $parsedSubject,
                        'body'    => $parsedMessage,
                        'icon'    => 'Cake',
                        'link'    => '/account/offers',
                        'is_read' => false,
                    ]);
                    $sentInApp++;
                } catch (\Throwable $e) {
                    Log::error("Failed to create birthday in-app notification for User #{$user->id}: " . $e->getMessage());
                }
            }

            // 2. Email Delivery (Customer Gmail / Email Inbox)
            if (in_array('email', $channels) && !empty($user->email)) {
                try {
                    $emailSuccess = EmailService::sendBirthdayWishEmail(
                        $user,
                        $parsedSubject,
                        $parsedMessage,
                        $couponCode ?: null,
                        $discountValue ?: null,
                        $language
                    );
                    if ($emailSuccess) {
                        $sentEmail++;
                    }
                } catch (\Throwable $e) {
                    Log::error("Failed to send birthday email to {$user->email}: " . $e->getMessage());
                }
            }

            // 3. SMS Delivery (via configured SMS Gateway)
            if (in_array('sms', $channels) && !empty($user->phone)) {
                try {
                    $smsSuccess = \App\Services\SmsService::send($user->phone, $parsedMessage);
                    if ($smsSuccess) {
                        $sentSms++;
                    }
                } catch (\Throwable $e) {
                    Log::error("Failed to send birthday SMS to {$user->phone}: " . $e->getMessage());
                }
            }

            // 4. User Bonus Coupon Credit (Visible in Customer Account -> Coupons tab)
            if (!empty($couponCode)) {
                try {
                    DB::table('user_bonus_coupons')->updateOrInsert(
                        [
                            'user_id' => $user->id,
                            'code'    => $couponCode,
                        ],
                        [
                            'value'      => $discountValue ?: '15%',
                            'is_used'    => false,
                            'expires_at' => now()->addDays($validityDays),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                } catch (\Throwable $e) {
                    Log::error("Failed to credit bonus coupon to User #{$user->id}: " . $e->getMessage());
                }
            }
        }

        $totalUsers = $users->count();
        $parts = [];
        if ($sentInApp > 0) $parts[] = "ইন-অ্যাপ: {$sentInApp}টি";
        if ($sentEmail > 0) $parts[] = "ইমেইল: {$sentEmail}টি";
        if ($sentSms > 0) $parts[] = "এসএমএস: {$sentSms}টি";
        if (in_array('whatsapp', $channels)) $parts[] = "WhatsApp কিউ প্রস্তুত";

        $summary = !empty($parts) ? '(' . implode(', ', $parts) . ')' : '';
        $msg = "🎉 মোট {$totalUsers} জন কাস্টমারকে জন্মদিনের শুভেচ্ছা প্রক্রিয়াকরণ সম্পন্ন হয়েছে! {$summary}";

        return back()->with('success', $msg);
    }

    /**
     * Save Birthday Wish Automation Settings
     */
    public function updateSettings(Request $request)
    {
        foreach ($request->except('_token') as $key => $value) {
            $val = is_bool($value) ? ($value ? 'true' : 'false') : $value;
            SiteSetting::set($key, $val, 'birthday_wishes');
        }

        return back()->with('success', 'Birthday Wishes সেটিংস সফলভাবে সেভ করা হয়েছে!');
    }
}
