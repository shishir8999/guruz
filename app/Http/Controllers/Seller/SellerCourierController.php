<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\AdminCourierApi;
use App\Models\SellerCourierSetting;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class SellerCourierController extends Controller
{
    private function ensureTableColumnsExist()
    {
        try {
            if (!Schema::hasTable('admin_courier_apis')) {
                Schema::create('admin_courier_apis', function (Blueprint $table) {
                    $table->id();
                    $table->string('courier_name');
                    $table->boolean('is_active')->default(true);
                    $table->string('api_key')->nullable();
                    $table->string('secret_key')->nullable();
                    $table->string('merchant_code')->nullable();
                    $table->string('base_url')->nullable();
                    $table->boolean('cod_vault_active')->default(true);
                    $table->text('notes')->nullable();
                    $table->timestamps();
                });

                // Seed default master courier APIs
                AdminCourierApi::create([
                    'courier_name'     => 'Steadfast Courier',
                    'is_active'        => true,
                    'api_key'          => 'st_master_live_98421049182',
                    'secret_key'       => 'st_master_sec_891048102',
                    'merchant_code'    => 'STEADFAST-PLATFORM-MASTER',
                    'base_url'         => 'https://portal.steadfast.com.bd/api/v1',
                    'cod_vault_active' => true,
                    'notes'            => 'Master Steadfast account. All COD collections flow to Super Admin Vault.',
                ]);

                AdminCourierApi::create([
                    'courier_name'     => 'Pathao Courier',
                    'is_active'        => true,
                    'api_key'          => 'pth_master_client_77810294',
                    'secret_key'       => 'pth_master_sec_9918203',
                    'merchant_code'    => 'PATHAO-PLATFORM-MASTER',
                    'base_url'         => 'https://api.pathao.com/aladdin/api/v1',
                    'cod_vault_active' => true,
                    'notes'            => 'Master Pathao account for nationwide express delivery.',
                ]);

                AdminCourierApi::create([
                    'courier_name'     => 'RedX Courier',
                    'is_active'        => true,
                    'api_key'          => 'redx_master_key_4491029',
                    'secret_key'       => 'redx_master_sec_102948',
                    'merchant_code'    => 'REDX-PLATFORM-MASTER',
                    'base_url'         => 'https://openapi.redx.com.bd/v1.0.0',
                    'cod_vault_active' => true,
                    'notes'            => 'Master RedX courier API credentials.',
                ]);

                AdminCourierApi::create([
                    'courier_name'     => 'Paperfly Express',
                    'is_active'        => true,
                    'api_key'          => 'pf_master_api_3381029',
                    'secret_key'       => 'pf_master_sec_5591820',
                    'merchant_code'    => 'PAPERFLY-PLATFORM-MASTER',
                    'base_url'         => 'https://paperfly.com.bd/api/v1',
                    'cod_vault_active' => true,
                    'notes'            => 'Master Paperfly API credentials.',
                ]);
            }

            if (!Schema::hasTable('seller_courier_settings')) {
                Schema::create('seller_courier_settings', function (Blueprint $table) {
                    $table->id();
                    $table->unsignedBigInteger('shop_id')->nullable();
                    $table->string('courier_name');
                    $table->boolean('is_enabled')->default(true);
                    $table->string('api_key')->nullable();
                    $table->string('secret_key')->nullable();
                    $table->string('merchant_id')->nullable();
                    $table->string('zone_id')->nullable();
                    $table->text('pickup_address')->nullable();
                    $table->boolean('admin_approval_required')->default(true);
                    $table->boolean('vault_collection_enabled')->default(true);
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

        // Fetch Master API Settings configured by Super Admin
        $masterApis = AdminCourierApi::where('is_active', true)->get();

        if ($masterApis->isEmpty()) {
            $courierList = [
                [
                    'id'                        => 1,
                    'courier_name'              => 'Steadfast Courier',
                    'is_enabled'                => true,
                    'master_api_key_configured' => true,
                    'merchant_code'             => 'STEADFAST-PLATFORM-MASTER',
                    'pickup_address'            => $shop->address ?? 'House 42, Road 11, Block D, Banani, Dhaka',
                    'admin_approval_required'  => true,
                    'vault_collection_enabled'  => true,
                    'notes'                     => 'Operated via Super Admin Master API Key. Cash on Delivery goes directly to Admin Vault.',
                ],
                [
                    'id'                        => 2,
                    'courier_name'              => 'Pathao Courier',
                    'is_enabled'                => true,
                    'master_api_key_configured' => true,
                    'merchant_code'             => 'PATHAO-PLATFORM-MASTER',
                    'pickup_address'            => $shop->address ?? 'House 42, Road 11, Block D, Banani, Dhaka',
                    'admin_approval_required'  => true,
                    'vault_collection_enabled'  => true,
                    'notes'                     => 'Operated via Super Admin Master API Key.',
                ],
                [
                    'id'                        => 3,
                    'courier_name'              => 'RedX Courier',
                    'is_enabled'                => true,
                    'master_api_key_configured' => true,
                    'merchant_code'             => 'REDX-PLATFORM-MASTER',
                    'pickup_address'            => $shop->address ?? 'House 42, Road 11, Block D, Banani, Dhaka',
                    'admin_approval_required'  => true,
                    'vault_collection_enabled'  => true,
                    'notes'                     => 'Operated via Super Admin Master API Key.',
                ],
                [
                    'id'                        => 4,
                    'courier_name'              => 'Paperfly Express',
                    'is_enabled'                => true,
                    'master_api_key_configured' => true,
                    'merchant_code'             => 'PAPERFLY-PLATFORM-MASTER',
                    'pickup_address'            => $shop->address ?? 'House 42, Road 11, Block D, Banani, Dhaka',
                    'admin_approval_required'  => true,
                    'vault_collection_enabled'  => true,
                    'notes'                     => 'Operated via Super Admin Master API Key.',
                ],
            ];
        } else {
            $courierList = $masterApis->map(function ($api) use ($shop) {
                return [
                    'id'                        => $api->id,
                    'courier_name'              => $api->courier_name,
                    'is_enabled'                => (bool)$api->is_active,
                    'master_api_key_configured' => !empty($api->api_key),
                    'merchant_code'             => $api->merchant_code ?: 'MASTER-COURIER-ACCOUNT',
                    'pickup_address'            => $shop->address ?? 'House 42, Road 11, Block D, Banani, Dhaka',
                    'admin_approval_required'  => true,
                    'vault_collection_enabled'  => true,
                    'notes'                     => $api->notes ?: 'Operated via Super Admin Master API Key.',
                ];
            });
        }

        return Inertia::render('Seller/CourierSettings', [
            'couriers'     => $courierList,
            'totalCount'   => count($courierList),
            'activeCount'  => count($courierList),
            'shopAddress'  => $shop->address ?? 'House 42, Road 11, Block D, Banani, Dhaka',
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'pickup_address' => 'required|string|max:500',
        ]);

        $user = Auth::user();
        if ($user && $user->shop) {
            $user->shop->update(['address' => $validated['pickup_address']]);
        }

        return redirect()->back()->with('success', 'Pickup address updated successfully! All products will continue to be shipped via Super Admin Master API Key.');
    }
}
