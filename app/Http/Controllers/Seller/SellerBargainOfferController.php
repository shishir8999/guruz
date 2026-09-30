<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\BargainOffer;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Str;

class SellerBargainOfferController extends Controller
{
    private function ensureTableExists()
    {
        if (!Schema::hasTable('bargain_offers')) {
            Schema::create('bargain_offers', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('shop_id')->nullable();
                $table->unsignedBigInteger('product_id')->nullable();
                $table->string('offer_type')->default('bargain'); // 'bargain' or 'beginner'
                $table->string('offer_title')->nullable();
                $table->string('customer_name')->nullable();
                $table->string('customer_phone')->nullable();
                $table->decimal('original_price', 12, 2)->default(0.00);
                $table->decimal('offered_price', 12, 2)->default(0.00);
                $table->decimal('discount_percent', 5, 2)->default(0.00);
                $table->string('status')->default('pending'); // 'pending', 'accepted', 'rejected', 'active'
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
            });
        } else {
            Schema::table('bargain_offers', function (Blueprint $table) {
                if (!Schema::hasColumn('bargain_offers', 'shop_id')) {
                    $table->unsignedBigInteger('shop_id')->nullable();
                }
                if (!Schema::hasColumn('bargain_offers', 'user_id')) {
                    $table->unsignedBigInteger('user_id')->nullable();
                }
                if (!Schema::hasColumn('bargain_offers', 'product_id')) {
                    $table->unsignedBigInteger('product_id')->nullable();
                }
                if (!Schema::hasColumn('bargain_offers', 'offer_type')) {
                    $table->string('offer_type')->default('bargain');
                }
                if (!Schema::hasColumn('bargain_offers', 'offer_title')) {
                    $table->string('offer_title')->nullable();
                }
                if (!Schema::hasColumn('bargain_offers', 'customer_name')) {
                    $table->string('customer_name')->nullable();
                }
                if (!Schema::hasColumn('bargain_offers', 'customer_phone')) {
                    $table->string('customer_phone')->nullable();
                }
                if (!Schema::hasColumn('bargain_offers', 'original_price')) {
                    $table->decimal('original_price', 12, 2)->default(0.00);
                }
                if (!Schema::hasColumn('bargain_offers', 'offered_price')) {
                    $table->decimal('offered_price', 12, 2)->default(0.00);
                }
                if (!Schema::hasColumn('bargain_offers', 'discount_percent')) {
                    $table->decimal('discount_percent', 5, 2)->default(0.00);
                }
                if (!Schema::hasColumn('bargain_offers', 'status')) {
                    $table->string('status')->default('pending');
                }
                if (!Schema::hasColumn('bargain_offers', 'expires_at')) {
                    $table->timestamp('expires_at')->nullable();
                }
            });

            try {
                \DB::statement("ALTER TABLE bargain_offers MODIFY user_id BIGINT UNSIGNED NULL DEFAULT NULL;");
                \DB::statement("ALTER TABLE bargain_offers MODIFY product_id BIGINT UNSIGNED NULL DEFAULT NULL;");
                \DB::statement("ALTER TABLE bargain_offers MODIFY status VARCHAR(255) NOT NULL DEFAULT 'pending';");
            } catch (\Throwable $e) {
                // ignore
            }
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
        $userId = $user ? $user->id : 1;

        $products = Product::where('shop_id', $shopId)->get(['id', 'name', 'price']);

        $query = BargainOffer::with('product')->where('shop_id', $shopId);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('offer_title', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhereHas('product', function($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status') && $request->status !== 'All Offers') {
            $query->where('status', strtolower($request->status));
        }

        $offers = $query->latest()->get();

        $allOffers = BargainOffer::where('shop_id', $shopId)->get();
        $activeCount = $allOffers->whereIn('status', ['active', 'accepted'])->count();
        $pendingCount = $allOffers->where('status', 'pending')->count();

        return Inertia::render('Seller/BargainOffers', [
            'offers'       => $offers,
            'products'     => $products,
            'totalCount'   => $allOffers->count(),
            'activeCount'  => $activeCount,
            'pendingCount' => $pendingCount,
            'filters'      => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureTableExists();

        $request->validate([
            'offer_type'     => 'required|in:bargain,beginner',
            'product_id'     => 'nullable|exists:products,id',
            'offer_title'    => 'required|string|max:255',
            'original_price' => 'required|numeric',
            'offered_price'  => 'required|numeric',
            'customer_name'  => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'status'         => 'nullable|string',
        ]);

        $user = Auth::user();
        $shop = $user ? $user->shop : null;
        $shopId = $shop ? $shop->id : 1;
        $userId = $user ? $user->id : 1;

        $orig = floatval($request->original_price);
        $offered = floatval($request->offered_price);
        $discount = $orig > 0 ? round((($orig - $offered) / $orig) * 100, 2) : 0;

        BargainOffer::create([
            'shop_id'          => $shopId,
            'user_id'          => $userId,
            'product_id'       => $request->product_id,
            'offer_type'       => $request->offer_type,
            'offer_title'      => $request->offer_title,
            'customer_name'    => $request->customer_name,
            'customer_phone'   => $request->customer_phone,
            'original_price'   => $orig,
            'offered_price'    => $offered,
            'discount_percent' => $discount,
            'status'           => $request->status ?? 'active',
            'expires_at'       => now()->addDays(14),
        ]);

        return redirect()->back()->with('success', 'Offer created successfully.');
    }

    public function update(Request $request, $id)
    {
        $this->ensureTableExists();

        $offer = BargainOffer::findOrFail($id);

        if ($request->has('status')) $offer->status = strtolower($request->status);
        if ($request->has('offer_title')) $offer->offer_title = $request->offer_title;
        if ($request->has('offered_price')) {
            $offer->offered_price = floatval($request->offered_price);
            if ($offer->original_price > 0) {
                $offer->discount_percent = round((($offer->original_price - $offer->offered_price) / $offer->original_price) * 100, 2);
            }
        }

        $offer->save();

        return redirect()->back()->with('success', 'Offer updated successfully.');
    }

    public function destroy($id)
    {
        $this->ensureTableExists();

        $offer = BargainOffer::find($id);
        if ($offer) {
            $offer->delete();
        }

        return redirect()->back()->with('success', 'Offer deleted successfully.');
    }
}
