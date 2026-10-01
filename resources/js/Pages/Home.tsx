import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Header } from '@/Components/Header';
import { Footer } from '@/Components/Footer';
import { ProductCard, type Product } from '@/Components/ProductCard';
import { 
    Zap, ShieldCheck, HelpCircle, 
    Headset, Gift, ChevronRight, ChevronLeft, Award, CheckCircle2, Star, PackagePlus,
    User, ChevronsRight, Truck, RefreshCw
} from 'lucide-react';
import { HeroCarousel } from '@/Components/HeroCarousel';
import { TopBanner } from '@/Components/TopBanner';
import { NoticeMarquee } from '@/Components/NoticeMarquee';
import { TopNoticeBar } from '@/Components/TopNoticeBar';
import { MobileBottomNav } from '@/Components/MobileBottomNav';
import { usePage } from '@inertiajs/react';
import { useI18n } from '@/lib/i18n';

interface Category {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    image_url?: string;
}

interface Shop {
    id: number;
    name: string;
    slug: string;
    logo_url?: string;
    rating?: number;
    badge?: string;
    badgeColor?: string;
    followers_count?: number;
}

interface TextBanner {
    badge: string;
    text: string;
    btn_text: string;
    btn_link: string;
    is_active: boolean;
}

interface Brand {
    id: number;
    name: string;
    slug: string;
    logo_url?: string;
}

interface HomeProps {
    categories: Category[];
    featuredProducts: Product[];
    latestProducts: Product[];
    flashSaleProducts?: Product[];
    shops: Shop[];
    brands?: Brand[];
    heroSliders?: any[];
    topBanners?: any[];
    textBanner?: TextBanner;
    guruzSpecial?: {
        enabled: boolean;
        title_en: string;
        title_bn: string;
        sub_en: string;
        sub_bn: string;
        emoji: string;
        grad_from: string;
        grad_to: string;
        products: Product[];
    };
    activeFlashSale?: {
        id: number;
        title_en: string;
        title_bn?: string;
        products: { product: Product, sale_price: number }[];
    } | null;
    marqueeSpeed?: number;
}

function FeatureBadgesAutoSlider({ badges }: { badges: any[] }) {
    const sliderRef = React.useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = React.useState(false);
    const { lang } = useI18n();

    React.useEffect(() => {
        const activeBadges = (badges || []).filter((b: any) => b.is_active ?? true);
        if (activeBadges.length <= 1) return;

        const interval = setInterval(() => {
            if (isPaused || !sliderRef.current) return;

            const el = sliderRef.current;
            const itemWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).clientWidth + 10 : 180;
            const maxScroll = el.scrollWidth - el.clientWidth;

            if (el.scrollLeft + itemWidth >= maxScroll - 10) {
                el.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                el.scrollBy({ left: itemWidth, behavior: 'smooth' });
            }
        }, 2000); // 2 Seconds Auto Slide

        return () => clearInterval(interval);
    }, [badges, isPaused]);

    const activeBadges = (badges || []).filter((b: any) => b.is_active ?? true);
    if (activeBadges.length === 0) return null;

    return (
        <div 
            className="w-full overflow-hidden py-0 my-0"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setTimeout(() => setIsPaused(false), 2500)}
        >
            <div 
                ref={sliderRef}
                className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-0.5 px-0.5"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {activeBadges.map((badge: any, index: number) => {
                    const iconMap: Record<string, any> = {
                        ShieldCheck, Truck, RefreshCw, Headset, Award, Zap,
                        BadgeCheck: ShieldCheck, RotateCcw: RefreshCw, Tag: Gift, Sparkles: Award, Star, Heart: Award, Gift, Clock: Zap
                    };
                    const IconComponent = iconMap[badge.icon] || ShieldCheck;

                    return (
                        <div 
                            key={badge.id || index}
                            className={`snap-start shrink-0 w-[calc(50%-0.35rem)] min-w-[calc(50%-0.35rem)] sm:w-auto sm:min-w-[185px] bg-gradient-to-r ${badge.gradient_from || 'from-cyan-500'} ${badge.gradient_to || 'to-blue-500'} text-white rounded-2xl px-2.5 py-2.5 sm:px-4 sm:py-2.5 flex items-center gap-2 sm:gap-2.5 shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer`}
                        >
                            <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                            </div>
                            <span className="text-[11px] sm:text-xs font-black tracking-tight leading-tight truncate">
                                {lang === 'en' ? (badge.label_en || badge.label_bn) : (badge.label_bn || badge.label_en)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function GuruzVerifiedAutoSlider({ products, intervalMs = 5000, sliderId = 'slider-1' }: { products: Product[]; intervalMs?: number; sliderId?: string }) {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = React.useState(false);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const cardWidth = container.firstElementChild ? (container.firstElementChild as HTMLElement).clientWidth + 16 : 220;
        const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

    React.useEffect(() => {
        if (!products || products.length <= 4 || isHovered) return;

        const interval = setInterval(() => {
            if (!scrollRef.current || isHovered) return;
            const container = scrollRef.current;
            const cardWidth = container.firstElementChild ? (container.firstElementChild as HTMLElement).clientWidth + 16 : 220;
            const maxScroll = container.scrollWidth - container.clientWidth;

            if (container.scrollLeft >= maxScroll - 10) {
                container.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                container.scrollBy({ left: cardWidth, behavior: 'smooth' });
            }
        }, intervalMs);

        return () => clearInterval(interval);
    }, [products, isHovered, intervalMs]);

    if (!products || products.length === 0) return null;

    return (
        <div 
            id={sliderId}
            className="relative group/slider w-full py-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setTimeout(() => setIsHovered(false), 3000)}
        >
            {/* Prev Button */}
            <button
                type="button"
                onClick={() => scroll('left')}
                aria-label="Previous products"
                className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-white/95 dark:bg-slate-800/95 hover:bg-white text-slate-800 dark:text-white rounded-full shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all opacity-0 group-hover/slider:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next Button */}
            <button
                type="button"
                onClick={() => scroll('right')}
                aria-label="Next products"
                className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-white/95 dark:bg-slate-800/95 hover:bg-white text-slate-800 dark:text-white rounded-full shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all opacity-0 group-hover/slider:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
            >
                <ChevronRight className="w-5 h-5" />
            </button>

            {/* Products Row */}
            <div 
                ref={scrollRef}
                className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {products.map((p, idx) => (
                    <div 
                        key={`${sliderId}-card-${p.id}-${idx}`}
                        className="shrink-0 w-[calc((100%-12px)/2)] sm:w-[calc((100%-48px)/4)] lg:w-[calc((100%-64px)/5)]"
                    >
                        <ProductCard product={p} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Home({
    categories = [],
    featuredProducts = [],
    latestProducts = [],
    flashSaleProducts = [],
    shops = [],
    brands = [],
    heroSliders = [],
    topBanners = [],
    textBanner,
    guruzSpecial,
    activeFlashSale,
    marqueeSpeed = 20
}: HomeProps) {
    const { flash = {}, siteSettings = {}, auth = {} } = usePage<any>().props;

    const popularShopsList = shops && shops.length > 0 ? shops : [
        { id: 1, name: 'Gadget Guruz', slug: 'gadget-guruz', logo_url: '', badge: '⭐ টপ ভেন্ডর', badgeColor: 'bg-emerald-600 text-white', followers_count: 1420 },
        { id: 2, name: 'Tech Master BD', slug: 'tech-master-bd', logo_url: '', badge: '🔥 হট শপ', badgeColor: 'bg-orange-600 text-white', followers_count: 980 },
        { id: 3, name: 'Fashion World', slug: 'fashion-world', logo_url: '', badge: '👑 ভিআইপি ভেন্ডর', badgeColor: 'bg-purple-600 text-white', followers_count: 2150 },
        { id: 4, name: 'Smart Electronics', slug: 'smart-electronics', logo_url: '', badge: '⚡ ভেরিফাইড', badgeColor: 'bg-blue-600 text-white', followers_count: 1640 },
    ];

    const displayProducts = latestProducts.length > 0 ? latestProducts : featuredProducts;

    const speedShops = Number(siteSettings?.marquee_speed_shops ?? marqueeSpeed ?? 20);
    const speedCategories = Number(siteSettings?.marquee_speed_categories ?? marqueeSpeed ?? 20);
    const speedBrands = Number(siteSettings?.marquee_speed_brands ?? marqueeSpeed ?? 20);

    const styleShops = speedShops > 0 ? { animationDuration: `${speedShops}s` } : { animation: 'none' };
    const styleCategories = speedCategories > 0 ? { animationDuration: `${speedCategories}s` } : { animation: 'none' };
    const styleBrands = speedBrands > 0 ? { animationDuration: `${speedBrands}s` } : { animation: 'none' };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col pb-16 md:pb-0">
            <Head title="Guruz — Bangladesh's Multi-Vendor Online Marketplace" />
            
            {/* Very Top Announcement Banner */}
            <TopNoticeBar />

            {/* Top Banners / L-Tops Slider or Text Banner */}
            {topBanners && topBanners.length > 0 ? (
                <TopBanner banners={topBanners} />
            ) : textBanner && textBanner.is_active ? (
                <div className="bg-gradient-to-r from-purple-800 via-pink-700 to-purple-900 text-white text-[11px] sm:text-xs font-bold py-2 px-3 text-center tracking-wide flex items-center justify-center gap-2 shadow-sm border-b border-purple-900/50">
                    {textBanner.badge && (
                        <span className="bg-yellow-400 text-purple-950 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] uppercase font-black tracking-wider shrink-0">
                            {textBanner.badge}
                        </span>
                    )}
                    <span className="text-[11px] sm:text-xs font-extrabold truncate">
                        {textBanner.text}
                    </span>
                    {textBanner.btn_text && (
                        <a href={textBanner.btn_link || '#'} className="ml-2 bg-white text-purple-800 hover:bg-slate-100 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap shadow-sm transition">
                            {textBanner.btn_text}
                        </a>
                    )}
                </div>
            ) : null}

            {/* Announcement Marquee Ticker */}
            <NoticeMarquee />

            {/* Main Header */}
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-2 sm:px-4 py-1 sm:py-3 space-y-1.5 sm:space-y-4 w-full">

                {/* Hero Carousel Section */}
                <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-white">
                    <HeroCarousel slides={heroSliders} />
                </div>

                {/* ─── FEATURE BADGES AUTO SLIDER (EVERY 2 SECONDS) ─── */}
                <FeatureBadgesAutoSlider badges={siteSettings?.feature_badges} />

                {/* Banner Promo Card */}
                <div className="bg-gradient-to-r from-emerald-100 via-teal-50 to-emerald-200 rounded-xl p-4 sm:p-5 border border-emerald-200 shadow-xs flex items-center justify-between">
                    <div>
                        <h3 className="text-base sm:text-xl font-black text-emerald-950">ঘরে বসেই করুন অনলাইন শপিং</h3>
                        <p className="text-xs sm:text-sm text-emerald-800 font-bold mt-1">ফ্রি ডেলিভারি • ক্যাশ অন ডেলিভারি সুবিধা</p>
                    </div>
                    <div className="text-3xl sm:text-5xl">🛒</div>
                </div>

                {/* 1. Guruz Special Section (গুরুজ ঈদ স্পেশাল - ২ সেকেন্ডের ১-কার্ড অটো স্লাইডার) */}
                {guruzSpecial && guruzSpecial.enabled && guruzSpecial.products && guruzSpecial.products.length > 0 && (
                    <section 
                        className="rounded-xl p-3 sm:p-4 text-white shadow-md relative overflow-hidden space-y-3 border border-purple-400/30" 
                        style={{ 
                            background: guruzSpecial.grad_from && guruzSpecial.grad_to
                                ? `linear-gradient(135deg, ${guruzSpecial.grad_from}, ${guruzSpecial.grad_to})`
                                : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)'
                        }}
                    >
                        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                        <div className="flex items-center justify-between border-b border-white/20 pb-2 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-purple-950 font-black shadow-sm animate-pulse text-base shrink-0">
                                    {guruzSpecial.emoji || '🌙'}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="font-black text-base sm:text-xl tracking-wide flex items-center gap-1.5 text-white">
                                        {guruzSpecial.title_bn || guruzSpecial.title_en || 'GURUZ স্পেশাল'}
                                    </h2>
                                    <p className="text-[10px] sm:text-xs text-purple-100 font-bold truncate">
                                        {guruzSpecial.sub_bn || guruzSpecial.sub_en || 'সেরা অফার ও বিশেষ আকর্ষণ সমাহার!'}
                                    </p>
                                </div>
                            </div>
                            <Link 
                                href="/products?section=guruz-special" 
                                className="text-[11px] sm:text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full font-black text-white transition flex items-center gap-0.5 border border-white/30 shrink-0"
                            >
                                <span>সব দেখুন</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <GuruzVerifiedAutoSlider 
                            sliderId="eid-special-slider"
                            products={guruzSpecial.products} 
                            intervalMs={2800}
                        />
                    </section>
                )}

                {/* 2. Flash Sale Section (ফ্ল্যাশ সেল - ২ সেকেন্ডের ১-কার্ড অটো স্লাইডার) */}
                <section className="bg-gradient-to-r from-rose-700 via-red-600 to-amber-600 rounded-xl p-3 sm:p-4 text-white shadow-md relative overflow-hidden space-y-3 border border-rose-500/30">
                    <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="flex items-center justify-between border-b border-white/20 pb-2 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-rose-950 font-black shadow-sm animate-pulse text-base">
                                ⚡
                            </div>
                            <div>
                                <h2 className="font-black text-base sm:text-xl tracking-wide flex items-center gap-1.5 text-white">
                                    {activeFlashSale?.title_en || 'ফ্ল্যাশ সেল (Flash Sale)'}
                                </h2>
                                <p className="text-[10px] sm:text-xs text-amber-200 font-bold">সীমিত সময়ের বিশেষ ডিসকাউন্ট ধামাকা!</p>
                            </div>
                        </div>
                        <Link href="/products?section=flash-sale" className="text-[11px] sm:text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full font-black transition flex items-center gap-0.5 border border-white/30">
                            সব দেখুন <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <GuruzVerifiedAutoSlider 
                        sliderId="flash-sale-slider"
                        intervalMs={2200}
                        products={
                            (flashSaleProducts && flashSaleProducts.length > 0)
                                ? flashSaleProducts
                                : (activeFlashSale?.products && activeFlashSale.products.length > 0)
                                    ? activeFlashSale.products.map((fp: any) => ({ ...fp.product, sale_price: fp.sale_price || fp.product.sale_price }))
                                    : displayProducts
                        } 
                    />
                </section>

                {/* 3. Top Brands Section (টপ ব্র্যান্ড) */}
                <section className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h2 className="font-extrabold text-sm sm:text-lg text-slate-800 flex items-center gap-1.5">
                            <span>⭐</span> টপ ব্র্যান্ড
                        </h2>
                        <Link href="/brands" className="text-emerald-600 hover:underline text-xs sm:text-sm font-bold flex items-center gap-0.5">
                            সব দেখুন <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="overflow-hidden w-full py-1">
                        <div className="flex items-center gap-3 sm:gap-4 animate-marquee-left hover:[animation-play-state:paused]" style={styleBrands}>
                            {[...(brands && brands.length > 0 ? brands : [
                                { id: 1, name: 'Apple', slug: 'apple', logo_url: '' },
                                { id: 2, name: 'Samsung', slug: 'samsung', logo_url: '' },
                                { id: 3, name: 'Logitech', slug: 'logitech', logo_url: '' },
                                { id: 4, name: 'Anker', slug: 'anker', logo_url: '' },
                                { id: 5, name: 'Baseus', slug: 'baseus', logo_url: '' },
                                { id: 6, name: 'Xiaomi', slug: 'xiaomi', logo_url: '' },
                                { id: 7, name: 'Sony', slug: 'sony', logo_url: '' },
                            ]), ...(brands && brands.length > 0 ? brands : [
                                { id: 101, name: 'Apple', slug: 'apple', logo_url: '' },
                                { id: 102, name: 'Samsung', slug: 'samsung', logo_url: '' },
                                { id: 103, name: 'Logitech', slug: 'logitech', logo_url: '' },
                                { id: 104, name: 'Anker', slug: 'anker', logo_url: '' },
                                { id: 105, name: 'Baseus', slug: 'baseus', logo_url: '' },
                                { id: 106, name: 'Xiaomi', slug: 'xiaomi', logo_url: '' },
                                { id: 107, name: 'Sony', slug: 'sony', logo_url: '' },
                            ])].map((brand, i) => {
                                const colors = [
                                    'from-slate-700 to-slate-900',
                                    'from-blue-600 to-blue-800',
                                    'from-cyan-600 to-teal-800',
                                    'from-blue-400 to-blue-600',
                                    'from-amber-400 to-amber-600',
                                    'from-orange-500 to-orange-700',
                                    'from-indigo-600 to-indigo-900',
                                ];
                                const cardColor = colors[i % colors.length];

                                return (
                                    <Link
                                        key={i}
                                        href={`/products?brand=${encodeURIComponent(brand.slug || brand.name.toLowerCase())}`}
                                        className="flex flex-col items-center gap-1.5 p-1 rounded-xl hover:bg-slate-50 transition group text-center shrink-0 w-20 sm:w-24 cursor-pointer"
                                    >
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr from-emerald-500 via-teal-400 to-blue-600 shadow-2xs group-hover:scale-110 transition overflow-hidden border border-slate-200 shrink-0">
                                            {brand.logo_url ? (
                                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-1.5 overflow-hidden">
                                                    <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain" />
                                                </div>
                                            ) : (
                                                <div className={`w-full h-full rounded-full bg-gradient-to-br ${cardColor} flex items-center justify-center p-1 font-black text-white text-xs sm:text-sm tracking-wider uppercase`}>
                                                    {brand.name.substring(0, 3)}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[10px] sm:text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition">
                                            {brand.name}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* 4. Popular Categories Section (জনপ্রিয় ক্যাটাগরি সমূহ) */}
                <section className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between border-b pb-2 mb-3">
                        <h2 className="font-extrabold text-sm sm:text-lg text-slate-800 flex items-center gap-1.5">
                            <span>📦</span> জনপ্রিয় ক্যাটাগরি সমূহ
                        </h2>
                        <Link href="/categories" className="text-emerald-600 hover:underline text-xs sm:text-sm font-bold flex items-center gap-0.5">
                            সব দেখুন <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="overflow-hidden w-full py-1">
                        <div className="flex items-center gap-3 sm:gap-4 animate-marquee-fast hover:[animation-play-state:paused]" style={styleCategories}>
                            {[...categories, ...categories].map((c, i) => (
                                <Link 
                                    key={`${c.id}-${i}`} 
                                    href={`/products?category=${c.slug}`}
                                    className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-100 transition group text-center shrink-0 w-20 sm:w-24 cursor-pointer"
                                >
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition shadow-2xs overflow-hidden">
                                        {c.image_url ? (
                                            <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                                        ) : (c.icon && /^https?:\/\//i.test(c.icon) ? (
                                            <img src={c.icon} alt="" className="w-6 h-6 object-contain" />
                                        ) : (c.icon || '🛍️'))}
                                    </div>
                                    <span className="text-[10px] sm:text-xs font-bold text-slate-700 line-clamp-1">{c.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 🌟 5. New Arrivals Section (জনপ্রিয় ক্যাটাগরির একদম নিচে) 🌟 */}
                <section className="bg-white rounded-xl p-3 sm:p-4 border border-emerald-200 shadow-sm space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -ml-10 -mt-10 pointer-events-none"></div>
                    <div className="flex items-center justify-between border-b border-emerald-100 pb-2 relative z-10">
                        <h2 className="font-black text-sm sm:text-lg text-emerald-900 flex items-center gap-1.5">
                            <PackagePlus className="w-5 h-5 text-emerald-600" /> New Arrivals (নতুন প্রডাক্ট)
                        </h2>
                        <Link href="/products?section=new-arrivals" className="text-emerald-600 hover:underline text-xs sm:text-sm font-bold flex items-center gap-0.5">
                            সব দেখুন <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 relative z-10">
                        {displayProducts.slice(0, 8).map(p => (
                            <ProductCard key={`na-${p.id}`} product={p} />
                        ))}
                    </div>
                </section>

                {/* 5. Popular Shops Section (জনপ্রিয় শপ) */}
                <section className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                            <h2 className="font-black text-base sm:text-lg text-slate-900">জনপ্রিয় শপ</h2>
                            <Link href="/vendor-badges" className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full shadow-xs hover:bg-amber-600 transition">
                                <Award className="w-3.5 h-3.5" /> লেভেল
                            </Link>
                        </div>
                        <Link href="/shops" className="text-emerald-600 hover:underline text-xs sm:text-sm font-bold flex items-center gap-0.5">
                            সব দেখুন <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="overflow-hidden w-full py-1">
                        <div className="flex items-center gap-4 sm:gap-6 animate-marquee-left hover:[animation-play-state:paused]" style={styleShops}>
                            {[...popularShopsList, ...popularShopsList].map((s, i) => (
                                <Link
                                    key={`${s.id}-${i}`}
                                    href={`/shops/${s.slug}`}
                                    className="flex flex-col items-center text-center shrink-0 group hover:scale-105 transition-transform duration-200 cursor-pointer"
                                >
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-emerald-500 via-teal-400 to-blue-600 shadow-sm mb-1.5">
                                        <div className="w-full h-full rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xl overflow-hidden border-2 border-white">
                                            {s.logo_url ? (
                                                <img src={s.logo_url} alt={s.name} className="w-full h-full object-cover" />
                                            ) : (
                                                s.name[0].toUpperCase()
                                            )}
                                        </div>
                                    </div>

                                    <span className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 max-w-[100px] group-hover:text-emerald-600 transition">
                                        {s.name}
                                    </span>

                                    <span className={`mt-1 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs ${s.badgeColor || 'bg-purple-600 text-white'}`}>
                                        {s.badge || '⭐ টপ রেটেড'}
                                    </span>

                                    <span className="text-[10px] text-slate-500 font-semibold mt-1">
                                        {s.followers_count ?? 0} ফলোয়ার
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 6. Guruz Verified Section (২ সেকেন্ড পর পর অটো-স্লাইডার) */}
                <section className="bg-white rounded-xl p-3 sm:p-4 border border-blue-200 shadow-sm space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="flex items-center justify-between border-b border-blue-100 pb-2 relative z-10">
                        <h2 className="font-black text-sm sm:text-lg text-blue-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-600/20" /> Guruz Verified
                        </h2>
                        <Link href="/products?section=verified" className="text-blue-600 hover:underline text-xs sm:text-sm font-bold flex items-center gap-0.5">
                            সব দেখুন <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <GuruzVerifiedAutoSlider products={featuredProducts.length > 0 ? featuredProducts : displayProducts} />
                </section>

                {/* 7. For You Section (Guruz Verified এর নিচে) */}
                <section className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h2 className="text-base sm:text-xl font-black text-slate-900 flex items-center gap-1.5">
                            <span className="text-emerald-600">🛍️</span> For You (আপনার জন্য সাজানো পণ্যসমূহ)
                        </h2>
                        <Link href="/products?section=for-you" className="text-emerald-600 hover:underline text-xs sm:text-sm font-bold flex items-center gap-0.5">
                            সব দেখুন <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                        {latestProducts.slice(0, 12).map(p => (
                            <ProductCard key={`fy-${p.id}`} product={p} />
                        ))}
                    </div>
                </section>




            </main>

            <Footer />

            {/* Mobile Bottom Navigation Bar */}
            <MobileBottomNav />
        </div>
    );
}
