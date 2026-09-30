<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminCourierApi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class AdminCourierApiController extends Controller
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
            }
        } catch (\Throwable $e) {
            // ignore
        }
    }

    public function index(Request $request): Response
    {
        $this->ensureTableColumnsExist();

        // Seed master courier APIs if empty
        if (AdminCourierApi::count() === 0) {
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

        $apis = AdminCourierApi::latest()
            ->get()
            ->map(function ($c) {
                return [
                    'id'               => $c->id,
                    'courier_name'     => $c->courier_name,
                    'is_active'        => (bool)$c->is_active,
                    'api_key'          => $c->api_key ?: '',
                    'secret_key'       => $c->secret_key ?: '',
                    'merchant_code'    => $c->merchant_code ?: '',
                    'base_url'         => $c->base_url ?: '',
                    'cod_vault_active' => true,
                    'notes'            => $c->notes ?: '',
                ];
            });

        return Inertia::render('Admin/CourierApiPage', [
            'courierApis' => $apis,
            'totalApis'   => $apis->count(),
            'activeApis'  => $apis->filter(fn($a) => $a['is_active'])->count(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $this->ensureTableColumnsExist();

        $validated = $request->validate([
            'courier_name'  => 'required|string|max:255',
            'api_key'       => 'required|string|max:255',
            'secret_key'    => 'required|string|max:255',
            'merchant_code' => 'nullable|string|max:255',
            'base_url'      => 'nullable|string|max:500',
            'is_active'     => 'required|boolean',
            'notes'         => 'nullable|string|max:500',
        ]);

        $courier = AdminCourierApi::findOrFail($id);

        $courier->update([
            'courier_name'     => $validated['courier_name'],
            'api_key'          => $validated['api_key'],
            'secret_key'       => $validated['secret_key'],
            'merchant_code'    => $validated['merchant_code'] ?? '',
            'base_url'         => $validated['base_url'] ?? '',
            'is_active'        => $validated['is_active'],
            'notes'            => $validated['notes'] ?? '',
            'cod_vault_active' => true,
        ]);

        return redirect()->back()->with('success', 'Super Admin Master Courier API Credentials updated successfully!');
    }
}
