<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Str;

class SellerReturnController extends Controller
{
    private function ensureTableExists()
    {
        if (!Schema::hasTable('returns')) {
            Schema::create('returns', function (Blueprint $table) {
                $table->id();
                $table->foreignId('shop_id')->constrained()->onDelete('cascade');
                $table->string('return_number');
                $table->string('order_number');
                $table->string('customer_name');
                $table->string('customer_phone')->nullable();
                $table->string('product_name');
                $table->string('reason');
                $table->decimal('amount', 12, 2)->default(0.00);
                $table->string('status')->default('pending'); // 'pending', 'approved', 'rejected', 'refunded'
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function index(Request $request)
    {
        $this->ensureTableExists();

        $user = Auth::user();
        $shop = $user ? $user->shop : null;

        if ($user && !$shop) {
            $shop = Shop::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'name'        => ($user->name ?? 'Vendor') . "'s Shop",
                    'slug'        => Str::slug(($user->name ?? 'Vendor') . "-shop-" . $user->id),
                    'status'      => 'active',
                    'is_approved' => true,
                ]
            );
        }

        $shopId = $shop ? $shop->id : 1;

        $query = \DB::table('returns')->where('shop_id', $shopId);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('return_number', 'like', "%{$search}%")
                  ->orWhere('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('product_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'All Returns') {
            $query->where('status', strtolower($request->status));
        }

        $returns = $query->orderBy('id', 'desc')->get();

        $allReturns = \DB::table('returns')->where('shop_id', $shopId)->get();
        $pendingCount = $allReturns->where('status', 'pending')->count();
        $approvedAmount = $allReturns->whereIn('status', ['approved', 'refunded'])->sum('amount');

        return Inertia::render('Seller/Returns', [
            'returns'        => $returns,
            'totalCount'     => $allReturns->count(),
            'pendingCount'   => $pendingCount,
            'approvedAmount' => $approvedAmount,
            'filters'        => $request->only(['search', 'status']),
        ]);
    }

    public function update(Request $request, $id)
    {
        $this->ensureTableExists();

        $request->validate([
            'status' => 'required|in:pending,approved,rejected,refunded',
            'notes'  => 'nullable|string',
        ]);

        \DB::table('returns')->where('id', $id)->update([
            'status'     => strtolower($request->status),
            'notes'      => $request->notes ?? null,
            'updated_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Return status updated successfully.');
    }

    public function exportCsv()
    {
        $this->ensureTableExists();

        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="returns_export.csv"',
        ];

        $shopId = Auth::user()->shop ? Auth::user()->shop->id : 1;
        $returns = \DB::table('returns')->where('shop_id', $shopId)->orderBy('id', 'desc')->get();

        $columns = ['Return ID', 'Order Ref', 'Date', 'Customer Name', 'Phone', 'Product', 'Reason', 'Amount', 'Status'];

        $callback = function () use ($columns, $returns) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($file, $columns);

            foreach ($returns as $r) {
                fputcsv($file, [
                    $r->return_number,
                    $r->order_number,
                    $r->created_at,
                    $r->customer_name,
                    $r->customer_phone,
                    $r->product_name,
                    $r->reason,
                    $r->amount,
                    ucfirst($r->status),
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
