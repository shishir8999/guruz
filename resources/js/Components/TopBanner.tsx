import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

export interface TopBannerItem {
  id: number;
  title?: string | null;
  link?: string | null;
  image: string;
  sort_order?: number;
  is_active?: boolean;
}

interface TopBannerProps {
  banners?: TopBannerItem[];
  autoSlideInterval?: number; // default 3500ms
}

export function TopBanner({ banners = [], autoSlideInterval = 3500 }: TopBannerProps) {
  const [failedBanners, setFailedBanners] = useState<Record<string | number, boolean>>({});

  // Filter active banners with valid images that haven't failed to load
  const activeBanners = useMemo(() => {
    return (banners || []).filter(b => (b.is_active ?? true) && !!b.image && !failedBanners[b.id]);
  }, [banners, failedBanners]);

  // When multiple banners exist, create an extended array with the 1st banner cloned at the end
  const slides = useMemo(() => {
    if (activeBanners.length <= 1) return activeBanners;
    return [...activeBanners, activeBanners[0]];
  }, [activeBanners]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const handleImageError = (id: string | number) => {
    setFailedBanners(prev => ({ ...prev, [id]: true }));
  };

  // Move strictly forward in one direction (right to left)
  const advanceSlide = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex(prev => prev + 1);
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      advanceSlide();
    }, autoSlideInterval);

    return () => clearInterval(timer);
  }, [activeBanners.length, isPaused, autoSlideInterval, advanceSlide]);

  // Seamless infinite loop handler
  const handleTransitionEnd = () => {
    if (currentIndex >= activeBanners.length) {
      setIsTransitioning(false);
      setCurrentIndex(0);
    }
  };

  if (activeBanners.length === 0) return null;

  // Render a single banner without slider overhead
  if (activeBanners.length === 1) {
    const banner = activeBanners[0];
    const bannerKey = banner.id || 0;

    const content = (
      <img
        src={banner.image}
        alt={banner.title || "Top Banner"}
        onError={() => handleImageError(bannerKey)}
        className="w-full h-full object-fill block select-none"
        loading="eager"
        decoding="async"
      />
    );

    return (
      <div className="relative w-full bg-[#0a0f1d] overflow-hidden select-none border-b border-slate-800/30">
        <div className="w-full h-[26px] md:h-[80px] relative overflow-hidden flex items-center justify-center">
          {banner.link ? (
            <a
              href={banner.link}
              className="block w-full h-full cursor-pointer focus:outline-none"
              aria-label={banner.title || "Top Banner"}
            >
              {content}
            </a>
          ) : (
            content
          )}
        </div>
      </div>
    );
  }

  const activeDotIndex = currentIndex >= activeBanners.length ? 0 : currentIndex;

  return (
    <div
      className="relative w-full bg-[#0a0f1d] overflow-hidden select-none border-b border-slate-800/30 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.targetTouches[0].clientX;
        setIsPaused(true);
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current !== null) {
          const distance = touchStartX.current - e.changedTouches[0].clientX;
          // Swipe left advances forward
          if (distance > 35) {
            advanceSlide();
          }
        }
        touchStartX.current = null;
        setTimeout(() => setIsPaused(false), 2000);
      }}
    >
      <div className="w-full h-[26px] md:h-[80px] relative overflow-hidden">
        {/* Sliding Track - Strictly moves in one direction seamlessly */}
        <div
          onTransitionEnd={handleTransitionEnd}
          className={`flex w-full h-full ${isTransitioning ? "transition-transform duration-700 ease-in-out" : ""}`}
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {slides.map((banner, index) => {
            const bannerKey = `${banner.id || index}-${index}`;

            const content = (
              <img
                src={banner.image}
                alt={banner.title || "Top Banner"}
                onError={() => handleImageError(banner.id || index)}
                className="w-full h-full object-fill block select-none"
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            );

            return (
              <div key={bannerKey} className="w-full min-w-full max-w-full basis-full h-full relative shrink-0 overflow-hidden">
                {banner.link ? (
                  <a
                    href={banner.link}
                    className="block w-full h-full cursor-pointer focus:outline-none"
                    aria-label={banner.title || "Top Banner"}
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>

        {/* Minimalist Dots Indicator - positioned at bottom right */}
        <div className="absolute bottom-1 right-2 md:right-4 z-20 flex items-center gap-1 md:gap-1.5 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full pointer-events-auto">
          {activeBanners.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsTransitioning(true);
                setCurrentIndex(i);
              }}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                i === activeDotIndex
                  ? "w-3 md:w-5 h-1 md:h-1.5 bg-gradient-to-r from-amber-400 to-amber-500 shadow-xs"
                  : "w-1 md:w-1.5 h-1 md:h-1.5 bg-white/50 hover:bg-white/90"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}