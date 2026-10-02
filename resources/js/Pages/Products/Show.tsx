import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Header } from '@/Components/Header';
import { Footer } from '@/Components/Footer';
import { TopNoticeBar } from '@/Components/TopNoticeBar';
import { NoticeMarquee } from '@/Components/NoticeMarquee';
import { MobileBottomNav } from '@/Components/MobileBottomNav';
import { ProductCard, Product as CardProduct } from '@/Components/ProductCard';
import { 
    ShoppingCart, Heart, Star, Share2, ChevronLeft, ChevronRight, ChevronDown,
    Minus, Plus, Store, MessageCircle, ShieldCheck, MapPin, Zap, 
    RotateCcw, Gift, CheckCircle2, Award, ClipboardList, FileText, FileCheck,
    User, Edit3, Send, ThumbsUp, Check, Mail, ZoomIn, ZoomOut, X
} from 'lucide-react';
import { useCartStore } from '@/lib/cart';
import { useCurrencyStore } from '@/lib/currency';
import { useWishlistStore } from '@/lib/wishlist';
import { triggerFlyToCart } from '@/Components/FlyToCart';
import Swal from 'sweetalert2';
import axios from 'axios';
import { toast } from 'sonner';

interface ProductImage { id: number; url: string; is_primary: boolean; }
interface ProductVariant { id: number; name: string; price: number; sale_price: number | null; stock: number; }
interface Review { 
    id: number; 
    rating: number; 
    comment: string; 
    user_name?: string;
    reviewer_name?: string;
    user?: { name: string; avatar_url: string | null } | null; 
    created_at: string; 
}
interface Product {
    id: number; slug: string; name: string; description: string;
    price: number; sale_price: number | null; stock_quantity?: number; stock?: number;
    primary_image_url?: string; rating?: number; reviews_count?: number; sold_count?: number;
    sku?: string; brand?: string; warranty?: string; warranty_type?: string | null;
    shop?: { id: number; name: string; slug: string; logo_url: string | null; rating: number; followers?: number };
    category?: { id: number; name: string; slug: string } | null;
    images?: ProductImage[];
    variants?: ProductVariant[];
    reviews?: Review[];
    min_vip_level?: string;
}

export default function ProductShow({
    product,
    relatedProducts = [],
    reviewStats = { average: 5.0, total: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
}: {
    product: Product;
    relatedProducts: CardProduct[];
    reviewStats: { average: number; total: number; breakdown: Record<number, number> };
}) {
    const addToCart = useCartStore(s => s.add);
    const setIsOpen = useCartStore(s => s.setIsOpen);
    const showCartPopup = useCartStore(s => s.showPopup);
    const formatPrice = useCurrencyStore(s => s.formatPrice);

    const [qty, setQty] = useState(1);
    const [activeImg, setActiveImg] = useState(0);
    const [activeVariant, setActiveVariant] = useState<ProductVariant | null>(product.variants?.[0] ?? null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [questionInput, setQuestionInput] = useState('');
    
    // Color Selection
    const availableColors = ['Black', 'Silver', 'Ocean Blue', 'Rose Gold'];
    const [selectedColor, setSelectedColor] = useState<string>(availableColors[0]);

    // Accordion Dropdown States for Product Details
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        basic: true,
        detailed: true,
        warranty: false,
        terms: false,
    });

    const toggleSection = (key: string) => {
        setOpenSections(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const mainImage = product.primary_image_url || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600';
    const allImages = [
        mainImage,
        ...(product.images?.map(i => i.url) ?? []),
    ];

    // Image Zoom & Lightbox State
    const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
    const [modalZoomScale, setModalZoomScale] = useState(1);
    const [isHoverZooming, setIsHoverZooming] = useState(false);
    const [hoverPos, setHoverPos] = useState({ x: 50, y: 50 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
        setHoverPos({ x, y });
    };

    const handlePrevImage = () => {
        setActiveImg(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
        setModalZoomScale(1);
    };

    const handleNextImage = () => {
        setActiveImg(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
        setModalZoomScale(1);
    };

    useEffect(() => {
        if (!isZoomModalOpen) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsZoomModalOpen(false);
                setModalZoomScale(1);
            } else if (e.key === 'ArrowLeft') {
                handlePrevImage();
            } else if (e.key === 'ArrowRight') {
                handleNextImage();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [isZoomModalOpen, allImages.length]);

    const currentPrice = activeVariant?.sale_price ?? activeVariant?.price ?? product.sale_price ?? product.price;
    const originalPrice = activeVariant?.price ?? product.price;
    const discount = originalPrice > currentPrice
        ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
        : 0;

    const stock = product.stock_quantity ?? product.stock ?? 25;
    const shopName = product.shop?.name || 'shishir';
    const shopSlug = product.shop?.slug || 'shishir-store';

    const { auth } = usePage<any>().props;
    const user = auth?.user;

    const { wishlistIds, initWishlist, toggleWishlistId, showPopup: showWishlistPopup, isInitialized } = useWishlistStore();

    useEffect(() => {
        if (!isInitialized && auth?.wishlist_ids && Array.isArray(auth.wishlist_ids)) {
            initWishlist(auth.wishlist_ids);
        }
    }, [isInitialized, auth?.wishlist_ids]);

    const isWishlisted = isInitialized
        ? wishlistIds.includes(Number(product.id))
        : (auth?.wishlist_ids ? auth.wishlist_ids.map(Number).includes(Number(product.id)) : false);

    const handleToggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('উইশলিস্টে যুক্ত করতে লগইন করুন!');
            return;
        }

        const currentlyFav = isWishlisted;
        const willBeAdded = !currentlyFav;

        toggleWishlistId(product.id);

        showWishlistPopup({
            productName: product.name,
            productImage: allImages[0],
            action: willBeAdded ? 'added' : 'removed',
        });

        try {
            const res = await axios.post('/api/v1/wishlist/toggle', { product_id: product.id });
            if (res.data?.status === 'removed') {
                toast.success('উইশলিস্ট থেকে সরানো হয়েছে');
            } else if (res.data?.status === 'added') {
                toast.success('উইশলিস্টে যুক্ত করা হয়েছে! ❤️');
            }
        } catch (error) {
            toggleWishlistId(product.id);
            toast.error('উইশলিস্ট পরিবর্তন করতে সমস্যা হয়েছে।');
        }
    };

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

    // Review Submission States
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewerName, setReviewerName] = useState(user?.name || '');
    const [reviewerEmail, setReviewerEmail] = useState(user?.email || '');
    const [reviewComment, setReviewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewRating || reviewRating < 1) {
            Swal.fire({
                icon: 'warning',
                title: 'স্টার রেটিং দিন',
                text: 'অনুগ্রহ করে প্রোডাক্টের জন্য ১ থেকে ৫ এর মধ্যে স্টার রেটিং নির্বাচন করুন।',
                customClass: { popup: 'rounded-2xl shadow-xl' }
            });
            return;
        }

        if (!reviewComment.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'মন্তব্য লিখুন',
                text: 'অনুগ্রহ করে প্রোডাক্ট সম্পর্কে আপনার মতামত লিখুন।',
                customClass: { popup: 'rounded-2xl shadow-xl' }
            });
            return;
        }

        if (!user && !reviewerName.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'নাম প্রদান করুন',
                text: 'অনুগ্রহ করে আপনার পুরো নাম লিখুন।',
                customClass: { popup: 'rounded-2xl shadow-xl' }
            });
            return;
        }

        setIsSubmittingReview(true);
        router.post(`/products/${product.id}/reviews`, {
            rating: reviewRating,
            comment: reviewComment,
            user_name: reviewerName,
            user_email: reviewerEmail,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmittingReview(false);
                setIsReviewOpen(false);
                setReviewRating(0);
                setHoverRating(0);
                setReviewComment('');
                Swal.fire({
                    icon: 'success',
                    title: 'রিভিউ সফলভাবে গৃহীত হয়েছে! 🎉',
                    text: 'আপনার মূল্যবান মতামত শেয়ার করার জন্য আন্তরিকভাবে ধন্যবাদ জানাই।',
                    customClass: { popup: 'rounded-2xl shadow-2xl p-6 text-center' },
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'ঠিক আছে',
                });
            },
            onError: (errors: any) => {
                setIsSubmittingReview(false);
                Swal.fire({
                    icon: 'error',
                    title: 'সাবমিট করা যায়নি',
                    text: Object.values(errors)[0] as string || 'অনুগ্রহ করে পুনরায় চেষ্টা করুন।',
                    customClass: { popup: 'rounded-2xl shadow-xl' }
                });
            }
        });
    };

    const handleAddToCart = (e?: React.MouseEvent) => {
        if (isLocked) return;

        // 🚀 Add to cart store immediately so cart is never empty on immediate checkout/navigation
        addToCart({
            product_id: product.id,
            slug: product.slug,
            name: product.name,
            price: currentPrice,
            image_url: allImages[0],
            shop_id: product.shop?.id,
            quantity: qty,
        });

        // 🚀 Trigger Magical Flying Animation visually
        triggerFlyToCart(e || null, allImages[0]);
    };

    const handleBuyNow = () => {
        if (isLocked) return;
        addToCart({
            product_id: product.id,
            slug: product.slug,
            name: product.name,
            price: currentPrice,
            image_url: allImages[0],
            shop_id: product.shop?.id,
            quantity: qty,
        });
        router.visit('/checkout');
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: product.name, url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('লিঙ্ক কপি হয়েছে!');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col pb-16 md:pb-0">
            <Head title={`${product.name} — Guruz`} />

            {/* Top Announcement Bar */}
            <TopNoticeBar />


            {/* Announcement Ticker */}
            <NoticeMarquee />

            {/* Main Header */}
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-2 sm:px-4 py-3 space-y-4 w-full">

                {/* Breadcrumb */}
                <div className="bg-white rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 shadow-2xs flex items-center gap-2 border border-slate-200">
                    <Link href="/" className="hover:text-blue-600">🏠 হোম</Link>
                    <span>/</span>
                    {product.category && (
                        <>
                            <Link href={`/products?category=${product.category.slug}`} className="hover:text-blue-600">
                                {product.category.name}
                            </Link>
                            <span>/</span>
                        </>
                    )}
                    <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
                </div>

                {/* === MAIN PRODUCT GRID (3-COLUMN LAYOUT MATCHING SCREENSHOT) === */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                    {/* ── LEFT COLUMN: IMAGE GALLERY (4 cols) ── */}
                    <div className="lg:col-span-4 bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-3">
                        <div
                            className="relative aspect-square rounded-lg overflow-hidden bg-white border border-slate-200 group cursor-crosshair select-none"
                            onMouseEnter={() => setIsHoverZooming(true)}
                            onMouseLeave={() => setIsHoverZooming(false)}
                            onMouseMove={handleMouseMove}
                            onClick={() => {
                                setIsZoomModalOpen(true);
                                setModalZoomScale(1.5);
                            }}
                        >
                            <img
                                src={allImages[activeImg]}
                                alt={product.name}
                                className="w-full h-full object-contain p-2 transition-transform duration-150 ease-out pointer-events-none"
                                style={
                                    isHoverZooming
                                        ? {
                                            transform: 'scale(2.4)',
                                            transformOrigin: `${hoverPos.x}% ${hoverPos.y}%`,
                                        }
                                        : {
                                            transform: 'scale(1)',
                                        }
                                }
                            />

                            {/* Badges */}
                            <span className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow flex items-center gap-1 z-10 pointer-events-none">
                                🔥 অনলাইন
                            </span>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsZoomModalOpen(true);
                                    setModalZoomScale(1.5);
                                }}
                                className="absolute top-2 right-2 bg-slate-900/85 hover:bg-black text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow flex items-center gap-1.5 transition cursor-pointer z-10"
                                title="জুম করে বড় আকারে দেখুন"
                            >
                                <ZoomIn className="w-3.5 h-3.5 text-yellow-300" />
                                <span>🔍 জুম</span>
                            </button>

                            {discount > 0 && (
                                <span className="absolute bottom-2 left-2 bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded shadow z-10 pointer-events-none">
                                    -{discount}% ছাড়
                                </span>
                            )}

                            {isHoverZooming && (
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full pointer-events-none z-10 shadow">
                                    ক্লিক করলে ফুলস্ক্রিন জুম হবে
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Selector */}
                        {allImages.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {allImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImg(i)}
                                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 bg-slate-50 transition shrink-0 cursor-pointer ${
                                            activeImg === i ? 'border-emerald-600 ring-2 ring-emerald-200 scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-contain p-1" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── MIDDLE COLUMN: PRODUCT INFO & ACTIONS (5 cols) ── */}
                    <div className="lg:col-span-5 bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-4">
                        
                        {/* Title + Wishlist & Share */}
                        <div className="flex items-start justify-between gap-3 border-b pb-3 border-slate-200">
                            <div>
                                <h1 className="text-base sm:text-xl font-extrabold text-slate-900 leading-snug">
                                    {product.name}
                                </h1>
                                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-semibold">
                                    <span className="flex items-center gap-0.5 text-amber-500 font-black">
                                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                        {product.rating ?? '5.0'}
                                    </span>
                                    <span>({reviewStats.total} Reviews)</span>
                                    <span>•</span>
                                    <span>0 Questions</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={handleToggleWishlist}
                                    className={`p-2 rounded-full border transition cursor-pointer ${
                                        isWishlisted ? 'bg-red-50 border-red-300 text-red-600' : 'border-slate-200 text-slate-500 hover:text-red-500'
                                    }`}
                                    title="Wishlist"
                                >
                                    <Heart className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} />
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="p-2 rounded-full border border-slate-200 text-slate-500 hover:text-blue-600 transition"
                                    title="Share"
                                >
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* SKU & Brand info badge */}
                        <div className="text-xs text-slate-600 font-semibold flex items-center flex-wrap gap-2 sm:gap-3">
                            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                ব্র্যান্ড: <strong className="text-slate-900">{product.brand || 'লজিটেক'}</strong>
                            </span>
                            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                মডেল/SKU: <strong className="text-slate-900">{product.sku || `GRZ-PROD-${product.id}`}</strong>
                            </span>
                            {product.warranty_type && product.warranty_type !== 'No warranty' && (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-black flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>{product.warranty_type}</span>
                                </span>
                            )}
                        </div>

                        {/* Large Price Display */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-baseline gap-3">
                            <span className="text-2xl sm:text-3xl font-black text-red-600">
                                {formatPrice(currentPrice)}
                            </span>
                            {discount > 0 && (
                                <span className="text-sm text-slate-400 line-through font-bold">
                                    {formatPrice(originalPrice)}
                                </span>
                            )}
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                স্টক আছে ({stock}টি বাকি)
                            </span>
                        </div>

                        {/* Color Selector */}
                        <div className="space-y-2">
                            <span className="text-xs font-bold text-slate-700">Color Family: <span className="text-slate-900">{selectedColor}</span></span>
                            <div className="flex flex-wrap gap-2">
                                {availableColors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={`px-3 py-1.5 border rounded-md text-[11px] font-bold transition ${
                                            selectedColor === color 
                                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                                                : 'border-slate-200 text-slate-600 hover:border-blue-300'
                                        }`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-700">পরিমাণ:</span>
                            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                                <button
                                    onClick={() => setQty(q => Math.max(1, q - 1))}
                                    className="px-3 py-1.5 hover:bg-slate-100 text-slate-700 transition"
                                >
                                    <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-4 py-1.5 text-xs font-black min-w-[36px] text-center">{qty}</span>
                                <button
                                    onClick={() => setQty(q => Math.min(stock, q + 1))}
                                    className="px-3 py-1.5 hover:bg-slate-100 text-slate-700 transition"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* VIP Lock Banner */}
                        {isLocked && (
                            <div className="bg-slate-900 text-amber-400 p-4 rounded-xl border-2 border-amber-500/50 flex flex-col items-center justify-center text-center space-y-2 mb-4 shadow-lg">
                                <Award className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
                                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider">
                                    VIP Exclusive: Unlocks at {product.min_vip_level}
                                </h3>
                                <p className="text-[11px] sm:text-xs text-amber-200/80 font-medium">
                                    Complete more orders to reach {product.min_vip_level} level and unlock this premium product.
                                </p>
                            </div>
                        )}

                        {/* 2 Main Action Buttons matching screenshot */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={(e) => handleAddToCart(e)}
                                disabled={isLocked}
                                className={`w-full font-extrabold py-2.5 px-3 rounded-xl transition text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs cursor-pointer ${
                                    isLocked 
                                        ? 'bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed'
                                        : 'bg-white hover:bg-blue-50 text-blue-700 border-2 border-blue-600'
                                }`}
                            >
                                <ShoppingCart className="w-4 h-4" />
                                কার্ট যোগ করুন
                            </button>

                            <button
                                onClick={handleBuyNow}
                                disabled={isLocked}
                                className={`w-full font-black py-2.5 px-3 rounded-xl transition text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md ${
                                    isLocked 
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                            >
                                এখনই কিনুন
                            </button>
                        </div>

                        {/* Orange Full-width Quick Buy Button */}
                        <button
                            onClick={handleBuyNow}
                            disabled={isLocked}
                            className={`w-full font-black py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md tracking-wide ${
                                isLocked 
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:opacity-95 text-white'
                            }`}
                        >
                            ⚡ সরাসরি অর্ডার করুন
                        </button>

                        {/* Add-on Gift / Referral Deals Box */}
                        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                                <span className="flex items-center gap-1.5">
                                    <Gift className="w-4 h-4 text-emerald-600" />
                                    বন্ধুদের উপহার দিন (১০% + ৳১২০)
                                </span>
                            </div>
                            <button
                                onClick={handleShare}
                                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-2 transition"
                            >
                                💸 বন্ধুর সাথে শেয়ার করুন
                            </button>
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN: DELIVERY OPTIONS & VENDOR CARD (3 cols) ── */}
                    <div className="lg:col-span-3 space-y-4">
                        
                        {/* 1. Delivery Options Box */}
                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
                            <h3 className="font-extrabold text-xs text-slate-800 border-b pb-2 flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-blue-600" /> Delivery Options
                            </h3>
                            <ul className="space-y-2 text-xs font-semibold text-slate-700">
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span>Inside Dhaka: {formatPrice(60)} (1-2 Days)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span>Outside Dhaka: {formatPrice(120)} (2-4 Days)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                                    <span>Express Same-Day Delivery</span>
                                </li>
                            </ul>
                        </div>

                        {/* 2. Vendor / Merchant Card matching screenshot */}
                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-300 text-blue-900 font-black text-sm flex items-center justify-center">
                                    {product.shop?.logo_url ? (
                                        <img src={product.shop.logo_url} alt="" className="w-full h-full object-cover rounded-full" />
                                    ) : shopName[0].toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 font-bold text-xs text-slate-900">
                                        <span>{shopName}</span>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 fill-blue-100" />
                                    </div>
                                    <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded mt-0.5">
                                        ⭐ RISING STAR
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    href={`/shops/${shopSlug}`}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-center py-1.5 px-2 rounded-lg text-[11px] font-bold transition border border-slate-200"
                                >
                                    View Shop
                                </Link>
                                <a
                                    href="https://wa.me/8801700000000"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-center py-1.5 px-2 rounded-lg text-[11px] font-bold transition border border-emerald-200 flex items-center justify-center gap-1"
                                >
                                    <MessageCircle className="w-3 h-3" /> Chat Now
                                </a>
                            </div>

                            <div className="border-t pt-2 grid grid-cols-3 gap-1 text-center text-[10px] font-bold text-slate-600">
                                <div>
                                    <span className="block text-slate-400 font-semibold">Ship on time</span>
                                    <span className="text-emerald-600">95%</span>
                                </div>
                                <div>
                                    <span className="block text-slate-400 font-semibold">Chat response</span>
                                    <span className="text-emerald-600">80%</span>
                                </div>
                                <div>
                                    <span className="block text-slate-400 font-semibold">Shop rating</span>
                                    <span className="text-emerald-600">100%</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ── PRODUCT DETAILS ACCORDION DROPDOWN SYSTEM ── */}
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                    <h2 className="font-black text-sm sm:text-base border-b pb-3 text-slate-900 leading-snug">
                        প্রোডাক্ট এর বিস্তারিত <span className="text-emerald-700 dark:text-emerald-400 font-black">{product.name}</span>
                    </h2>

                    <div className="space-y-3 pt-1">
                        {/* 1. ডিটেইল্ড ইনফরমেশন (Detailed Information) */}
                        <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                            openSections.detailed 
                                ? 'border-emerald-500 bg-emerald-50/20 shadow-xs ring-2 ring-emerald-500/10' 
                                : 'border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-md'
                        }`}>
                            <button
                                type="button"
                                onClick={() => toggleSection('detailed')}
                                className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left cursor-pointer select-none group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-100/80 border border-emerald-300/80 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform duration-300 shrink-0">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                                        ডিটেইল্ড ইনফরমেশন
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-emerald-600">
                                        {openSections.detailed ? 'লুকান' : 'দেখুন'}
                                    </span>
                                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSections.detailed ? 'rotate-180 text-emerald-600' : 'group-hover:text-emerald-600'}`} />
                                </div>
                            </button>

                            {openSections.detailed && (
                                <div className="px-5 pb-5 pt-3 border-t border-emerald-100 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white/90 animate-in fade-in duration-200">
                                    {product.description || 'এই প্রোডাক্টের সমস্ত ফিচার এবং বিশদ বর্ণনা সেলার কর্তৃক ভেরিফাইড।\n\n১০০% অরিজিনাল ব্র্যান্ড নিউ অফিসিয়াল প্রোডাক্ট। দারুণ কোয়ালিটি ও লং লাস্টিং পারফরম্যান্স উপভোগ করুন।'}
                                </div>
                            )}
                        </div>

                        {/* 2. ওয়ারেন্টি ইনফরমেশন (Warranty Information) */}
                        <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                            openSections.warranty 
                                ? 'border-teal-500 bg-teal-50/20 shadow-xs ring-2 ring-teal-500/10' 
                                : 'border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50/50 hover:shadow-md'
                        }`}>
                            <button
                                type="button"
                                onClick={() => toggleSection('warranty')}
                                className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left cursor-pointer select-none group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-teal-100/80 border border-teal-300/80 flex items-center justify-center text-teal-700 group-hover:scale-110 transition-transform duration-300 shrink-0">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                                        ওয়ারেন্টি ইনফরমেশন
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-teal-600">
                                        {openSections.warranty ? 'লুকান' : 'দেখুন'}
                                    </span>
                                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSections.warranty ? 'rotate-180 text-teal-600' : 'group-hover:text-teal-600'}`} />
                                </div>
                            </button>

                            {openSections.warranty && (
                                <div className="px-5 pb-5 pt-3 border-t border-teal-100 text-xs sm:text-sm text-slate-700 leading-relaxed bg-amber-50/40 space-y-2 animate-in fade-in duration-200">
                                    <p className="font-black text-amber-950 flex items-center gap-1.5 text-xs">
                                        🛡️ অফিসিয়াল ওয়ারেন্টি পলিসি ও গ্যারান্টি:
                                    </p>
                                    <p className="text-slate-700 font-medium">
                                        {product.warranty_type && product.warranty_type !== 'No warranty'
                                            ? `এই প্রোডাক্টটির সাথে ${product.warranty_type} সুবিধা মিলবে। কোনো যান্ত্রিক বা উৎপাদনজনিত ত্রুটি দেখা দিলে ক্যাশ মেমো বা অর্ডার আইডি দিয়ে যোগাযোগ করতে পারবেন।`
                                            : (product.warranty || 'এই প্রোডাক্টটিতে কোনো অতিরিক্ত অফিসিয়াল ওয়ারেন্টি সুবিধা প্রযোজ্য নয় (তবে ৭ দিনের রিটার্ন ও রিফান্ড নিশ্চয়তা প্রযোজ্য)।')}
                                    </p>
                                    <div className="pt-1 flex items-center gap-2 text-[11px] font-bold text-emerald-700">
                                        <span>✓ ৭ দিনের ফ্রি রিফান্ড/রিপ্লেসমেন্ট গ্যারান্টি</span>
                                        <span>•</span>
                                        <span>✓ ১০০% আসল প্রোডাক্ট নিশ্চয়তা</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. টার্মস অ্যান্ড কন্ডিশনস (Terms & Conditions) */}
                        <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                            openSections.terms 
                                ? 'border-blue-500 bg-blue-50/20 shadow-xs ring-2 ring-blue-500/10' 
                                : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-md'
                        }`}>
                            <button
                                type="button"
                                onClick={() => toggleSection('terms')}
                                className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left cursor-pointer select-none group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-100/80 border border-blue-300/80 flex items-center justify-center text-blue-700 group-hover:scale-110 transition-transform duration-300 shrink-0">
                                        <FileCheck className="w-5 h-5" />
                                    </div>
                                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                                        টার্মস অ্যান্ড কন্ডিশনস
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-blue-600">
                                        {openSections.terms ? 'লুকান' : 'দেখুন'}
                                    </span>
                                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSections.terms ? 'rotate-180 text-blue-600' : 'group-hover:text-blue-600'}`} />
                                </div>
                            </button>

                            {openSections.terms && (
                                <div className="px-5 pb-5 pt-3 border-t border-blue-100 text-xs sm:text-sm text-slate-700 space-y-2 animate-in fade-in duration-200">
                                    <p className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                                        📜 ডেলিভারি ও রিটার্ন সংক্রান্ত কন্ডিশনসমূহ:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1.5 pl-1 text-slate-700 font-medium">
                                        <li>ডেলিভারিম্যানের সামনে প্রোডাক্ট পরীক্ষা করে গ্রহণ করুন।</li>
                                        <li>পার্সেল আনবক্সিং করার সময় মোবাইল ফোনে একটি ছোট ভিডিও ধারণ করুন।</li>
                                        <li>ব্যবহারজনিত ক্ষয়ক্ষতি অথবা দুর্ঘটনাজনিত ভাঙচুর ওয়ারেন্টির আওতাভুক্ত নয়।</li>
                                        <li>ক্যাশ অন ডেলিভারি এবং যেকোনো ডিজিটাল পেমেন্ট সম্পূর্ণ সিকিউরড।</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── CUSTOMER REVIEWS SECTION ── */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-200">
                        <div>
                            <h2 className="font-black text-base sm:text-lg text-slate-900 flex items-center gap-2">
                                <span>কাস্টমার রিভিউ</span>
                                <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                                    {reviewStats.total} টি রিভিউ
                                </span>
                            </h2>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                সমস্ত রিভিউ গ্রাহকদের বাস্তব অভিজ্ঞতা থেকে সংগৃহীত ও ভেরিফাইড।
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <span className="hidden sm:inline-flex bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-emerald-600" /> Guruz Assured 100% Authentic!
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsReviewOpen(!isReviewOpen)}
                                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-extrabold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                            >
                                <Edit3 className="w-4 h-4" />
                                {isReviewOpen ? 'ফর্ম বন্ধ করুন' : 'রিভিউ দিন'}
                            </button>
                        </div>
                    </div>

                    {/* Review Submission Form (Expandable / Inline) */}
                    {isReviewOpen && (
                        <form 
                            onSubmit={handleReviewSubmit}
                            className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border-2 border-emerald-500/30 space-y-4 animate-in fade-in duration-200"
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                <div className="flex items-center gap-2">
                                    <Edit3 className="w-4 h-4 text-emerald-600" />
                                    <h3 className="font-extrabold text-sm text-slate-900">আপনার প্রোডাক্ট রিভিউ ও মতামত</h3>
                                </div>
                            </div>

                            {/* 1. Rating Selector */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-700 block">স্টার রেটিং নির্বাচন করুন *</label>
                                <div className="flex items-center gap-1.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewRating(star)}
                                            onMouseEnter={() => {
                                                setHoverRating(star);
                                                setReviewRating(star);
                                            }}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-hidden"
                                            title={`${star} স্টার`}
                                        >
                                            <Star 
                                                className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                                                    (hoverRating || reviewRating) >= star 
                                                        ? 'text-amber-400 fill-amber-400 drop-shadow-xs' 
                                                        : 'text-slate-300'
                                                }`} 
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 2. Reviewer Name & Email for Public / Guests */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-black text-slate-700 block mb-1">আপনার নাম *</label>
                                    <div className="relative">
                                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            required
                                            value={reviewerName}
                                            onChange={(e) => setReviewerName(e.target.value)}
                                            placeholder="আপনার পুরো নাম লিখুন"
                                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-black text-slate-700 block mb-1">ইমেইল ঠিকানা (ঐচ্ছিক)</label>
                                    <div className="relative">
                                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="email"
                                            value={reviewerEmail}
                                            onChange={(e) => setReviewerEmail(e.target.value)}
                                            placeholder="your.email@example.com"
                                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 3. Review Comment */}
                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-700 block">আপনার অভিজ্ঞতা ও মতামত *</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="প্রোডাক্টের গুণগত মান, ডেলিভারি সার্ভিস এবং ব্যবহার অভিজ্ঞতা সম্পর্কে লিখুন..."
                                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed"
                                />
                            </div>

                            {/* Notice & Submit Button */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                    <span>🛡️</span> আপনার মূল্যবান মতামতের জন্য ধন্যবাদ! দ্রুত যাচাই সম্পন্ন করে রিভিউটি প্রকাশ করা হবে।
                                </p>
                                <button
                                    type="submit"
                                    disabled={isSubmittingReview}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    {isSubmittingReview ? 'জমা দেওয়া হচ্ছে...' : 'রিভিউ সাবমিট করুন'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Summary Rating Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                        <div className="text-center sm:border-r border-slate-200 sm:pr-4">
                            <div className="text-4xl sm:text-5xl font-black text-slate-900">{reviewStats.average}</div>
                            <div className="flex items-center justify-center gap-1 my-1.5 text-amber-400">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star 
                                        key={s} 
                                        className={`w-4 h-4 ${s <= Math.round(reviewStats.average) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 fill-slate-300'}`} 
                                    />
                                ))}
                            </div>
                            <div className="text-xs text-slate-500 font-bold">
                                {reviewStats.total > 0 ? `${reviewStats.total} টি গ্রাহক রিভিউ` : 'এখনো কোনো রিভিউ দেওয়া হয়নি'}
                            </div>
                        </div>

                        <div className="sm:col-span-2 space-y-1.5 text-xs font-bold text-slate-600">
                            {[5, 4, 3, 2, 1].map((n) => {
                                const countForN = reviewStats.breakdown[n] || 0;
                                const pct = reviewStats.total > 0 ? Math.round((countForN / reviewStats.total) * 100) : 0;
                                return (
                                    <div key={n} className="flex items-center gap-2.5">
                                        <span className="w-6 text-right font-black text-slate-700">{n}★</span>
                                        <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                            <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="w-8 text-slate-400 text-right">({countForN})</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Approved Reviews List */}
                    <div className="space-y-3 pt-2">
                        {product.reviews && product.reviews.length > 0 ? (
                            product.reviews.map((rev) => {
                                const revName = rev.reviewer_name || rev.user_name || rev.user?.name || 'কাস্টমার';
                                const initials = revName.slice(0, 2).toUpperCase();
                                return (
                                    <div key={rev.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center border border-emerald-300 shrink-0">
                                                    {rev.user?.avatar_url ? (
                                                        <img src={rev.user.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                                                    ) : initials}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                                                        <span>{revName}</span>
                                                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-sm flex items-center gap-0.5">
                                                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> ভেরিফাইড
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-medium">
                                                        {rev.created_at ? new Date(rev.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-0.5 text-amber-400">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star 
                                                        key={s} 
                                                        className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed pl-10">
                                            {rev.comment}
                                        </p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl space-y-2">
                                <p className="text-xs font-bold text-slate-500">এখনো কোনো রিভিউ দেওয়া হয়নি।</p>
                                <button
                                    type="button"
                                    onClick={() => setIsReviewOpen(true)}
                                    className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                                >
                                    আপনিই প্রথম রিভিউ দিন! ✍️
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── RECOMMENDED PRODUCTS CAROUSEL ── */}
                {relatedProducts.length > 0 && (
                    <section className="space-y-3">
                        <h2 className="font-black text-base sm:text-lg text-slate-900 flex items-center gap-2">
                            <span className="text-orange-500">🔥</span> আপনার জন্য বাছাই করা পণ্যসমূহ
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {relatedProducts.slice(0, 4).map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Spacer for mobile sticky bottom actions */}
                <div className="h-20 md:hidden" aria-hidden="true" />
            </main>

            {/* ─── STICKY BOTTOM ACTIONS (MOBILE ONLY) ─── */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/50 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] p-3 z-50 pb-safe">
                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => handleAddToCart(e)}
                        disabled={isLocked}
                        className="flex-1 font-extrabold py-3 px-2 rounded-xl transition text-[13px] flex items-center justify-center gap-1.5 shadow-sm bg-white hover:bg-emerald-50 text-emerald-700 border-2 border-emerald-600 active:scale-95 cursor-pointer"
                    >
                        <ShoppingCart className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>কার্ট যোগ করুন</span>
                    </button>
                    <button
                        onClick={handleBuyNow}
                        disabled={isLocked}
                        className="flex-1 font-extrabold py-3 px-2 rounded-xl transition text-[13px] flex items-center justify-center gap-1.5 shadow-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 active:scale-95 cursor-pointer"
                    >
                        <Zap className="w-4 h-4 shrink-0 fill-yellow-300 text-yellow-300" />
                        <span>সরাসরি অর্ডার করুন</span>
                    </button>
                </div>
            </div>

            {/* ─── FULLSCREEN PRODUCT IMAGE ZOOM LIGHTBOX MODAL ─── */}
            {isZoomModalOpen && (
                <div 
                    className="fixed inset-0 z-[9999999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6 animate-in fade-in duration-200 select-none"
                    onClick={() => {
                        setIsZoomModalOpen(false);
                        setModalZoomScale(1);
                    }}
                >
                    {/* Top Control Bar */}
                    <div 
                        className="w-full max-w-6xl flex items-center justify-between text-white py-2 px-1 z-20"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs sm:text-sm line-clamp-1 max-w-[200px] sm:max-w-md text-slate-200">
                                {product.name}
                            </span>
                            <span className="text-[11px] text-yellow-400 bg-white/10 px-2 py-0.5 rounded-full font-mono font-bold">
                                {activeImg + 1} / {allImages.length}
                            </span>
                        </div>

                        {/* Zoom Controls */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <button
                                type="button"
                                onClick={() => setModalZoomScale(s => Math.max(1, Number((s - 0.5).toFixed(1))))}
                                disabled={modalZoomScale <= 1}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 transition cursor-pointer text-white flex items-center gap-1 text-xs font-bold"
                                title="Zoom Out (-)"
                            >
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-mono font-black text-yellow-300 w-12 text-center bg-black/40 py-1 rounded-lg border border-white/10">
                                {Math.round(modalZoomScale * 100)}%
                            </span>
                            <button
                                type="button"
                                onClick={() => setModalZoomScale(s => Math.min(4, Number((s + 0.5).toFixed(1))))}
                                disabled={modalZoomScale >= 4}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 transition cursor-pointer text-white flex items-center gap-1 text-xs font-bold"
                                title="Zoom In (+)"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalZoomScale(1)}
                                className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer text-slate-300 hover:text-white"
                                title="Reset Zoom"
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsZoomModalOpen(false);
                                    setModalZoomScale(1);
                                }}
                                className="p-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white ml-1 sm:ml-3 transition cursor-pointer shadow-lg hover:scale-105"
                                title="Close (Esc)"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Center Main Stage with Drag / Pan */}
                    <div 
                        className="relative flex-1 w-full max-w-6xl flex items-center justify-center overflow-hidden my-2"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Prev Image Arrow */}
                        {allImages.length > 1 && (
                            <button
                                type="button"
                                onClick={handlePrevImage}
                                className="absolute left-2 sm:left-4 z-30 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition backdrop-blur-md cursor-pointer hover:scale-110 border border-white/20 shadow-xl"
                                title="Previous Image (Left Arrow)"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}

                        {/* Zoomable Image Container */}
                        <div 
                            className="w-full h-full flex items-center justify-center overflow-auto p-2 sm:p-4 cursor-grab active:cursor-grabbing select-none"
                            onDoubleClick={() => setModalZoomScale(s => s === 1 ? 2.5 : 1)}
                            title="ডাবল ক্লিক করলে ২.৫ গুণ জুম হবে"
                        >
                            <img
                                src={allImages[activeImg]}
                                alt={product.name}
                                className="max-w-full max-h-[70vh] sm:max-h-[75vh] object-contain transition-transform duration-200 rounded-xl shadow-2xl pointer-events-none"
                                style={{
                                    transform: `scale(${modalZoomScale})`,
                                    transformOrigin: 'center center',
                                }}
                            />
                        </div>

                        {/* Next Image Arrow */}
                        {allImages.length > 1 && (
                            <button
                                type="button"
                                onClick={handleNextImage}
                                className="absolute right-2 sm:right-4 z-30 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition backdrop-blur-md cursor-pointer hover:scale-110 border border-white/20 shadow-xl"
                                title="Next Image (Right Arrow)"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    {/* Bottom Hint and Thumbnail Carousel */}
                    <div 
                        className="w-full max-w-3xl flex flex-col items-center gap-2 py-1 z-20"
                        onClick={e => e.stopPropagation()}
                    >
                        <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                            💡 টিপস: জুম করতে <span className="text-yellow-400 font-bold">+ / -</span> বাটন চাপুন অথবা ছবিতে ডাবল-ক্লিক করুন।
                        </p>

                        {allImages.length > 1 && (
                            <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 px-2 max-w-full">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            setActiveImg(idx);
                                            setModalZoomScale(1);
                                        }}
                                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 bg-white/5 transition shrink-0 cursor-pointer ${
                                            activeImg === idx 
                                                ? 'border-yellow-400 ring-2 ring-yellow-400/50 scale-105 bg-white/20' 
                                                : 'border-white/20 opacity-50 hover:opacity-100 hover:border-white/50'
                                        }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-contain p-1" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Footer />

            <MobileBottomNav />
        </div>
    );
}
