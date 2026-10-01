<?php

use App\Http\Controllers\Admin\AdminCmsController;
use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Admin\SystemNotificationController;
use App\Http\Controllers\Admin\VendorManagementController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminSystemSettingsController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Seller\SellerFinanceController;
use App\Http\Controllers\Seller\SellerPosController;
use App\Http\Controllers\Seller\SellerProductController;
use App\Http\Controllers\Seller\SellerStockController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\StaticPageController;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

// ─── 1-Click Database Migration Runner ─────────────────────────────
Route::get('/system/run-migrations', function () {
    \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
    $output = \Illuminate\Support\Facades\Artisan::output();
    \Illuminate\Support\Facades\Artisan::call('optimize:clear');
    return response("<div style='font-family:sans-serif;padding:30px;max-width:700px;margin:40px auto;background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;'><h2 style='color:#16a34a;margin-top:0;'>✅ ডাটাবেজ মাইগ্রেশন সফল হয়েছে!</h2><p style='color:#64748b;font-size:14px;'>সবগুলো নতুন ও পুরাতন টেবিল সঠিকভাবে আপডেট ও তৈরি করা হয়েছে।</p><pre style='padding:15px;background:#0f172a;color:#38bdf8;border-radius:10px;overflow:auto;font-size:13px;'>" . htmlspecialchars($output ?: "Nothing to migrate. All tables are up to date.") . "</pre><a href='/admin/dashboard' style='display:inline-block;padding:10px 20px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;margin-top:10px;'>ড্যাশবোর্ডে ফিরে যান</a></div>");
});

// ─── Software License Route (Disabled - Redirects to Home) ──────────────────
Route::get('/activate-license', fn() => redirect('/'))->name('license.activate');
Route::post('/activate-license', fn() => redirect('/'))->name('license.submit');

// ─── Currency Switch Route (BDT ৳ <-> INR ₹) ───────────────────────────────
Route::post('/currency/switch', function (Request $request) {
    $currency = strtoupper($request->input('currency', 'BDT'));
    if (in_array($currency, ['BDT', 'INR'])) {
        session(['user_currency' => $currency]);
    }
    return back();
})->name('currency.switch');

// Real-time unread messages count for Admin sidebar
Route::get('/api/admin/live-unread-messages', [\App\Http\Controllers\Admin\AdminMessageController::class, 'getUnreadCount']);
Route::post('/api/admin/messages/mark-all-read', [\App\Http\Controllers\Admin\AdminMessageController::class, 'markAllAsRead']);
Route::get('/api/admin/shop-messages/{shop}', [\App\Http\Controllers\Admin\AdminMessageController::class, 'getShopMessages']);
Route::post('/api/admin/send-shop-message', [\App\Http\Controllers\Admin\AdminMessageController::class, 'sendShopMessage']);
Route::post('/api/admin/customers/mark-seen', [\App\Http\Controllers\Admin\CustomerController::class, 'markSeen']);
Route::get('/api/admin/customers/unseen-count', fn() => response()->json(['unseen_count' => \App\Models\User::whereNull('admin_seen_at')->where('email', '!=', 'admin@guruz.com')->count()]));
Route::post('/api/shops/{shop}/customer-message', [\App\Http\Controllers\ShopController::class, 'sendCustomerMessage']);

// ─── Cache & View Reset Helper for cPanel ────────────────────────────────────
Route::get('/clear-cache', function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('view:clear');
        \Illuminate\Support\Facades\Artisan::call('config:clear');
        \Illuminate\Support\Facades\Artisan::call('cache:clear');
    } catch (\Throwable $e) {}
    
    // Delete files in storage/framework/views
    $files = glob(storage_path('framework/views/*.php'));
    if ($files) {
        foreach ($files as $file) {
            @unlink($file);
        }
    }

    return '<h1>Cache & Views Cleared Successfully!</h1><p><a href="/">Click here to open Homepage</a></p>';
});

// ─── 1-Click Storage Symlink & File Sync Helper for cPanel ───────────────────
Route::get('/system/storage-link', function () {
    $synced = \App\Services\StorageHelper::syncAll();
    
    $publicStorage = public_path('storage');
    $appPublic = storage_path('app/public');
    $statusMsg = "Synced {$synced} file(s) from storage/app/public to public/storage.";

    // Optional or auto: Clean up dummy/broken hero sliders whose images do not exist on disk
    $cleanedSliders = 0;
    if (request()->has('clean_sliders') || request()->has('clean_broken')) {
        $sliders = \App\Models\HeroSlider::all();
        foreach ($sliders as $s) {
            $rel = ltrim(str_replace('/storage/', '', $s->image), '/\\');
            if (!file_exists(storage_path('app/public/' . $rel)) && !file_exists(public_path('storage/' . $rel))) {
                $s->delete();
                $cleanedSliders++;
            }
        }
        if ($cleanedSliders > 0) {
            \Illuminate\Support\Facades\Cache::forget('home_hero_sliders');
            $statusMsg .= " | Cleaned {$cleanedSliders} broken/missing hero slider record(s).";
        }
    }

    try {
        \Illuminate\Support\Facades\Artisan::call('storage:link');
        $output = \Illuminate\Support\Facades\Artisan::output();
        $statusMsg .= " | Artisan: " . trim($output);
    } catch (\Throwable $e) {
        $statusMsg .= " | Artisan error: " . $e->getMessage();
    }

    if (!file_exists($publicStorage) && file_exists($appPublic)) {
        try {
            @symlink($appPublic, $publicStorage);
            $statusMsg .= " | Symlink created via PHP symlink().";
        } catch (\Throwable $e) {
            $statusMsg .= " | PHP symlink error: " . $e->getMessage();
        }
    }

    return response("<div style='font-family:sans-serif;padding:30px;max-width:700px;margin:40px auto;background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;'><h2 style='color:#16a34a;margin-top:0;'>✅ Storage Synced & Verified!</h2><p style='color:#64748b;font-size:14px;'>পাবলিক স্টোরেজের সকল ইমেজ সিনক্রোনাইজেশন সম্পন্ন হয়েছে। মোট ফাইল সিঙ্ক হয়েছে: <strong style='color:#16a34a;'>{$synced}</strong> টি।</p><pre style='padding:15px;background:#0f172a;color:#38bdf8;border-radius:10px;overflow:auto;font-size:13px;'>" . htmlspecialchars($statusMsg) . "</pre><div style='margin-top:20px;display:flex;flex-wrap:wrap;gap:10px;'><a href='/admin/appearance/hero-slider' style='display:inline-block;padding:10px 20px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;'>হিরো স্লাইডারে যান</a><a href='/system/storage-link?clean_broken=1' style='display:inline-block;padding:10px 20px;background:#dc2626;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;'>মিসিং/ভাঙা স্লাইডার ক্লিন করুন</a><a href='/admin/brands' style='display:inline-block;padding:10px 20px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;'>ব্র্যান্ড পেজে যান</a></div></div>");
});

// ─── Direct Fallback Route for Uploaded Images (cPanel Symlink Resilience) ───
Route::get('/storage/{path}', function ($path) {
    // 1. Check in storage/app/public/
    $targetPath = storage_path('app/public/' . $path);
    if (file_exists($targetPath) && is_file($targetPath)) {
        // Also copy it to public/storage so next time Apache serves it directly!
        $pubPath = public_path('storage/' . $path);
        if (!file_exists($pubPath)) {
            @mkdir(dirname($pubPath), 0777, true);
            @copy($targetPath, $pubPath);
            @chmod($pubPath, 0644);
        }

        $mime = mime_content_type($targetPath) ?: 'image/jpeg';
        return response()->file($targetPath, [
            'Content-Type' => $mime,
            'Cache-Control' => 'public, max-age=31536000'
        ]);
    }

    // 2. Check in public/storage/
    $pubPath = public_path('storage/' . $path);
    if (file_exists($pubPath) && is_file($pubPath)) {
        $mime = mime_content_type($pubPath) ?: 'image/jpeg';
        return response()->file($pubPath, [
            'Content-Type' => $mime,
            'Cache-Control' => 'public, max-age=31536000'
        ]);
    }

    abort(404);
})->where('path', '.*');

// ─── Force Cleanup Orphaned User Email Helper for cPanel ─────────────────────
Route::get('/cleanup-email', function (Request $request) {
    $email = trim($request->query('email', 'shishirbarai015@gmail.com'));
    $users = \App\Models\User::where('email', $email)->get();
    
    if ($users->isEmpty()) {
        return "<h1>No user found with email: {$email}</h1><p>You can register now with this email!</p>";
    }

    $count = 0;
    foreach ($users as $user) {
        try {
            \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            \Illuminate\Support\Facades\DB::table('user_roles')->where('user_id', $user->id)->delete();
            \Illuminate\Support\Facades\DB::table('profiles')->where('user_id', $user->id)->delete();
            \Illuminate\Support\Facades\DB::table('orders')->where('user_id', $user->id)->delete();
            $user->delete();
            \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            $count++;
        } catch (\Throwable $e) {}
    }

    return "<h1>Successfully deleted {$count} user(s) matching email: {$email}!</h1><p><a href='/register'>Click here to Register now</a></p>";
});

// ─── Public Live Visitors & Recent Purchase Social Proof Feed ─────────────
Route::get('/api/live-visitors', [\App\Http\Controllers\Api\PublicFeedController::class, 'getLiveVisitors'])->name('api.live-visitors');
Route::get('/api/recent-purchases', [\App\Http\Controllers\Api\PublicFeedController::class, 'getRecentPurchases'])->name('api.recent-purchases');

// ─── Public Storefront Routes ────────────────────────────────────────────────
Route::get('/', [ProductController::class, 'home'])->name('home');
Route::get('/search/suggestions', [ProductController::class, 'suggestions'])->name('search.suggestions');
Route::get('/offers', fn() => redirect('/account/offers'));
Route::post('/search/image', [ProductController::class, 'imageSearch'])->name('search.image');
Route::get('/auth', function () {
    if (Illuminate\Support\Facades\Auth::check()) {
        $user = Illuminate\Support\Facades\Auth::user();
        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('seller.dashboard');
    }
    return Inertia::render('Auth/AdminLogin');
})->name('admin.login');
Route::post('/auth', [\App\Http\Controllers\Auth\AdminAuthController::class, 'store'])->name('admin.login.store');

Route::get('/seller/login', fn() => redirect('/login'))->name('seller.login');
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{slug}', [ProductController::class, 'show'])->name('products.show');
Route::get('/product/{slug}', [ProductController::class, 'show']);
Route::post('/products/{product}/reviews', [ProductController::class, 'storeReview'])->name('products.reviews.store');

Route::get('/shops', [ShopController::class, 'index'])->name('shops.index');
Route::get('/shops/{slug}', [ShopController::class, 'show'])->name('shops.show');
Route::get('/shop/{slug}', [ShopController::class, 'show']);
Route::post('/shops/{shop}/follow', [ShopController::class, 'toggleFollow'])->name('shops.follow');

Route::get('/category/{slug}', [ProductController::class, 'index'])->name('categories.show');
Route::get('/categories', [\App\Http\Controllers\CategoryController::class, 'index'])->name('categories.index');
Route::get('/brands', [\App\Http\Controllers\BrandController::class, 'index'])->name('brands.index');

Route::post('/api/v1/wishlist/add', [\App\Http\Controllers\WishlistController::class, 'add'])->name('wishlist.add');
Route::post('/api/v1/wishlist/toggle', [\App\Http\Controllers\WishlistController::class, 'toggle'])->name('wishlist.toggle');

Route::get('/cart', fn() => Inertia::render('Cart'))->name('cart');
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
Route::get('/order-confirmation/{order_number}', [OrderController::class, 'confirmation'])->name('orders.confirmation');

// ─── SSLCommerz Payment Gateway Routes ──────────────────────────────────────
Route::post('/payment/sslcommerz/initiate/{order}', [\App\Http\Controllers\Payment\SSLCommerzController::class, 'initiatePayment'])->name('payment.sslcommerz.initiate');
Route::post('/payment/sslcommerz/success', [\App\Http\Controllers\Payment\SSLCommerzController::class, 'success'])->name('payment.sslcommerz.success');
Route::post('/payment/sslcommerz/fail', [\App\Http\Controllers\Payment\SSLCommerzController::class, 'fail'])->name('payment.sslcommerz.fail');
Route::post('/payment/sslcommerz/cancel', [\App\Http\Controllers\Payment\SSLCommerzController::class, 'cancel'])->name('payment.sslcommerz.cancel');
Route::post('/payment/sslcommerz/ipn', [\App\Http\Controllers\Payment\SSLCommerzController::class, 'ipn'])->name('payment.sslcommerz.ipn');
// Also accept GET for convenience
Route::get('/payment/sslcommerz/success', [\App\Http\Controllers\Payment\SSLCommerzController::class, 'success']);
Route::get('/payment/sslcommerz/fail', [\App\Http\Controllers\Payment\SSLCommerzController::class, 'fail']);
// ─── Bangla QR Direct API Payment Gateway Routes ───────────────────────────
Route::post('/payment/bangla-qr/initiate/{order}', [\App\Http\Controllers\Payment\BanglaQrController::class, 'initiatePayment'])->name('payment.bangla-qr.initiate');
Route::get('/payment/bangla-qr/status/{orderNumber}', [\App\Http\Controllers\Payment\BanglaQrController::class, 'checkStatus'])->name('payment.bangla-qr.status');
Route::post('/payment/bangla-qr/ipn', [\App\Http\Controllers\Payment\BanglaQrController::class, 'webhook'])->name('payment.bangla-qr.ipn');
Route::post('/payment/bangla-qr/callback', [\App\Http\Controllers\Payment\BanglaQrController::class, 'webhook'])->name('payment.bangla-qr.callback');
// ─── EPS (Easy Payment System) Gateway Routes ──────────────────────────────
Route::post('/payment/eps/initiate/{order}', [\App\Http\Controllers\Payment\EPSController::class, 'initiatePayment'])->name('payment.eps.initiate');
Route::post('/payment/eps/success', [\App\Http\Controllers\Payment\EPSController::class, 'success'])->name('payment.eps.success');
Route::post('/payment/eps/fail', [\App\Http\Controllers\Payment\EPSController::class, 'fail'])->name('payment.eps.fail');
Route::post('/payment/eps/cancel', [\App\Http\Controllers\Payment\EPSController::class, 'cancel'])->name('payment.eps.cancel');
Route::post('/payment/eps/ipn', [\App\Http\Controllers\Payment\EPSController::class, 'ipn'])->name('payment.eps.ipn');
Route::get('/payment/eps/success', [\App\Http\Controllers\Payment\EPSController::class, 'success']);
Route::get('/payment/eps/fail', [\App\Http\Controllers\Payment\EPSController::class, 'fail']);
Route::get('/payment/eps/cancel', [\App\Http\Controllers\Payment\EPSController::class, 'cancel']);

// Public Vendor Landing Page
Route::get('/vendor', function () {
    $logo = \App\Models\SiteSetting::get('vlp_logo_url', '') ?: \App\Models\SiteSetting::get('site_logo', '');
    if ($logo && !str_starts_with($logo, 'http') && !str_starts_with($logo, '/')) {
        $logo = '/storage/' . $logo;
    }

    $cms = [
        'hero_title'        => \App\Models\SiteSetting::get('vlp_hero_title', 'আপনার পণ্য বিক্রি করুন প্রতিটি গ্রাহকের কাছে'),
        'hero_subtitle'     => \App\Models\SiteSetting::get('vlp_hero_subtitle', 'একটি প্ল্যাটফর্ম যেখানে আপনি অনলাইনে, ইন-পারসন এবং সব জায়গায় বিক্রি করতে পারবেন। Guruz সেলার হয়ে আপনার ব্যবসা বাড়ান!'),
        'hero_bg_color'     => \App\Models\SiteSetting::get('vlp_hero_bg_color', '#0a0a1a'),
        'hero_accent_color' => \App\Models\SiteSetting::get('vlp_hero_accent_color', '#10b981'),
        'button_text'       => \App\Models\SiteSetting::get('vlp_button_text', 'সেলার হিসেবে যোগ দিন'),
        'logo_url'          => $logo,
        'benefits_json'     => \App\Models\SiteSetting::get('vlp_benefits_json', ''),
        'steps_json'        => \App\Models\SiteSetting::get('vlp_steps_json', ''),
        'faqs_json'         => \App\Models\SiteSetting::get('vlp_faqs_json', ''),
    ];

    return Inertia::render('VendorLandingPage', ['cms' => $cms]);
})->name('vendor.landing');

Route::get('/track', [OrderController::class, 'track'])->name('track');
// Route::post('/track', [OrderTrackingController::class, 'search'])->name('track.search');

// Public Invoice PDF Download
Route::get('/invoices/{orderNumber}/download', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'downloadInvoice'])->name('invoices.public.download');

// Warranty Claim Center Routes
Route::get('/warranty-claim', [\App\Http\Controllers\WarrantyClaimController::class, 'create'])->name('warranty.claim');
Route::post('/warranty-claim', [\App\Http\Controllers\WarrantyClaimController::class, 'store'])->name('warranty.claim.store');

// Static / Policy Pages
Route::get('/pages/warranty', [StaticPageController::class, 'warranty'])->name('pages.warranty');
Route::get('/pages/benefits', [StaticPageController::class, 'benefits'])->name('pages.benefits');
Route::get('/pages/terms', [StaticPageController::class, 'terms'])->name('pages.terms');
Route::get('/pages/privacy', [StaticPageController::class, 'privacy'])->name('pages.privacy');
Route::get('/pages/contact', [StaticPageController::class, 'contact'])->name('pages.contact');
Route::get('/pages/{slug}', [StaticPageController::class, 'show'])->name('pages.show');

// ─── Public Vendor Registration Routes (Accessible to guests and users upgrading) ───
Route::get('/vendor/register', [\App\Http\Controllers\Auth\VendorRegistrationController::class, 'create'])->name('vendor.register');
Route::post('/vendor/register', [\App\Http\Controllers\Auth\VendorRegistrationController::class, 'store'])->name('vendor.register.store');
Route::get('/vendor-register', fn() => redirect()->route('vendor.register'));
Route::get('/become-seller', fn() => redirect()->route('vendor.register'));

// ─── Authentication Routes ─────────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
    Route::get('/login/2fa', [AuthenticatedSessionController::class, 'show2faChallenge'])->name('login.2fa');
    Route::post('/login/2fa', [AuthenticatedSessionController::class, 'verify2fa'])->name('login.2fa.verify');
    Route::post('/login/2fa/send-secret', [AuthenticatedSessionController::class, 'sendSecretToEmail'])->name('login.2fa.send-secret');
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);
    
    Route::get('/forgot-password', [\App\Http\Controllers\Auth\PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('/forgot-password', [\App\Http\Controllers\Auth\PasswordResetLinkController::class, 'store'])->name('password.email');
    Route::post('/forgot-password/send-otp', [\App\Http\Controllers\Auth\PasswordResetLinkController::class, 'sendMobileOtp'])->name('password.send-otp');
    Route::post('/forgot-password/verify-otp', [\App\Http\Controllers\Auth\PasswordResetLinkController::class, 'verifyMobileOtp'])->name('password.verify-otp');
    Route::get('/reset-password/{token}', [\App\Http\Controllers\Auth\NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('/reset-password', [\App\Http\Controllers\Auth\NewPasswordController::class, 'store'])->name('password.store');
    
    // Google OAuth Routes
    Route::get('/auth/google', [GoogleController::class, 'redirectToGoogle'])->name('auth.google');
    Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback'])->name('auth.google.callback');
});

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

// ─── Email Verification Routes ─────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::get('/email/verify', function (\Illuminate\Http\Request $request) {
        return $request->user()->hasVerifiedEmail() 
            ? redirect()->route('account.dashboard') 
            : Inertia::render('Auth/VerifyEmail', ['status' => session('status')]);
    })->name('verification.notice');

    Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
        $request->fulfill();
        return redirect()->route('account.dashboard')->with('verified', true);
    })->middleware(['signed'])->name('verification.verify');

    Route::post('/email/verification-notification', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();
        return back()->with('status', 'verification-link-sent');
    })->middleware(['throttle:6,1'])->name('verification.send');
});

// ─── Customer Account Portal ───────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->prefix('account')->name('account.')->group(function () {
    Route::get('/', [CustomerController::class, 'dashboard'])->name('dashboard');
    Route::get('/orders', [CustomerController::class, 'orders'])->name('orders');
    Route::get('/orders/{order}', [CustomerController::class, 'orderDetails'])->name('orders.show');
    Route::post('/orders/{order}/cancel', [CustomerController::class, 'cancelOrder'])->name('orders.cancel');
    Route::post('/orders/{order}/return', [CustomerController::class, 'requestReturn'])->name('orders.return');
    Route::get('/wallet', [CustomerController::class, 'wallet'])->name('wallet');
    Route::get('/loyalty', [CustomerController::class, 'loyalty'])->name('loyalty');
    Route::get('/messages', [CustomerController::class, 'messages'])->name('messages');
    Route::post('/messages', [CustomerController::class, 'sendMessage'])->name('messages.send');
    Route::put('/messages/{id}', [CustomerController::class, 'updateMessage'])->name('messages.update');
    Route::get('/messages/poll', [CustomerController::class, 'messagesPoll'])->name('messages.poll');
    Route::post('/messages/mark-read', [CustomerController::class, 'markMessagesRead'])->name('messages.mark-read');
    Route::get('/profile', [CustomerController::class, 'profile'])->name('profile');
    Route::post('/profile', [CustomerController::class, 'updateProfile'])->name('profile.update.post');
    Route::put('/profile', [CustomerController::class, 'updateProfile'])->name('profile.update');
    Route::get('/notifications', [CustomerController::class, 'notifications'])->name('notifications');
    Route::post('/notifications/{id}/read', [CustomerController::class, 'readNotification'])->name('notifications.read');
    Route::post('/notifications/read-all', [CustomerController::class, 'markAllNotificationsRead'])->name('notifications.read-all');
    Route::get('/offers', [CustomerController::class, 'offers'])->name('offers');
    
    // New pages
    Route::get('/returns', [CustomerController::class, 'returns'])->name('returns');
    Route::get('/favorites', [CustomerController::class, 'favorites'])->name('favorites');
    Route::delete('/favorites/{id}', [CustomerController::class, 'removeFavorite'])->name('favorites.remove');
    Route::get('/reviews', [CustomerController::class, 'reviews'])->name('reviews');
    Route::post('/reviews', [CustomerController::class, 'storeReview'])->name('reviews.store');
    Route::put('/reviews/{id}', [CustomerController::class, 'updateReview'])->name('reviews.update');
    Route::delete('/reviews/{id}', [CustomerController::class, 'deleteReview'])->name('reviews.delete');
    Route::get('/addresses', [CustomerController::class, 'addresses'])->name('addresses');
    Route::get('/password', [CustomerController::class, 'password'])->name('password');
    Route::post('/password', [CustomerController::class, 'updatePassword'])->name('password.update');
    Route::get('/2fa', [CustomerController::class, 'twoFactor'])->name('2fa');
    Route::post('/2fa/toggle', [CustomerController::class, 'toggleTwoFactor'])->name('2fa.toggle');
    Route::get('/track', [CustomerController::class, 'trackOrder'])->name('track');
});

// ─── Vendor / Seller Portal ────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->prefix('seller')->name('seller.')->group(function () {
    
    // (Onboarding routes have been removed in favor of /vendor/register)
    
    // All other seller routes require a shop
    Route::middleware(['seller.shop'])->group(function () {
        Route::get('/', function () {
        $user = auth()->user();
        if (request()->filled('impersonate')) {
            $targetShop = \App\Models\Shop::find(request('impersonate'));
            if ($targetShop && $targetShop->owner) {
                session()->put('impersonated_by_admin', auth()->id());
                auth()->login($targetShop->owner);
                $user = $targetShop->owner;
            }
        }
        $shop = $user->shop ?? null;
        $productCount = 0;
        try {
            $productCount = $shop ? $shop->products()->count() : 0;
        } catch (\Exception $e) {
            $productCount = 0;
        }
        return Inertia::render('Seller/Dashboard', [
            'shop'          => $shop ? [
                'id'       => $shop->id,
                'name'     => $shop->name,
                'logo_url' => $shop->logo_url ?? null,
                'status'   => $shop->status ?? 'pending',
                'rating'   => $shop->rating ?? 0,
            ] : null,
            'stats'         => [
                'total_orders'    => 0,
                'pending_orders'  => 0,
                'total_revenue'   => 0,
                'total_products'  => $productCount,
                'wallet_balance'  => 0,
            ],
            'recent_orders' => [],
        ]);
    })->name('dashboard');

    Route::get('/pos', [SellerPosController::class, 'index'])->name('pos');
    Route::post('/pos', [SellerPosController::class, 'store'])->name('pos.store');
    Route::post('/pos/customer', [SellerPosController::class, 'storeCustomer'])->name('pos.customer.store');
    
    Route::get('/coupons', [\App\Http\Controllers\Seller\SellerCouponController::class, 'index'])->name('coupons');
    Route::post('/coupons', [\App\Http\Controllers\Seller\SellerCouponController::class, 'store'])->name('coupons.store');
    Route::delete('/coupons/{id}', [\App\Http\Controllers\Seller\SellerCouponController::class, 'destroy'])->name('coupons.destroy');
    Route::post('/coupons/{id}/toggle', [\App\Http\Controllers\Seller\SellerCouponController::class, 'toggle'])->name('coupons.toggle');
    
    Route::get('/settings', [App\Http\Controllers\Seller\SellerShopController::class, 'settings'])->name('settings');
    Route::post('/settings', [App\Http\Controllers\Seller\SellerShopController::class, 'updateSettings'])->name('settings.update');
    Route::get('/custom-domain', [\App\Http\Controllers\Seller\SellerShopController::class, 'customDomain'])->name('custom-domain');
    Route::post('/custom-domain', [\App\Http\Controllers\Seller\SellerShopController::class, 'updateCustomDomain'])->name('custom-domain.update');
    Route::post('/custom-domain/verify', [\App\Http\Controllers\Seller\SellerShopController::class, 'verifyCustomDomainDns'])->name('custom-domain.verify');
    Route::post('/profile/avatar', [App\Http\Controllers\Seller\SellerShopController::class, 'updateAvatar'])->name('profile.avatar');
    Route::get('/my-shop/verify', fn() => redirect()->route('seller.my-shop'))->name('my-shop.verify.get');
    Route::post('/my-shop/verify', fn() => redirect()->route('seller.my-shop'))->name('my-shop.verify');
    Route::get('/orders', [\App\Http\Controllers\Seller\SellerOrderController::class, 'index'])->name('orders');
    Route::put('/orders/{id}', [\App\Http\Controllers\Seller\SellerOrderController::class, 'update'])->name('orders.update');
    Route::post('/orders/{id}/pickup-request', [\App\Http\Controllers\Seller\SellerOrderController::class, 'requestPickup'])->name('orders.pickup-request');
    Route::post('/orders/{id}/mark-delivered', [\App\Http\Controllers\Seller\SellerOrderController::class, 'markDelivered'])->name('orders.mark-delivered');
    Route::delete('/orders/{id}', [\App\Http\Controllers\Seller\SellerOrderController::class, 'destroy'])->name('seller.orders.destroy');
    Route::post('/orders/{id}/send-invoice-email', [\App\Http\Controllers\Seller\SellerOrderController::class, 'sendInvoiceEmail'])->name('seller.orders.send-invoice-email');
    Route::get('/orders/export', [\App\Http\Controllers\Seller\SellerOrderController::class, 'exportCsv'])->name('orders.export');
    Route::get('/invoices', [\App\Http\Controllers\Seller\SellerInvoiceController::class, 'index'])->name('invoices');
    Route::get('/returns', [\App\Http\Controllers\Seller\SellerReturnController::class, 'index'])->name('returns');
    Route::put('/returns/{id}', [\App\Http\Controllers\Seller\SellerReturnController::class, 'update'])->name('returns.update');
    Route::get('/returns/export', [\App\Http\Controllers\Seller\SellerReturnController::class, 'exportCsv'])->name('returns.export');
    Route::get('/bargain-offers', [\App\Http\Controllers\Seller\SellerBargainOfferController::class, 'index'])->name('bargain-offers');
    Route::post('/bargain-offers', [\App\Http\Controllers\Seller\SellerBargainOfferController::class, 'store'])->name('bargain-offers.store');
    Route::put('/bargain-offers/{id}', [\App\Http\Controllers\Seller\SellerBargainOfferController::class, 'update'])->name('bargain-offers.update');
    Route::get('/reviews', [\App\Http\Controllers\Seller\SellerReviewController::class, 'index'])->name('reviews');
    Route::post('/reviews/{review}/approve', [\App\Http\Controllers\Seller\SellerReviewController::class, 'approve'])->name('reviews.approve');
    Route::post('/reviews/{review}/reject', [\App\Http\Controllers\Seller\SellerReviewController::class, 'reject'])->name('reviews.reject');
    Route::delete('/reviews/{review}', [\App\Http\Controllers\Seller\SellerReviewController::class, 'destroy'])->name('reviews.destroy');
    Route::post('/reviews/{review}/reply', [\App\Http\Controllers\Seller\SellerReviewController::class, 'reply'])->name('reviews.reply');
    Route::get('/my-shop', function() {
        $user = auth()->user();
        $shop = $user->shop;

        if (!$shop) {
            $shop = \App\Models\Shop::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'name'        => ($user->name ?? 'Vendor') . "'s Shop",
                    'slug'        => \Illuminate\Support\Str::slug(($user->name ?? 'Vendor') . "-shop-" . $user->id),
                    'status'      => 'active',
                    'is_approved' => true,
                ]
            );
        }

        $kyc = \App\Models\VendorKyc::where('shop_id', $shop->id)->first();

        $myProducts = \App\Models\Product::with('category')->where('shop_id', $shop->id)->latest()->get();
        $allProducts = \App\Models\Product::with('category')->latest()->take(30)->get();

        return Inertia::render('Seller/MyShop', [
            'shop'               => $shop,
            'kycStatus'          => $kyc ? $kyc->status : null,
            'kycRejectionReason' => $kyc ? $kyc->rejection_reason : null,
            'myProducts'         => $myProducts,
            'allProducts'        => $allProducts,
        ]);
    })->name('my-shop');
    Route::get('/reels', fn() => Inertia::render('Seller/Placeholder', ['title' => 'Reels']))->name('reels');
    Route::get('/payouts', [\App\Http\Controllers\Seller\SellerPayoutController::class, 'index'])->name('payouts');
    Route::post('/payouts', [\App\Http\Controllers\Seller\SellerPayoutController::class, 'store'])->name('payouts.store');
    Route::get('/help', fn() => Inertia::render('Seller/Help'))->name('help');
    Route::get('/comments', [\App\Http\Controllers\Seller\SellerCommentController::class, 'index'])->name('comments');
    Route::post('/comments/reply', [\App\Http\Controllers\Seller\SellerCommentController::class, 'reply'])->name('comments.reply');
    Route::delete('/comments/{id}', [\App\Http\Controllers\Seller\SellerCommentController::class, 'destroy'])->name('comments.destroy');
    Route::get('/notice', [\App\Http\Controllers\Seller\SellerNoticeController::class, 'index'])->name('notice');
    Route::get('/notices', fn() => redirect()->route('notice'));
    Route::get('/category-request', [\App\Http\Controllers\Seller\SellerCategoryRequestController::class, 'index'])->name('category-request');
    Route::get('/category-requests', fn() => redirect()->route('category-request'));
    Route::post('/category-request', [\App\Http\Controllers\Seller\SellerCategoryRequestController::class, 'store'])->name('category-request.store');
    Route::delete('/category-request/{id}', [\App\Http\Controllers\Seller\SellerCategoryRequestController::class, 'destroy'])->name('category-request.destroy');
    Route::get('/pickup-request', [\App\Http\Controllers\Seller\SellerPickupRequestController::class, 'index'])->name('pickup-request');
    Route::post('/pickup-request', [\App\Http\Controllers\Seller\SellerPickupRequestController::class, 'store'])->name('pickup-request.store');
    Route::delete('/pickup-request/{id}', [\App\Http\Controllers\Seller\SellerPickupRequestController::class, 'destroy'])->name('pickup-request.destroy');
    Route::get('/moderator', [\App\Http\Controllers\Seller\SellerModeratorController::class, 'index'])->name('moderator');
    Route::post('/moderator', [\App\Http\Controllers\Seller\SellerModeratorController::class, 'store'])->name('moderator.store');
    Route::put('/moderator/{id}', [\App\Http\Controllers\Seller\SellerModeratorController::class, 'update'])->name('moderator.update');
    Route::post('/moderator/{id}/toggle', [\App\Http\Controllers\Seller\SellerModeratorController::class, 'toggleStatus'])->name('moderator.toggle');
    Route::delete('/moderator/{id}', [\App\Http\Controllers\Seller\SellerModeratorController::class, 'destroy'])->name('moderator.destroy');
    Route::post('/moderator/roles', [\App\Http\Controllers\Seller\SellerModeratorController::class, 'storeRole'])->name('moderator.roles.store');
    Route::put('/moderator/roles/{id}', [\App\Http\Controllers\Seller\SellerModeratorController::class, 'updateRole'])->name('moderator.roles.update');
    Route::delete('/moderator/roles/{id}', [\App\Http\Controllers\Seller\SellerModeratorController::class, 'destroyRole'])->name('moderator.roles.destroy');
    Route::get('/courier-settings', [\App\Http\Controllers\Seller\SellerCourierController::class, 'index'])->name('courier-settings');
    Route::put('/courier-settings/{id}', [\App\Http\Controllers\Seller\SellerCourierController::class, 'update'])->name('courier-settings.update');
    Route::post('/courier-settings/{id}/toggle', [\App\Http\Controllers\Seller\SellerCourierController::class, 'toggle'])->name('courier-settings.toggle');
    Route::get('/accounts', [\App\Http\Controllers\Seller\SellerAccountController::class, 'index'])->name('accounts');
    Route::post('/accounts', [\App\Http\Controllers\Seller\SellerAccountController::class, 'store'])->name('accounts.store');
    Route::get('/report', [\App\Http\Controllers\Seller\SellerReportController::class, 'index'])->name('report');
    Route::post('/report/export', [\App\Http\Controllers\Seller\SellerReportController::class, 'export'])->name('report.export');
    Route::get('/report-issue', [\App\Http\Controllers\Seller\SellerReportIssueController::class, 'index'])->name('report-issue');
    Route::post('/report-issue', [\App\Http\Controllers\Seller\SellerReportIssueController::class, 'store'])->name('report-issue.store');
    Route::post('/report-issue/{id}/reply', [\App\Http\Controllers\Seller\SellerReportIssueController::class, 'reply'])->name('report-issue.reply');
    Route::get('/marketing', [\App\Http\Controllers\Seller\SellerMarketingController::class, 'index'])->name('marketing');
    Route::post('/marketing/pixels', [\App\Http\Controllers\Seller\SellerMarketingController::class, 'update'])->name('marketing.pixels.update');
    Route::post('/marketing/domain', [\App\Http\Controllers\Seller\SellerMarketingController::class, 'updateDomain'])->name('marketing.domain.update');

    Route::get('/optimizer', [\App\Http\Controllers\Seller\SellerOptimizerController::class, 'index'])->name('optimizer');
    Route::post('/optimizer/products', [\App\Http\Controllers\Seller\SellerOptimizerController::class, 'optimizeProducts'])->name('optimizer.products');
    Route::post('/optimizer/domain', [\App\Http\Controllers\Seller\SellerOptimizerController::class, 'saveDomain'])->name('optimizer.domain');
    Route::post('/optimizer/cache', [\App\Http\Controllers\Seller\SellerOptimizerController::class, 'clearCache'])->name('optimizer.cache');
    Route::get('/unit', [\App\Http\Controllers\Seller\SellerUnitController::class, 'index'])->name('unit.index');
    Route::post('/unit', [\App\Http\Controllers\Seller\SellerUnitController::class, 'store'])->name('unit.store');
    Route::post('/unit/bulk-update', [\App\Http\Controllers\Seller\SellerUnitController::class, 'bulkUpdate'])->name('unit.bulkUpdate');
    Route::put('/unit/{unit}', [\App\Http\Controllers\Seller\SellerUnitController::class, 'update'])->name('unit.update');
    Route::delete('/unit/{unit}', [\App\Http\Controllers\Seller\SellerUnitController::class, 'destroy'])->name('unit.destroy');

    Route::get('/attributes', [\App\Http\Controllers\Seller\SellerAttributeController::class, 'index'])->name('attributes.index');
    Route::post('/attributes', [\App\Http\Controllers\Seller\SellerAttributeController::class, 'store'])->name('attributes.store');
    Route::post('/attributes/bulk-update', [\App\Http\Controllers\Seller\SellerAttributeController::class, 'bulkUpdate'])->name('attributes.bulkUpdate');
    Route::put('/attributes/{attribute}', [\App\Http\Controllers\Seller\SellerAttributeController::class, 'update'])->name('attributes.update');
    Route::delete('/attributes/{attribute}', [\App\Http\Controllers\Seller\SellerAttributeController::class, 'destroy'])->name('attributes.destroy');

    Route::get('/brand', [\App\Http\Controllers\Seller\SellerBrandController::class, 'index'])->name('brand.index');
    Route::post('/brand', [\App\Http\Controllers\Seller\SellerBrandController::class, 'store'])->name('brand.store');
    Route::post('/brand/bulk-update', [\App\Http\Controllers\Seller\SellerBrandController::class, 'bulkUpdate'])->name('brand.bulkUpdate');
    Route::put('/brand/{brand}', [\App\Http\Controllers\Seller\SellerBrandController::class, 'update'])->name('brand.update');
    Route::delete('/brand/{brand}', [\App\Http\Controllers\Seller\SellerBrandController::class, 'destroy'])->name('brand.destroy');

    Route::get('/import', [\App\Http\Controllers\Seller\SellerProductImportController::class, 'index'])->name('import');
    Route::get('/import/template', [\App\Http\Controllers\Seller\SellerProductImportController::class, 'downloadTemplate'])->name('import.template');
    Route::post('/import', [\App\Http\Controllers\Seller\SellerProductImportController::class, 'uploadCsv'])->name('import.store');
    Route::get('/purchase', [\App\Http\Controllers\Seller\PurchaseController::class, 'index'])->name('purchase');
    Route::post('/purchase', [\App\Http\Controllers\Seller\PurchaseController::class, 'store'])->name('purchase.store');
    Route::put('/purchase/{purchase}', [\App\Http\Controllers\Seller\PurchaseController::class, 'update'])->name('purchase.update');
    Route::delete('/purchase/{purchase}', [\App\Http\Controllers\Seller\PurchaseController::class, 'destroy'])->name('purchase.destroy');
    Route::get('/sales', [\App\Http\Controllers\Seller\SalesController::class, 'index'])->name('sales');
    Route::post('/sales', [\App\Http\Controllers\Seller\SalesController::class, 'store'])->name('sales.store');
    Route::put('/sales/{order}', [\App\Http\Controllers\Seller\SalesController::class, 'update'])->name('sales.update');
    Route::delete('/sales/{order}', [\App\Http\Controllers\Seller\SalesController::class, 'destroy'])->name('sales.destroy');
    Route::get('/warehouse', [\App\Http\Controllers\Seller\WarehouseController::class, 'index'])->name('warehouse');
    Route::post('/warehouse', [\App\Http\Controllers\Seller\WarehouseController::class, 'store'])->name('warehouse.store');
    Route::put('/warehouse/{warehouse}', [\App\Http\Controllers\Seller\WarehouseController::class, 'update'])->name('warehouse.update');
    Route::get('/contact', [\App\Http\Controllers\Seller\SellerContactController::class, 'index'])->name('contact');
    Route::post('/contact', [\App\Http\Controllers\Seller\SellerContactController::class, 'store'])->name('contact.store');
    Route::put('/contact/{contact}', [\App\Http\Controllers\Seller\SellerContactController::class, 'update'])->name('contact.update');
    Route::delete('/contact/{contact}', [\App\Http\Controllers\Seller\SellerContactController::class, 'destroy'])->name('contact.destroy');
    Route::get('/supplier', fn() => redirect()->route('contact', ['type' => 'supplier']))->name('supplier');
    Route::get('/customer', fn() => redirect()->route('contact', ['type' => 'customer']))->name('customer');
    Route::post('/pos', [SellerPosController::class, 'store'])->name('pos.store');

    Route::get('/banking', [SellerFinanceController::class, 'banking'])->name('banking');
    Route::post('/banking', [SellerFinanceController::class, 'updateBanking'])->name('banking.update');
    Route::get('/profit-loss', [SellerFinanceController::class, 'profitLoss'])->name('profit-loss');
    Route::get('/kyc', fn() => redirect()->route('seller.my-shop'))->name('kyc');
    Route::post('/kyc', fn() => redirect()->route('seller.my-shop'))->name('kyc.update');
    Route::get('/fraud-check', [SellerFinanceController::class, 'fraudCheck'])->name('fraud-check');

    Route::get('/stock', [SellerStockController::class, 'index'])->name('stock');
    Route::put('/stock/{product}', [SellerStockController::class, 'update'])->name('stock.update');
    Route::delete('/stock/{product}', [SellerStockController::class, 'destroy'])->name('stock.destroy');

    Route::get('/product', [SellerProductController::class, 'index']);
    Route::get('/product-list', [SellerProductController::class, 'index']);
    Route::get('/products', [SellerProductController::class, 'index'])->name('products.index');
    Route::get('/products-list', [SellerProductController::class, 'index'])->name('products');
    Route::get('/products/create', [SellerProductController::class, 'create'])->name('products.create');
    Route::post('/products', [SellerProductController::class, 'store'])->name('products.store');
    Route::get('/products/{product}/edit', [SellerProductController::class, 'edit'])->name('products.edit');
    Route::put('/products/{product}', [SellerProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [SellerProductController::class, 'destroy'])->name('products.destroy');

    // Live Support Messages with Admin
    Route::get('/messages', [\App\Http\Controllers\Seller\SellerMessageController::class, 'index'])->name('messages');
    Route::post('/messages', [\App\Http\Controllers\Seller\SellerMessageController::class, 'send'])->name('messages.send');
    Route::get('/messages/poll', [\App\Http\Controllers\Seller\SellerMessageController::class, 'poll'])->name('messages.poll');
    }); // End seller.shop group
});

// ─── Admin Portal ─────────────────────────────────────────────────────────
Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::post('/system/clear-cache', [AdminDashboardController::class, 'clearCache'])->name('system.clear-cache');

    Route::get('/customers', [AdminCustomerController::class, 'index'])->name('customers.index');
    Route::post('/customers/mark-seen', [AdminCustomerController::class, 'markSeen'])->name('customers.mark-seen');
    Route::put('/customers/{user}/status', [AdminCustomerController::class, 'updateStatus'])->name('customers.status');
    Route::delete('/customers/{user}', [AdminCustomerController::class, 'destroy'])->name('customers.destroy');
    Route::get('/customers/export', [AdminCustomerController::class, 'export'])->name('customers.export');
    Route::post('/customers/{user}/toggle-bonus-coupon', [AdminCustomerController::class, 'toggleBonusCoupon'])->name('customers.toggle-bonus-coupon');
    Route::post('/customers/bulk-bonus-coupon', [AdminCustomerController::class, 'bulkBonusCoupon'])->name('customers.bulk-bonus-coupon');
    Route::post('/bonus-coupon-message', [AdminCustomerController::class, 'updateBonusCouponMessage'])->name('bonus-coupon-message.update');
    
    Route::get('/users', [AdminDashboardController::class, 'users'])->name('users');
    Route::put('/users/{user}/role', [AdminDashboardController::class, 'updateUserRole'])->name('users.role');
    Route::match(['get', 'post'], '/users/{user}/impersonate', [AdminDashboardController::class, 'impersonateUser'])->name('users.impersonate');
    Route::delete('/users/{user}', [AdminDashboardController::class, 'destroyUser'])->name('users.destroy');
    Route::post('/users/{user}/toggle-bonus-coupon', [AdminDashboardController::class, 'toggleBonusCoupon'])->name('users.toggle-bonus-coupon');
    Route::post('/users/bulk-bonus-coupon', [AdminDashboardController::class, 'bulkBonusCoupon'])->name('users.bulk-bonus-coupon');

    Route::get('/users/import-export', fn() => Inertia::render('Admin/BulkImportExport'))->name('users.import-export');
    
    Route::get('/users/notifications', [SystemNotificationController::class, 'index'])->name('users.notifications');
    Route::post('/users/notifications', [SystemNotificationController::class, 'store'])->name('users.notifications.store');
    Route::put('/users/notifications/{notification}/toggle', [SystemNotificationController::class, 'toggle'])->name('users.notifications.toggle');
    Route::delete('/users/notifications/{notification}', [SystemNotificationController::class, 'destroy'])->name('users.notifications.destroy');
    Route::post('/users/notifications/toggle-all', [SystemNotificationController::class, 'toggleAll'])->name('users.notifications.toggle-all');
    
    Route::get('/users/birthdays', [\App\Http\Controllers\Admin\AdminBirthdayWishController::class, 'index'])->name('users.birthdays');
    Route::post('/users/birthdays/send', [\App\Http\Controllers\Admin\AdminBirthdayWishController::class, 'send'])->name('users.birthdays.send');
    Route::post('/users/birthdays/settings', [\App\Http\Controllers\Admin\AdminBirthdayWishController::class, 'updateSettings'])->name('users.birthdays.settings');

    Route::post('/users/{user}/assign-role-secure', [\App\Http\Controllers\Admin\RoleManagementController::class, 'assignRoleSecure'])->name('users.assign-role');

    // Admin Offers
    Route::get('/offers/create', [App\Http\Controllers\AdminOfferController::class, 'create'])->name('admin.offers.create');
    Route::post('/offers', [App\Http\Controllers\AdminOfferController::class, 'store'])->name('admin.offers.store');

    Route::get('/super-admins', [AdminDashboardController::class, 'superAdmins'])->name('super-admins');
    Route::post('/super-admins/promote', [AdminDashboardController::class, 'promoteSuperAdmin'])->name('super-admins.promote');
    Route::post('/super-admins/create', [AdminDashboardController::class, 'createSuperAdmin'])->name('super-admins.create');
    Route::post('/super-admins/{user}/reset-password', [AdminDashboardController::class, 'resetSuperAdminPassword'])->name('super-admins.reset-password');
    Route::post('/super-admins/{user}/revoke', [AdminDashboardController::class, 'revokeSuperAdmin'])->name('super-admins.revoke');

    Route::get('/settings/social', fn() => Inertia::render('Admin/SocialSettings'))->name('settings.social');
    
    // Security Routes
    Route::get('/security/settings', [\App\Http\Controllers\Admin\AdminSecurityController::class, 'settings'])->name('security.settings');
    Route::post('/security/settings', [\App\Http\Controllers\Admin\AdminSecurityController::class, 'updateSettings'])->name('security.settings.update');
    Route::get('/security/2fa', [\App\Http\Controllers\Admin\AdminSecurityController::class, 'twoFactor'])->name('security.2fa');
    Route::get('/security/sessions', [\App\Http\Controllers\Admin\AdminSecurityController::class, 'sessions'])->name('security.sessions');
    Route::post('/security/sessions/revoke-all', [\App\Http\Controllers\Admin\AdminSecurityController::class, 'revokeAllOtherSessions'])->name('security.sessions.revoke-all');
    Route::delete('/security/sessions/{id}', [\App\Http\Controllers\Admin\AdminSecurityController::class, 'revokeSession'])->name('security.sessions.revoke');
    Route::get('/security/ip-list', [\App\Http\Controllers\Admin\AdminSecurityController::class, 'ipList'])->name('security.ip-list');
    Route::post('/security/ip-list', [\App\Http\Controllers\Admin\AdminSecurityController::class, 'storeIpRule'])->name('security.ip-list.store');
    Route::delete('/security/ip-list/{ipRule}', [\App\Http\Controllers\Admin\AdminSecurityController::class, 'destroyIpRule'])->name('security.ip-list.destroy');
    Route::get('/security/webhooks', [\App\Http\Controllers\Admin\AdminSecurityController::class, 'webhooks'])->name('security.webhooks');
    Route::post('/security/webhooks', [\App\Http\Controllers\Admin\AdminSecurityController::class, 'storeWebhook'])->name('security.webhooks.store');
    Route::post('/security/webhooks/{webhook}', [\App\Http\Controllers\Admin\AdminSecurityController::class, 'updateWebhook'])->name('security.webhooks.update');
    Route::delete('/security/webhooks/{webhook}', [\App\Http\Controllers\Admin\AdminSecurityController::class, 'destroyWebhook'])->name('security.webhooks.destroy');
    Route::get('/security/audit-logs', [\App\Http\Controllers\Admin\AdminSecurityController::class, 'auditLogs'])->name('security.audit-logs');
    Route::get('/security/audit-logs/export', [\App\Http\Controllers\Admin\AdminSecurityController::class, 'exportAuditLogs'])->name('security.audit-logs.export');

    // Integrations
    Route::get('/integrations', [\App\Http\Controllers\Admin\AdminIntegrationController::class, 'index'])->name('integrations');

    // Courier Management
    Route::get('/couriers', [\App\Http\Controllers\Admin\AdminCourierController::class, 'index'])->name('couriers');
    Route::post('/couriers', [\App\Http\Controllers\Admin\AdminCourierController::class, 'store'])->name('couriers.store');
    Route::put('/couriers/{courier}', [\App\Http\Controllers\Admin\AdminCourierController::class, 'update'])->name('couriers.update');
    Route::delete('/couriers/{courier}', [\App\Http\Controllers\Admin\AdminCourierController::class, 'destroy'])->name('couriers.destroy');
    Route::get('/shipments', [\App\Http\Controllers\Admin\AdminCourierController::class, 'shipments'])->name('shipments');
    Route::get('/delivery-charges', [\App\Http\Controllers\Admin\AdminCourierController::class, 'shippingRates'])->name('delivery-charges');
    Route::post('/delivery-charges', [\App\Http\Controllers\Admin\AdminCourierController::class, 'updateShippingRates'])->name('delivery-charges.update');
    Route::get('/pickup-requests', [\App\Http\Controllers\Admin\AdminCourierController::class, 'pickupRequests'])->name('pickup-requests');
    Route::get('/courier-logs', [\App\Http\Controllers\Admin\AdminCourierController::class, 'courierLogs'])->name('courier-logs');
    Route::get('/returns', [\App\Http\Controllers\Admin\AdminCourierController::class, 'returns'])->name('returns');

    // Admin Warranty Claims
    Route::get('/warranty-claims', [\App\Http\Controllers\WarrantyClaimController::class, 'adminIndex'])->name('warranty-claims.index');
    Route::post('/warranty-claims/mark-all-seen', [\App\Http\Controllers\WarrantyClaimController::class, 'markAllSeen'])->name('warranty-claims.mark-all-seen');
    Route::post('/warranty-claims/{id}/mark-seen', [\App\Http\Controllers\WarrantyClaimController::class, 'markSeen'])->name('warranty-claims.mark-seen');
    Route::put('/warranty-claims/{id}', [\App\Http\Controllers\WarrantyClaimController::class, 'adminUpdate'])->name('warranty-claims.update');
    Route::delete('/warranty-claims/{id}', [\App\Http\Controllers\WarrantyClaimController::class, 'adminDestroy'])->name('warranty-claims.destroy');

    // Admin Vendor Support Tickets
    Route::get('/vendor-tickets', [\App\Http\Controllers\Admin\AdminSupportTicketController::class, 'index'])->name('vendor-tickets.index');
    Route::post('/vendor-tickets/mark-all-read', [\App\Http\Controllers\Admin\AdminSupportTicketController::class, 'markAllRead'])->name('vendor-tickets.mark-all-read');
    Route::post('/vendor-tickets/{id}/mark-read', [\App\Http\Controllers\Admin\AdminSupportTicketController::class, 'markRead'])->name('vendor-tickets.mark-read');
    Route::post('/vendor-tickets/{id}/reply', [\App\Http\Controllers\Admin\AdminSupportTicketController::class, 'reply'])->name('vendor-tickets.reply');
    Route::post('/vendor-tickets/{id}/status', [\App\Http\Controllers\Admin\AdminSupportTicketController::class, 'updateStatus'])->name('vendor-tickets.status');
    Route::delete('/vendor-tickets/{id}', [\App\Http\Controllers\Admin\AdminSupportTicketController::class, 'destroy'])->name('vendor-tickets.destroy');
    Route::get('/support-tickets', [\App\Http\Controllers\Admin\AdminSupportTicketController::class, 'index'])->name('support-tickets.index');

    // Admin Profile
    Route::get('/profile/me', [\App\Http\Controllers\Admin\AdminProfileController::class, 'me'])->name('profile.me');
    Route::post('/profile/me', [\App\Http\Controllers\Admin\AdminProfileController::class, 'updateMe'])->name('profile.me.update');
    Route::post('/profile/me/password', [\App\Http\Controllers\Admin\AdminProfileController::class, 'updatePassword'])->name('profile.me.password');

    // VIP Loyalty Tiers Management
    Route::get('/customers/loyalty', [\App\Http\Controllers\Admin\AdminVipLoyaltyController::class, 'index'])->name('customers.loyalty');
    Route::post('/customers/loyalty', [\App\Http\Controllers\Admin\AdminVipLoyaltyController::class, 'update'])->name('customers.loyalty.update');

    // Localization
    Route::get('/localization/languages', [\App\Http\Controllers\Admin\AdminLocalizationController::class, 'languages'])->name('localization.languages');
    Route::post('/localization/languages', [\App\Http\Controllers\Admin\AdminLocalizationController::class, 'store'])->name('localization.languages.store');
    Route::post('/localization/languages/{language}', [\App\Http\Controllers\Admin\AdminLocalizationController::class, 'update'])->name('localization.languages.update');
    Route::post('/localization/languages/{language}/toggle', [\App\Http\Controllers\Admin\AdminLocalizationController::class, 'toggleStatus'])->name('localization.languages.toggle');
    Route::delete('/localization/languages/{language}', [\App\Http\Controllers\Admin\AdminLocalizationController::class, 'destroy'])->name('localization.languages.destroy');

    Route::get('/developers/api', [\App\Http\Controllers\Admin\AdminApiKeyController::class, 'index'])->name('developers.api');
    Route::get('/api/keys', [\App\Http\Controllers\Admin\AdminApiKeyController::class, 'index'])->name('api-keys.index');
    Route::post('/api/keys', [\App\Http\Controllers\Admin\AdminApiKeyController::class, 'store'])->name('api-keys.store');
    Route::post('/api/keys/{apiKey}/revoke', [\App\Http\Controllers\Admin\AdminApiKeyController::class, 'revoke'])->name('api-keys.revoke');
    Route::delete('/api/keys/{apiKey}', [\App\Http\Controllers\Admin\AdminApiKeyController::class, 'destroy'])->name('api-keys.destroy');
    Route::get('/staff', [\App\Http\Controllers\Admin\StaffController::class, 'index'])->name('staff.index');
    Route::post('/staff/store', [\App\Http\Controllers\Admin\StaffController::class, 'store'])->name('staff.store');
    Route::put('/staff/{staff}', [\App\Http\Controllers\Admin\StaffController::class, 'update'])->name('staff.update');
    Route::delete('/staff/{staff}', [\App\Http\Controllers\Admin\StaffController::class, 'destroy'])->name('staff.destroy');
    Route::get('/staff/attendance', [\App\Http\Controllers\Admin\StaffController::class, 'attendance'])->name('staff.attendance');
    Route::get('/staff/salary', [\App\Http\Controllers\Admin\StaffController::class, 'salary'])->name('staff.salary');
    Route::get('/staff/leaves', [\App\Http\Controllers\Admin\StaffController::class, 'leaves'])->name('staff.leaves');


    Route::get('/roles/list', [\App\Http\Controllers\Admin\AdminRoleController::class, 'index'])->name('roles.list');
    Route::post('/roles/list', [\App\Http\Controllers\Admin\AdminRoleController::class, 'updateRoles'])->name('roles.update');
    Route::get('/roles/staff-permissions', [\App\Http\Controllers\Admin\StaffController::class, 'permissionsIndex'])->name('roles.staff-permissions');
    Route::post('/staff/add', [\App\Http\Controllers\Admin\StaffController::class, 'addStaff'])->name('staff.add');
    Route::post('/staff/{user}/toggle-full-access', [\App\Http\Controllers\Admin\StaffController::class, 'toggleFullAccess'])->name('staff.toggle-full-access');
    Route::post('/staff/{user}/toggle-module', [\App\Http\Controllers\Admin\StaffController::class, 'toggleModule'])->name('staff.toggle-module');

    Route::get('/finance/payments', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'payments'])->name('finance.payments');
    Route::get('/finance/invoices', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'invoices'])->name('finance.invoices');
    Route::get('/finance/invoices/{orderNumber}/download', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'downloadInvoice'])->name('finance.invoices.download');
    Route::get('/finance/invoices/settings', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'invoiceSettings'])->name('finance.invoices.settings');
    Route::post('/finance/invoices/settings', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'updateInvoiceSettings'])->name('finance.invoices.settings.update');
    Route::get('/transactions', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'transactions'])->name('finance.transactions');
    // Appearance Routes
    Route::get('/appearance/hero-slider', [\App\Http\Controllers\Admin\HeroSliderController::class, 'index'])->name('appearance.hero-slider');
    Route::post('/appearance/hero-slider', [\App\Http\Controllers\Admin\HeroSliderController::class, 'store'])->name('appearance.hero-slider.store');
    Route::post('/appearance/hero-slider/{id}', [\App\Http\Controllers\Admin\HeroSliderController::class, 'update'])->name('appearance.hero-slider.update');
    Route::delete('/appearance/hero-slider/{id}', [\App\Http\Controllers\Admin\HeroSliderController::class, 'destroy'])->name('appearance.hero-slider.destroy');
    Route::get('/top-banner', [\App\Http\Controllers\Admin\TopBannerController::class, 'index'])->name('top-banner');
    Route::get('/appearance/top-banner', [\App\Http\Controllers\Admin\TopBannerController::class, 'index'])->name('appearance.top-banner');
    Route::post('/top-banner/text', [\App\Http\Controllers\Admin\TopBannerController::class, 'updateTextBanner'])->name('top-banner.text.update');
    Route::post('/top-banner', [\App\Http\Controllers\Admin\TopBannerController::class, 'store'])->name('top-banner.store');
    Route::post('/top-banner/{id}', [\App\Http\Controllers\Admin\TopBannerController::class, 'update'])->name('top-banner.update');
    Route::delete('/top-banner/{id}', [\App\Http\Controllers\Admin\TopBannerController::class, 'destroy'])->name('top-banner.destroy');
    Route::get('/appearance/notice-marquee', [\App\Http\Controllers\Admin\AdminNoticeMarqueeController::class, 'index'])->name('appearance.notice-marquee');
    Route::post('/appearance/notice-marquee', [\App\Http\Controllers\Admin\AdminNoticeMarqueeController::class, 'update'])->name('appearance.notice-marquee.update');
    Route::get('/appearance/feature-badges', [\App\Http\Controllers\Admin\AdminFeatureBadgeController::class, 'index'])->name('appearance.feature-badges');
    Route::post('/appearance/feature-badges', [\App\Http\Controllers\Admin\AdminFeatureBadgeController::class, 'update'])->name('appearance.feature-badges.update');
    Route::get('/appearance/themes-effects', function() {
        $activeThemeId = \App\Models\SiteSetting::get('active_theme_id');
        $savedData = \App\Models\SiteSetting::get('themes_data');
        $themesData = $savedData ? json_decode($savedData, true) : null;
        return Inertia::render('Admin/ThemesEffectsPage', [
            'initialActiveThemeId' => $activeThemeId,
            'initialThemesData' => $themesData
        ]);
    })->name('appearance.themes-effects');

    Route::post('/appearance/themes-effects', function(\Illuminate\Http\Request $request) {
        $activeThemeId = $request->input('active_theme_id');
        $themesData = $request->input('themes_data');

        \App\Models\SiteSetting::set('active_theme_id', $activeThemeId);
        if ($themesData) {
            \App\Models\SiteSetting::set('themes_data', is_string($themesData) ? $themesData : json_encode($themesData));
        }

        return back()->with('success', 'Theme settings updated successfully!');
    })->name('appearance.themes-effects.update');
    Route::get('/appearance/theme-colors', [\App\Http\Controllers\Admin\AdminThemeColorController::class, 'index'])->name('admin.appearance.theme-colors');
    Route::post('/appearance/theme-colors', [\App\Http\Controllers\Admin\AdminThemeColorController::class, 'update'])->name('admin.appearance.theme-colors.update');
    Route::get('/appearance/pages', [\App\Http\Controllers\Admin\AdminPageController::class, 'index'])->name('appearance.pages');
    Route::post('/appearance/pages', [\App\Http\Controllers\Admin\AdminPageController::class, 'store'])->name('appearance.pages.store');
    Route::put('/appearance/pages/{id}', [\App\Http\Controllers\Admin\AdminPageController::class, 'update'])->name('appearance.pages.update');
    Route::delete('/appearance/pages/{id}', [\App\Http\Controllers\Admin\AdminPageController::class, 'destroy'])->name('appearance.pages.destroy');
    Route::get('/appearance/pages/{slug}/edit', [\App\Http\Controllers\Admin\AdminPageController::class, 'editBySlug'])->name('appearance.pages.edit');
    Route::get('/appearance/footer-builder', [\App\Http\Controllers\Admin\AdminFooterBuilderController::class, 'index'])->name('appearance.footer-builder');
    Route::post('/appearance/footer-widgets', [\App\Http\Controllers\Admin\AdminFooterBuilderController::class, 'storeWidget'])->name('appearance.footer-widgets.store');
    Route::match(['post', 'put'], '/appearance/footer-widgets/{id}', [\App\Http\Controllers\Admin\AdminFooterBuilderController::class, 'updateWidget'])->name('appearance.footer-widgets.update');
    Route::delete('/appearance/footer-widgets/{id}', [\App\Http\Controllers\Admin\AdminFooterBuilderController::class, 'destroyWidget'])->name('appearance.footer-widgets.destroy');

    Route::post('/appearance/footer-links', [\App\Http\Controllers\Admin\AdminFooterBuilderController::class, 'storeLink'])->name('appearance.footer-links.store');
    Route::match(['post', 'put'], '/appearance/footer-links/{id}', [\App\Http\Controllers\Admin\AdminFooterBuilderController::class, 'updateLink'])->name('appearance.footer-links.update');
    Route::delete('/appearance/footer-links/{id}', [\App\Http\Controllers\Admin\AdminFooterBuilderController::class, 'destroyLink'])->name('appearance.footer-links.destroy');

    // Media Manager
    Route::get('/media', [\App\Http\Controllers\Admin\AdminMediaController::class, 'index'])->name('media.index');
    Route::post('/media', [\App\Http\Controllers\Admin\AdminMediaController::class, 'store'])->name('media.store');
    Route::delete('/media', [\App\Http\Controllers\Admin\AdminMediaController::class, 'destroy'])->name('media.destroy');

    Route::post('/appearance/footer-settings', [\App\Http\Controllers\Admin\AdminFooterBuilderController::class, 'updateSettings'])->name('appearance.footer-settings.update');

    Route::get('/subscribers', [\App\Http\Controllers\Admin\SubscriberController::class, 'index'])->name('subscribers.index');
    Route::delete('/subscribers/{id}', [\App\Http\Controllers\Admin\SubscriberController::class, 'destroy'])->name('subscribers.destroy');
    Route::get('/finance/refunds', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'refunds'])->name('finance.refunds');
    Route::get('/finance/billing-plans', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'billingPlans'])->name('finance.billing-plans');
    Route::post('/finance/billing-plans', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'storeBillingPlan'])->name('finance.billing-plans.store');
    Route::put('/finance/billing-plans/{id}', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'updateBillingPlan'])->name('finance.billing-plans.update');
    Route::post('/finance/billing-plans/{id}/toggle', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'toggleBillingPlan'])->name('finance.billing-plans.toggle');
    Route::delete('/finance/billing-plans/{id}', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'destroyBillingPlan'])->name('finance.billing-plans.destroy');
    Route::get('/finance/gateway-settings', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'gatewaySettings'])->name('finance.gateway-settings');
    Route::post('/finance/gateway-settings', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'updateGatewaySettings'])->name('finance.gateway-settings.update');

    // Units
    Route::get('/units', [\App\Http\Controllers\Admin\AdminUnitController::class, 'index'])->name('units');
    Route::post('/units', [\App\Http\Controllers\Admin\AdminUnitController::class, 'store'])->name('units.store');
    Route::put('/units/{unit}', [\App\Http\Controllers\Admin\AdminUnitController::class, 'update'])->name('units.update');
    Route::delete('/units/{unit}', [\App\Http\Controllers\Admin\AdminUnitController::class, 'destroy'])->name('units.destroy');

    // Attributes
    Route::get('/attributes', [\App\Http\Controllers\Admin\AdminAttributeController::class, 'index'])->name('attributes');
    Route::post('/attributes', [\App\Http\Controllers\Admin\AdminAttributeController::class, 'store'])->name('attributes.store');
    Route::put('/attributes/{attribute}', [\App\Http\Controllers\Admin\AdminAttributeController::class, 'update'])->name('attributes.update');
    Route::delete('/attributes/{attribute}', [\App\Http\Controllers\Admin\AdminAttributeController::class, 'destroy'])->name('attributes.destroy');

    // Brands
    Route::get('/brands', [\App\Http\Controllers\Admin\AdminBrandController::class, 'index'])->name('brands');
    Route::post('/brands', [\App\Http\Controllers\Admin\AdminBrandController::class, 'store'])->name('brands.store');
    Route::put('/brands/{brand}', [\App\Http\Controllers\Admin\AdminBrandController::class, 'update'])->name('brands.update');
    Route::delete('/brands/{brand}', [\App\Http\Controllers\Admin\AdminBrandController::class, 'destroy'])->name('brands.destroy');

    Route::get('/products/import', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'importProductsCsv'])->name('products.import');
    Route::post('/products/import', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'importProductsCsvStore'])->name('products.import.store');
    Route::get('/reviews', [\App\Http\Controllers\Admin\AdminReviewController::class, 'index'])->name('reviews');
    Route::post('/reviews/{review}/approve', [\App\Http\Controllers\Admin\AdminReviewController::class, 'approve'])->name('reviews.approve');
    Route::post('/reviews/{review}/reject', [\App\Http\Controllers\Admin\AdminReviewController::class, 'reject'])->name('reviews.reject');
    Route::post('/reviews/{review}/reply', [\App\Http\Controllers\Admin\AdminReviewController::class, 'reply'])->name('reviews.reply');

    Route::get('/bargain', [\App\Http\Controllers\Admin\AdminBargainOfferController::class, 'index'])->name('bargain');
    Route::post('/bargain/{id}/accept', [\App\Http\Controllers\Admin\AdminBargainOfferController::class, 'accept'])->name('bargain.accept');
    Route::post('/bargain/{id}/reject', [\App\Http\Controllers\Admin\AdminBargainOfferController::class, 'reject'])->name('bargain.reject');
    Route::delete('/bargain/{id}', [\App\Http\Controllers\Admin\AdminBargainOfferController::class, 'destroy'])->name('bargain.destroy');
    Route::get('/categories', [\App\Http\Controllers\Admin\AdminCategoryController::class, 'index'])->name('categories');
    Route::post('/categories', [\App\Http\Controllers\Admin\AdminCategoryController::class, 'store'])->name('categories.store');
    Route::match(['POST', 'PUT'], '/categories/{category}', [\App\Http\Controllers\Admin\AdminCategoryController::class, 'update'])->name('categories.update');
    Route::put('/categories/{category}/toggle', [\App\Http\Controllers\Admin\AdminCategoryController::class, 'toggle'])->name('categories.toggle');
    Route::delete('/categories/{category}', [\App\Http\Controllers\Admin\AdminCategoryController::class, 'destroy'])->name('categories.destroy');
    Route::get('/category-requests', [AdminDashboardController::class, 'categoryRequests'])->name('category-requests');
    Route::post('/category-requests/{categoryRequest}/status', [AdminDashboardController::class, 'updateCategoryRequestStatus'])->name('category-requests.status');

    Route::get('/subscribers', [\App\Http\Controllers\Admin\SubscriberController::class, 'index'])->name('subscribers.index');
    Route::delete('/subscribers/{id}', [\App\Http\Controllers\Admin\SubscriberController::class, 'destroy'])->name('subscribers.destroy');
    Route::get('/finance/refunds', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'refunds'])->name('finance.refunds');
    Route::get('/finance/gateway-settings', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'gatewaySettings'])->name('finance.gateway-settings');
    Route::post('/finance/gateway-settings', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'updateGatewaySettings'])->name('finance.gateway-settings.update');
    Route::post('/finance/gateway-settings/create', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'createGateway'])->name('finance.gateway-settings.create');
    Route::delete('/finance/gateway-settings/{code}', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'deleteGateway'])->name('finance.gateway-settings.delete');
    Route::post('/finance/gateway-settings/reset', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'resetDefaultGateways'])->name('finance.gateway-settings.reset');
    Route::post('/finance/gateway-settings/upload-logo', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'uploadGatewayLogo'])->name('finance.gateway-settings.upload-logo');
    Route::post('/finance/gateway-settings/upload-qr', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'uploadGatewayQr'])->name('finance.gateway-settings.upload-qr');
    Route::post('/finance/gateway-settings/remove-logo', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'removeGatewayLogo'])->name('finance.gateway-settings.remove-logo');
    Route::post('/finance/gateway-settings/remove-qr', [\App\Http\Controllers\Admin\AdminFinanceController::class, 'removeGatewayQr'])->name('finance.gateway-settings.remove-qr');


    Route::get('/reviews', [\App\Http\Controllers\Admin\AdminReviewController::class, 'index'])->name('reviews');
    Route::post('/reviews/{review}/approve', [\App\Http\Controllers\Admin\AdminReviewController::class, 'approve'])->name('reviews.approve');
    Route::post('/reviews/{review}/reject', [\App\Http\Controllers\Admin\AdminReviewController::class, 'reject'])->name('reviews.reject');
    Route::delete('/reviews/{review}', [\App\Http\Controllers\Admin\AdminReviewController::class, 'destroy'])->name('reviews.destroy');
    Route::post('/reviews/{review}/reply', [\App\Http\Controllers\Admin\AdminReviewController::class, 'reply'])->name('reviews.reply');
    
    // Order Management
    Route::get('/orders', [\App\Http\Controllers\Admin\AdminOrderController::class, 'index'])->name('orders');
    Route::post('/orders/mark-all-seen', [\App\Http\Controllers\Admin\AdminOrderController::class, 'markAllSeen'])->name('admin.orders.mark-all-seen');
    Route::post('/orders/bulk-status', [\App\Http\Controllers\Admin\AdminOrderController::class, 'bulkStatus'])->name('admin.orders.bulk-status');
    Route::post('/orders/bulk-delete', [\App\Http\Controllers\Admin\AdminOrderController::class, 'bulkDelete'])->name('admin.orders.bulk-delete');
    Route::post('/orders/{id}/mark-seen', [\App\Http\Controllers\Admin\AdminOrderController::class, 'markSeen'])->name('admin.orders.mark-seen');
    Route::post('/orders/{id}', [\App\Http\Controllers\Admin\AdminOrderController::class, 'update'])->name('admin.orders.update');
    Route::post('/orders/{id}/status', [\App\Http\Controllers\Admin\AdminOrderController::class, 'updateStatus'])->name('orders.update-status');
    Route::delete('/orders/{id}', [\App\Http\Controllers\Admin\AdminOrderController::class, 'destroy'])->name('admin.orders.destroy');
    Route::post('/orders/{id}/send-invoice-email', [\App\Http\Controllers\Admin\AdminOrderController::class, 'sendInvoiceEmail'])->name('admin.orders.send-invoice-email');

    // Blog System
    Route::get('/blogs/posts', [\App\Http\Controllers\Admin\AdminBlogController::class, 'posts'])->name('blogs.posts');
    Route::post('/blogs/posts', [\App\Http\Controllers\Admin\AdminBlogController::class, 'storePost'])->name('blogs.posts.store');
    Route::put('/blogs/posts/{id}', [\App\Http\Controllers\Admin\AdminBlogController::class, 'updatePost'])->name('blogs.posts.update');
    Route::delete('/blogs/posts/{id}', [\App\Http\Controllers\Admin\AdminBlogController::class, 'destroyPost'])->name('blogs.posts.destroy');

    Route::get('/blogs/categories', [\App\Http\Controllers\Admin\AdminBlogController::class, 'categories'])->name('blogs.categories');
    Route::post('/blogs/categories', [\App\Http\Controllers\Admin\AdminBlogController::class, 'storeCategory'])->name('blogs.categories.store');
    Route::put('/blogs/categories/{id}', [\App\Http\Controllers\Admin\AdminBlogController::class, 'updateCategory'])->name('blogs.categories.update');
    Route::delete('/blogs/categories/{id}', [\App\Http\Controllers\Admin\AdminBlogController::class, 'destroyCategory'])->name('blogs.categories.destroy');

    Route::get('/blogs/tags', [\App\Http\Controllers\Admin\AdminBlogController::class, 'tags'])->name('blogs.tags');
    Route::post('/blogs/tags', [\App\Http\Controllers\Admin\AdminBlogController::class, 'storeTag'])->name('blogs.tags.store');
    Route::put('/blogs/tags/{id}', [\App\Http\Controllers\Admin\AdminBlogController::class, 'updateTag'])->name('blogs.tags.update');
    Route::delete('/blogs/tags/{id}', [\App\Http\Controllers\Admin\AdminBlogController::class, 'destroyTag'])->name('blogs.tags.destroy');

    Route::get('/blogs/comments', [\App\Http\Controllers\Admin\AdminBlogController::class, 'comments'])->name('blogs.comments');
    Route::put('/blogs/comments/{id}/toggle', [\App\Http\Controllers\Admin\AdminBlogController::class, 'toggleCommentStatus'])->name('blogs.comments.toggle');
    Route::delete('/blogs/comments/{id}', [\App\Http\Controllers\Admin\AdminBlogController::class, 'destroyComment'])->name('blogs.comments.destroy');

    Route::get('/flash-sales', [\App\Http\Controllers\Admin\AdminFlashSaleController::class, 'index'])->name('flash-sales');
    Route::post('/flash-sales', [\App\Http\Controllers\Admin\AdminFlashSaleController::class, 'store'])->name('flash-sales.store');
    Route::post('/flash-sales/{flashSale}/toggle', [\App\Http\Controllers\Admin\AdminFlashSaleController::class, 'toggle'])->name('flash-sales.toggle');
    Route::delete('/flash-sales/{flashSale}', [\App\Http\Controllers\Admin\AdminFlashSaleController::class, 'destroy'])->name('flash-sales.destroy');

    Route::get('/guruz-special', [\App\Http\Controllers\Admin\AdminGuruzSpecialController::class, 'index'])->name('guruz-special');
    Route::post('/guruz-special', [\App\Http\Controllers\Admin\AdminGuruzSpecialController::class, 'update'])->name('guruz-special.update');

    Route::get('/vendor-approvals', [AdminDashboardController::class, 'vendorApprovals'])->name('vendor-approvals');
    
    // Email Management
    Route::get('/emails/smtp', [\App\Http\Controllers\Admin\AdminEmailController::class, 'smtp'])->name('emails.smtp');
    Route::post('/emails/smtp', [\App\Http\Controllers\Admin\AdminEmailController::class, 'updateSmtp'])->name('emails.smtp.update');
    Route::post('/emails/smtp/test', [\App\Http\Controllers\Admin\AdminEmailController::class, 'testSmtp'])->name('emails.smtp.test');
    Route::get('/emails/templates', [\App\Http\Controllers\Admin\AdminEmailController::class, 'templates'])->name('emails.templates');
    Route::get('/email-templates/{template}/edit', [\App\Http\Controllers\Admin\AdminEmailController::class, 'edit'])->name('emails.templates.edit');
    Route::post('/email-templates/{template}/update', [\App\Http\Controllers\Admin\AdminEmailController::class, 'update'])->name('emails.templates.update');
    Route::post('/email-templates/store', [\App\Http\Controllers\Admin\AdminEmailController::class, 'store'])->name('emails.templates.store');
    Route::delete('/email-templates/{template}', [\App\Http\Controllers\Admin\AdminEmailController::class, 'destroy'])->name('emails.templates.destroy');
    Route::get('/emails/bulk', [\App\Http\Controllers\Admin\AdminEmailController::class, 'bulk'])->name('emails.bulk');
    Route::post('/emails/bulk/send', [\App\Http\Controllers\Admin\AdminEmailController::class, 'bulkSend'])->name('emails.bulk.send');
    
    // SMS & WhatsApp Management
    Route::get('/sms/gateway', [\App\Http\Controllers\Admin\AdminSmsController::class, 'gateway'])->name('sms.gateway');
    Route::post('/sms/gateway', [\App\Http\Controllers\Admin\AdminSmsController::class, 'updateGateway'])->name('sms.gateway.update');
    Route::get('/sms/templates', [\App\Http\Controllers\Admin\AdminSmsController::class, 'templates'])->name('admin.sms.templates');
    Route::post('/sms/templates', [\App\Http\Controllers\Admin\AdminSmsController::class, 'storeTemplate'])->name('admin.sms.templates.store');
    Route::put('/sms/templates/{id}', [\App\Http\Controllers\Admin\AdminSmsController::class, 'updateTemplate'])->name('admin.sms.templates.update');
    Route::delete('/sms/templates/{id}', [\App\Http\Controllers\Admin\AdminSmsController::class, 'destroyTemplate'])->name('admin.sms.templates.destroy');
    Route::get('/sms/whatsapp', [\App\Http\Controllers\Admin\AdminSmsController::class, 'whatsapp'])->name('sms.whatsapp');
    Route::post('/sms/whatsapp', [\App\Http\Controllers\Admin\AdminSmsController::class, 'updateWhatsapp'])->name('sms.whatsapp.update');
    Route::post('/sms/whatsapp/templates', [\App\Http\Controllers\Admin\AdminSmsController::class, 'storeWhatsappTemplate'])->name('admin.sms.whatsapp.templates.store');
    Route::put('/sms/whatsapp/templates/{id}', [\App\Http\Controllers\Admin\AdminSmsController::class, 'updateWhatsappTemplate'])->name('admin.sms.whatsapp.templates.update');
    Route::delete('/sms/whatsapp/templates/{id}', [\App\Http\Controllers\Admin\AdminSmsController::class, 'destroyWhatsappTemplate'])->name('admin.sms.whatsapp.templates.destroy');

    // Forms
    Route::get('/forms/submissions', [\App\Http\Controllers\Admin\AdminFormModuleController::class, 'submissions'])->name('forms.submissions');
    Route::get('/forms/abandoned-checkouts', [\App\Http\Controllers\Admin\AdminFormModuleController::class, 'abandonedCheckouts'])->name('forms.abandoned-checkouts');
    Route::get('/forms/cart-followups', [\App\Http\Controllers\Admin\AdminFormModuleController::class, 'cartFollowups'])->name('forms.cart-followups');
    Route::get('/forms/support-tickets', [\App\Http\Controllers\Admin\AdminSupportTicketController::class, 'index'])->name('forms.support-tickets');
    Route::get('/forms/knowledge-base', [\App\Http\Controllers\Admin\AdminFormModuleController::class, 'knowledgeBase'])->name('forms.knowledge-base');

    // Support Routes
    Route::get('/support/floating-widget', [\App\Http\Controllers\Admin\AdminSupportController::class, 'floatingWidget'])->name('support.floating-widget');
    Route::post('/support/floating-widget', [\App\Http\Controllers\Admin\AdminSupportController::class, 'updateFloatingWidget'])->name('support.floating-widget.update');

    // Analytics Routes
    Route::get('/analytics/visitor', [\App\Http\Controllers\Admin\AdminAnalyticsController::class, 'visitors'])->name('analytics.visitor');
    Route::get('/analytics/visitors', [\App\Http\Controllers\Admin\AdminAnalyticsController::class, 'visitors'])->name('analytics.visitors');


    // Appearance Routes
    Route::get('/appearance/guruz-special', [\App\Http\Controllers\Admin\AdminGuruzSpecialController::class, 'index'])->name('appearance.guruz-special');
    Route::get('/appearance/vendor-landing-page', [\App\Http\Controllers\Admin\AdminVendorLandingController::class, 'index'])->name('appearance.vendor-landing-page');
    Route::post('/appearance/vendor-landing-page/cms', [\App\Http\Controllers\Admin\AdminVendorLandingController::class, 'updateCms'])->name('appearance.vendor-landing-page.cms');
    Route::post('/appearance/vendor-landing-page', [\App\Http\Controllers\Admin\AdminVendorLandingController::class, 'store'])->name('appearance.vendor-landing-page.store');
    Route::post('/appearance/vendor-landing-page/{section}', [\App\Http\Controllers\Admin\AdminVendorLandingController::class, 'update'])->name('appearance.vendor-landing-page.update');
    Route::post('/appearance/vendor-landing-page/{section}/toggle', [\App\Http\Controllers\Admin\AdminVendorLandingController::class, 'toggleStatus'])->name('appearance.vendor-landing-page.toggle');
    Route::delete('/appearance/vendor-landing-page/{section}', [\App\Http\Controllers\Admin\AdminVendorLandingController::class, 'destroy'])->name('appearance.vendor-landing-page.destroy');

    Route::get('/api/keys', [\App\Http\Controllers\Admin\AdminApiKeyController::class, 'index'])->name('api.keys');
    Route::post('/api/keys', [\App\Http\Controllers\Admin\AdminApiKeyController::class, 'store'])->name('api.keys.store');
    Route::post('/api/keys/{apiKey}/revoke', [\App\Http\Controllers\Admin\AdminApiKeyController::class, 'revoke'])->name('api.keys.revoke');
    Route::delete('/api/keys/{apiKey}', [\App\Http\Controllers\Admin\AdminApiKeyController::class, 'destroy'])->name('api.keys.destroy');

    // System Routes
    Route::get('/system/config', [\App\Http\Controllers\Admin\AdminSystemSettingsController::class, 'systemConfig'])->name('system.config');
    Route::post('/system/config', [\App\Http\Controllers\Admin\AdminSystemSettingsController::class, 'updateSystemConfig'])->name('system.config.update');
    Route::post('/system/optimize', [\App\Http\Controllers\Admin\AdminSystemSettingsController::class, 'optimize'])->name('system.optimize');
    Route::get('/system/feature-limits', [\App\Http\Controllers\Admin\AdminSystemSettingsController::class, 'featureLimits'])->name('system.feature-limits');
    Route::post('/system/feature-limits', [\App\Http\Controllers\Admin\AdminSystemSettingsController::class, 'updateFeatureLimits'])->name('system.feature-limits.update');

    // Security 2FA
    Route::post('/security/two-factor/{id}/toggle', [\App\Http\Controllers\Admin\AdminSecurityController::class, 'toggleTwoFactor'])->name('security.2fa.toggle');

    // Developer Tools
    Route::get('/developer/debug-logs', [\App\Http\Controllers\Admin\AdminFormModuleController::class, 'debugLogs'])->name('developer.debug-logs');

    // Integrations
    Route::get('/integrations/list', fn() => Inertia::render('Admin/Integrations/Index'))->name('integrations.list');

    // Marketing Routes
    Route::get('/marketing/coupons', [\App\Http\Controllers\Admin\AdminCouponController::class, 'index'])->name('marketing.coupons');
    Route::post('/marketing/coupons/toggle-system', [\App\Http\Controllers\Admin\AdminCouponController::class, 'toggleSystem'])->name('marketing.coupons.toggle-system');
    Route::post('/marketing/coupons/welcome-settings', [\App\Http\Controllers\Admin\AdminCouponController::class, 'updateWelcomeSettings'])->name('marketing.coupons.welcome-settings');
    Route::post('/marketing/coupons', [\App\Http\Controllers\Admin\AdminCouponController::class, 'store'])->name('marketing.coupons.store');
    Route::put('/marketing/coupons/{id}', [\App\Http\Controllers\Admin\AdminCouponController::class, 'update'])->name('marketing.coupons.update');
    Route::post('/marketing/coupons/{id}/toggle', [\App\Http\Controllers\Admin\AdminCouponController::class, 'toggle'])->name('marketing.coupons.toggle');
    Route::delete('/marketing/coupons/{id}', [\App\Http\Controllers\Admin\AdminCouponController::class, 'destroy'])->name('marketing.coupons.destroy');
    Route::get('/marketing/campaigns', [\App\Http\Controllers\Admin\AdminCampaignController::class, 'index'])->name('marketing.campaigns');
    Route::post('/marketing/campaigns', [\App\Http\Controllers\Admin\AdminCampaignController::class, 'store'])->name('marketing.campaigns.store');
    Route::post('/marketing/campaigns/{campaign}', [\App\Http\Controllers\Admin\AdminCampaignController::class, 'update'])->name('marketing.campaigns.update');
    Route::get('/marketing/birthday-wish', [\App\Http\Controllers\Admin\AdminBirthdayWishController::class, 'index'])->name('marketing.birthday-wishes');
    Route::post('/marketing/birthday-wish', [\App\Http\Controllers\Admin\AdminBirthdayWishController::class, 'updateSettings'])->name('marketing.birthday-wishes.update');
    Route::post('/marketing/birthday-wish/send', [\App\Http\Controllers\Admin\AdminBirthdayWishController::class, 'send'])->name('marketing.birthday-wishes.send');
    Route::get('/marketing/seller-notices', [\App\Http\Controllers\Admin\AdminSellerNoticeController::class, 'index'])->name('marketing.seller-notices');
    Route::post('/marketing/seller-notices', [\App\Http\Controllers\Admin\AdminSellerNoticeController::class, 'store'])->name('marketing.seller-notices.store');
    Route::post('/marketing/seller-notices/{sellerNotice}', [\App\Http\Controllers\Admin\AdminSellerNoticeController::class, 'update'])->name('marketing.seller-notices.update');
    Route::delete('/marketing/seller-notices/{sellerNotice}', [\App\Http\Controllers\Admin\AdminSellerNoticeController::class, 'destroy'])->name('marketing.seller-notices.destroy');
    Route::get('/marketing/notifications', [\App\Http\Controllers\Admin\AdminPushNotificationController::class, 'index'])->name('marketing.notifications');
    Route::post('/marketing/notifications', [\App\Http\Controllers\Admin\AdminPushNotificationController::class, 'store'])->name('marketing.notifications.store');
    Route::post('/marketing/notifications/{pushNotification}', [\App\Http\Controllers\Admin\AdminPushNotificationController::class, 'update'])->name('marketing.notifications.update');
    Route::delete('/marketing/notifications/{pushNotification}', [\App\Http\Controllers\Admin\AdminPushNotificationController::class, 'destroy'])->name('marketing.notifications.destroy');

    // System Database Migration Runner
    Route::get('/system/run-migrations', function () {
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        $output = \Illuminate\Support\Facades\Artisan::output();
        \Illuminate\Support\Facades\Artisan::call('optimize:clear');
        return response("<div style='font-family:sans-serif;padding:30px;max-width:700px;margin:40px auto;background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;'><h2 style='color:#16a34a;margin-top:0;'>✅ ডাটাবেজ মাইগ্রেশন সফল হয়েছে!</h2><p style='color:#64748b;font-size:14px;'>সবগুলো নতুন ও পুরাতন টেবিল সঠিকভাবে আপডেট ও তৈরি করা হয়েছে।</p><pre style='padding:15px;background:#0f172a;color:#38bdf8;border-radius:10px;overflow:auto;font-size:13px;'>" . htmlspecialchars($output ?: "Nothing to migrate. All tables are up to date.") . "</pre><a href='/admin/dashboard' style='display:inline-block;padding:10px 20px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;margin-top:10px;'>ড্যাশবোর্ডে ফিরে যান</a></div>");
    })->name('system.run-migrations');

    // Vendor KYC Routes
    Route::get('/vendor-kyc', [AdminDashboardController::class, 'vendorKyc'])->name('vendor-kyc');
    Route::post('/vendor-kyc/{id}/approve', [AdminDashboardController::class, 'approveKyc'])->name('admin.vendor-kyc.approve');
    Route::post('/vendor-kyc/{id}/reject', [AdminDashboardController::class, 'rejectKyc'])->name('admin.vendor-kyc.reject');

    // Vendor Category Requests Routes
    Route::get('/category-requests', [\App\Http\Controllers\Admin\AdminCategoryRequestController::class, 'index'])->name('admin.category-requests');
    Route::post('/category-requests/{id}/approve', [\App\Http\Controllers\Admin\AdminCategoryRequestController::class, 'approve'])->name('admin.category-requests.approve');
    Route::post('/category-requests/{id}/reject', [\App\Http\Controllers\Admin\AdminCategoryRequestController::class, 'reject'])->name('admin.category-requests.reject');

    // Vendor Courier Pickup Requests Routes
    Route::get('/pickup-requests', [\App\Http\Controllers\Admin\AdminPickupRequestController::class, 'index'])->name('admin.pickup-requests');
    Route::post('/pickup-requests/{id}/accept', [\App\Http\Controllers\Admin\AdminPickupRequestController::class, 'accept'])->name('admin.pickup-requests.accept');
    Route::post('/pickup-requests/{id}/reject', [\App\Http\Controllers\Admin\AdminPickupRequestController::class, 'reject'])->name('admin.pickup-requests.reject');
    Route::get('/courier-api', [\App\Http\Controllers\Admin\AdminCourierApiController::class, 'index'])->name('admin.courier-api');
    Route::put('/courier-api/{id}', [\App\Http\Controllers\Admin\AdminCourierApiController::class, 'update'])->name('admin.courier-api.update');
    
    Route::get('/all-shops', [AdminDashboardController::class, 'shops'])->name('all-shops');
    Route::get('/commission-settings', [AdminDashboardController::class, 'commissionSettings'])->name('commission-settings');
    Route::post('/commission-settings', [AdminDashboardController::class, 'updateCommissionSettings'])->name('commission-settings.update');

    Route::get('/seller-wallets', [AdminDashboardController::class, 'sellerWallets'])->name('seller-wallets');
    Route::post('/seller-wallets/{wallet}/adjust', [AdminDashboardController::class, 'adjustSellerWallet'])->name('seller-wallets.adjust');
    
    Route::get('/customers/loyalty', [AdminDashboardController::class, 'loyaltyTiers'])->name('loyalty-tiers');
    Route::post('/customers/loyalty', [AdminDashboardController::class, 'updateLoyaltyTiers'])->name('loyalty-tiers.update');
    Route::get('/payout-requests', [AdminDashboardController::class, 'payoutRequests'])->name('payout-requests');
    Route::post('/payout-notice', [AdminDashboardController::class, 'updatePayoutNotice'])->name('payout-notice.update');
    Route::post('/payout-requests/{id}/status', [AdminDashboardController::class, 'updatePayoutRequestStatus'])->name('payout-requests.status');
    Route::get('/customer-wallet', [\App\Http\Controllers\Admin\AdminCustomerWalletController::class, 'index'])->name('customer-wallet');
    Route::post('/customer-wallet/adjust', [\App\Http\Controllers\Admin\AdminCustomerWalletController::class, 'adjust'])->name('customer-wallet.adjust');
    Route::post('/customer-wallet/settings', [\App\Http\Controllers\Admin\AdminCustomerWalletController::class, 'updateSettings'])->name('customer-wallet.settings');
    Route::get('/vendor-badges', [AdminDashboardController::class, 'vendorBadges'])->name('vendor-badges');
    Route::post('/vendor-badges/recompute', [AdminDashboardController::class, 'recomputeVendorBadges'])->name('vendor-badges.recompute');
    Route::post('/vendor-badges/{shop}/recompute', [AdminDashboardController::class, 'recomputeSingleVendorBadge'])->name('vendor-badges.recompute-single');
    Route::post('/vendor-badges/{shop}/grant', [AdminDashboardController::class, 'grantVendorBadge'])->name('vendor-badges.grant');
    Route::delete('/vendor-badges/{shop}/{badgeId}/remove', [AdminDashboardController::class, 'removeVendorBadge'])->name('vendor-badges.remove');
    Route::get('/vendor-landing-page', fn() => Inertia::render('Admin/VendorLandingPageCms'))->name('vendor-landing-page');
    Route::get('/appearance/themes-effects', [App\Http\Controllers\Admin\ThemeController::class, 'index'])->name('appearance.themes-effects');
    Route::post('/appearance/themes-effects', [App\Http\Controllers\Admin\ThemeController::class, 'update'])->name('appearance.themes-effects.update');
    Route::post('/admin/appearance/themes-effects', [App\Http\Controllers\Admin\ThemeController::class, 'update']);

    Route::get('/shops', [AdminDashboardController::class, 'shops'])->name('shops');
    Route::match(['get', 'post'], '/shops/{shop}/impersonate', [AdminDashboardController::class, 'impersonateShop'])->name('shops.impersonate');
    Route::post('/shops/{shop}/update-status', [AdminDashboardController::class, 'updateStatus'])->name('shops.updateStatus');
    Route::post('/shops/{shop}/reject', [AdminDashboardController::class, 'rejectShop'])->name('shops.reject');
    Route::post('/shops/{shop}/suspend', [AdminDashboardController::class, 'suspendShop'])->name('shops.suspend');
    Route::post('/shops/{shop}/approve', [AdminDashboardController::class, 'approveShop'])->name('shops.approve');
    Route::delete('/shops/{shop}', [AdminDashboardController::class, 'destroyShop'])->name('shops.destroy');

    Route::get('/products', [AdminDashboardController::class, 'products'])->name('products');
    Route::get('/products/create', [AdminDashboardController::class, 'createProduct'])->name('products.create');
    Route::post('/products', [AdminProductController::class, 'store'])->name('admin.products.store');
    Route::get('/products/add', fn() => Inertia::render('Admin/AddProduct'));
    Route::get('/products/{product}/edit', [AdminDashboardController::class, 'editProduct'])->name('admin.products.edit');
    Route::post('/products/{product}/toggle', [AdminDashboardController::class, 'toggleProduct'])->name('products.toggle');
    Route::post('/products/{product}/toggle-guruz-special', [AdminProductController::class, 'toggleGuruzSpecial'])->name('admin.products.toggle-guruz-special');
    Route::post('/products/{product}', [AdminProductController::class, 'update'])->name('admin.products.update'); // Using POST instead of PUT because of FormData file uploads
    Route::delete('/products/{product}', [AdminProductController::class, 'destroy'])->name('admin.products.destroy');

    // Reports
    Route::get('/reports/all', [\App\Http\Controllers\Admin\AdminReportController::class, 'index'])->name('reports.all');
    Route::get('/reports/export', [\App\Http\Controllers\Admin\AdminReportController::class, 'exportCsv'])->name('reports.export');
    Route::get('/analytics/visitors', [\App\Http\Controllers\Admin\AdminAnalyticsController::class, 'visitors'])->name('analytics.visitors');

    // Database Backup
    Route::get('/system/backups', [\App\Http\Controllers\Admin\AdminBackupController::class, 'index'])->name('system.backups');
    Route::post('/system/backups/create', [\App\Http\Controllers\Admin\AdminBackupController::class, 'create'])->name('system.backups.create');
    Route::post('/system/backups/restore', [\App\Http\Controllers\Admin\AdminBackupController::class, 'restore'])->name('system.backups.restore');
    Route::get('/system/backups/{filename}/download', [\App\Http\Controllers\Admin\AdminBackupController::class, 'download'])->name('system.backups.download');
    Route::delete('/system/backups/{filename}', [\App\Http\Controllers\Admin\AdminBackupController::class, 'destroy'])->name('system.backups.destroy');


    // Advanced SEO Management
    Route::get('/seo/tools', [\App\Http\Controllers\Admin\AdminSeoController::class, 'index'])->name('seo.tools');
    Route::post('/seo/tools/global', [\App\Http\Controllers\Admin\AdminSeoController::class, 'updateGlobal'])->name('seo.tools.global');
    Route::post('/seo/sitemap/generate', [\App\Http\Controllers\Admin\AdminSeoController::class, 'generateSitemap'])->name('seo.sitemap.generate');

    Route::get('/cms', [AdminCmsController::class, 'index'])->name('cms');
    Route::post('/cms/slides', [AdminCmsController::class, 'storeSlide'])->name('cms.slides.store');
    Route::delete('/cms/slides/{slide}', [AdminCmsController::class, 'destroySlide'])->name('cms.slides.destroy');
    Route::post('/cms/marquees', [AdminCmsController::class, 'storeMarquee'])->name('cms.marquees.store');

    Route::get('/settings', [AdminSystemSettingsController::class, 'settings'])->name('settings');
    Route::post('/settings', [AdminSystemSettingsController::class, 'updateSettings'])->name('settings.update');

    Route::get('/integrations', [AdminSystemSettingsController::class, 'integrations'])->name('integrations');
    Route::post('/integrations', [AdminSystemSettingsController::class, 'updateIntegrations'])->name('integrations.update');

    // Live Messenger / Customer Support Routes for Super Admin
    Route::get('/messages/unread-count', [\App\Http\Controllers\Admin\AdminMessageController::class, 'unreadCount'])->name('messages.unreadCount');
    Route::get('/messages', [\App\Http\Controllers\Admin\AdminMessageController::class, 'index'])->name('messages.index');
    Route::post('/messages', [\App\Http\Controllers\Admin\AdminMessageController::class, 'store'])->name('messages.store');
    Route::delete('/messages/thread/{id}', [\App\Http\Controllers\Admin\AdminMessageController::class, 'deleteThread'])->name('messages.thread.destroy');
    Route::delete('/messages/user/{id}', [\App\Http\Controllers\Admin\AdminMessageController::class, 'deleteUser'])->name('messages.user.destroy');
    Route::delete('/messages/message/{id}', [\App\Http\Controllers\Admin\AdminMessageController::class, 'deleteMessage'])->name('messages.message.destroy');

    // Dynamic Admin Fallback for 100% functional sub-menu coverage
    Route::get('/{section}/{feature?}', function ($section, $feature = null) {
        $formattedTitle = ucwords(str_replace(['-', '_'], ' ', $feature ?: $section));
        $formattedCategory = ucwords(str_replace(['-', '_'], ' ', $section));

        // Dynamically build the component path based on URL segments
        $segments = explode('/', ltrim($section . ($feature ? '/' . $feature : ''), '/'));
        $componentParts = array_map(function($segment) {
            return str_replace(' ', '', ucwords(str_replace(['-', '_'], ' ', $segment)));
        }, $segments);
        
        $componentPath = 'Admin/' . implode('/', $componentParts);
        $fullPathTsx = resource_path("js/Pages/{$componentPath}.tsx");
        $fullPathJsx = resource_path("js/Pages/{$componentPath}.jsx");

        if (file_exists($fullPathTsx) || file_exists($fullPathJsx)) {
            return Inertia::render($componentPath);
        }
        
        return Inertia::render('Admin/FeaturePage', [
            'title'       => $formattedTitle,
            'category'    => $formattedCategory,
            'description' => "Manage $formattedTitle configurations and system parameters.",
        ]);
    })->where('section', '.*');
});

// ─── Payment Callbacks ────────────────────────────────────────────────────
Route::prefix('payment')->name('payment.')->group(function () {
    Route::get('/sslcommerz/success', fn() => redirect()->route('home')->with('success', 'Payment successful!'));
    Route::get('/sslcommerz/fail', fn() => redirect()->route('cart')->with('error', 'Payment failed!'));
    Route::get('/bkash/callback', fn() => redirect()->route('home')->with('success', 'bKash Payment Completed!'));
});

Route::post('/api/ai/generate-product', [\App\Http\Controllers\Api\AiController::class, 'generateProduct']);
Route::post('/api/ai/generate-description', [\App\Http\Controllers\Api\AiController::class, 'generateDescription']);

Route::post('/subscribe', [\App\Http\Controllers\Admin\SubscriberController::class, 'store'])->name('subscribe');

Route::get('/page/{slug}', [\App\Http\Controllers\PageController::class, 'show'])->name('page.show');

// ─── Public Live Chat Messenger Endpoints ─────────────────────────────────
Route::prefix('api/live-chat')->group(function () {
    Route::get('/thread', [\App\Http\Controllers\Api\LiveChatController::class, 'getThread']);
    Route::post('/register-lead', [\App\Http\Controllers\Api\LiveChatController::class, 'registerLead']);
    Route::post('/send', [\App\Http\Controllers\Api\LiveChatController::class, 'sendMessage']);
    Route::get('/poll', [\App\Http\Controllers\Api\LiveChatController::class, 'poll']);
    Route::post('/upload', [\App\Http\Controllers\Api\LiveChatController::class, 'uploadAttachment']);
});
