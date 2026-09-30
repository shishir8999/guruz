<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\PickupRequest;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class SellerPickupRequestController extends Controller
{
    private function ensureTableColumnsExist()
    {
        try {
            if (!Schema::hasTable('pickup_requests')) {
                Schema::create('pickup_requests', function (Blueprint $table) {
                    $table->id();
                    $table->string('request_number')->nullable();
                    $table->unsignedBigInteger('shop_id')->nullable();
                    $table->unsignedBigInteger('user_id')->nullable();
                    $table->string('vendor_name')->nullable();
                    $table->string('phone')->nullable();
                    $table->string('courier_name')->nullable();
                    $table->text('pickup_address')->nullable();
                    $table->integer('parcel_count')->default(1);
                    $table->string('estimated_weight')->default('1 kg');
                    $table->decimal('cod_amount', 12, 2)->default(0.00);
                    $table->boolean('is_cod_collected')->default(false);
                    $table->text('notes')->nullable();
                    $table->string('status')->default('Pending');
                    $table->string('courier_consignment_id')->nullable();
                    $table->text('admin_notes')->nullable();
                    $table->timestamps();
                });
            } else {
                if (!Schema::hasColumn('pickup_requests', 'cod_amount')) {
                    Schema::table('pickup_requests', function (Blueprint $table) {
                        $table->decimal('cod_amount', 12, 2)->default(0.00)->nullable();
                        $table->boolean('is_cod_collected')->default(false)->nullable();
                    });
                }
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

        $requests = PickupRequest::where('shop_id', $shop ? $shop->id : 0)
            ->latest()
            ->get()
            ->map(function ($p) {
                return [
                    'id'                     => $p->id,
                    'request_number'         => $p->request_number ?: ('#PKP-' . str_pad($p->id, 4, '0', STR_PAD_LEFT)),
                    'vendor_name'            => $p->vendor_name ?: 'Vendor',
                    'phone'                  => $p->phone ?: '01700000000',
                    'courier_name'           => $p->courier_name ?: 'Steadfast Courier',
                    'pickup_address'         => $p->pickup_address ?: 'Seller Hub Address',
                    'parcel_count'           => (int)($p->parcel_count ?: 1),
                    'estimated_weight'       => $p->estimated_weight ?: '1.0 kg',
                    'cod_amount'             => (float)($p->cod_amount ?: 0),
                    'is_cod_collected'       => (bool)($p->is_cod_collected ?? false),
                    'notes'                  => $p->notes ?: 'None',
                    'status'                 => $p->status ?: 'Pending',
                    'courier_consignment_id' => $p->courier_consignment_id ?? null,
                    'admin_notes'            => $p->admin_notes ?? null,
                    'date'                   => $p->created_at ? $p->created_at->format('M d, Y h:i A') : 'Recently',
                ];
            });

        $totalCodDispatched = $requests->filter(fn($r) => str_contains(strtolower($r['status']), 'accepted'))->sum('cod_amount');
        $totalCodPending    = $requests->filter(fn($r) => $r['status'] === 'Pending')->sum('cod_amount');

        return Inertia::render('Seller/PickupRequest', [
            'pickupRequests'      => $requests,
            'totalRequests'       => $requests->count(),
            'pendingCount'        => $requests->filter(fn($r) => $r['status'] === 'Pending')->count(),
            'acceptedCount'       => $requests->filter(fn($r) => str_contains(strtolower($r['status']), 'accepted'))->count(),
            'rejectedCount'       => $requests->filter(fn($r) => str_contains(strtolower($r['status']), 'reject'))->count(),
            'totalCodDispatched'  => $totalCodDispatched,
            'totalCodPending'     => $totalCodPending,
            'shopAddress'         => $shop->address ?? 'House 42, Road 11, Block D, Banani, Dhaka',
            'shopPhone'           => $user->phone ?? '01700000000',
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureTableColumnsExist();

        $validated = $request->validate([
            'courier_name'     => 'required|string',
            'pickup_address'   => 'required|string|max:500',
            'phone'            => 'required|string|max:20',
            'parcel_count'     => 'required|integer|min:1',
            'estimated_weight' => 'required|string',
            'cod_amount'       => 'required|numeric|min:0',
            'notes'            => 'nullable|string|max:500',
        ]);

        $user = Auth::user();
        $shop = $user ? $user->shop : null;

        $pickup = PickupRequest::create([
            'request_number'   => '#PKP-' . rand(1000, 9999),
            'shop_id'          => $shop ? $shop->id : 1,
            'user_id'          => $user ? $user->id : 1,
            'vendor_name'      => $shop ? $shop->name : ($user ? $user->name : 'Vendor'),
            'phone'            => $validated['phone'],
            'courier_name'     => $validated['courier_name'],
            'pickup_address'   => $validated['pickup_address'],
            'parcel_count'     => $validated['parcel_count'],
            'estimated_weight' => $validated['estimated_weight'],
            'cod_amount'       => $validated['cod_amount'],
            'notes'            => $validated['notes'] ?? '',
            'status'           => 'Pending',
        ]);

        // Send Notification to Super Admin
        try {
            \App\Models\Notification::create([
                'user_id' => 1, // Super Admin
                'type'    => 'pickup_request',
                'title'   => 'New Parcel Pickup Request!',
                'body'    => ($shop ? $shop->name : 'Vendor') . ' requested pickup of ' . $validated['parcel_count'] . ' parcels (COD ৳' . number_format($validated['cod_amount'], 2) . ') via ' . $validated['courier_name'],
                'link'    => '/admin/pickup-requests',
                'icon'    => 'truck',
                'is_read' => false,
            ]);
        } catch (\Throwable $e) {
            // ignore
        }

        return redirect()->back()->with('success', 'Pickup request submitted to Super Admin for Courier approval!');
    }

    public function destroy($id)
    {
        $this->ensureTableColumnsExist();
        PickupRequest::where('id', $id)->delete();
        return redirect()->back()->with('success', 'Pickup request canceled.');
    }
}
