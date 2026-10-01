<?php

namespace App\Http\Middleware;

use App\Models\SiteSetting;
use App\Models\FooterWidget;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        // 🚀 CRITICAL PERFORMANCE OPTIMIZATION:
        // Cache all site_settings in memory to avoid 35+ SQL SELECT queries on EVERY request!
        $settingsMap = Cache::remember('all_site_settings_map', 600, function () {
            try {
                return SiteSetting::pluck('value', 'key')->toArray();
            } catch (\Throwable $e) {
                return [];
            }
        });

        $getSetting = fn($key, $default = null) => $settingsMap[$key] ?? $default;

        $activeThemeId = $getSetting('active_theme_id');
        $themesData = $getSetting('themes_data');
        $activeTheme = null;

        if ($themesData) {
            $themes = json_decode($themesData, true);
            $currentMonthDay = date('m-d');

            if ($activeThemeId && is_array($themes)) {
                foreach ($themes as $theme) {
                    if ($theme['id'] === $activeThemeId && !empty($theme['visibleOnSite'])) {
                        $activeTheme = $theme;
                        break;
                    }
                }
            }

            if (!$activeTheme && is_array($themes)) {
                foreach ($themes as $theme) {
                    if (!empty($theme['active']) && !empty($theme['visibleOnSite'])) {
                        $activeTheme = $theme;
                        break;
                    }
                }
            }

            if (!$activeTheme && is_array($themes)) {
                foreach ($themes as $theme) {
                    if (!empty($theme['scheduled']) && !empty($theme['startDate']) && !empty($theme['endDate'])) {
                        $start = $theme['startDate'];
                        $end = $theme['endDate'];
                        $isMatch = ($start <= $end)
                            ? ($currentMonthDay >= $start && $currentMonthDay <= $end)
                            : ($currentMonthDay >= $start || $currentMonthDay <= $end);

                        if ($isMatch && !empty($theme['visibleOnSite'])) {
                            $activeTheme = $theme;
                            break;
                        }
                    }
                }
            }
        }

        $savedVisitorWidget = $getSetting('live_visitor_widget');
        $visitorWidget = $savedVisitorWidget ? json_decode($savedVisitorWidget, true) : [];
        $visitorWidget['is_active'] = (bool) ($getSetting('social_proof_enabled', '1') === '1');
        $visitorWidget['interval_seconds'] = (int) $getSetting('social_proof_interval_seconds', 20);
        $visitorWidget['display_duration_seconds'] = (int) $getSetting('social_proof_duration_seconds', 6);
        $visitorWidget['live_visitor_mode'] = $getSetting('live_visitor_mode', 'virtual');
        $visitorWidget['live_visitor_label_text'] = $getSetting('live_visitor_label_text', 'LIVE');
        $visitorWidget['live_visitor_prefix_text'] = $getSetting('live_visitor_prefix_text', '🔴');
        $visitorWidget['live_visitor_suffix_text'] = $getSetting('live_visitor_suffix_text', '');
        $visitorWidget['live_visitor_min_count'] = (int) $getSetting('live_visitor_min_count', 250);
        $visitorWidget['live_visitor_max_count'] = (int) $getSetting('live_visitor_max_count', 500);
        $visitorWidget['live_visitor_base_count'] = (int) $getSetting('live_visitor_base_count', 350);

        $savedFeatureBadges = $getSetting('feature_badges');
        $featureBadges = $savedFeatureBadges ? json_decode($savedFeatureBadges, true) : [
            ['id' => 'safe_payments', 'label_bn' => 'নিরাপদ পেমেন্ট', 'icon' => 'ShieldCheck', 'gradient_from' => 'from-cyan-500', 'gradient_to' => 'to-blue-500', 'is_active' => true],
            ['id' => 'nationwide_delivery', 'label_bn' => 'সারাদেশে ডেলিভারি', 'icon' => 'Truck', 'gradient_from' => 'from-orange-500', 'gradient_to' => 'to-amber-500', 'is_active' => true],
            ['id' => 'easy_return', 'label_bn' => 'সহজ রিটার্ন পলিসি', 'icon' => 'RefreshCw', 'gradient_from' => 'from-emerald-500', 'gradient_to' => 'to-teal-500', 'is_active' => true],
            ['id' => 'support', 'label_bn' => '২৪/৭ সাপোর্ট', 'icon' => 'Headset', 'gradient_from' => 'from-purple-500', 'gradient_to' => 'to-indigo-500', 'is_active' => true],
            ['id' => 'authentic_products', 'label_bn' => '১০০% আসল প্রোডাক্ট', 'icon' => 'Award', 'gradient_from' => 'from-amber-500', 'gradient_to' => 'to-yellow-500', 'is_active' => true],
            ['id' => 'fast_delivery', 'label_bn' => 'দ্রুততম হোম ডেলিভারি', 'icon' => 'Zap', 'gradient_from' => 'from-rose-500', 'gradient_to' => 'to-pink-500', 'is_active' => true]
        ];

        $savedProfileCard = $getSetting('profile_discount_card');
        $profileCard = $savedProfileCard ? json_decode($savedProfileCard, true) : [
            'is_active' => true,
            'text_bn' => 'আপনার প্রোফাইল সম্পূর্ণ করুন এবং পান অতিরিক্ত ২% ডিসকাউন্ট!',
            'discount_percentage' => '২%',
            'link_url' => '/account'
        ];

        $siteSettings = [
            'site_logo'                => $getSetting('site_logo'),
            'site_favicon'             => $getSetting('site_favicon'),
            'site_title'               => $getSetting('site_title', 'Guruz BD'),
            'support_phone'            => $getSetting('support_phone', '01700000000'),
            'marquee_speed_shops'      => $getSetting('marquee_speed_shops', '20'),
            'marquee_speed_categories' => $getSetting('marquee_speed_categories', '20'),
            'marquee_speed_brands'     => $getSetting('marquee_speed_brands', '20'),
            'active_theme'             => $activeTheme,
            'visitor_widget'           => $visitorWidget,
            'feature_badges'           => $featureBadges,
            'profile_discount_card'    => $profileCard,
            'search_product_names'     => Cache::remember('global_search_product_names', 1800, function () {
                return Product::where('is_active', true)->latest()->limit(15)->pluck('name')->toArray();
            }),
            'support_widget' => [
                'enabled'        => $getSetting('widget_enabled', '1') === '1',
                'color'          => $getSetting('widget_color', '#4f46e5'),
                'position'       => $getSetting('widget_position', 'bottom-right'),
                'greeting'       => $getSetting('widget_greeting', '২৪/৭ কাস্টমার সাপোর্ট — যেকোনো প্রয়োজনে আমরা আপনার সাথে আছি!'),
                'whatsapp'       => $getSetting('widget_whatsapp', '+8801982708789'),
                'messenger'      => $getSetting('widget_messenger', 'guruzbd'),
                'phone'          => $getSetting('widget_phone', '01700000000'),
                'email'          => $getSetting('widget_email', 'support@guruz.com.bd'),
                'whatsapp_icon'  => $getSetting('widget_whatsapp_icon'),
                'messenger_icon' => $getSetting('widget_messenger_icon'),
                'livechat_icon'  => $getSetting('widget_livechat_icon'),
            ],
            'theme_colors' => [
                'primary_color'     => $getSetting('theme_primary_color', '#16a34a'),
                'primary_dark'      => $getSetting('theme_primary_dark', '#15803d'),
                'primary_text'      => $getSetting('theme_primary_text', '#ffffff'),
                'accent_color'       => $getSetting('theme_accent_color', '#22c9a3'),
                'badge_bg'          => $getSetting('theme_badge_bg', '#f97316'),
                'sale_bg'           => $getSetting('theme_sale_bg', '#ef4444'),
                'navy_color'        => $getSetting('theme_navy_color', '#0f2033'),
                'header_bg'         => $getSetting('theme_header_bg', '#0f2033'),
                'header_text'       => $getSetting('theme_header_text', '#ffffff'),
                'search_bg'         => $getSetting('theme_search_bg', '#383333'),
                'search_text'       => $getSetting('theme_search_text', '#ffffff'),
                'announcement_bg'   => $getSetting('theme_announcement_bg', '#16a34a'),
                'announcement_text' => $getSetting('theme_announcement_text', '#ffffff'),
                'notice_from'       => $getSetting('theme_notice_from', '#fbbf24'),
                'notice_via'        => $getSetting('theme_notice_via', '#f97316'),
                'notice_to'         => $getSetting('theme_notice_to', '#f43f5e'),
                'notice_text'       => $getSetting('theme_notice_text', '#ffffff'),
                'footer_bg'         => $getSetting('theme_footer_bg', '#0f2033'),
                'footer_text'       => $getSetting('theme_footer_text', '#ffffff'),
                'page_bg'           => $getSetting('theme_page_bg', '#ffffff'),
                'page_text'         => $getSetting('theme_page_text', '#0a0f1c'),
                'card_bg'           => $getSetting('theme_card_bg', '#ffffff'),
                'card_text'         => $getSetting('theme_card_text', '#0a0f1c'),
                'popover_bg'        => $getSetting('theme_popover_bg', '#ffffff'),
                'popover_text'      => $getSetting('theme_popover_text', '#0a0f1c'),
                'secondary_bg'      => $getSetting('theme_secondary_bg', '#f1f5f9'),
                'secondary_text'    => $getSetting('theme_secondary_text', '#0f2033'),
                'accent_bg'         => $getSetting('theme_accent_bg', '#f1f5f9'),
                'accent_text'       => $getSetting('theme_accent_text', '#1e293b'),
                'muted_bg'          => $getSetting('theme_muted_bg', '#f1f5f9'),
                'muted_text'        => $getSetting('theme_muted_text', '#64748b'),
                'border_color'      => $getSetting('theme_border_color', '#e2e8f0'),
                'input_border'      => $getSetting('theme_input_border', '#e2e8f0'),
                'focus_ring'        => $getSetting('theme_focus_ring', '#94a3b8'),
                'danger_bg'         => $getSetting('theme_danger_bg', '#ef4444'),
                'danger_text'       => $getSetting('theme_danger_text', '#ffffff'),
                'sidebar_bg'        => $getSetting('theme_sidebar_bg', '#242628'),
                'sidebar_text'      => $getSetting('theme_sidebar_text', '#ffffff'),
                'sidebar_active_bg' => $getSetting('theme_sidebar_active_bg', '#1e293b'),
                'sidebar_active_text' => $getSetting('theme_sidebar_active_text', '#f8fafc'),
                'sidebar_hover_bg'  => $getSetting('theme_sidebar_hover_bg', '#f1f5f9'),
                'sidebar_hover_text' => $getSetting('theme_sidebar_hover_text', '#1e293b'),
                'sidebar_border'    => $getSetting('theme_sidebar_border', '#e2e8f0'),
            ],
        ];

        $footerSettings = [
            'footer_facebook' => $getSetting('footer_facebook', ''),
            'footer_instagram' => $getSetting('footer_instagram', ''),
            'footer_youtube' => $getSetting('footer_youtube', ''),
            'footer_linkedin' => $getSetting('footer_linkedin', ''),
            'footer_tiktok' => $getSetting('footer_tiktok', ''),
            'footer_pinterest' => $getSetting('footer_pinterest', ''),
            'footer_whatsapp' => $getSetting('footer_whatsapp', ''),
            'footer_app_store' => $getSetting('footer_app_store', ''),
            'footer_play_store' => $getSetting('footer_play_store', ''),
            'footer_copyright' => $getSetting('footer_copyright', '© 2026 GURUZ All rights reserved. Secure payments • Genuine products'),
            'footer_payment_methods' => json_decode($getSetting('footer_payment_methods', '[]'), true),
        ];

        $adminCounts = [
            'pending_orders'            => 0,
            'pending_category_requests' => 0,
            'pending_vendors'           => 0,
            'pending_vendor_kyc'        => 0,
            'pending_payouts'           => 0,
            'pending_pickup_requests'   => 0,
            'new_users_today'          => 0,
            'pending_payments'          => 0,
            'pending_emails'            => 0,
            'pending_sms'               => 0,
            'pending_support_tickets'   => 0,
            'pending_reviews'           => 0,
            'pending_warranty_claims'   => 0,
            'unread_messages'           => 0,
        ];

        // 🚀 ONLY run admin count SQL queries if accessing admin routes, cached for 5s for fast & fresh transitions!
        if ($user && $request->is('admin*')) {
            try {
                $adminCounts = Cache::remember('admin_nav_counts', 5, function () {
                    $counts = [];
                    $counts['pending_orders']            = \App\Models\Order::whereNull('admin_seen_at')->whereIn('status', ['pending', 'processing'])->count();
                    $counts['pending_category_requests'] = \App\Models\CategoryRequest::where('status', 'pending')->count();
                    $counts['pending_vendors']           = \App\Models\Shop::where('status', 'pending')->count();
                    $counts['pending_vendor_kyc']        = \Illuminate\Support\Facades\Schema::hasTable('vendor_kycs')
                        ? \App\Models\VendorKyc::where('status', 'pending')->count()
                        : 0;
                    $counts['pending_payouts']           = \Illuminate\Support\Facades\Schema::hasTable('payout_requests')
                        ? \App\Models\PayoutRequest::where('status', 'pending')->count()
                        : 0;
                    $counts['pending_pickup_requests']   = \Illuminate\Support\Facades\Schema::hasTable('pickup_requests')
                        ? \App\Models\PickupRequest::where('status', 'pending')->count()
                        : 0;
                    $counts['new_users_today']          = \App\Models\User::whereNull('admin_seen_at')->where('email', '!=', 'admin@guruz.com')->count();
                    $counts['pending_payments']          = \Illuminate\Support\Facades\Schema::hasTable('payment_transactions')
                        ? \App\Models\PaymentTransaction::where('status', 'pending')->count()
                        : 0;
                    $counts['pending_emails']            = \Illuminate\Support\Facades\Schema::hasTable('notifications')
                        ? \App\Models\Notification::where('is_read', false)->count()
                        : 0;
                    $counts['pending_sms']               = \Illuminate\Support\Facades\Schema::hasTable('push_notifications')
                        ? \App\Models\PushNotification::where('status', 'pending')->count()
                        : 0;
                    $counts['pending_support_tickets']   = \Illuminate\Support\Facades\Schema::hasTable('vendor_support_tickets')
                        ? \App\Models\VendorSupportTicket::where('is_read', false)->whereIn('status', ['pending', 'open', 'Open'])->count()
                        : 0;
                    $counts['pending_reviews']           = \App\Models\ProductReview::where(function($q) {
                        $q->whereNotIn('status', ['approved', 'rejected'])
                          ->orWhereNull('status');
                    })->count();
                    $counts['pending_warranty_claims']   = \Illuminate\Support\Facades\Schema::hasTable('warranty_claims')
                        ? \App\Models\WarrantyClaim::whereNull('admin_seen_at')->whereIn('status', ['pending', 'under_review'])->count()
                        : 0;
                    $directUnread = \App\Models\Message::where('sender_id', '!=', 1)->where('is_read', false)->count();
                    $liveChatUnread = 0;
                    if (\Illuminate\Support\Facades\Schema::hasTable('live_chat_threads')) {
                        $liveChatUnread = (int) \App\Models\LiveChatThread::sum('unread_admin_count');
                    }
                    $counts['unread_messages']           = $directUnread + $liveChatUnread;
                    return $counts;
                });

                // Auto-clear badge count when Super Admin views that specific page
                if ($request->is('admin/messages*')) {
                    $adminCounts['unread_messages'] = 0;
                }
                if ($request->is('admin/category-requests*')) {
                    $adminCounts['pending_category_requests'] = 0;
                }
                if ($request->is('admin/warranty-claims*')) {
                    $adminCounts['pending_warranty_claims'] = 0;
                }
                if ($request->is('admin/pickup-requests*') || $request->is('admin/returns*')) {
                    $adminCounts['pending_pickup_requests'] = 0;
                }
                if ($request->is('admin/vendor-tickets*') || $request->is('admin/support-tickets*')) {
                    $adminCounts['pending_support_tickets'] = 0;
                }
                if ($request->is('admin/orders*')) {
                    $adminCounts['pending_orders'] = 0;
                }
                if ($request->is('admin/customers*')) {
                    $adminCounts['new_users_today'] = 0;
                }
                if ($request->is('admin/shops*')) {
                    $adminCounts['pending_vendors'] = 0;
                }
                if ($request->is('admin/vendor-kyc*')) {
                    $adminCounts['pending_vendor_kyc'] = 0;
                }
                if ($request->is('admin/payout-requests*')) {
                    $adminCounts['pending_payouts'] = 0;
                }
                if ($request->is('admin/finance/payments*') || $request->is('admin/finance/refunds*') || $request->is('admin/finance/gateway-settings*')) {
                    $adminCounts['pending_payments'] = 0;
                }
                if ($request->is('admin/emails*') || $request->is('admin/users/notifications*')) {
                    $adminCounts['pending_emails'] = 0;
                }
                if ($request->is('admin/sms*')) {
                    $adminCounts['pending_sms'] = 0;
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('adminCounts error: ' . $e->getMessage());
            }
        }

        $sellerCounts = [
            'pending_orders'            => 0,
            'pending_purchases'          => 0,
            'total_contacts'            => 0,
            'pending_returns'           => 0,
            'pending_reviews'           => 0,
            'pending_bargain_offers'    => 0,
            'pending_help_tickets'      => 0,
            'pending_comments'          => 0,
            'unread_notices'            => 0,
            'pending_reports'           => 0,
            'pending_category_requests' => 0,
            'pending_pickup_requests'   => 0,
            'pending_payouts'           => 0,
        ];

        // 🚀 ONLY run seller count SQL queries if accessing seller routes, cached for 15s!
        if ($user && $request->is('seller*')) {
            try {
                $shop = $user->shop ?? \App\Models\Shop::where('user_id', $user->id)->first();
                if ($shop) {
                    $sellerCounts = Cache::remember('seller_nav_counts_' . $shop->id, 15, function () use ($shop, $user) {
                        $sCounts = [];
                        $sCounts['pending_orders'] = \App\Models\Order::where(function($q) use ($shop) {
                            $q->where('shop_id', $shop->id)
                              ->orWhereHas('items', function($sub) use ($shop) {
                                  $sub->where('shop_id', $shop->id);
                              });
                        })->where('status', 'processing')->count();
                        $sCounts['pending_category_requests'] = \App\Models\CategoryRequest::where('shop_id', $shop->id)->where('status', 'pending')->count();
                        $sCounts['pending_pickup_requests'] = \App\Models\PickupRequest::where('shop_id', $shop->id)->where('status', 'pending')->count();
                        $sCounts['pending_bargain_offers'] = \App\Models\BargainOffer::where('shop_id', $shop->id)->where('status', 'pending')->count();
                        $sCounts['pending_payouts'] = \App\Models\PayoutRequest::where('shop_id', $shop->id)->where('status', 'pending')->count();
                        $sCounts['pending_returns'] = \App\Models\Order::where('shop_id', $shop->id)->whereIn('status', ['returned', 'return_requested'])->count();
                        $sCounts['unread_notices'] = class_exists('\App\Models\NoticeMarquee') ? \App\Models\NoticeMarquee::where('is_active', true)->count() : 0;
                        $sCounts['pending_purchases'] = class_exists('\App\Models\Purchase') ? \App\Models\Purchase::where('shop_id', $shop->id)->where('status', 'pending')->count() : 0;
                        $sCounts['total_contacts'] = 0;

                        $productIds = $shop->products()->pluck('id');
                        $sCounts['pending_reviews'] = class_exists('\App\Models\ProductReview')
                            ? \App\Models\ProductReview::whereIn('product_id', $productIds)
                                ->where(function($q) {
                                    $q->whereNotIn('status', ['approved', 'rejected'])
                                      ->orWhereNull('status');
                                })->count()
                            : 0;

                        $sCounts['pending_help_tickets'] = \Illuminate\Support\Facades\Schema::hasTable('vendor_support_tickets')
                            ? \App\Models\VendorSupportTicket::where('shop_id', $shop->id)->whereIn('status', ['pending', 'open', 'Open'])->count()
                            : 0;
                        $sCounts['pending_comments'] = class_exists('\App\Models\ProductQuestion')
                            ? \App\Models\ProductQuestion::whereHas('product', fn($q) => $q->where('shop_id', $shop->id))->whereNull('answer')->count()
                            : 0;
                        $sCounts['pending_reports'] = 0;
                        return $sCounts;
                    });
                }
            } catch (\Throwable $e) {}
        }

        $profileCompletionPercentage = 0;
        if ($user) {
            $user->loadMissing('profile');
            $completedFields = 0;
            $totalFields = 5;

            if (!empty($user->name)) $completedFields++;
            if (!empty($user->email)) $completedFields++;
            if (!empty($user->phone)) $completedFields++;
            if (!empty($user->address) || (!empty($user->profile) && !empty($user->profile->address))) $completedFields++;
            if (!empty($user->birthday) || (!empty($user->profile) && (!empty($user->profile->birthday) || !empty($user->profile->date_of_birth)))) $completedFields++;

            $profileCompletionPercentage = (int) round(($completedFields / $totalFields) * 100);
        }

        $currencyCode = session('user_currency', 'BDT');
        $inrRate = (float) $getSetting('inr_exchange_rate', '0.72');
        $usdRate = (float) $getSetting('usd_exchange_rate', '0.00833');
        $currencyData = [
            'code'    => $currencyCode,
            'symbol'  => $currencyCode === 'INR' ? '₹' : ($currencyCode === 'USD' ? '$' : '৳'),
            'rate'    => $currencyCode === 'INR' ? $inrRate : ($currencyCode === 'USD' ? $usdRate : 1.0),
            'is_inr'  => $currencyCode === 'INR',
            'inr_rate'=> $inrRate,
            'country' => session('user_country', $currencyCode === 'INR' ? 'IN' : 'BD'),
        ];

        $unreadNotificationsCount = 0;
        if ($user) {
            if ($request->is('account/notifications*')) {
                $unreadNotificationsCount = 0;
            } else {
                try {
                    $userUnread = \App\Models\Notification::where('user_id', $user->id)
                        ->where(function($q) {
                            $q->where('is_read', false)->orWhereNull('is_read');
                        })
                        ->count();

                    $lastViewed = session('customer_viewed_notifications_' . $user->id)
                        ?: \Illuminate\Support\Facades\Cache::get('customer_viewed_notifications_' . $user->id);

                    $sysUnread = 0;
                    if ($lastViewed) {
                        $sysUnread = \App\Models\SystemNotification::where('active', true)
                            ->where('created_at', '>', $lastViewed)
                            ->count();
                    }

                    $unreadNotificationsCount = $userUnread + $sysUnread;
                } catch (\Throwable $e) {
                    $unreadNotificationsCount = 0;
                }
            }
        }

        return [
            ...parent::share($request),
            'currency'     => $currencyData,
            'siteSettings' => $siteSettings,
            'footerSettings' => $footerSettings,
            'footerWidgets' => Cache::remember('shared_footer_widgets', 600, function() {
                return FooterWidget::with('links')->where('is_active', true)->orderBy('position')->get();
            }),
            'adminCounts'  => $adminCounts,
            'sellerCounts' => $sellerCounts,
            'auth' => [
                'user' => $user ? [
                    'id'         => $user->id,
                    'name'       => $user->name,
                    'email'      => $user->email,
                    'phone'      => $user->phone ?: ($user->profile->phone ?? null),
                    'avatar_url' => $user->avatar_url ?? $user->avatar ?? ($user->profile_photo_path ? '/storage/' . $user->profile_photo_path : null) ?? ($user->shop ? $user->shop->logo_url : null),
                    'city'       => $user->city ?? ($user->profile->city ?? null),
                    'address'    => $user->address ?: ($user->profile->address ?? null),
                    'birthday'   => $user->birthday ?? ($user->profile->birthday ?? ($user->profile->date_of_birth ?? null)),
                    'is_profile_complete' => $profileCompletionPercentage >= 100,
                    'profile_completion_percentage' => $profileCompletionPercentage,
                    'completed_orders_count' => $user->completed_orders_count,
                    'vip_level' => $user->vip_level,
                    'next_vip_level' => $user->next_vip_level,
                    'orders_to_next_level' => $user->orders_to_next_level,
                    'unread_notifications_count' => $unreadNotificationsCount,
                    'shop' => ($userShop = ($user->shop ?? \App\Models\Shop::where('user_id', $user->id)->first())) ? [
                        'id'              => $userShop->id,
                        'name'            => $userShop->name,
                        'slug'            => $userShop->slug,
                        'status'          => $userShop->status,
                        'is_approved'     => (bool)$userShop->is_approved,
                        'is_kyc_approved' => (bool)$userShop->is_kyc_approved,
                        'kyc_status'      => $userShop->kyc ? $userShop->kyc->status : 'None',
                        'logo_url'        => $userShop->logo_url,
                        'banner_url'      => $userShop->banner_url,
                    ] : null,
                ] : null,
                'shop' => ($user && ($userShop = ($user->shop ?? \App\Models\Shop::where('user_id', $user->id)->first()))) ? [
                    'id'              => $userShop->id,
                    'name'            => $userShop->name,
                    'slug'            => $userShop->slug,
                    'status'          => $userShop->status,
                    'is_approved'     => (bool)$userShop->is_approved,
                    'is_kyc_approved' => (bool)$userShop->is_kyc_approved,
                    'kyc_status'      => $userShop->kyc ? $userShop->kyc->status : 'None',
                    'logo_url'        => $userShop->logo_url,
                    'banner_url'      => $userShop->banner_url,
                ] : null,
                'notifications' => $user ? \App\Models\Notification::where('user_id', $user->id)
                    ->latest()
                    ->limit(10)
                    ->get()
                    ->map(function ($notif) {
                        return [
                            'id'         => $notif->id,
                            'type'       => $notif->type,
                            'title'      => $notif->title,
                            'body'       => $notif->body,
                            'link'       => $notif->link,
                            'icon'       => $notif->icon,
                            'is_read'    => (bool)$notif->is_read,
                            'created_at' => $notif->created_at ? $notif->created_at->diffForHumans() : 'Just now',
                        ];
                    }) : [],
                'roles'    => $user && method_exists($user, 'getRoles') ? $user->getRoles() : ($user->roles ?? []),
                'isAdmin'  => $user && method_exists($user, 'hasRole') ? $user->hasRole('admin') : false,
                'isVendor' => $user && method_exists($user, 'hasRole') ? $user->hasRole('vendor') : false,
                'wishlist_ids' => $user ? Cache::remember("user_wishlist_ids_{$user->id}", 60, fn() => Wishlist::where('user_id', $user->id)->pluck('product_id')->toArray()) : [],
                'unread_messages_count' => ($user && !$request->is('account/messages*')) ? \App\Models\Message::where('receiver_id', $user->id)->where('is_read', false)->count() : 0,
                'unread_notifications_count' => $unreadNotificationsCount,
            ],
            'flash' => [
                'success'    => fn () => $request->session()->get('success'),
                'error'      => fn () => $request->session()->get('error'),
                'vendor_registration_success' => fn () => $request->session()->get('vendor_registration_success'),
                'registered' => fn () => $request->session()->get('registered'),
                'reset_url'  => fn () => $request->session()->get('reset_url'),
                'otp_sent'   => fn () => $request->session()->get('otp_sent'),
                'demo_otp'   => fn () => $request->session()->get('demo_otp'),
                'otp_phone'  => fn () => $request->session()->get('otp_phone'),
            ],
        ];
    }
}
