import React, { useState, useEffect } from 'react';

interface FlyingItem {
    id: number;
    imageUrl: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    endX: number;
    endY: number;
}

interface PlusOneBurst {
    id: number;
    x: number;
    y: number;
}

type TriggerFlyFunction = (
    source: HTMLElement | React.MouseEvent | null,
    imageUrl: string | null | undefined,
    onComplete?: () => void
) => void;

let globalTriggerFly: TriggerFlyFunction | null = null;

export const triggerFlyToCart: TriggerFlyFunction = (source, imageUrl, onComplete) => {
    if (globalTriggerFly) {
        globalTriggerFly(source, imageUrl, onComplete);
    } else if (onComplete) {
        onComplete();
    }
};

export function FlyToCartOverlay() {
    const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
    const [bursts, setBursts] = useState<PlusOneBurst[]>([]);

    useEffect(() => {
        globalTriggerFly = (source, imageUrl, onComplete) => {
            let startRect: DOMRect | null = null;

            if (source) {
                if ('getBoundingClientRect' in source && typeof source.getBoundingClientRect === 'function') {
                    startRect = source.getBoundingClientRect();
                } else if ('currentTarget' in source && (source as React.MouseEvent).currentTarget) {
                    startRect = ((source as React.MouseEvent).currentTarget as HTMLElement).getBoundingClientRect();
                } else if ('clientX' in source) {
                    const e = source as React.MouseEvent;
                    startRect = new DOMRect(e.clientX - 35, e.clientY - 35, 70, 70);
                }
            }

            if (!startRect) {
                startRect = new DOMRect(window.innerWidth / 2 - 40, window.innerHeight / 2 - 40, 80, 80);
            }

            // Find Cart Target on screen (Header Cart or Mobile Bottom Nav Cart)
            const cartElements = Array.from(document.querySelectorAll('[data-cart-target], button[aria-label="cart"], a[href="/cart"], .cart-badge-target'));
            let targetRect: DOMRect | null = null;

            for (const el of cartElements) {
                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight) {
                    targetRect = rect;
                    break;
                }
            }

            // Fallback targets for Mobile / Desktop
            if (!targetRect) {
                if (window.innerWidth < 768) {
                    targetRect = new DOMRect(window.innerWidth * 0.7, window.innerHeight - 50, 30, 30);
                } else {
                    targetRect = new DOMRect(window.innerWidth - 180, 25, 30, 30);
                }
            }

            const endX = targetRect.left + targetRect.width / 2;
            const endY = targetRect.top + targetRect.height / 2;

            const newItem: FlyingItem = {
                id: Date.now() + Math.random(),
                imageUrl: imageUrl || '',
                startX: startRect.left + startRect.width / 2,
                startY: startRect.top + startRect.height / 2,
                startWidth: Math.min(Math.max(startRect.width || 70, 60), 90),
                startHeight: Math.min(Math.max(startRect.height || 70, 60), 90),
                endX,
                endY,
            };

            setFlyingItems((prev) => [...prev, newItem]);

            // Exact moment the product lands in the cart (1200ms slow-mo flight)
            setTimeout(() => {
                // Remove the flying thumbnail
                setFlyingItems((prev) => prev.filter((item) => item.id !== newItem.id));

                // 💥 1. Execute the count commit right on arrival
                if (onComplete) {
                    onComplete();
                }

                // 💥 2. Trigger bouncing animation on the cart icon
                const targetEls = document.querySelectorAll('[data-cart-target], button[aria-label="cart"]');
                targetEls.forEach(el => {
                    el.classList.remove('animate-cart-bounce');
                    void (el as HTMLElement).offsetWidth; // Trigger reflow
                    el.classList.add('animate-cart-bounce');
                    setTimeout(() => el.classList.remove('animate-cart-bounce'), 700);
                });

                // 💥 3. Spawn a "+1" floating burst indicator
                const burstId = Date.now() + Math.random();
                setBursts((prev) => [...prev, { id: burstId, x: endX, y: endY }]);
                setTimeout(() => {
                    setBursts((prev) => prev.filter((b) => b.id !== burstId));
                }, 850);

            }, 1200);
        };

        return () => {
            globalTriggerFly = null;
        };
    }, []);

    if (flyingItems.length === 0 && bursts.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden">
            {/* Flying Products */}
            {flyingItems.map((item) => {
                const deltaX = item.endX - item.startX;
                const deltaY = item.endY - item.startY;

                return (
                    <div
                        key={item.id}
                        className="absolute rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/80 shadow-[0_12px_30px_rgba(16,185,129,0.35)] p-1.5 flex items-center justify-center pointer-events-none will-change-transform"
                        style={{
                            left: `${item.startX - item.startWidth / 2}px`,
                            top: `${item.startY - item.startHeight / 2}px`,
                            width: `${item.startWidth}px`,
                            height: `${item.startHeight}px`,
                            animation: 'flyToCartAnimation 1200ms cubic-bezier(0.2, 0.8, 0.25, 1) forwards',
                            ['--fly-delta-x' as any]: `${deltaX}px`,
                            ['--fly-delta-y' as any]: `${deltaY}px`,
                        }}
                    >
                        {item.imageUrl ? (
                            <img
                                src={item.imageUrl}
                                alt=""
                                className="w-full h-full object-contain rounded-xl"
                            />
                        ) : (
                            <div className="w-full h-full rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-2xl shadow">
                                🛒
                            </div>
                        )}
                    </div>
                );
            })}

            {/* +1 Arrival Burst Popups */}
            {bursts.map((burst) => (
                <div
                    key={burst.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-0.5 rounded-full shadow-lg border border-white flex items-center gap-0.5 animate-plus-one-float pointer-events-none"
                    style={{
                        left: `${burst.x}px`,
                        top: `${burst.y - 10}px`,
                    }}
                >
                    <span>+1</span>
                </div>
            ))}
        </div>
    );
}
