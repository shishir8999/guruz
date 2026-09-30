<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminFinanceController extends Controller
{
    public function payments(Request $request)
    {
        // Fetch real payment transactions, optionally filtered by order number or status
        $query = PaymentTransaction::with('order.user')->latest();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('order_id', 'like', "%{$search}%")
                  ->orWhere('transaction_id', 'like', "%{$search}%");
        }

        $payments = $query->paginate(20)->through(function ($p) {
            return [
                'id' => $p->id,
                'order_number' => $p->order ? $p->order->order_number : 'N/A',
                'customer_name' => ($p->order && $p->order->user) ? $p->order->user->name : 'Guest',
                'amount' => $p->amount,
                'gateway' => $p->gateway,
                'date' => $p->created_at->format('Y-m-d H:i'),
                'status' => ucfirst($p->status),
            ];
        });

        // Calculate total collected for completed payments
        $totalCollected = PaymentTransaction::where('status', 'completed')->sum('amount');
        $totalCount = PaymentTransaction::where('status', 'completed')->count();

        return Inertia::render('Admin/PaymentHistory', [
            'payments' => $payments,
            'summary' => [
                'totalCollected' => $totalCollected,
                'totalCount' => $totalCount,
            ]
        ]);
    }

    public function invoices(Request $request)
    {
        $orders = Order::with('user')->whereIn('status', ['processing', 'shipped', 'delivered'])->latest()->paginate(20);
        return Inertia::render('Admin/InvoicesPage', [
            'orders' => $orders
        ]);
    }

    public function downloadInvoice(Request $request, $orderNumber)
    {
        $order = Order::with(['user', 'shop', 'items.product'])->where('order_number', $orderNumber)->firstOrFail();
        
        $siteLogo = \App\Models\SiteSetting::get('site_logo', '');
        if (empty($siteLogo)) {
            $siteLogo = \App\Models\SiteSetting::get('invoice_logo', '');
        }

        $shop = $order->shop;
        $vendorLogo = $shop ? ($shop->logo_url ?? $shop->logo) : null;
        $vendorShopName = $shop ? $shop->name : 'Guruz Marketplace';

        $formatImage = function($path) {
            if (empty($path)) return null;
            if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                return $path;
            }
            $cleanPath = ltrim(str_replace(['public/', 'storage/'], '', $path), '/');
            if (file_exists(public_path('storage/' . $cleanPath))) {
                return asset('storage/' . $cleanPath);
            }
            if (file_exists(public_path($path))) {
                return asset($path);
            }
            return asset('storage/' . $cleanPath);
        };

        $siteLogoUrl = $formatImage($siteLogo);
        $vendorLogoUrl = $formatImage($vendorLogo);

        $settings = [
            'site_logo' => $siteLogoUrl,
            'vendor_logo' => $vendorLogoUrl,
            'vendor_name' => $vendorShopName,
            'logo' => $siteLogoUrl,
            'color' => \App\Models\SiteSetting::get('invoice_color', '#7c3aed'),
            'company_info' => $shop ? "{$shop->name}\nOfficial Vendor Store\nPhone: " . ($shop->phone ?? '01700000000') : \App\Models\SiteSetting::get('invoice_company_info', "Guruz Official Store\nUttara, Dhaka\nPhone: 01700000000\nEmail: contact@guruz.com"),
            'terms' => \App\Models\SiteSetting::get('invoice_terms', "Thanks for your business.\nReturns are accepted within 7 days."),
            'watermark' => \App\Models\SiteSetting::get('invoice_watermark', ''),
        ];
        
        $lang = $request->query('lang', 'en');

        if ($request->has('download')) {
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.invoice', compact('order', 'settings', 'lang'))
                ->setOption('isRemoteEnabled', true)
                ->setOption('isHtml5ParserEnabled', true);
            return $pdf->download("invoice-{$order->order_number}.pdf");
        }

        return view('pdf.invoice', compact('order', 'settings', 'lang'));
    }

    public function invoiceSettings()
    {
        $settings = [
            'logo' => \App\Models\SiteSetting::get('invoice_logo', ''),
            'color' => \App\Models\SiteSetting::get('invoice_color', '#7c3aed'),
            'company_info' => \App\Models\SiteSetting::get('invoice_company_info', "Guruz Official Store\nUttara, Dhaka\nPhone: 01700000000\nEmail: contact@guruz.com"),
            'terms' => \App\Models\SiteSetting::get('invoice_terms', "Thanks for your business.\nReturns are accepted within 7 days."),
            'watermark' => \App\Models\SiteSetting::get('invoice_watermark', ''),
        ];

        return Inertia::render('Admin/InvoiceSettingsPage', [
            'settings' => $settings
        ]);
    }

    public function updateInvoiceSettings(Request $request)
    {
        $data = $request->validate([
            'logo' => 'nullable|image|mimes:png,jpg,jpeg|max:2048',
            'color' => 'required|string',
            'company_info' => 'nullable|string',
            'terms' => 'nullable|string',
            'watermark' => 'nullable|string|max:50',
        ]);

        if ($request->hasFile('logo')) {
            $extension = $request->file('logo')->extension();
            $path = $request->file('logo')->storeAs('public/settings', 'invoice_logo.' . $extension);
            \App\Models\SiteSetting::set('invoice_logo', str_replace('public/', 'storage/', $path));
        }

        \App\Models\SiteSetting::set('invoice_color', $data['color']);
        \App\Models\SiteSetting::set('invoice_company_info', $data['company_info'] ?? '');
        \App\Models\SiteSetting::set('invoice_terms', $data['terms'] ?? '');
        \App\Models\SiteSetting::set('invoice_watermark', $data['watermark'] ?? '');

        return back()->with('success', 'Invoice settings updated successfully!');
    }

    public function refunds(Request $request)
    {
        $refunds = Order::with('user')->whereIn('status', ['return_requested', 'returned', 'refunded'])->latest()->paginate(20);
        return Inertia::render('Admin/RefundRequests', [
            'refunds' => $refunds
        ]);
    }

    public function billingPlans(Request $request)
    {
        $plans = \App\Models\BillingPlan::orderBy('sort_order')->orderBy('id')->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'price' => (float) $p->price,
                'billing_cycle' => $p->billing_cycle,
                'max_products' => (int) $p->max_products,
                'max_staff' => (int) $p->max_staff,
                'active' => (bool) $p->is_active,
            ];
        });

        return Inertia::render('Admin/BillingPlans', [
            'initialPlans' => $plans,
        ]);
    }

    public function storeBillingPlan(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'billing_cycle' => 'required|string|in:Monthly,Yearly',
            'max_products' => 'required|integer|min:1',
            'max_staff' => 'required|integer|min:0',
        ]);

        \App\Models\BillingPlan::create([
            'name' => $request->name,
            'price' => $request->price,
            'billing_cycle' => $request->billing_cycle,
            'max_products' => $request->max_products,
            'max_staff' => $request->max_staff,
            'is_active' => true,
            'sort_order' => (\App\Models\BillingPlan::max('sort_order') ?? 0) + 1,
        ]);

        return back()->with('success', 'নতুন সাবস্ক্রিপশন প্ল্যান সফলভাবে তৈরি করা হয়েছে!');
    }

    public function updateBillingPlan(Request $request, $id)
    {
        $plan = \App\Models\BillingPlan::findOrFail($id);
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'billing_cycle' => 'required|string|in:Monthly,Yearly',
            'max_products' => 'required|integer|min:1',
            'max_staff' => 'required|integer|min:0',
        ]);

        $plan->update([
            'name' => $request->name,
            'price' => $request->price,
            'billing_cycle' => $request->billing_cycle,
            'max_products' => $request->max_products,
            'max_staff' => $request->max_staff,
        ]);

        return back()->with('success', 'প্ল্যান সফলভাবে আপডেট করা হয়েছে!');
    }

    public function toggleBillingPlan($id)
    {
        $plan = \App\Models\BillingPlan::findOrFail($id);
        $plan->update(['is_active' => !$plan->is_active]);

        return back()->with('success', 'প্ল্যানের স্ট্যাটাস পরিবর্তন করা হয়েছে!');
    }

    public function destroyBillingPlan($id)
    {
        $plan = \App\Models\BillingPlan::findOrFail($id);
        $plan->delete();

        return back()->with('success', 'প্ল্যান সফলভাবে মুছে ফেলা হয়েছে!');
    }

    public function gatewaySettings()
    {
        $gateways = \App\Models\PaymentGateway::orderBy('sort_order')->get()->map(function ($gw) {
            return [
                'id' => $gw->id,
                'code' => $gw->code,
                'name' => $gw->name,
                'name_bn' => $gw->name_bn,
                'logo_url' => $gw->logo_url ? (str_starts_with($gw->logo_url, 'http') ? $gw->logo_url : '/' . ltrim($gw->logo_url, '/')) : null,
                'is_active' => (bool) $gw->is_active,
                'gateway_type' => $gw->gateway_type ?? 'manual',
                'environment' => $gw->environment ?? 'live',
                'api_key' => $gw->api_key ?? '',
                'secret_key' => $gw->secret_key ?? '',
                'app_key' => $gw->app_key ?? '',
                'app_secret' => $gw->app_secret ?? '',
                'merchant_id' => $gw->merchant_id ?? '',
                'token_id' => $gw->token_id ?? '',
                'webhook_secret' => $gw->webhook_secret ?? '',
                'callback_url' => $gw->callback_url ?? '',
                'extra_config' => $gw->extra_config ?? [],
                'account_number' => $gw->account_number ?? '',
                'account_type' => $gw->account_type ?? 'Personal',
                'qr_image_url' => $gw->qr_image_url ? (str_starts_with($gw->qr_image_url, 'http') ? $gw->qr_image_url : '/' . ltrim($gw->qr_image_url, '/')) : null,
                'bank_name' => $gw->bank_name ?? '',
                'branch_name' => $gw->branch_name ?? '',
                'account_holder_name' => $gw->account_holder_name ?? '',
                'routing_number' => $gw->routing_number ?? '',
                'instructions' => $gw->instructions ?? '',
                'sort_order' => $gw->sort_order ?? 0,
            ];
        });

        return Inertia::render('Admin/GatewaySettings', [
            'gateways' => $gateways
        ]);
    }

    public function updateGatewaySettings(Request $request)
    {
        $gatewaysData = $request->input('gateways', []);

        foreach ($gatewaysData as $code => $data) {
            $gateway = \App\Models\PaymentGateway::where('code', $code)->first();
            if (!$gateway) {
                $gateway = new \App\Models\PaymentGateway();
                $gateway->code = $code;
                $gateway->name = ucfirst($code);
            }

            if (isset($data['is_active'])) {
                $gateway->is_active = filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN);
            }
            if (isset($data['name'])) $gateway->name = $data['name'];
            if (isset($data['name_bn'])) $gateway->name_bn = $data['name_bn'];
            if (isset($data['gateway_type'])) $gateway->gateway_type = $data['gateway_type'];
            if (isset($data['environment'])) $gateway->environment = $data['environment'];
            if (isset($data['api_key'])) $gateway->api_key = $data['api_key'];
            if (isset($data['secret_key'])) $gateway->secret_key = $data['secret_key'];
            if (isset($data['app_key'])) $gateway->app_key = $data['app_key'];
            if (isset($data['app_secret'])) $gateway->app_secret = $data['app_secret'];
            if (isset($data['merchant_id'])) $gateway->merchant_id = $data['merchant_id'];
            if (isset($data['token_id'])) $gateway->token_id = $data['token_id'];
            if (isset($data['webhook_secret'])) $gateway->webhook_secret = $data['webhook_secret'];
            if (isset($data['callback_url'])) $gateway->callback_url = $data['callback_url'];
            if (isset($data['extra_config'])) {
                $gateway->extra_config = is_array($data['extra_config']) ? $data['extra_config'] : json_decode($data['extra_config'], true);
            }
            if (isset($data['account_number'])) $gateway->account_number = $data['account_number'];
            if (isset($data['account_type'])) $gateway->account_type = $data['account_type'];
            if (isset($data['bank_name'])) $gateway->bank_name = $data['bank_name'];
            if (isset($data['branch_name'])) $gateway->branch_name = $data['branch_name'];
            if (isset($data['account_holder_name'])) $gateway->account_holder_name = $data['account_holder_name'];
            if (isset($data['routing_number'])) $gateway->routing_number = $data['routing_number'];
            if (isset($data['instructions'])) $gateway->instructions = $data['instructions'];
            if (isset($data['sort_order'])) $gateway->sort_order = (int) $data['sort_order'];

            // Logo URL preservation or file / base64 upload
            if (array_key_exists('logo_url', $data)) {
                $gateway->logo_url = !empty($data['logo_url']) ? $data['logo_url'] : null;
            }

            $logoFile = null;
            if ($request->hasFile("gateways.{$code}.logo_file")) {
                $logoFile = $request->file("gateways.{$code}.logo_file");
            } elseif ($request->hasFile("gateways")) {
                $allGatewaysFiles = $request->file("gateways");
                if (isset($allGatewaysFiles[$code]['logo_file'])) {
                    $logoFile = $allGatewaysFiles[$code]['logo_file'];
                }
            }

            if ($logoFile && $logoFile->isValid()) {
                $filename = time() . '_' . $code . '_logo.' . $logoFile->getClientOriginalExtension();
                $logoFile->storeAs('payment_gateways', $filename, 'public');
                
                $destDir = public_path('storage/payment_gateways');
                if (!file_exists($destDir)) {
                    @mkdir($destDir, 0777, true);
                }
                @copy($logoFile->getRealPath(), $destDir . DIRECTORY_SEPARATOR . $filename);

                $gateway->logo_url = '/storage/payment_gateways/' . $filename;
            } elseif (!empty($data['logo_base64']) && str_starts_with($data['logo_base64'], 'data:image')) {
                $dataUrl = $data['logo_base64'];
                $parts = explode(',', $dataUrl);
                $base64Data = count($parts) > 1 ? $parts[1] : $parts[0];
                $decoded = base64_decode($base64Data);
                if ($decoded !== false) {
                    $ext = 'png';
                    if (str_contains($dataUrl, 'image/jpeg') || str_contains($dataUrl, 'image/jpg')) $ext = 'jpg';
                    elseif (str_contains($dataUrl, 'image/webp')) $ext = 'webp';
                    elseif (str_contains($dataUrl, 'image/svg+xml')) $ext = 'svg';

                    $filename = time() . '_' . $code . '_logo.' . $ext;
                    \Illuminate\Support\Facades\Storage::disk('public')->put('payment_gateways/' . $filename, $decoded);
                    
                    $destDir = public_path('storage/payment_gateways');
                    if (!file_exists($destDir)) {
                        @mkdir($destDir, 0777, true);
                    }
                    @file_put_contents($destDir . DIRECTORY_SEPARATOR . $filename, $decoded);

                    $gateway->logo_url = '/storage/payment_gateways/' . $filename;
                }
            } elseif (!empty($data['remove_logo'])) {
                $gateway->logo_url = null;
            }

            // QR code URL preservation or file / base64 upload
            if (array_key_exists('qr_image_url', $data)) {
                $gateway->qr_image_url = !empty($data['qr_image_url']) ? $data['qr_image_url'] : null;
            }

            $qrFile = null;
            if ($request->hasFile("gateways.{$code}.qr_file")) {
                $qrFile = $request->file("gateways.{$code}.qr_file");
            } elseif ($request->hasFile("gateways")) {
                $allGatewaysFiles = $request->file("gateways");
                if (isset($allGatewaysFiles[$code]['qr_file'])) {
                    $qrFile = $allGatewaysFiles[$code]['qr_file'];
                }
            }

            if ($qrFile && $qrFile->isValid()) {
                $filename = time() . '_' . $code . '_qr.' . $qrFile->getClientOriginalExtension();
                $qrFile->storeAs('payment_gateways', $filename, 'public');
                
                $destDir = public_path('storage/payment_gateways');
                if (!file_exists($destDir)) {
                    @mkdir($destDir, 0777, true);
                }
                @copy($qrFile->getRealPath(), $destDir . DIRECTORY_SEPARATOR . $filename);

                $gateway->qr_image_url = '/storage/payment_gateways/' . $filename;
            } elseif (!empty($data['qr_base64']) && str_starts_with($data['qr_base64'], 'data:image')) {
                $dataUrl = $data['qr_base64'];
                $parts = explode(',', $dataUrl);
                $base64Data = count($parts) > 1 ? $parts[1] : $parts[0];
                $decoded = base64_decode($base64Data);
                if ($decoded !== false) {
                    $ext = 'png';
                    if (str_contains($dataUrl, 'image/jpeg') || str_contains($dataUrl, 'image/jpg')) $ext = 'jpg';
                    elseif (str_contains($dataUrl, 'image/webp')) $ext = 'webp';

                    $filename = time() . '_' . $code . '_qr.' . $ext;
                    \Illuminate\Support\Facades\Storage::disk('public')->put('payment_gateways/' . $filename, $decoded);
                    
                    $destDir = public_path('storage/payment_gateways');
                    if (!file_exists($destDir)) {
                        @mkdir($destDir, 0777, true);
                    }
                    @file_put_contents($destDir . DIRECTORY_SEPARATOR . $filename, $decoded);

                    $gateway->qr_image_url = '/storage/payment_gateways/' . $filename;
                }
            } elseif (!empty($data['remove_qr'])) {
                $gateway->qr_image_url = null;
            }

            $gateway->save();
        }

        \Illuminate\Support\Facades\Cache::forget('active_payment_gateways');
        \Illuminate\Support\Facades\Cache::flush();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'পেমেন্ট গেটওয়ে সেটিংস এবং লোগো সফলভাবে সংরক্ষিত হয়েছে!'
            ]);
        }

        return back()->with('success', 'পেমেন্ট গেটওয়ে সেটিংস এবং লোগো সফলভাবে সংরক্ষিত হয়েছে!');
    }

    public function uploadGatewayLogo(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'logo' => 'required',
        ]);

        $code = $request->input('code');
        $gateway = \App\Models\PaymentGateway::where('code', $code)->first();
        if (!$gateway) {
            $gateway = new \App\Models\PaymentGateway();
            $gateway->code = $code;
            $gateway->name = ucfirst($code);
            $gateway->is_active = true;
        }

        $destDir = public_path('storage/payment_gateways');
        $storageDir = storage_path('app/public/payment_gateways');
        if (!file_exists($destDir)) @mkdir($destDir, 0777, true);
        if (!file_exists($storageDir)) @mkdir($storageDir, 0777, true);

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $filename = time() . '_' . $code . '_logo.' . $file->getClientOriginalExtension();
            $file->move($destDir, $filename);
            @copy($destDir . DIRECTORY_SEPARATOR . $filename, $storageDir . DIRECTORY_SEPARATOR . $filename);
            $gateway->logo_url = '/storage/payment_gateways/' . $filename;
        } elseif (is_string($request->input('logo')) && str_starts_with($request->input('logo'), 'data:image')) {
            $dataUrl = $request->input('logo');
            $parts = explode(',', $dataUrl);
            $base64Data = count($parts) > 1 ? $parts[1] : $parts[0];
            $decoded = base64_decode($base64Data);
            if ($decoded !== false) {
                $ext = 'png';
                if (str_contains($dataUrl, 'image/jpeg') || str_contains($dataUrl, 'image/jpg')) $ext = 'jpg';
                elseif (str_contains($dataUrl, 'image/webp')) $ext = 'webp';
                elseif (str_contains($dataUrl, 'image/svg+xml')) $ext = 'svg';

                $filename = time() . '_' . $code . '_logo.' . $ext;
                @file_put_contents($destDir . DIRECTORY_SEPARATOR . $filename, $decoded);
                @file_put_contents($storageDir . DIRECTORY_SEPARATOR . $filename, $decoded);
                $gateway->logo_url = '/storage/payment_gateways/' . $filename;
            }
        }

        $gateway->save();
        if ($code === 'manual_dropdown') {
            \App\Models\SiteSetting::set('gateway_manual_dropdown_logo', $gateway->logo_url);
        }
        \Illuminate\Support\Facades\Cache::forget('active_payment_gateways');
        \Illuminate\Support\Facades\Cache::flush();

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'code' => $code,
                'logo_url' => $gateway->logo_url,
                'message' => 'লোগো সফলভাবে আপলোড ও সেভ হয়েছে!'
            ]);
        }

        return back()->with('success', 'লোগো সফলভাবে আপলোড ও সেভ হয়েছে!');
    }

    public function uploadGatewayQr(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'qr' => 'required',
        ]);

        $code = $request->input('code');
        $gateway = \App\Models\PaymentGateway::where('code', $code)->first();
        if (!$gateway) {
            $gateway = new \App\Models\PaymentGateway();
            $gateway->code = $code;
            $gateway->name = ucfirst($code);
            $gateway->is_active = true;
        }

        $destDir = public_path('storage/payment_gateways');
        $storageDir = storage_path('app/public/payment_gateways');
        if (!file_exists($destDir)) @mkdir($destDir, 0777, true);
        if (!file_exists($storageDir)) @mkdir($storageDir, 0777, true);

        if ($request->hasFile('qr')) {
            $file = $request->file('qr');
            $filename = time() . '_' . $code . '_qr.' . $file->getClientOriginalExtension();
            $file->move($destDir, $filename);
            @copy($destDir . DIRECTORY_SEPARATOR . $filename, $storageDir . DIRECTORY_SEPARATOR . $filename);
            $gateway->qr_image_url = '/storage/payment_gateways/' . $filename;
        } elseif (is_string($request->input('qr')) && str_starts_with($request->input('qr'), 'data:image')) {
            $dataUrl = $request->input('qr');
            $parts = explode(',', $dataUrl);
            $base64Data = count($parts) > 1 ? $parts[1] : $parts[0];
            $decoded = base64_decode($base64Data);
            if ($decoded !== false) {
                $ext = 'png';
                if (str_contains($dataUrl, 'image/jpeg') || str_contains($dataUrl, 'image/jpg')) $ext = 'jpg';
                elseif (str_contains($dataUrl, 'image/webp')) $ext = 'webp';

                $filename = time() . '_' . $code . '_qr.' . $ext;
                @file_put_contents($destDir . DIRECTORY_SEPARATOR . $filename, $decoded);
                @file_put_contents($storageDir . DIRECTORY_SEPARATOR . $filename, $decoded);
                $gateway->qr_image_url = '/storage/payment_gateways/' . $filename;
            }
        }

        $gateway->save();
        \Illuminate\Support\Facades\Cache::forget('active_payment_gateways');
        \Illuminate\Support\Facades\Cache::flush();

        return response()->json([
            'success' => true,
            'code' => $code,
            'qr_image_url' => $gateway->qr_image_url,
            'message' => 'QR কোড সফলভাবে আপলোড ও সেভ হয়েছে!'
        ]);
    }

    public function removeGatewayLogo(Request $request)
    {
        $code = $request->input('code');
        $gateway = \App\Models\PaymentGateway::where('code', $code)->first();
        if ($gateway) {
            $gateway->logo_url = null;
            $gateway->save();
        }

        if ($code === 'manual_dropdown') {
            \App\Models\SiteSetting::set('gateway_manual_dropdown_logo', '');
        }

        \Illuminate\Support\Facades\Cache::forget('active_payment_gateways');
        \Illuminate\Support\Facades\Cache::flush();

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'code' => $code,
                'message' => 'লোগো সফলভাবে রিসেট করা হয়েছে!'
            ]);
        }

        return back()->with('success', 'লোগো সফলভাবে রিসেট করা হয়েছে!');
    }

    public function removeGatewayQr(Request $request)
    {
        $code = $request->input('code');
        $gateway = \App\Models\PaymentGateway::where('code', $code)->first();
        if ($gateway) {
            $gateway->qr_image_url = null;
            $gateway->save();
        }

        \Illuminate\Support\Facades\Cache::forget('active_payment_gateways');
        \Illuminate\Support\Facades\Cache::flush();

        return response()->json([
            'success' => true,
            'code' => $code,
            'message' => 'QR কোড সফলভাবে রিসেট করা হয়েছে!'
        ]);
    }

    public function createGateway(Request $request)
    {
        $data = $request->validate([
            'code'           => 'required|string|alpha_dash|unique:payment_gateways,code',
            'name'           => 'required|string|max:100',
            'name_bn'        => 'nullable|string|max:100',
            'gateway_type'   => 'required|in:manual,automated_api',
            'environment'    => 'nullable|in:sandbox,live',
            'account_number' => 'nullable|string|max:100',
            'account_type'   => 'nullable|string|max:50',
            'instructions'   => 'nullable|string',
            'is_active'      => 'nullable|boolean',
        ]);

        $maxSort = \App\Models\PaymentGateway::max('sort_order') ?? 0;

        $gateway = \App\Models\PaymentGateway::create([
            'code'           => strtolower($data['code']),
            'name'           => $data['name'],
            'name_bn'        => $data['name_bn'] ?: $data['name'],
            'gateway_type'   => $data['gateway_type'] ?: 'manual',
            'environment'    => $data['environment'] ?: 'live',
            'account_number' => $data['account_number'] ?? null,
            'account_type'   => $data['account_type'] ?: 'Personal',
            'instructions'   => $data['instructions'] ?? '',
            'is_active'      => $request->boolean('is_active', true),
            'sort_order'     => $maxSort + 1,
        ]);

        \Illuminate\Support\Facades\Cache::flush();

        return response()->json([
            'success' => true,
            'gateway' => $gateway,
            'message' => 'নতুন পেমেন্ট গেটওয়ে সফলভাবে তৈরি হয়েছে!'
        ]);
    }

    public function deleteGateway(Request $request, $code)
    {
        $gateway = \App\Models\PaymentGateway::where('code', $code)->first();
        if ($gateway) {
            $gateway->delete();
        }

        \Illuminate\Support\Facades\Cache::flush();

        return response()->json([
            'success' => true,
            'code'    => $code,
            'message' => 'পেমেন্ট গেটওয়ে মুছে ফেলা হয়েছে!'
        ]);
    }

    public function resetDefaultGateways(Request $request)
    {
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        \App\Models\PaymentGateway::truncate();
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $defaults = [
            [
                'code' => 'cod',
                'name' => 'Cash on Delivery',
                'name_bn' => 'ক্যাশ অন ডেলিভারি',
                'is_active' => true,
                'gateway_type' => 'manual',
                'environment' => 'live',
                'account_type' => 'Cash',
                'instructions' => 'ক্যাশ অন ডেলিভারি: পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধ করুন।',
                'sort_order' => 1,
            ],
            [
                'code' => 'bkash',
                'name' => 'bKash',
                'name_bn' => 'বিকাশ',
                'logo_url' => '/storage/payment_gateways/bkash.png',
                'is_active' => true,
                'gateway_type' => 'manual',
                'environment' => 'live',
                'account_type' => 'Merchant / Personal',
                'account_number' => '01700000000',
                'instructions' => 'বিকাশ অ্যাপ থেকে ‘Send Money’ বা ‘Payment’ করে TrxID ও প্রেরক নম্বর দিন।',
                'sort_order' => 2,
            ],
            [
                'code' => 'nagad',
                'name' => 'Nagad',
                'name_bn' => 'নগদ',
                'logo_url' => '/storage/payment_gateways/nagad.png',
                'is_active' => true,
                'gateway_type' => 'manual',
                'environment' => 'live',
                'account_type' => 'Merchant / Personal',
                'account_number' => '01700000000',
                'instructions' => 'নগদ অ্যাপ থেকে ‘Send Money’ বা ‘Merchant Pay’ সম্পন্ন করে TrxID ও প্রেরক নম্বর লিখুন।',
                'sort_order' => 3,
            ],
            [
                'code' => 'rocket',
                'name' => 'Rocket',
                'name_bn' => 'রকেট',
                'logo_url' => '/storage/payment_gateways/rocket.png',
                'is_active' => true,
                'gateway_type' => 'manual',
                'environment' => 'live',
                'account_type' => 'Personal',
                'account_number' => '01700000000-8',
                'instructions' => 'রকেট একাউন্ট থেকে সেন্ড মানি করে TrxID ও প্রেরক নম্বর নিচে প্রদান করুন।',
                'sort_order' => 4,
            ],
            [
                'code' => 'bangla_qr',
                'name' => 'Bangla QR',
                'name_bn' => 'বাংলা কিউআর',
                'logo_url' => '/storage/payment_gateways/bangla_qr.png',
                'is_active' => true,
                'gateway_type' => 'manual',
                'environment' => 'live',
                'account_type' => 'Merchant',
                'account_number' => '01700000000',
                'instructions' => 'বাংলাদেশ ব্যাংক অনুমোদিত বাংলা কিউআর: যেকোনো ব্যাংক বা বিকাশ/নগদ/রকেট অ্যাপের কিউআর স্ক্যানার দিয়ে স্ক্যান করে পেমেন্ট করুন।',
                'sort_order' => 5,
            ],
            [
                'code' => 'bank',
                'name' => 'Bank Transfer',
                'name_bn' => 'ব্যাংক ট্রান্সফার',
                'is_active' => true,
                'gateway_type' => 'manual',
                'environment' => 'live',
                'bank_name' => 'Islami Bank Bangladesh PLC / City Bank',
                'branch_name' => 'Uttara Branch, Dhaka',
                'account_holder_name' => 'Guruz BD Limited',
                'account_number' => '20501234567890',
                'routing_number' => '125272648',
                'account_type' => 'Corporate / Current',
                'instructions' => 'ব্যাংক অ্যাকাউন্টে টাকা জমা দিয়ে ডিপোজিট স্লিপ নম্বর বা ট্রানজেকশন রেফারেন্স আইডি নিচে প্রদান করুন।',
                'sort_order' => 6,
            ],
            [
                'code' => 'sslcommerz',
                'name' => 'SSLCommerz',
                'name_bn' => 'এসএসএল কমর্স',
                'is_active' => true,
                'gateway_type' => 'automated_api',
                'environment' => 'sandbox',
                'api_key' => 'testbox',
                'secret_key' => 'qwerty',
                'instructions' => 'SSLCommerz-এর মাধ্যমে ভিসা, মাস্টারকার্ড, বিকাশ, নগদ, রকেট সহ যেকোনো মাধ্যমে নিরাপদ অটোমেটেড পেমেন্ট সম্পন্ন করুন।',
                'sort_order' => 7,
            ],
            [
                'code' => 'eps',
                'name' => 'EPS (Easy Payment System)',
                'name_bn' => 'ইপস (Easy Payment System)',
                'is_active' => true,
                'gateway_type' => 'automated_api',
                'environment' => 'sandbox',
                'merchant_id' => 'EPS_DEMO_MERCHANT',
                'api_key' => 'EPS_DEMO_KEY',
                'secret_key' => 'EPS_DEMO_SECRET',
                'instructions' => 'EPS (Easy Payment System)-এর মাধ্যমে ভিসা, মাস্টারকার্ড, বিকাশ, নগদ, রকেট ও ৩০+ ব্যাংকের মাধ্যমে তাৎক্ষণিক পেমেন্ট করুন।',
                'sort_order' => 8,
            ],
            [
                'code' => 'aamarpay',
                'name' => 'AamarPay',
                'name_bn' => 'আমার পে',
                'is_active' => false,
                'gateway_type' => 'automated_api',
                'environment' => 'sandbox',
                'instructions' => 'AamarPay গেটওয়ের মাধ্যমে কার্ড ও মোবাইল ব্যাংকিংয়ে পেমেন্ট করুন।',
                'sort_order' => 9,
            ],
            [
                'code' => 'shurjopay',
                'name' => 'shurjoPay',
                'name_bn' => 'সূর্য পে',
                'is_active' => false,
                'gateway_type' => 'automated_api',
                'environment' => 'sandbox',
                'instructions' => 'shurjoPay গেটওয়ের মাধ্যমে ইনস্ট্যান্ট পেমেন্ট সম্পন্ন করুন।',
                'sort_order' => 9,
            ],
            [
                'code' => 'upi_india',
                'name' => 'India UPI',
                'name_bn' => 'ইউপিআই (ভারত)',
                'is_active' => false,
                'gateway_type' => 'manual',
                'environment' => 'live',
                'account_number' => 'guruzbd@upi',
                'account_type' => 'UPI ID',
                'instructions' => 'Pay to our UPI ID or scan QR code and submit 12-digit UTR Reference Number.',
                'sort_order' => 10,
            ],
        ];

        foreach ($defaults as $g) {
            \App\Models\PaymentGateway::create($g);
        }

        \Illuminate\Support\Facades\Cache::flush();

        return response()->json([
            'success' => true,
            'message' => 'সকল পেমেন্ট গেটওয়ে নতুনভাবে রিসেট ও সেটআপ করা হয়েছে!'
        ]);
    }

    public function transactions(Request $request)
    {
        $transactions = \App\Models\TransactionLog::latest()->get()->map(function ($txn) {
            return [
                'id' => $txn->txn_id,
                'date' => $txn->transaction_date ? $txn->transaction_date->format('Y-m-d H:i') : $txn->created_at->format('Y-m-d H:i'),
                'user' => $txn->user_name ?? ($txn->user ? $txn->user->name : 'N/A'),
                'amount' => (float)$txn->amount,
                'type' => $txn->type,
                'method' => $txn->method,
                'status' => $txn->status,
            ];
        });

        return Inertia::render('Admin/Finance/TransactionLog', [
            'initialTransactions' => $transactions
        ]);
    }
}


