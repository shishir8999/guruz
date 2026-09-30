import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from '@inertiajs/react';

interface Slide {
    id: number;
    title?: string;
    subtitle?: string;
    cta_label?: string;
    cta_url?: string;
    image_url?: string;
    bg_color?: string;
    image?: string;
    button_text?: string;
    button_link?: string;
}

interface HeroCarouselProps {
    slides?: Slide[];
}

const DEFAULT_SLIDES: Slide[] = [
    {
        id: 1,
        title: "Bangladesh's #1 Online Marketplace",
        subtitle: 'Shop thousands of products with Cash on Delivery',
        cta_label: 'Shop Now',
        cta_url: '/products',
        bg_color: 'from-blue-900 via-blue-700 to-teal-600',
    },
    {
        id: 2,
        title: 'Flash Sale — Up to 70% Off',
        subtitle: 'Limited time offers on top brands',
        cta_label: 'View Deals',
        cta_url: '/products?flash=1',
        bg_color: 'from-rose-700 via-rose-500 to-orange-500',
    },
    {
        id: 3,
        title: 'Become a Vendor Today',
        subtitle: 'Sell your products to millions of customers',
        cta_label: 'Start Selling',
        cta_url: '/seller/register',
        bg_color: 'from-emerald-800 via-emerald-600 to-teal-500',
    },
];

export function HeroCarousel({ slides = [] }: HeroCarouselProps) {
    const rawItems = slides.length > 0 ? slides : DEFAULT_SLIDES;
    const [failedImages, setFailedImages] = useState<Record<string | number, boolean>>({});

    // Filter out completely invalid or empty slides
    const items = useMemo(() => {
        return rawItems.filter(item => {
            if (failedImages[item.id]) {
                // If it was an image slide with no fallback text, hide it
                if (!item.title && !item.subtitle && !item.bg_color) return false;
            }
            return true;
        });
    }, [rawItems, failedImages]);

    const displayItems = items.length > 0 ? items : DEFAULT_SLIDES;

    // For smooth infinite unidirectional loop
    const carouselSlides = useMemo(() => {
        if (displayItems.length <= 1) return displayItems;
        return [...displayItems, displayItems[0]];
    }, [displayItems]);

    const [current, setCurrent] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    const advanceSlide = useCallback(() => {
        setIsTransitioning(true);
        setCurrent(c => c + 1);
    }, []);

    const prevSlide = useCallback((e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setIsTransitioning(true);
        setCurrent(c => (c === 0 ? displayItems.length - 1 : c - 1));
    }, [displayItems.length]);

    const nextSlide = useCallback((e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        advanceSlide();
    }, [advanceSlide]);

    // Auto-advance every 3.5 seconds when not paused
    useEffect(() => {
        if (displayItems.length <= 1 || isPaused) return;
        const id = setInterval(() => {
            advanceSlide();
        }, 3500);
        return () => clearInterval(id);
    }, [displayItems.length, isPaused, advanceSlide]);

    // Seamless infinite loop handler
    const handleTransitionEnd = () => {
        if (current >= displayItems.length) {
            setIsTransitioning(false);
            setCurrent(0);
        }
    };

    // Touch Swipe Handlers for Mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
        setIsPaused(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (touchStartX.current !== null && touchEndX.current !== null) {
            const distance = touchStartX.current - touchEndX.current;
            if (distance > 40) {
                // Swiped Left -> Next
                nextSlide();
            } else if (distance < -40) {
                // Swiped Right -> Prev
                prevSlide();
            }
        }
        touchStartX.current = null;
        touchEndX.current = null;
        setTimeout(() => setIsPaused(false), 2000);
    };

    const handleImageError = (id: string | number) => {
        setFailedImages(prev => ({
            ...prev,
            [id]: true
        }));
    };

    const activeDotIndex = current >= displayItems.length ? 0 : current;

    return (
        <div 
            className="relative w-full aspect-[2.1/1] sm:aspect-auto h-auto max-h-[220px] sm:max-h-none sm:h-64 md:h-80 lg:h-[380px] xl:h-[420px] rounded-xl sm:rounded-2xl overflow-hidden select-none group bg-slate-950"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Sliding Track */}
            <div 
                onTransitionEnd={handleTransitionEnd}
                className={`flex w-full h-full ${isTransitioning ? "transition-transform duration-500 ease-out" : ""}`}
                style={{ transform: `translateX(-${current * 100}%)` }}
            >
                {carouselSlides.map((slide, idx) => {
                    const slideKey = `${slide.id || idx}-${idx}`;
                    const hasFailed = !!failedImages[slide.id || idx];
                    const hasImage = !hasFailed && !!(slide.image || slide.image_url);
                    const linkUrl = slide.cta_url || slide.button_link || '/products';
                    const imgUrl = slide.image || slide.image_url;

                    return (
                        <div key={slideKey} className="w-full min-w-full max-w-full basis-full h-full relative shrink-0 overflow-hidden">
                            {hasImage && imgUrl ? (
                                <Link href={linkUrl} className="block relative w-full h-full cursor-pointer overflow-hidden group/slide">
                                    {/* 1. Ambient Blurred Backdrop */}
                                    <img
                                        src={imgUrl}
                                        alt=""
                                        aria-hidden="true"
                                        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-500 blur-xl scale-110 opacity-30"
                                    />
                                    <div className="absolute inset-0 bg-slate-950/10 pointer-events-none" />

                                    {/* 2. Main Sharp Banner */}
                                    <img
                                        src={imgUrl}
                                        alt={slide.title || 'Hero Banner'}
                                        onError={() => handleImageError(slide.id || idx)}
                                        className="relative z-10 w-full h-full select-none transition-transform duration-500 group-hover/slide:scale-[1.01] object-cover object-center block"
                                        loading={idx === 0 ? 'eager' : 'lazy'}
                                        decoding="async"
                                    />
                                    {/* Subtle depth vignette */}
                                    <div className="absolute inset-x-0 bottom-0 h-8 sm:h-14 bg-gradient-to-t from-black/30 to-transparent pointer-events-none z-10" />

                                    {/* Optional text badge if title/subtitle explicitly provided */}
                                    {(slide.title || slide.subtitle) && (
                                        <div className="absolute bottom-5 left-5 sm:bottom-8 sm:left-10 z-20 max-w-md bg-black/50 backdrop-blur-md p-3.5 sm:p-5 rounded-2xl border border-white/20 text-white shadow-2xl space-y-1 pointer-events-none">
                                            {slide.title && (
                                                <h2 className="text-sm sm:text-xl font-black leading-tight drop-shadow-md line-clamp-1">
                                                    {slide.title}
                                                </h2>
                                            )}
                                            {slide.subtitle && (
                                                <p className="text-[11px] sm:text-xs text-white/90 font-medium line-clamp-1">
                                                    {slide.subtitle}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </Link>
                            ) : (
                                <div className={`w-full h-full bg-gradient-to-r ${slide.bg_color ?? 'from-blue-900 to-teal-600'} relative`}>
                                    <div className="absolute inset-0 bg-black/20" />
                                    <div className="absolute top-4 left-8 w-40 h-40 bg-white rounded-full blur-3xl opacity-10" />
                                    <div className="absolute bottom-4 right-8 w-32 h-32 bg-yellow-300 rounded-full blur-2xl opacity-10" />

                                    <div className="relative z-10 h-full flex flex-col justify-center px-8 sm:px-14 text-white">
                                        {slide.title && (
                                            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black leading-tight mb-2 max-w-md drop-shadow-lg">
                                                {slide.title}
                                            </h2>
                                        )}
                                        {slide.subtitle && (
                                            <p className="text-xs sm:text-sm lg:text-base opacity-90 mb-4 max-w-sm">{slide.subtitle}</p>
                                        )}
                                        {(slide.cta_url || slide.button_link) && (
                                            <Link
                                                href={linkUrl}
                                                className="inline-flex items-center gap-2 self-start bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all hover:shadow-lg hover:shadow-orange-500/30"
                                            >
                                                {slide.cta_label || slide.button_text || 'Shop Now'}
                                            </Link>
                                        )}
                                    </div>

                                    <div className="absolute right-8 bottom-0 text-6xl sm:text-8xl opacity-20 select-none pointer-events-none">
                                        🛒
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Pagination Dots */}
            {displayItems.length > 1 && (
                <div className="absolute bottom-1.5 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2 bg-black/40 backdrop-blur-md px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-full border border-white/10 shadow-lg">
                    {displayItems.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsTransitioning(true);
                                setCurrent(i);
                            }}
                            className={`transition-all duration-300 rounded-full cursor-pointer ${
                                i === activeDotIndex 
                                    ? 'w-4 sm:w-7 h-1 sm:h-2 bg-amber-400 shadow-xs' 
                                    : 'w-1 sm:w-2 h-1 sm:h-2 bg-white/50 hover:bg-white'
                            }`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}