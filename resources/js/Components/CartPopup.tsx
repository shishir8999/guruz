import React, { useEffect } from 'react';
import { useCartStore } from '@/lib/cart';
import { useCurrencyStore } from '@/lib/currency';
import { ShoppingCart, X, ArrowRight, CheckCircle2 } from 'lucide-react';

export function CartPopup() {
    const { popup, hidePopup, setIsOpen } = useCartStore();
    const { formatPrice } = useCurrencyStore();

    useEffect(() => {
        if (popup.isOpen) {
            const timer = setTimeout(() => {
                hidePopup();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [popup.isOpen, hidePopup]);

    if (!popup.isOpen) return null;

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[99999] w-[92%] max-w-md animate-in fade-in slide-in-from-top-6 duration-300 pointer-events-auto">
            <div className="relative overflow-hidden rounded-2xl p-4 shadow-2xl backdrop-blur-xl bg-slate-900/95 text-white border border-emerald-500/40 shadow-emerald-950/40">
                {/* Glowing Accent */}
                <div className="absolute -top-12 -left-12 w-28 h-28 rounded-full blur-2xl opacity-40 bg-emerald-500" />

                <div className="relative flex items-center gap-3.5 z-10">
                    {/* Thumbnail */}
                    <div className="relative shrink-0">
                        {popup.productImage ? (
                            <div className="w-12 h-12 rounded-xl bg-white p-1 overflow-hidden shadow-inner flex items-center justify-center">
                                <img src={popup.productImage} alt="" className="w-full h-full object-contain" />
                            </div>
                        ) : (
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/20 text-emerald-400">
                                <ShoppingCart className="w-6 h-6 text-emerald-400 animate-bounce" />
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-400">
                            <ShoppingCart className="w-3.5 h-3.5" />
                            কার্টে যোগ করা হয়েছে! 🛒
                        </div>
                        {popup.productName && (
                            <p className="text-xs sm:text-sm font-bold text-slate-100 truncate mt-0.5">
                                {popup.productName}
                            </p>
                        )}
                        {popup.price !== undefined && (
                            <div className="text-xs font-extrabold text-amber-300 mt-0.5">
                                {formatPrice(popup.price)}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => {
                                hidePopup();
                                setIsOpen(true);
                            }}
                            className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold px-3 py-2 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                            কার্ট দেখুন
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button 
                            onClick={hidePopup}
                            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
