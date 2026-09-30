<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminApiKeyController extends Controller
{
    public function index()
    {
        if (ApiKey::count() === 0) {
            $keysData = [
                [
                    'key_id'      => '#API-001',
                    'name'        => 'Mobile App Integration',
                    'token'       => 'sk-live-8f92a4bc-1234-5678-90ab-cdef12349d8e',
                    'permissions' => json_encode(['Read', 'Write']),
                    'status'      => 'Active',
                    'last_used'   => '2 mins ago',
                ],
                [
                    'key_id'      => '#API-002',
                    'name'        => 'ERP Sync Service',
                    'token'       => 'sk-live-3b7c19ad-9876-5432-10fe-dcba98764f2a',
                    'permissions' => json_encode(['Read']),
                    'status'      => 'Active',
                    'last_used'   => '1 hour ago',
                ],
                [
                    'key_id'      => '#API-003',
                    'name'        => 'Legacy Payment Gateway',
                    'token'       => 'sk-test-9e8d7c6b-1111-2222-3333-444455551a2b',
                    'permissions' => json_encode(['Full Access']),
                    'status'      => 'Revoked',
                    'last_used'   => 'Never',
                ],
                [
                    'key_id'      => '#API-004',
                    'name'        => 'Vendor Dashboard Sync',
                    'token'       => 'sk-live-5a4b3c2d-abab-cdcd-efef-123456788e7f',
                    'permissions' => json_encode(['Read', 'Write']),
                    'status'      => 'Active',
                    'last_used'   => '3 days ago',
                ]
            ];

            foreach ($keysData as $item) {
                ApiKey::create([
                    'key_id'      => $item['key_id'],
                    'name'        => $item['name'],
                    'key_token'   => $item['token'],
                    'key_prefix'  => substr($item['token'], 0, 16),
                    'key_hash'    => hash('sha256', $item['token']),
                    'permissions' => json_decode($item['permissions'], true),
                    'status'      => $item['status'],
                    'last_used'   => $item['last_used'],
                ]);
            }
        }

        $apiKeys = ApiKey::orderBy('created_at', 'desc')->get()->map(function($key) {
            $fullKey = $key->key_token ?: ($key->key_hash ?: ('sk-live-' . Str::random(32)));
            $prefix = substr($fullKey, 0, 16);
            $suffix = strlen($fullKey) > 4 ? substr($fullKey, -4) : 'xxxx';
            $key->key = $prefix . '...' . $suffix;
            $key->fullKey = $fullKey;
            $key->permissions = is_array($key->permissions) ? $key->permissions : (json_decode($key->permissions, true) ?: ['Read', 'Write']);
            return $key;
        });

        return Inertia::render('Admin/Api/ApiKeys', [
            'apiKeys' => $apiKeys,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'permissions' => 'required|array',
        ]);

        $count = ApiKey::count() + 1;
        $keyId = '#API-' . str_pad($count, 3, '0', STR_PAD_LEFT);
        $token = 'sk-live-' . Str::uuid()->toString();

        ApiKey::create([
            'key_id'      => $keyId,
            'name'        => $request->name,
            'key_token'   => $token,
            'key_prefix'  => substr($token, 0, 16),
            'key_hash'    => hash('sha256', $token),
            'permissions' => $request->permissions,
            'status'      => 'Active',
            'last_used'   => 'Never',
        ]);

        return back()->with('success', 'নতুন এপিআই কী সফলভাবে তৈরি করা হয়েছে!');
    }

    public function revoke(ApiKey $apiKey)
    {
        $newStatus = $apiKey->status === 'Active' ? 'Revoked' : 'Active';
        $apiKey->update(['status' => $newStatus]);
        return back()->with('success', "এপিআই কী এর স্ট্যাটাস '{$newStatus}' করা হয়েছে!");
    }

    public function destroy(ApiKey $apiKey)
    {
        $apiKey->delete();
        return back()->with('success', 'এপিআই কী সফলভাবে মুছে ফেলা হয়েছে!');
    }
}
