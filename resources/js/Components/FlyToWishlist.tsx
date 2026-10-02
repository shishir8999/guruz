import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { playNotificationSound } from '@/lib/notificationSound';

interface FlyingHeartItem {
    id: number;
    imageUrl?: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    endX: number;
    endY: number;
}

interface WishlistBurst {
    id: number;
    x: number;
    y: number;
}

type TriggerFlyWishlistFunction = (
    source: HTMLElement | React.MouseEvent | null,
    imageUrl?: string | null,
    onComplete?: () => void
) => void;

let globalTriggerFlyWishlist: TriggerFlyWishlistFunction | null = null;

export const triggerFlyToWishlist: TriggerFlyWishlistFunction = (source, imageUrl, onComplete) => {
    if (globalTriggerFlyWishlist) {
        globalTriggerFlyWishlist(source, imageUrl, onComplete);
    } else if (onComplete) {
        onComplete();
    }
};

export function FlyToWishlistOverlay() {
    const [flyingItems, setFlyingItems] = useState<FlyingHeartItem[]>([]);
    const [bursts, setBursts] = useState<WishlistBurst[]>([]);

    useEffect(() => {
        globalTriggerFlyWishlist = (source, imageUrl, onComplete) => {
            let startRect: DOMRect | null = null;

            if (source) {
                if ('getBoundingClientRect' in source && typeof (source as any).getBoundingClientRect === 'function') {
                    startRect = (source as HTMLElement).getBoundingClientRect();
                } else if ('currentTarget' in (source as any) && (source as React.MouseEvent).currentTarget) {
                    startRect = ((source as React.MouseEvent).currentTarget as HTMLElement).getBoundingClientRect();
                } else if ('clientX' in (source as any)) {
                    const e = source as React.MouseEvent;
                    startRect = new DOMRect(e.clientX - 25, e.clientY - 25, 50, 50);
                }
            }

            if (!startRect) {
                startRect = new DOMRect(window.innerWidth / 2 - 25, window.innerHeight / 2 - 25, 50, 50);
            }

            // Find Wishlist Target on screen (Header Wishlist Link / Badge)
            const wishlistElements = Array.from(
                document.querySelectorAll('[data-wishlist-target], a[href*="/favorites"], a[href*="/wishlist"]')
            );
            let targetRect: DOMRect | null = null;

            for (const el of wishlistElements) {
                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight) {
                    targetRect = rect;
                    break;
                }
            }

            // Fallback targets for Mobile / Desktop
            if (!targetRect) {
                if (window.innerWidth < 768) {
                    targetRect = new DOMRect(window.innerWidth - 60, 20, 30, 30);
                } else {
                    targetRect = new DOMRect(window.innerWidth - 130, 25, 30, 30);
                }
            }

            const endX = targetRect.left + targetRect.width / 2;
            const endY = targetRect.top + targetRect.height / 2;

            const newItem: FlyingHeartItem = {
                id: Date.now() + Math.random(),
                imageUrl: imageUrl || undefined,
                startX: startRect.left + startRect.width / 2,
                startY: startRect.top + startRect.height / 2,
                startWidth: Math.min(Math.max(startRect.width || 45, 40), 70),
                startHeight: Math.min(Math.max(startRect.height || 45, 40), 70),
                endX,
                endY,
            };

            setFlyingItems((prev) => [...prev, newItem]);

            // Exact moment the heart lands in the wishlist (1200ms slow-mo flight)
            setTimeout(() => {
                // Remove flying item
                setFlyingItems((prev) => prev.filter((item) => item.id !== newItem.id));

                // 💥 1. Execute onComplete callback (increment store count & api save)
                if (onComplete) {
                    onComplete();
                }

                // 💥 2. Play soft magical notification chime
                playNotificationSound('heart');

                // 💥 3. Trigger bouncing animation on the header wishlist icon
                const targetEls = document.querySelectorAll('[data-wishlist-target], a[href*="/favorites"]');
                targetEls.forEach((el) => {
                    el.classList.remove('animate-wishlist-bounce');
                    void (el as HTMLElement).offsetWidth; // Trigger reflow
                    el.classList.add('animate-wishlist-bounce');
                    setTimeout(() => el.classList.remove('animate-wishlist-bounce'), 700);
                });

                // 💥 4. Spawn a "+1 ❤️" floating burst indicator
                const burstId = Date.now() + Math.random();
                setBursts((prev) => [...prev, { id: burstId, x: endX, y: endY }]);
                setTimeout(() => {
                    setBursts((prev) => prev.filter((b) => b.id !== burstId));
                }, 850);
            }, 1200);
        };

        return () => {
            globalTriggerFlyWishlist = null;
        };
    }, []);

    if (flyingItems.length === 0 && bursts.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden">
            {/* Flying Heart Items */}
            {flyingItems.map((item) => {
                const deltaX = item.endX - item.startX;
                const deltaY = item.endY - item.startY;

                return (
                    <div
                        key={item.id}
                        className="absolute rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-red-500 p-1.5 shadow-[0_0_20px_rgba(244,63,94,0.7)] flex items-center justify-center pointer-events-none will-change-transform border-2 border-white"
                        style={{
                            left: `${item.startX - item.startWidth / 2}px`,
                            top: `${item.startY - item.startHeight / 2}px`,
                            width: `${item.startWidth}px`,
                            height: `${item.startHeight}px`,
                            animation: 'flyToWishlistAnimation 1200ms cubic-bezier(0.2, 0.8, 0.25, 1) forwards',
                            ['--fly-delta-x' as any]: `${deltaX}px`,
                            ['--fly-delta-y' as any]: `${deltaY}px`,
                        }}
                    >
                        {item.imageUrl ? (
                            <div className="w-full h-full rounded-full overflow-hidden relative bg-white flex items-center justify-center p-0.5">
                                <img
                                    src={item.imageUrl}
                                    alt=""
                                    className="w-full h-full object-contain rounded-full"
                                />
                                <div className="absolute inset-0 bg-rose-500/20 flex items-center justify-center">
                                    <Heart className="w-4 h-4 text-rose-600 fill-rose-600 drop-shadow animate-pulse" />
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white">
                                <Heart className="w-6 h-6 text-white fill-white drop-shadow" />
                            </div>
                        )}
                    </div>
                );
            })}

            {/* +1 Heart Arrival Burst Indicator */}
            {bursts.map((burst) => (
                <div
                    key={burst.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 font-black text-xs sm:text-sm bg-gradient-to-r from-rose-500 to-pink-600 text-white px-2.5 py-0.5 rounded-full shadow-lg border border-white flex items-center gap-1 animate-heart-float pointer-events-none"
                    style={{
                        left: `${burst.x}px`,
                        top: `${burst.y - 12}px`,
                    }}
                >
                    <span>+1</span>
                    <Heart className="w-3.5 h-3.5 fill-white text-white" />
                </div>
            ))}
        </div>
    );
}