import React, { useEffect } from 'react';
import { useWishlistStore } from '@/lib/wishlist';
import { Heart, X, ArrowRight, CheckCircle2, Trash2 } from 'lucide-react';
import { Link } from '@inertiajs/react';

export function WishlistPopup() {
    const { popup, hidePopup } = useWishlistStore();

    useEffect(() => {
        if (popup.isOpen) {
            const timer = setTimeout(() => {
                hidePopup();
            }, 4500);
            return () => clearTimeout(timer);
        }
    }, [popup.isOpen, hidePopup]);

    if (!popup.isOpen) return null;

    const isAdded = popup.action === 'added';

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-md animate-in fade-in slide-in-from-top-6 duration-300 pointer-events-auto">
            <div className={`relative overflow-hidden rounded-2xl p-4 shadow-2xl backdrop-blur-xl border transition-all ${
                isAdded 
                    ? 'bg-slate-900/95 text-white border-rose-500/40 shadow-rose-950/30' 
                    : 'bg-slate-900/95 text-white border-slate-700/50 shadow-slate-950/30'
            }`}>
                {/* Glow Accent */}
                <div className={`absolute -top-12 -left-12 w-28 h-28 rounded-full blur-2xl opacity-40 ${
                    isAdded ? 'bg-rose-500' : 'bg-slate-500'
                }`} />

                <div className="relative flex items-center gap-3.5 z-10">
                    {/* Icon or Thumbnail */}
                    <div className="relative shrink-0">
                        {popup.productImage ? (
                            <div className="w-12 h-12 rounded-xl bg-white p-1 overflow-hidden shadow-inner flex items-center justify-center">
                                <img src={popup.productImage} alt="" className="w-full h-full object-contain" />
                            </div>
                        ) : (
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                isAdded ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-300'
                            }`}>
                                <Heart className={`w-6 h-6 ${isAdded ? 'fill-rose-500 text-rose-500 animate-pulse' : ''}`} />
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-400">
                            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                            {isAdded ? 'ফেভারিটে যোগ করা হয়েছে!' : 'উইশলিস্ট থেকে সরানো হয়েছে'}
                        </div>
                        {popup.productName && (
                            <p className="text-xs sm:text-sm font-bold text-slate-100 truncate mt-0.5">
                                {popup.productName}
                            </p>
                        )}
                    </div>

                    {/* Action Button */}
                    {isAdded && (
                        <Link
                            href="/account/favorites"
                            onClick={hidePopup}
                            className="shrink-0 px-3 py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl font-extrabold text-xs shadow-md hover:shadow-rose-500/30 transition-all flex items-center gap-1 active:scale-95"
                        >
                            দেখুন
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    )}

                    {/* Close button */}
                    <button
                        onClick={hidePopup}
                        className="shrink-0 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
                        aria-label="Close notification"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
