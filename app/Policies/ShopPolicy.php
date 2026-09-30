<?php

namespace App\Policies;

use App\Models\Shop;
use App\Models\User;

class ShopPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(?User $user, Shop $shop): bool
    {
        return $shop->status === 'approved' || optional($user)->id === $shop->user_id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('vendor') || $user->hasRole('admin');
    }

    public function update(User $user, Shop $shop): bool
    {
        return $user->id === $shop->user_id || $user->isAdmin();
    }

    public function delete(User $user, Shop $shop): bool
    {
        return $user->isAdmin();
    }

    public function approve(User $user, Shop $shop): bool
    {
        return $user->isAdmin();
    }
}
