import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { Star, ShoppingCart, Heart, Lock } from 'lucide-react';
import { useCartStore } from '@/lib/cart';
import { useCurrencyStore } from '@/lib/currency';
import { useI18nStore } from '@/lib/i18n';
import { useWishlistStore } from '@/lib/wishlist';
import { triggerFlyToCart } from '@/Components/FlyToCart';
import { triggerFlyToWishlist } from '@/Components/FlyToWishlist';
import axios from 'axios';
import { toast } from 'sonner';

export interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    sale_price?: number;
    rating?: number;
    primary_image_url?: string;
    shop?: { name: string; slug: string };
    shop_id?: number;
    min_vip_level?: string;
}

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
    const [imgError, setImgError] = useState(false);
    const { add, setIsOpen, showPopup: showCartPopup } = useCartStore();
    const { formatPrice } = useCurrencyStore();
    const { t, lang } = useI18nStore();
    const { wishlistIds, initWishlist, toggleWishlistId, showPopup, isInitialized } = useWishlistStore();

    const displayPrice = product.sale_price ?? product.price;
    const discount = product.sale_price
        ? Math.round(((product.price - product.sale_price) / product.price) * 100)
        : 0;

    const { auth } = usePage<any>().props;
    const user = auth?.user;

    // Initialize wishlist store from server props once
    useEffect(() => {
        if (!isInitialized && auth?.wishlist_ids && Array.isArray(auth.wishlist_ids)) {
            initWishlist(auth.wishlist_ids);
        }
    }, [isInitialized, auth?.wishlist_ids]);

    // Single source of truth:
    const isFav = isInitialized
        ? wishlistIds.includes(Number(product.id))
        : (auth?.wishlist_ids ? auth.wishlist_ids.map(Number).includes(Number(product.id)) : false);

    const vipLevelValue = (level?: string) => {
        switch (level) {
            case 'diamond': return 5;
            case 'platinum': return 4;
            case 'gold': return 3;
            case 'silver': return 2;
            case 'bronze': return 1;
            case 'beginner':
            default: return 0;
        }
    };

    const userLevel = vipLevelValue(user?.vip_level);
    const requiredLevel = vipLevelValue(product.min_vip_level);
    const isLocked = !!product.min_vip_level && userLevel < requiredLevel;

    const addToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isLocked) return;

        // 🚀 Add to cart immediately so rapid checkout navigation never sees an empty cart
        add({
            product_id: product.id,
            slug: product.slug,
            name: product.name,
            price: displayPrice,
            image_url: product.primary_image_url,
            shop_id: product.shop_id,
            quantity: 1
        });

        // 🚀 Trigger Magical Flying Animation visually
        triggerFlyToCart(e, product.primary_image_url);
    };

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error('উইশলিস্টে যুক্ত করতে লগইন করুন!');
            return;
        }

        const currentlyFav = isFav;
        const willBeAdded = !currentlyFav;

        if (willBeAdded) {
            // 💖 Trigger Flying Heart Animation to header WISHLIST!
            triggerFlyToWishlist(e, product.primary_image_url, () => {
                toggleWishlistId(product.id);
            });
        } else {
            toggleWishlistId(product.id);
        }

        showPopup({
            productName: product.name,
            productImage: product.primary_image_url,
            action: willBeAdded ? 'added' : 'removed',
        });

        try {
            const res = await axios.post('/api/v1/wishlist/toggle', { product_id: product.id });
            if (res.data?.status === 'removed') {
                toast.success('উইশলিস্ট থেকে সরানো হয়েছে');
            } else if (res.data?.status === 'added') {
                toast.success('উইশলিস্টে যুক্ত করা হয়েছে! ❤️');
            }
            if (window.location.pathname.includes('/favorites')) {
                router.reload();
            }
        } catch (error) {
            toggleWishlistId(product.id);
            console.error('Wishlist error', error);
            toast.error('উইশলিস্ট পরিবর্তন করতে সমস্যা হয়েছে।');
        }
    };

    return (
        <div className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-300 transition-shadow duration-200 flex flex-col justify-between h-full transform-gpu backface-hidden">
            <div className="relative block overflow-hidden bg-white h-40 md:h-48 lg:h-[280px]">
                <Link
                    href={`/products/${product.slug}`}
                    className="block w-full h-full"
                >
                    {product.primary_image_url && !imgError ? (
                        <img
                            src={product.primary_image_url}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            onError={() => setImgError(true)}
                            className={`w-full h-full object-contain pointer-events-none ${isLocked ? 'blur-sm grayscale-[0.5]' : ''}`}
                        />
                    ) : (
                        <div className={`w-full h-full flex flex-col items-center justify-center bg-purple-50 text-purple-600 ${isLocked ? 'blur-sm grayscale-[0.5]' : ''}`}>
                            <ShoppingCart className="w-10 h-10 opacity-80" strokeWidth={1.5} />
                        </div>
                    )}
                </Link>

                {isLocked && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/40 text-white p-2 text-center backdrop-blur-[2px] pointer-events-none">
                        <div className="bg-slate-900/80 p-2 rounded-full mb-1">
                            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-400">
                            Unlocks at {product.min_vip_level}
                        </span>
                    </div>
                )}

                {discount > 0 && (
                    <div className="absolute top-1.5 left-1.5 z-10 bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs pointer-events-none">
                        -{discount}%
                    </div>
                )}

                <button
                    type="button"
                    onClick={toggleWishlist}
                    aria-label="Wishlist"
                    className={`absolute top-2 right-2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-md flex items-center justify-center transition-colors ${
                        isFav 
                            ? 'bg-rose-500 text-white shadow-rose-500/40 ring-2 ring-rose-300' 
                            : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                    }`}
                    title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                >
                    <Heart 
                        className={`w-4 h-4 transition-colors ${
                            isFav ? 'fill-white text-white' : 'text-slate-400 hover:text-rose-500'
                        }`} 
                    />
                </button>
            </div>

            <div className="p-2 sm:p-3 flex-1 flex flex-col justify-between gap-1">
                <div>
                    <Link
                        href={`/products/${product.slug}`}
                        className="text-xs sm:text-sm font-bold line-clamp-2 text-slate-800 hover:text-emerald-600 transition-colors leading-tight min-h-[2rem] sm:min-h-[2.5rem] flex items-start"
                    >
                        {product.name}
                    </Link>

                    <div className="flex items-center gap-1 mt-1">
                        <span className="inline-flex items-center gap-0.5 text-amber-500 text-[11px] font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {product.rating ?? '5.0'}
                        </span>
                    </div>

                    <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
                        <span className="font-black text-xs sm:text-base text-emerald-700">
                            {formatPrice(displayPrice)}
                        </span>
                        {discount > 0 && (
                            <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                                {formatPrice(product.price)}
                            </span>
                        )}
                    </div>
                </div>

                {!compact && (
                    <button
                        onClick={addToCart}
                        disabled={isLocked}
                        className={`mt-2 w-full inline-flex items-center justify-center gap-1 text-[10px] sm:text-xs font-extrabold rounded-lg py-1.5 px-1 sm:px-2 transition shadow-xs active:scale-98 ${
                            isLocked 
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                    >
                        {isLocked ? (
                            <>
                                <Lock className="w-3.5 h-3.5 shrink-0" />
                                <span className="whitespace-nowrap truncate">Locked</span>
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                                <span className="whitespace-nowrap truncate">{t('add_to_cart')}</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}