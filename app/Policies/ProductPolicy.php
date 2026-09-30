<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Product $product): bool
    {
        return $product->is_active || optional($user)->id === optional($product->shop)->user_id;
    }

    public function create(User $user): bool
    {
        return $user->isVendor() || $user->isAdmin();
    }

    public function update(User $user, Product $product): bool
    {
        return $user->isAdmin() || $user->id === optional($product->shop)->user_id;
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->isAdmin() || $user->id === optional($product->shop)->user_id;
    }
}
