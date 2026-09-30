<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\ShopAccountTransaction;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class SellerAccountController extends Controller
{
    private function ensureTableColumnsExist()
    {
        try {
            if (!Schema::hasTable('shop_account_transactions')) {
                Schema::create('shop_account_transactions', function (Blueprint $table) {
                    $table->id();
                    $table->unsignedBigInteger('shop_id')->nullable();
                    $table->unsignedBigInteger('user_id')->nullable();
                    $table->string('transaction_number');
                    $table->string('type'); // credit, debit, expense, commission
                    $table->string('category'); // sales, payout, admin_commission, shop_expense, refund
                    $table->string('title');
                    $table->string('reference_id')->nullable();
                    $table->decimal('amount', 12, 2)->default(0);
                    $table->decimal('balance_after', 12, 2)->default(0);
                    $table->string('status')->default('completed');
                    $table->text('notes')->nullable();
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

        // Seed demo financial transactions if empty
        if (ShopAccountTransaction::where('shop_id', $shopId)->count() === 0) {
            ShopAccountTransaction::create([
                'shop_id'            => $shopId,
                'user_id'            => $user ? $user->id : 1,
                'transaction_number' => 'TXN-8849201',
                'type'               => 'credit',
                'category'           => 'sales',
                'title'              => 'Order #ORD-9824 Customer Payment Cleared',
                'reference_id'       => 'ORD-9824',
                'amount'             => 28500.00,
                'balance_after'      => 28500.00,
                'status'             => 'completed',
                'notes'              => 'Cash on Delivery cleared by Super Admin Courier Dispatch.',
                'created_at'         => now()->subDays(5),
            ]);

            ShopAccountTransaction::create([
                'shop_id'            => $shopId,
                'user_id'            => $user ? $user->id : 1,
                'transaction_number' => 'TXN-8849202',
                'type'               => 'commission',
                'category'           => 'admin_commission',
                'title'              => 'Super Admin Commission Fee (5%)',
                'reference_id'       => 'COMM-9824',
                'amount'             => 1425.00,
                'balance_after'      => 27075.00,
                'status'             => 'completed',
                'notes'              => 'Platform service fee deducted.',
                'created_at'         => now()->subDays(5),
            ]);

            ShopAccountTransaction::create([
                'shop_id'            => $shopId,
                'user_id'            => $user ? $user->id : 1,
                'transaction_number' => 'TXN-8849203',
                'type'               => 'credit',
                'category'           => 'sales',
                'title'              => 'Order #ORD-9830 Online Bkash Payment',
                'reference_id'       => 'ORD-9830',
                'amount'             => 18200.00,
                'balance_after'      => 45275.00,
                'status'             => 'completed',
                'notes'              => 'Customer payment via bKash gateway.',
                'created_at'         => now()->subDays(3),
            ]);

            ShopAccountTransaction::create([
                'shop_id'            => $shopId,
                'user_id'            => $user ? $user->id : 1,
                'transaction_number' => 'TXN-8849204',
                'type'               => 'expense',
                'category'           => 'shop_expense',
                'title'              => 'Poly Bag & Bubble Wrap Supplies Purchase',
                'reference_id'       => 'EXP-1042',
                'amount'             => 2400.00,
                'balance_after'      => 42875.00,
                'status'             => 'completed',
                'notes'              => 'Packaging materials for 100 orders.',
                'created_at'         => now()->subDays(2),
            ]);

            ShopAccountTransaction::create([
                'shop_id'            => $shopId,
                'user_id'            => $user ? $user->id : 1,
                'transaction_number' => 'TXN-8849205',
                'type'               => 'debit',
                'category'           => 'payout',
                'title'              => 'Payout Withdrawal to City Bank Account',
                'reference_id'       => 'PO-2094',
                'amount'             => 20000.00,
                'balance_after'      => 22875.00,
                'status'             => 'completed',
                'notes'              => 'Approved and transferred by Super Admin.',
                'created_at'         => now()->subDays(1),
            ]);
        }

        $query = ShopAccountTransaction::where('shop_id', $shopId);

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('transaction_number', 'like', "%{$s}%")
                  ->orWhere('title', 'like', "%{$s}%")
                  ->orWhere('reference_id', 'like', "%{$s}%");
            });
        }

        $transactions = $query->latest()->get();

        // Calculate summary metrics
        $allTxns = ShopAccountTransaction::where('shop_id', $shopId)->get();
        $totalSales = $allTxns->where('category', 'sales')->sum('amount');
        $totalCommission = $allTxns->where('category', 'admin_commission')->sum('amount');
        $totalExpenses = $allTxns->where('category', 'shop_expense')->sum('amount');
        $totalPayouts = $allTxns->where('category', 'payout')->sum('amount');
        $availableBalance = $totalSales - $totalCommission - $totalExpenses - $totalPayouts;

        return Inertia::render('Seller/Accounts', [
            'transactions'     => $transactions,
            'summary'          => [
                'total_sales'       => (float)$totalSales,
                'total_commission'  => (float)$totalCommission,
                'total_expenses'    => (float)$totalExpenses,
                'total_payouts'     => (float)$totalPayouts,
                'available_balance' => max(0, (float)$availableBalance),
                'net_profit'        => (float)($totalSales - $totalCommission - $totalExpenses),
            ],
            'filters'          => $request->only(['type', 'search']),
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureTableColumnsExist();

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'type'        => 'required|string|in:credit,expense',
            'amount'      => 'required|numeric|min:1',
            'category'    => 'required|string|max:255',
            'reference_id' => 'nullable|string|max:255',
            'notes'       => 'nullable|string|max:500',
        ]);

        $user = Auth::user();
        $shop = $user ? $user->shop : null;
        $shopId = $shop ? $shop->id : 1;

        $lastTxn = ShopAccountTransaction::where('shop_id', $shopId)->latest()->first();
        $prevBalance = $lastTxn ? $lastTxn->balance_after : 0;

        $amount = (float)$validated['amount'];
        $newBalance = ($validated['type'] === 'credit') 
            ? ($prevBalance + $amount) 
            : ($prevBalance - $amount);

        ShopAccountTransaction::create([
            'shop_id'            => $shopId,
            'user_id'            => $user ? $user->id : 1,
            'transaction_number' => 'TXN-' . strtoupper(uniqid()),
            'type'               => $validated['type'],
            'category'           => $validated['category'],
            'title'              => $validated['title'],
            'reference_id'       => $validated['reference_id'] ?? 'MANUAL-' . rand(100, 999),
            'amount'             => $amount,
            'balance_after'      => max(0, $newBalance),
            'status'             => 'completed',
            'notes'              => $validated['notes'] ?? '',
        ]);

        return redirect()->back()->with('success', 'Accounting transaction entry recorded successfully!');
    }
}
