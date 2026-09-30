<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\BargainOffer;
use Inertia\Inertia;

class AdminBargainOfferController extends Controller
{
    public function index()
    {
        $offers = BargainOffer::with(['shop', 'product', 'user'])
            ->latest()
            ->get()
            ->map(function ($offer) {
                return [
                    'id' => $offer->id,
                    'date' => $offer->created_at ? $offer->created_at->format('m/d/Y') : '',
                    'customer' => $offer->customer_name ?? ($offer->user ? $offer->user->name : 'Customer'),
                    'shop' => $offer->shop ? $offer->shop->name : 'Guruz Marketplace',
                    'product' => $offer->product ? $offer->product->name : ($offer->offer_title ?? 'Product Offer'),
                    'list_price' => (float) ($offer->original_price > 0 ? $offer->original_price : ($offer->product ? $offer->product->price : 0)),
                    'offer_price' => (float) $offer->offered_price,
                    'final_price' => (float) ($offer->counter_price ?? $offer->offered_price),
                    'status' => ucfirst(strtolower($offer->status ?? 'Pending')),
                ];
            });

        return Inertia::render('Admin/BargainOffersPage', [
            'initialOffers' => $offers,
        ]);
    }

    public function accept($id)
    {
        $offer = BargainOffer::findOrFail($id);
        $offer->update(['status' => 'Accepted']);
        return back()->with('success', 'দামাদামি অফার গ্রহণ করা হয়েছে!');
    }

    public function reject($id)
    {
        $offer = BargainOffer::findOrFail($id);
        $offer->update(['status' => 'Rejected']);
        return back()->with('success', 'দামাদামি অফার প্রত্যাখ্যান করা হয়েছে।');
    }

    public function destroy($id)
    {
        $offer = BargainOffer::findOrFail($id);
        $offer->delete();
        return back()->with('success', 'দামাদামি অফার মুছে ফেলা হয়েছে।');
    }
}
