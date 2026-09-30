<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\SellerWallet;
use App\Models\VendorKyc;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class SellerFinanceController extends Controller
{
    private function ensureBankingColumnsExist()
    {
        try {
            if (!Schema::hasTable('vendor_kycs')) {
                Schema::create('vendor_kycs', function (Blueprint $table) {
                    $table->id();
                    $table->unsignedBigInteger('shop_id')->nullable();
                    $table->unsignedBigInteger('user_id')->nullable();
                    $table->string('nid_number')->nullable();
                    $table->string('trade_license_number')->nullable();
                    $table->string('bank_name')->nullable();
                    $table->string('account_name')->nullable();
                    $table->string('account_number')->nullable();
                    $table->string('branch_name')->nullable();
                    $table->string('routing_number')->nullable();
                    $table->string('status')->default('Pending');
                    $table->timestamps();
                });
            }
        } catch (\Throwable $e) {
            // ignore
        }
    }

    public function banking(Request $request)
    {
        $this->ensureBankingColumnsExist();

        $user = $request->user();
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

        $kyc = VendorKyc::where('shop_id', $shop ? $shop->id : 0)->first();

        // If no bank details saved yet, keep kyc null so form is clean and fresh
        if (!$kyc && $shop) {
            $kyc = null;
        }

        return Inertia::render('Seller/Banking', [
            'shop' => $shop,
            'kyc'  => $kyc,
        ]);
    }

    public function updateBanking(Request $request)
    {
        $this->ensureBankingColumnsExist();

        $user = $request->user();
        $shop = $user ? $user->shop : null;

        $request->validate([
            'bank_name'      => 'required|string|max:255',
            'account_name'   => 'required|string|max:255',
            'account_number' => 'required|string|max:255',
            'branch_name'    => 'nullable|string|max:255',
            'routing_number' => 'nullable|string|max:255',
        ]);

        VendorKyc::updateOrCreate(
            ['shop_id' => $shop ? $shop->id : 1],
            [
                'user_id'        => $user ? $user->id : 1,
                'bank_name'      => $request->bank_name,
                'account_name'   => $request->account_name,
                'account_number' => $request->account_number,
                'branch_name'    => $request->branch_name,
                'routing_number' => $request->routing_number,
                'status'         => 'Approved',
            ]
        );

        return redirect()->back()->with('success', 'Banking and payout account details updated successfully!');
    }

    public function profitLoss(Request $request)
    {
        $shop = $request->user()->shop;

        if (!$shop) {
            return redirect()->route('seller.dashboard');
        }

        // Settled orders (commission already calculated and saved in DB)
        $settled = Order::where('shop_id', $shop->id)
            ->where('status', 'delivered')
            ->whereNotNull('commission_settled_at')
            ->selectRaw('
                COALESCE(SUM(total), 0)              as gross_sales,
                COALESCE(SUM(commission_amount), 0)  as total_commission,
                COALESCE(SUM(courier_charge), 0)     as total_courier_charge,
                COALESCE(SUM(vendor_net_earning), 0) as total_net_earning,
                COUNT(*)                             as order_count
            ')->first();

        // Unsettled delivered orders (old orders before this feature)
        $unsettled = Order::where('shop_id', $shop->id)
            ->where('status', 'delivered')
            ->whereNull('commission_settled_at')
            ->selectRaw('COALESCE(SUM(total), 0) as gross_sales, COUNT(*) as order_count')
            ->first();

        $defaultRate     = (float) ($shop->commission_rate ?: \App\Models\SiteSetting::get('default_commission_rate', '10'));
        $unsettledGross  = (float) ($unsettled->gross_sales ?? 0);
        $unsettledComm   = round($unsettledGross * $defaultRate / 100, 2);
        $unsettledNet    = round($unsettledGross - $unsettledComm, 2);

        $totalRevenue       = (float) ($settled->gross_sales ?? 0)        + $unsettledGross;
        $totalOrders        = (int)   ($settled->order_count ?? 0)         + (int) ($unsettled->order_count ?? 0);
        $totalCommission    = (float) ($settled->total_commission ?? 0)    + $unsettledComm;
        $totalCourierCharge = (float) ($settled->total_courier_charge ?? 0);
        $netProfit          = (float) ($settled->total_net_earning ?? 0)   + $unsettledNet;

        // Per-order breakdown for the table
        $orderBreakdown = Order::where('shop_id', $shop->id)
            ->where('status', 'delivered')
            ->latest()
            ->get(['id', 'order_number', 'total', 'shipping_fee', 'commission_rate',
                   'commission_amount', 'courier_charge', 'vendor_net_earning',
                   'commission_settled_at', 'created_at'])
            ->map(function ($o) use ($defaultRate) {
                $gross     = (float) $o->total;
                $rate      = $o->commission_settled_at ? (float) $o->commission_rate : $defaultRate;
                $comm      = $o->commission_settled_at ? (float) $o->commission_amount : round($gross * $rate / 100, 2);
                $courier   = $o->commission_settled_at ? (float) $o->courier_charge  : (float) $o->shipping_fee;
                $net       = $o->commission_settled_at ? (float) $o->vendor_net_earning : round($gross - $comm, 2);
                return [
                    'order_number'    => $o->order_number,
                    'gross'           => $gross,
                    'commission_rate' => $rate,
                    'commission'      => $comm,
                    'courier_charge'  => $courier,
                    'net_earning'     => $net,
                    'settled'         => (bool) $o->commission_settled_at,
                    'date'            => $o->created_at?->format('d M Y'),
                ];
            });

        return Inertia::render('Seller/ProfitLoss', [
            'totalRevenue'       => $totalRevenue,
            'totalOrders'        => $totalOrders,
            'commission'         => $totalCommission,
            'courierCharge'      => $totalCourierCharge,
            'netProfit'          => $netProfit,
            'commissionRate'     => $defaultRate,
            'orderBreakdown'     => $orderBreakdown,
        ]);
    }

    public function kyc(Request $request)
    {
        $shop = $request->user()->shop;
        $kyc = VendorKyc::where('shop_id', $shop->id ?? 0)
            ->orWhere('user_id', $request->user()->id)
            ->latest()
            ->first();

        return Inertia::render('Seller/Kyc', [
            'kyc' => $kyc,
        ]);
    }

    public function updateKyc(Request $request)
    {
        $request->validate([
            'nid_number'           => 'required|string|max:50',
            'trade_license_number' => 'nullable|string|max:50',
            'nid_front'            => 'nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:20480',
            'nid_back'             => 'nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:20480',
            'trade_license'        => 'nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:20480',
            'bank_statement'       => 'nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:20480',
        ]);

        $user = $request->user();
        $shop = $user->shop;

        if (!$shop) {
            $shop = \App\Models\Shop::create([
                'user_id' => $user->id,
                'name'    => ($user->name ?? 'Vendor') . "'s Shop",
                'slug'    => \Illuminate\Support\Str::slug(($user->name ?? 'Vendor') . "-shop-" . $user->id),
            ]);
        }

        $kyc = VendorKyc::firstOrNew(['shop_id' => $shop->id]);
        $kyc->user_id = $user->id;
        $kyc->nid_number = $request->nid_number;
        if ($request->filled('trade_license_number')) {
            $kyc->trade_license_number = $request->trade_license_number;
        }
        $kyc->status = 'Pending';
        $kyc->rejection_reason = null;

        if ($request->hasFile('nid_front')) {
            if ($kyc->nid_front_image) {
                \App\Services\StorageHelper::deletePublicly($kyc->nid_front_image);
            }
            $path = \App\Services\StorageHelper::storePublicly($request->file('nid_front'), 'kyc');
            $kyc->nid_front_image = '/storage/' . ltrim($path, '/');
        }

        if ($request->hasFile('nid_back')) {
            if ($kyc->nid_back_image) {
                \App\Services\StorageHelper::deletePublicly($kyc->nid_back_image);
            }
            $path = \App\Services\StorageHelper::storePublicly($request->file('nid_back'), 'kyc');
            $kyc->nid_back_image = '/storage/' . ltrim($path, '/');
        }

        if ($request->hasFile('trade_license')) {
            if ($kyc->trade_license_image) {
                \App\Services\StorageHelper::deletePublicly($kyc->trade_license_image);
            }
            $path = \App\Services\StorageHelper::storePublicly($request->file('trade_license'), 'kyc');
            $kyc->trade_license_image = '/storage/' . ltrim($path, '/');
        }

        if ($request->hasFile('bank_statement')) {
            if ($kyc->bank_statement_image) {
                \App\Services\StorageHelper::deletePublicly($kyc->bank_statement_image);
            }
            $path = \App\Services\StorageHelper::storePublicly($request->file('bank_statement'), 'kyc');
            $kyc->bank_statement_image = '/storage/' . ltrim($path, '/');
        }

        $kyc->save();

        return back()->with('success', 'আপনার কেওয়াইসি (KYC) ভেরিফিকেশন সফলভাবে সাবমিট হয়েছে!');
    }

    public function fraudCheck(Request $request)
    {
        $user = $request->user();
        $shop = $user ? $user->shop : null;

        $searchPhone = $request->query('phone', '');
        $result = null;

        if (!empty($searchPhone)) {
            $cleanedPhone = preg_replace('/[^0-9]/', '', $searchPhone);

            $ordersCount = Order::where('customer_phone', 'like', "%{$cleanedPhone}%")->count();
            $cancelledCount = Order::where('customer_phone', 'like', "%{$cleanedPhone}%")->where('status', 'cancelled')->count();
            $returnedCount = Order::where('customer_phone', 'like', "%{$cleanedPhone}%")->where('status', 'returned')->count();
            $deliveredCount = Order::where('customer_phone', 'like', "%{$cleanedPhone}%")->where('status', 'delivered')->count();

            $successRate = $ordersCount > 0 ? round(($deliveredCount / $ordersCount) * 100) : 100;

            $result = [
                'phone' => $searchPhone,
                'total_orders' => $ordersCount,
                'successful_orders' => $deliveredCount,
                'canceled_orders' => $cancelledCount + $returnedCount,
                'trust_score' => $successRate,
            ];
        }

        return Inertia::render('Seller/FraudCheck', [
            'shop' => $shop,
            'phone' => $searchPhone,
            'result' => $result,
        ]);
    }
}
