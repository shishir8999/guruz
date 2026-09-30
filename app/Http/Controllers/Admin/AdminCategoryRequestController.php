<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Schema\Blueprint;

class AdminCategoryRequestController extends Controller
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
                        // ignore
                    }
                }
            }
        } catch (\Throwable $e) {
            // ignore
        }
    }

    public function index(Request $request): Response
    {
        $this->ensureTableColumnsExist();

        $requests = CategoryRequest::latest()
            ->get()
            ->map(function ($req) {
                $catName = $req->requested_category ?: ($req->requested_name ?: 'Category Request');
                return [
                    'id'                 => $req->id,
                    'formatted_id'       => '#CAT-REQ-' . str_pad($req->id, 3, '0', STR_PAD_LEFT),
                    'vendor_name'        => $req->vendor_name ?: 'Vendor',
                    'requested_category' => $catName,
                    'description'        => $req->description ?: 'No description provided.',
                    'status'             => ucfirst($req->status ?: 'Pending'),
                    'admin_notes'        => $req->admin_notes ?? null,
                    'date'               => $req->created_at ? $req->created_at->format('M d, Y h:i A') : 'Recently',
                ];
            });

        return Inertia::render('Admin/CategoryRequestsPage', [
            'categoryRequests' => $requests,
            'totalRequests'    => $requests->count(),
            'pendingCount'     => $requests->filter(fn($r) => $r['status'] === 'Pending')->count(),
            'approvedCount'    => $requests->filter(fn($r) => $r['status'] === 'Approved')->count(),
            'rejectedCount'    => $requests->filter(fn($r) => $r['status'] === 'Rejected')->count(),
        ]);
    }

    public function approve($id)
    {
        $this->ensureTableColumnsExist();

        $catReq = CategoryRequest::findOrFail($id);
        $catReq->update(['status' => 'Approved']);

        // Check if category already exists or create new category in categories table!
        $categoryName = trim($catReq->requested_category ?: ($catReq->requested_name ?: 'New Category'));
        $categorySlug = Str::slug($categoryName);

        $category = Category::where('name', $categoryName)
            ->orWhere('slug', $categorySlug)
            ->first();

        if (!$category) {
            Category::create([
                'name'          => $categoryName,
                'slug'          => $categorySlug,
                'is_featured'   => false,
                'display_order' => 0,
            ]);
        }

        return redirect()->back()->with('success', 'Category request approved and new category created successfully!');
    }

    public function reject(Request $request, $id)
    {
        $this->ensureTableColumnsExist();

        $catReq = CategoryRequest::findOrFail($id);
        $catReq->update([
            'status'      => 'Rejected',
            'admin_notes' => $request->input('notes', 'Category request rejected by admin.'),
        ]);

        return redirect()->back()->with('success', 'Category request rejected.');
    }
}
