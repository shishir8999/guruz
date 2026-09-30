<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        // Customer can see their own order
        // Seller can see orders for their shop
        // Admin can see all
        return $user->id === $order->user_id
            || $user->isAdmin()
            || (optional($order->shop)->user_id === $user->id);
    }

    public function update(User $user, Order $order): bool
    {
        // Only seller (for their shop orders) or admin can update status
        return $user->isAdmin()
            || optional($order->shop)->user_id === $user->id;
    }

    public function cancel(User $user, Order $order): bool
    {
        // Customer can cancel only if pending
        if ($user->id === $order->user_id && $order->status === 'pending') {
            return true;
        }
        return $user->isAdmin();
    }
}
