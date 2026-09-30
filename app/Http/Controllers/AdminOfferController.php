<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Offer;
use App\Notifications\SpecialOfferNotification;
use Carbon\Carbon;

class AdminOfferController extends Controller
{
    public function create()
    {
        $users = User::select('id', 'name', 'email', 'phone')->get();
        return Inertia::render('Admin/Offers/Create', [
            'users' => $users
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'promo_code' => 'nullable|string|max:50',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'valid_until' => 'nullable|date',
        ]);

        $offer = Offer::create([
            'user_id' => $request->user_id,
            'title' => $request->title,
            'description' => $request->description,
            'promo_code' => $request->promo_code,
            'discount_percentage' => $request->discount_percentage,
            'valid_until' => $request->valid_until ? Carbon::parse($request->valid_until) : null,
            'status' => 'active',
        ]);

        $user = User::findOrFail($request->user_id);
        \App\Models\Notification::create([
            'user_id' => $user->id,
            'type' => 'promo',
            'title' => $offer->title,
            'body' => $offer->description,
            'link' => null,
        ]);

        return redirect()->back()->with('success', 'Offer sent successfully and customer notified!');
    }
}
