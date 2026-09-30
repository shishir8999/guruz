<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\CategoryRequest;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Schema\Blueprint;

class SellerCategoryRequestController extends Controller
{
    private function ensureTableColumnsExist()
    {
        try {
            if (Schema::hasTable('category_requests')) {
                Schema::table('category_requests', function (Blueprint $table) {
                    if (!Schema::hasColumn('category_requests', 'shop_id')) {
                        $table->unsignedBigInteger('shop_id')->nullable();
                    }
                    if (!Schema::hasColumn('category_requests', 'user_id')) {
                        $table->unsignedBigInteger('user_id')->nullable();
                    }
                    if (!Schema::hasColumn('category_requests', 'vendor_name')) {
                        $table->string('vendor_name')->nullable();
                    }
                    if (!Schema::hasColumn('category_requests', 'requested_category')) {
                        $table->string('requested_category')->nullable();
                    }
                    if (!Schema::hasColumn('category_requests', 'requested_name')) {
                        $table->string('requested_name')->nullable();
                    }
                    if (!Schema::hasColumn('category_requests', 'description')) {
                        $table->text('description')->nullable();
                    }
                    if (!Schema::hasColumn('category_requests', 'status')) {
                        $table->string('status')->default('Pending');
                    }
                    if (!Schema::hasColumn('category_requests', 'admin_notes')) {
                        $table->text('admin_notes')->nullable();
                    }
                });

                if (DB::getDriverName() === 'mysql') {
                    try {
                        DB::statement("ALTER TABLE category_requests MODIFY requested_name VARCHAR(255) NULL");
                        DB::statement("ALTER TABLE category_requests MODIFY requested_category VARCHAR(255) NULL");
                        DB::statement("ALTER TABLE category_requests MODIFY shop_id BIGINT UNSIGNED NULL");
                        DB::statement("ALTER TABLE category_requests MODIFY user_id BIGINT UNSIGNED NULL");
                        DB::statement("ALTER TABLE category_requests MODIFY vendor_name VARCHAR(255) NULL");
                    } catch (\Throwable $ex) {
                        // ignore alter statement error
                    }
                }
            } else {
                Schema::create('category_requests', function (Blueprint $table) {
                    $table->id();
                    $table->unsignedBigInteger('shop_id')->nullable();
                    $table->unsignedBigInteger('user_id')->nullable();
                    $table->string('vendor_name')->nullable();
                    $table->string('requested_category')->nullable();
                    $table->string('requested_name')->nullable();
                    $table->text('description')->nullable();
                    $table->string('status')->default('Pending');
                    $table->text('admin_notes')->nullable();
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

        $requests = CategoryRequest::where('shop_id', $shop ? $shop->id : 0)
            ->latest()
            ->get()
            ->map(function ($req) {
                $catName = $req->requested_category ?: ($req->requested_name ?: 'Category Request');
                return [
                    'id'                 => '#CAT-REQ-' . str_pad($req->id, 3, '0', STR_PAD_LEFT),
                    'db_id'              => $req->id,
                    'requested_category' => $catName,
                    'description'        => $req->description ?: 'No detailed description provided.',
                    'vendor_name'        => $req->vendor_name ?: 'Vendor',
                    'status'             => ucfirst($req->status ?: 'Pending'),
                    'admin_notes'        => $req->admin_notes ?? null,
                    'date'               => $req->created_at ? $req->created_at->format('M d, Y') : 'Recently',
                ];
            });

        return Inertia::render('Seller/CategoryRequest', [
            'categoryRequests' => $requests,
            'totalRequests'    => $requests->count(),
            'pendingCount'     => $requests->filter(fn($r) => $r['status'] === 'Pending')->count(),
            'approvedCount'    => $requests->filter(fn($r) => $r['status'] === 'Approved')->count(),
            'rejectedCount'    => $requests->filter(fn($r) => $r['status'] === 'Rejected')->count(),
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureTableColumnsExist();

        $validated = $request->validate([
            'requested_category' => 'required|string|max:255',
            'description'        => 'required|string|max:1000',
        ]);

        $user = Auth::user();
        $shop = $user ? $user->shop : null;
        $catName = $validated['requested_category'];

        CategoryRequest::create([
            'shop_id'            => $shop ? $shop->id : 1,
            'user_id'            => $user ? $user->id : 1,
            'vendor_name'        => $shop ? $shop->name : ($user ? $user->name : 'Vendor'),
            'requested_category' => $catName,
            'requested_name'     => $catName,
            'description'        => $validated['description'],
            'status'             => 'Pending',
        ]);

        // Send Notification to Super Admin
        try {
            \App\Models\Notification::create([
                'user_id' => 1, // Super Admin
                'type'    => 'category_request',
                'title'   => 'New Category Request Received!',
                'body'    => ($shop ? $shop->name : ($user ? $user->name : 'Vendor')) . ' requested a new category: "' . $catName . '"',
                'link'    => '/admin/category-requests',
                'icon'    => 'tag',
                'is_read' => false,
            ]);
        } catch (\Throwable $e) {
            // Ignore non-critical notification error
        }

        return redirect()->back()->with('success', 'New category request sent to Super Admin successfully!');
    }

    public function destroy($id)
    {
        $this->ensureTableColumnsExist();
        CategoryRequest::where('id', $id)->delete();
        return redirect()->back()->with('success', 'Category request deleted.');
    }
}
