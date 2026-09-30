<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Str;

class SellerContactController extends Controller
{
    private function ensureTableExists()
    {
        if (!Schema::hasTable('contacts')) {
            Schema::create('contacts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('shop_id')->constrained()->onDelete('cascade');
                $table->string('type')->default('supplier'); // 'supplier' or 'customer'
                $table->string('name');
                $table->string('email')->nullable();
                $table->string('phone')->nullable();
                $table->string('company_name')->nullable();
                $table->text('address')->nullable();
                $table->string('city')->nullable();
                $table->decimal('balance', 12, 2)->default(0.00);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }
    }

    public function index(Request $request)
    {
        $this->ensureTableExists();

        $user = Auth::user();
        $shop = $user ? $user->shop : null;

        if ($user && !$shop) {
            $shop = Shop::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'name'        => ($user->name ?? 'Vendor') . "'s Shop",
                    'slug'        => Str::slug(($user->name ?? 'Vendor') . "-shop-" . $user->id),
                    'status'      => 'active',
                    'is_approved' => true,
                ]
            );
        }

        $shopId = $shop ? $shop->id : 1;

        $query = Contact::where('shop_id', $shopId);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('company_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        $contacts = $query->latest()->get();

        $allContacts = Contact::where('shop_id', $shopId)->get();
        $supplierCount = $allContacts->where('type', 'supplier')->count();
        $customerCount = $allContacts->where('type', 'customer')->count();

        return Inertia::render('Seller/Contact/Index', [
            'contacts'      => $contacts,
            'totalCount'    => $allContacts->count(),
            'supplierCount' => $supplierCount,
            'customerCount' => $customerCount,
            'filters'       => $request->only(['search', 'type']),
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureTableExists();

        $request->validate([
            'type'         => 'required|in:supplier,customer',
            'name'         => 'required|string|max:255',
            'email'        => 'nullable|email|max:255',
            'phone'        => 'nullable|string|max:50',
            'company_name' => 'nullable|string|max:255',
            'address'      => 'nullable|string|max:500',
            'balance'      => 'nullable|numeric',
            'is_active'    => 'nullable|boolean'
        ]);

        $user = Auth::user();
        $shop = $user ? $user->shop : null;
        $shopId = $shop ? $shop->id : 1;

        Contact::create([
            'shop_id'      => $shopId,
            'type'         => $request->type,
            'name'         => $request->name,
            'email'        => $request->email,
            'phone'        => $request->phone,
            'company_name' => $request->company_name,
            'address'      => $request->address,
            'balance'      => $request->balance ?? 0,
            'is_active'    => $request->boolean('is_active', true),
        ]);

        return redirect()->back()->with('success', 'Contact added successfully.');
    }

    public function update(Request $request, $id)
    {
        $this->ensureTableExists();

        $contact = Contact::findOrFail($id);

        $request->validate([
            'type'         => 'nullable|in:supplier,customer',
            'name'         => 'nullable|string|max:255',
            'email'        => 'nullable|email|max:255',
            'phone'        => 'nullable|string|max:50',
            'company_name' => 'nullable|string|max:255',
            'address'      => 'nullable|string|max:500',
            'balance'      => 'nullable|numeric',
            'is_active'    => 'nullable|boolean'
        ]);

        if ($request->has('type')) $contact->type = $request->type;
        if ($request->has('name')) $contact->name = $request->name;
        if ($request->has('email')) $contact->email = $request->email;
        if ($request->has('phone')) $contact->phone = $request->phone;
        if ($request->has('company_name')) $contact->company_name = $request->company_name;
        if ($request->has('address')) $contact->address = $request->address;
        if ($request->has('balance')) $contact->balance = $request->balance;
        if ($request->has('is_active')) $contact->is_active = $request->boolean('is_active');

        $contact->save();

        return redirect()->back()->with('success', 'Contact updated successfully.');
    }

    public function destroy($id)
    {
        $this->ensureTableExists();

        $contact = Contact::find($id);
        if ($contact) {
            $contact->delete();
        }

        return redirect()->back()->with('success', 'Contact deleted successfully.');
    }
}
