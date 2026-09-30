<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminVipLoyaltyController extends Controller
{
    public function index()
    {
        $tiers = User::getVipTiers();

        return Inertia::render('Admin/VipLoyaltyPage', [
            'tiers' => $tiers,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'tiers' => 'required|array|min:1',
            'tiers.*.name' => 'required|string',
            'tiers.*.min_orders' => 'required|integer|min:0',
        ]);

        $tiers = array_values($request->tiers);

        // Sort tiers by min_orders ascending
        usort($tiers, fn($a, $b) => $a['min_orders'] <=> $b['min_orders']);

        SiteSetting::set('vip_loyalty_tiers', json_encode($tiers), 'loyalty');

        return back()->with('success', 'VIP Loyalty Tier configuration updated successfully!');
    }
}
