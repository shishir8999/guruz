<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    /**
     * Generate standard Order Number formatted as:
     * GZ-YYYYMMDDXXXX (সন + মাস + তারিখ + ৪ ডিজিট সিরিয়াল)
     * Example: GZ-202609010001
     */
    public static function generateOrderNumber(): string
    {
        $datePrefix = 'GZ-' . date('Ymd');
        $todayCount = self::where('order_number', 'LIKE', "{$datePrefix}%")->count();
        $serialNum = $todayCount + 1;
        $serialStr = str_pad((string)$serialNum, 4, '0', STR_PAD_LEFT);
        $candidate = "{$datePrefix}{$serialStr}";

        while (self::where('order_number', $candidate)->exists()) {
            $serialNum++;
            $serialStr = str_pad((string)$serialNum, 4, '0', STR_PAD_LEFT);
            $candidate = "{$datePrefix}{$serialStr}";
        }

        return $candidate;
    }

    public static function awardOrderCompletionCashback(Order $order): void
    {
        if (!$order->user_id) {
            return;
        }

        try {
            $wallet = CustomerWallet::firstOrCreate(
                ['user_id' => $order->user_id],
                ['balance' => 0.00, 'total_earned' => 0.00, 'total_spent' => 0.00]
            );

            // Check if cashback for this exact order was already awarded
            $hasCashback = \Illuminate\Support\Facades\DB::table('customer_wallet_transactions')
                ->where('customer_wallet_id', $wallet->id)
                ->where(function ($q) use ($order) {
                    $q->where(function ($sq) use ($order) {
                        $sq->where('reference_type', 'order')
                           ->where('reference_id', $order->id);
                    })->orWhere('description', 'like', "%{$order->order_number}%");
                })
                ->where('description', 'like', '%ক্যাশব্যাক%')
                ->exists();

            if (!$hasCashback) {
                $cashbackAmount = 20.00;
                $wallet->balance += $cashbackAmount;
                $wallet->total_earned += $cashbackAmount;
                $wallet->save();

                \Illuminate\Support\Facades\DB::table('customer_wallet_transactions')->insert([
                    'customer_wallet_id' => $wallet->id,
                    'type'               => 'credit',
                    'amount'             => $cashbackAmount,
                    'reference_type'     => 'order',
                    'reference_id'       => $order->id,
                    'description'        => "অর্ডার সফলভাবে সম্পন্ন ক্যাশব্যাক (৳২০) ({$order->order_number})",
                    'created_at'         => now(),
                    'updated_at'         => now(),
                ]);

                // Create in-app notification for the customer
                try {
                    Notification::create([
                        'user_id' => $order->user_id,
                        'title'   => '🎉 ৳২০ ক্যাশব্যাক পেয়েছেন!',
                        'message' => "আপনার অর্ডার #{$order->order_number} সফলভাবে সম্পন্ন হওয়ায় আপনার ওয়ালেটে ৳২০ ক্যাশব্যাক জমা হয়েছে।",
                        'type'    => 'wallet_cashback',
                        'link'    => '/account/wallet',
                        'is_read' => false,
                    ]);
                } catch (\Throwable $e) {}

                // Send SMS notification if customer phone exists
                if (!empty($order->customer_phone)) {
                    try {
                        \App\Services\SmsService::send(
                            $order->customer_phone,
                            "অভিনন্দন! আপনার অর্ডার #{$order->order_number} সম্পন্ন হওয়ায় Guruz ওয়ালেটে ২০ টাকা ক্যাশব্যাক যোগ হয়েছে।"
                        );
                    } catch (\Throwable $e) {}
                }
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Failed to award cashback for order {$order->id}: " . $e->getMessage());
        }
    }

    protected static function booted()
    {
        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = self::generateOrderNumber();
            }
        });

        static::updated(function ($order) {
            if ($order->isDirty('status')) {
                $oldStatus = strtolower($order->getOriginal('status') ?? '');
                $newStatus = strtolower($order->status ?? '');
                
                if (!in_array($oldStatus, ['delivered', 'completed']) && in_array($newStatus, ['delivered', 'completed']) && $order->user_id) {
                    $user = \App\Models\User::find($order->user_id);
                    if ($user) {
                        $user->increment('completed_orders_count');
                    }

                    // Automatically award ৳20 Cashback into Customer Wallet
                    self::awardOrderCompletionCashback($order);

                } elseif (in_array($oldStatus, ['delivered', 'completed']) && !in_array($newStatus, ['delivered', 'completed']) && $order->user_id) {
                    $user = \App\Models\User::find($order->user_id);
                    if ($user && $user->completed_orders_count > 0) {
                        $user->decrement('completed_orders_count');
                    }
                }
            }
        });
    }

    protected $fillable = [
        'order_number', 'user_id', 'shop_id', 'status', 'payment_status',
        'payment_method', 'transaction_id', 'subtotal', 'shipping_fee',
        'discount', 'coupon_code', 'total', 'customer_name', 'customer_email',
        'customer_phone', 'shipping_address', 'city', 'zone',
        'courier_name', 'courier_tracking_id', 'notes', 'admin_seen_at',
        'commission_rate', 'commission_amount', 'courier_charge',
        'vendor_net_earning', 'commission_settled_at',
    ];

    protected $casts = [
        'subtotal'               => 'decimal:2',
        'shipping_fee'           => 'decimal:2',
        'discount'               => 'decimal:2',
        'total'                  => 'decimal:2',
        'commission_rate'        => 'decimal:2',
        'commission_amount'      => 'decimal:2',
        'courier_charge'         => 'decimal:2',
        'vendor_net_earning'     => 'decimal:2',
        'admin_seen_at'          => 'datetime',
        'commission_settled_at'  => 'datetime',
    ];

    // Accessors & Mutators for backward compatibility
    public function getTotalAmountAttribute()
    {
        return $this->attributes['total'] ?? 0;
    }

    public function setTotalAmountAttribute($value)
    {
        $this->attributes['total'] = $value;
    }

    public function getOrderStatusAttribute()
    {
        return $this->attributes['status'] ?? 'pending';
    }

    public function setOrderStatusAttribute($value)
    {
        $this->attributes['status'] = $value;
    }

    // Relations
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function pickupRequests(): HasMany
    {
        return $this->hasMany(PickupRequest::class);
    }
}
