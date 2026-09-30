<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PickupRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class AdminPickupRequestController extends Controller
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

        $requests = PickupRequest::latest()
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

        $totalAdminVaultFunds = $requests->filter(fn($r) => str_contains(strtolower($r['status']), 'accepted'))->sum('cod_amount');

        return Inertia::render('Admin/PickupRequestsPage', [
            'pickupRequests'       => $requests,
            'totalRequests'        => $requests->count(),
            'pendingCount'         => $requests->filter(fn($r) => $r['status'] === 'Pending')->count(),
            'acceptedCount'        => $requests->filter(fn($r) => str_contains(strtolower($r['status']), 'accepted'))->count(),
            'rejectedCount'        => $requests->filter(fn($r) => str_contains(strtolower($r['status']), 'reject'))->count(),
            'totalAdminVaultFunds' => $totalAdminVaultFunds,
        ]);
    }

    public function accept($id)
    {
        $this->ensureTableColumnsExist();

        $pickup = PickupRequest::findOrFail($id);
        $consignmentId = 'COURIER-' . strtoupper(Str::random(4)) . '-' . rand(1000, 9999);

        $pickup->update([
            'status'                 => 'Accepted & Sent to Courier',
            'courier_consignment_id' => $consignmentId,
            'is_cod_collected'       => true, // Automatically held in Super Admin Vault
        ]);

        // Send Notification to Seller
        if ($pickup->user_id) {
            try {
                \App\Models\Notification::create([
                    'user_id' => $pickup->user_id,
                    'type'    => 'pickup_approved',
                    'title'   => 'Pickup Request Accepted & Dispatched!',
                    'body'    => 'Super Admin accepted your pickup request (' . $pickup->request_number . ')! COD ৳' . number_format($pickup->cod_amount, 2) . ' will be held in Admin Vault. Consignment ID: ' . $consignmentId,
                    'link'    => '/seller/pickup-request',
                    'icon'    => 'truck',
                    'is_read' => false,
                ]);
            } catch (\Throwable $e) {
                // ignore
            }
        }

        return redirect()->back()->with('success', 'Pickup request accepted and dispatched to Courier rider successfully!');
    }

    public function reject(Request $request, $id)
    {
        $this->ensureTableColumnsExist();

        $pickup = PickupRequest::findOrFail($id);
        $reason = $request->input('notes', 'Pickup request rejected by admin.');

        $pickup->update([
            'status'      => 'Rejected',
            'admin_notes' => $reason,
        ]);

        // Send Notification to Seller
        if ($pickup->user_id) {
            try {
                \App\Models\Notification::create([
                    'user_id' => $pickup->user_id,
                    'type'    => 'pickup_rejected',
                    'title'   => 'Pickup Request Rejected',
                    'body'    => 'Super Admin rejected pickup request (' . $pickup->request_number . '). Reason: ' . $reason,
                    'link'    => '/seller/pickup-request',
                    'icon'    => 'x',
                    'is_read' => false,
                ]);
            } catch (\Throwable $e) {
                // ignore
            }
        }

        return redirect()->back()->with('success', 'Pickup request rejected.');
    }
}
