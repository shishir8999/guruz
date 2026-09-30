<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Subscriber;
use Inertia\Inertia;

class SubscriberController extends Controller
{
    public function index()
    {
        $subscribers = Subscriber::orderBy('created_at', 'desc')->paginate(20);
        return Inertia::render('Admin/Subscribers', [
            'subscribers' => $subscribers
        ]);
    }

    public function destroy($id)
    {
        Subscriber::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Subscriber deleted.');
    }

    // Public API route to handle submissions
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:subscribers,email'
        ]);

        Subscriber::create(['email' => $request->email]);

        return response()->json(['message' => 'Successfully subscribed!']);
    }
}
