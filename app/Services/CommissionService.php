<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Shop;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Log;

class CommissionService
{
    /**
     * Automatically calculate and settle commission when an order is delivered.
     * Called once per order — skipped if already settled.
     */
    public static function processOrderSettlement(Order $order): ?array
    {
        // Skip if already settled
        if ($order->commission_settled_at) {
            return null;
        }

        $gross = (float) ($order->total ?? 0);

        // Determine commission rate: shop-specific → global default → 10%
        $shop = $order->shop;
        if (!$shop && $order->shop_id) {
            $shop = Shop::find($order->shop_id);
        }

        $rate = (float) (
            ($shop && $shop->commission_rate > 0)
                ? $shop->commission_rate
                : SiteSetting::get('default_commission_rate', '10')
        );

        $commissionAmount  = round($gross * $rate / 100, 2);
        $courierCharge     = (float) ($order->shipping_fee ?? 0);
        $vendorNetEarning  = round($gross - $commissionAmount - $courierCharge, 2);

        try {
            $order->update([
                'commission_rate'       => $rate,
                'commission_amount'     => $commissionAmount,
                'courier_charge'        => $courierCharge,
                'vendor_net_earning'    => $vendorNetEarning,
                'commission_settled_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::error('CommissionService: Failed to settle order #' . $order->order_number . ' — ' . $e->getMessage());
            return null;
        }

        return [
            'commission_rate'    => $rate,
            'commission_amount'  => $commissionAmount,
            'courier_charge'     => $courierCharge,
            'vendor_net_earning' => $vendorNetEarning,
        ];
    }
}
