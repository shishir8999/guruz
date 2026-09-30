import { Head, Link, router } from '@inertiajs/react';
import { Package, Truck, CheckCircle2, ChevronLeft, RefreshCcw, XCircle, Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import { useI18nStore } from '@/lib/i18n';

export default function OrderDetails({ auth, order }: any) {
    const { lang } = useI18nStore();
    const steps = [
        { key: 'pending', label: 'Order Received', icon: Package },
        { key: 'processing', label: 'Processing', icon: RefreshCcw },
        { key: 'shipped', label: 'Shipped', icon: Truck },
        { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
    ];

    const currentStepIndex = steps.findIndex(s => s.key === order.status);
    const isCancelledOrReturned = ['cancelled', 'returned'].includes(order.status);
    
    // Check if delivered within 7 days
    const isReturnable = order.status === 'delivered' && order.delivered_at && 
        (new Date().getTime() - new Date(order.delivered_at).getTime()) / (1000 * 3600 * 24) <= 7;

    const handleCancelOrder = () => {
        Swal.fire({
            title: 'অর্ডার বাতিল করতে চান?',
            html: `
                <div style="text-align: left; font-size: 13px; line-height: 1.6; color: #475569;">
                    <p>আপনি কি নিশ্চিত যে <strong>অর্ডার #${order.order_number}</strong> বাতিল করতে চান?</p>
                    <p style="margin-top: 8px; font-size: 12px; color: #e11d48; font-weight: bold; background: #fff1f2; padding: 8px 12px; border-radius: 8px; border: 1px solid #fecdd3;">
                        ⚠️ অর্ডার বাতিল করার পর এটি আর ডেলিভারি বা প্রসেস করা হবে না। ওয়ালেট ব্যালেন্স ব্যবহার করা থাকলে তা স্বয়ংক্রিয়ভাবে রিফান্ড হয়ে যাবে।
                    </p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'হ্যাঁ, অর্ডার বাতিল করুন',
            cancelButtonText: 'না, ফিরে যান',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/account/orders/${order.id}/cancel`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'অর্ডার বাতিল হয়েছে!',
                            text: `অর্ডার #${order.order_number} সফলভাবে বাতিল করা হয়েছে।`,
                            confirmButtonColor: '#16a34a',
                            confirmButtonText: 'ঠিক আছে',
                        });
                    },
                    onError: (errors: any) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'বাতিল করা সম্ভব হয়নি',
                            text: Object.values(errors).join(', ') || 'অর্ডার বাতিল করতে সমস্যা হয়েছে।',
                            confirmButtonColor: '#e11d48',
                        });
                    }
                });
            }
        });
    };

    return (
        <>

            <Head title={`Order #${order.order_number}`} />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/account/orders" className="p-2 hover:bg-slate-100 rounded-full transition text-slate-700">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Order #{order.order_number}</h1>
                        <p className="text-sm text-slate-500 font-medium">
                            Placed on {new Date(order.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {order.can_cancel && (
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                                <Clock size={13} className="text-amber-600" />
                                <span>বাতিল করার সময়: {order.cancel_remaining_text}</span>
                            </span>
                            <button 
                                type="button"
                                onClick={handleCancelOrder}
                                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl transition flex items-center gap-1.5 text-xs active:scale-95 cursor-pointer shadow-2xs"
                            >
                                <XCircle size={14} className="text-rose-600 stroke-[2.5]" />
                                <span>Cancel Order (অর্ডার বাতিল)</span>
                            </button>
                        </div>
                    )}

                    {order.is_past_12_hours && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                            <Clock size={13} />
                            <span>১২ ঘণ্টা পার হওয়ায় বাতিলের সুযোগ শেষ</span>
                        </span>
                    )}

                    {isReturnable && (
                        <button 
                            onClick={() => router.post(`/account/orders/${order.id}/return`)}
                            className="px-4 py-2 bg-rose-100 text-rose-700 font-medium rounded-lg hover:bg-rose-200 transition"
                        >
                            Request Return
                        </button>
                    )}
                </div>
            </div>

            {/* Visual Tracking Stepper */}
            {!isCancelledOrReturned && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6">
                    <div className="flex justify-between items-center relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full z-0"></div>
                        <div 
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-500"
                            style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                        ></div>
                        
                        {steps.map((step, idx) => {
                            const isCompleted = currentStepIndex >= idx;
                            const isCurrent = currentStepIndex === idx;
                            const Icon = step.icon;
                            
                            return (
                                <div key={step.key} className="relative z-10 flex flex-col items-center gap-2 bg-card px-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-card transition-colors ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <span className={`text-xs font-bold ${isCurrent ? 'text-emerald-600' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {order.status === 'shipped' && order.courier_tracking_id && (
                        <div className="mt-6 p-4 bg-emerald-50 text-emerald-800 rounded-xl text-sm text-center">
                            <p><strong>Courier:</strong> {order.courier_name || 'Standard Shipping'}</p>
                            <p><strong>Tracking ID:</strong> {order.courier_tracking_id}</p>
                        </div>
                    )}
                </div>
            )}
            
            {isCancelledOrReturned && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-6 shadow-sm mb-6 text-center font-bold">
                    This order has been {order.status}.
                </div>
            )}

            {/* Order Items */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6">
                <h3 className="font-bold mb-4">Items</h3>
                <div className="space-y-4">
                    {order.items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                            <div>
                                <p className="font-medium">{item.product_name}</p>
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <span className="font-bold">৳{Number(item.subtotal).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                        <span>পণ্যের মোট দাম (Subtotal)</span>
                        <span className="font-semibold text-foreground">৳{Number(order.subtotal || order.total || 0).toLocaleString()}</span>
                    </div>
                    {Number(order.discount || 0) > 0 && (
                        <div className="flex justify-between items-center text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-200/50">
                            <span className="flex items-center gap-1.5">
                                <span>🎟️</span>
                                <span>কুপন ছাড় (Discount)</span>
                                {order.coupon_code && (
                                    <span className="ml-1 px-1.5 py-0.5 bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 rounded text-xs font-mono">
                                        {order.coupon_code}
                                    </span>
                                )}
                            </span>
                            <span>-৳{Number(order.discount).toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-muted-foreground pb-2 border-b border-border/50">
                        <span>ডেলিভারি চার্জ (Delivery Charge)</span>
                        <span className="font-semibold text-foreground">
                            {Number(order.shipping_fee || 0) === 0 ? 'ফ্রি (Free)' : `৳${Number(order.shipping_fee).toLocaleString()}`}
                        </span>
                    </div>
                    <div className="flex justify-between font-extrabold text-lg pt-1">
                        <span>Total Amount (সর্বমোট)</span>
                        <span className="text-emerald-600">৳{Number(order.total).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        
</>
    );
}
