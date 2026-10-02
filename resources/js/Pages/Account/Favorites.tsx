import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { HeartOff, ShoppingCart, Trash2, Heart, ArrowRight, Zap, Check, Eye } from 'lucide-react';
import Swal from 'sweetalert2';
import { useCartStore } from '@/lib/cart';
import { useWishlistStore } from '@/lib/wishlist';
import { triggerFlyToCart } from '@/Components/FlyToCart';
import { toast } from 'sonner';

export default function Favorites({ wishlistItems = [] }: { wishlistItems: any[] }) {
    const { add, showPopup } = useCartStore();
    const { removeWishlistId } = useWishlistStore();

    const handleRemove = (id: number, productId?: number) => {
        Swal.fire({
            title: 'উইশলিস্ট থেকে মুছে ফেলবেন?',
            text: "আপনি কি নিশ্চিতভাবে এই পণ্যটি পছন্দের তালিকা থেকে সরাতে চান?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'হ্যাঁ, সরিয়ে দিন',
            cancelButtonText: 'বাতিল'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/account/favorites/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        if (productId) {
                            removeWishlistId(productId);
                        }
                        toast.success('পণ্যটি সফলভাবে উইশলিস্ট থেকে সরানো হয়েছে');
                    }
                });
            }
        });
    };

    const getProductImage = (prod: any) => {
        const url = prod.primary_image_url || prod.image_url;
        if (url) {
            if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
                return url;
            }
            return '/storage/' + url;
        }
        if (prod.images) {
            try {
                const parsed = typeof prod.images === 'string' ? JSON.parse(prod.images) : prod.images;
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const img = parsed[0];
                    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')) return img;
                    return '/storage/' + img;
                }
            } catch (e) {}
        }
        return null;
    };

    const handleAddToCart = (e: React.MouseEvent, product: any) => {
        e.preventDefault();
        e.stopPropagation();

        const image = getProductImage(product);
        const finalPrice = product.sale_price ? Number(product.sale_price) : Number(product.price || 0);

        triggerFlyToCart(e, image, () => {
            add({
                product_id: product.id,
                slug: product.slug || String(product.id),
                name: product.name,
                price: finalPrice,
                image_url: image,
                shop_id: product.shop_id || product.shop?.id,
                quantity: 1
            });
            showPopup({
                productName: product.name,
                productImage: image,
                price: finalPrice,
                quantity: 1
            });
            toast.success(`'${product.name}' কার্টে যুক্ত করা হয়েছে! 🛒`);
        });
    };

    const handleBuyNow = (e: React.MouseEvent, product: any) => {
        e.preventDefault();
        e.stopPropagation();

        const image = getProductImage(product);
        const finalPrice = product.sale_price ? Number(product.sale_price) : Number(product.price || 0);

        add({
            product_id: product.id,
            slug: product.slug || String(product.id),
            name: product.name,
            price: finalPrice,
            image_url: image,
            shop_id: product.shop_id || product.shop?.id,
            quantity: 1
        });

        toast.success(`অর্ডার চেকআউটে নিয়ে যাওয়া হচ্ছে... 🚀`);
        router.visit('/checkout');
    };

    return (
        <>
            <Head title="My Favorites (পছন্দের তালিকা)" />
            
            <div className="bg-white rounded-3xl shadow-xs border border-slate-100 p-5 md:p-8 min-h-[500px]">
                <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-xs">
                            <Heart size={24} className="fill-rose-500" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">My Favorites (পছন্দের তালিকা)</h1>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">আপনার সেভ করা {wishlistItems.length} টি পছন্দের পণ্য।</p>
                        </div>
                    </div>
                </div>

                {wishlistItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
                        <div className="w-28 h-28 bg-rose-50 rounded-full flex items-center justify-center mb-5 relative">
                            <div className="absolute inset-0 bg-rose-100 rounded-full animate-ping opacity-20"></div>
                            <HeartOff size={44} className="text-rose-400 relative z-10" />
                        </div>
                        <h2 className="text-xl font-extrabold text-slate-800 mb-2">আপনার পছন্দের তালিকা খালি!</h2>
                        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                            আপনি এখনো কোনো পণ্য উইশলিস্টে যুক্ত করেননি। আমাদের আকর্ষণীয় পণ্যগুলো ঘুরে দেখুন এবং পছন্দের পণ্যে হার্ট আইকনে ক্লিক করুন!
                        </p>
                        <Link 
                            href="/" 
                            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs font-black shadow-md shadow-emerald-600/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                        >
                            <span>পণ্যসমূহ দেখুন (Start Shopping)</span>
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {wishlistItems.map((item) => {
                            const product = item.product;
                            if (!product) return null;
                            
                            const image = getProductImage(product);
                            const hasDiscount = product.sale_price && Number(product.sale_price) < Number(product.price);
                            const productUrl = `/product/${product.slug || product.id}`;

                            return (
                                <div key={item.id} className="group rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative bg-white flex flex-col border border-slate-100 hover:border-emerald-200">
                                    
                                    {/* Delete Button */}
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleRemove(item.id, item.product_id || item.product?.id);
                                        }}
                                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition z-20 shadow-sm cursor-pointer"
                                        title="পছন্দের তালিকা থেকে মুছুন"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                    
                                    {/* Product Image Link */}
                                    <Link href={productUrl} className="aspect-[4/3] bg-slate-50 overflow-hidden relative p-4 flex items-center justify-center block">
                                        {image ? (
                                            <img 
                                                src={image} 
                                                alt={product.name} 
                                                className="max-w-full max-h-full object-contain group-hover:scale-105 transition duration-500 drop-shadow-xs"
                                                onError={(e) => { 
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <ShoppingCart size={32} className="text-slate-300 opacity-60" />
                                        )}
                                        
                                        {hasDiscount && (
                                            <span className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                                                OFFER
                                            </span>
                                        )}
                                    </Link>
                                    
                                    {/* Product Info */}
                                    <div className="p-4 flex flex-col flex-1 border-t border-slate-50">
                                        <Link href={productUrl} className="block mb-2 h-9 sm:h-10 overflow-hidden">
                                            <h3 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-2 group-hover:text-emerald-600 leading-snug" title={product.name}>
                                                {product.name}
                                            </h3>
                                        </Link>
                                        
                                        <div className="flex items-baseline gap-2 mb-4">
                                            <span className="text-base sm:text-lg font-black text-slate-900">
                                                ৳{product.sale_price ?? product.price ?? '0'}
                                            </span>
                                            {hasDiscount && (
                                                <span className="text-xs text-slate-400 line-through font-medium">
                                                    ৳{product.price}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Action Buttons: Add to Cart + Order Now */}
                                        <div className="mt-auto space-y-2">
                                            {/* Order Now (Direct Checkout) */}
                                            <button 
                                                type="button"
                                                onClick={(e) => handleBuyNow(e, product)}
                                                className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
                                            >
                                                <Zap size={14} className="fill-current text-amber-300" />
                                                <span>অর্ডার করুন (Order Now)</span>
                                            </button>

                                            {/* Add to Cart */}
                                            <button 
                                                type="button"
                                                onClick={(e) => handleAddToCart(e, product)}
                                                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors active:scale-95 cursor-pointer border border-slate-200"
                                            >
                                                <ShoppingCart size={14} />
                                                <span>Add to Cart</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
