import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { Home, LayoutGrid, ShoppingCart, User, Store } from 'lucide-react';
import { useCartStore } from '@/lib/cart';
import { useI18nStore } from '@/lib/i18n';

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

interface PageProps {
    auth: {
        user: AuthUser | null;
    };
    [key: string]: any;
}

export function MobileBottomNav() {
    const { url, props } = usePage<PageProps>();
    const user = props.auth?.user ?? null;
    const count = useCartStore(s => s.items.reduce((a, b) => a + b.quantity, 0));
    const setIsCartOpen = useCartStore(s => s.setIsOpen);
    const { t } = useI18nStore();

    const [optimisticUrl, setOptimisticUrl] = useState<string>(url);

    useEffect(() => {
        setOptimisticUrl(url);
    }, [url]);

    // 🚀 Supercharged Inertia v2 prefetching for instant 0ms transitions!
    useEffect(() => {
        try {
            if (typeof (router as any).prefetch === 'function') {
                (router as any).prefetch('/', {}, { cacheFor: '5m' });
                (router as any).prefetch('/categories', {}, { cacheFor: '5m' });
                (router as any).prefetch('/products', {}, { cacheFor: '5m' });
                (router as any).prefetch('/shops', {}, { cacheFor: '5m' });
                (router as any).prefetch(user ? '/account' : '/login', {}, { cacheFor: '5m' });
            }
        } catch(e) {}
    }, [user]);

    // Hide on admin/seller paths, and single product detail pages (where sticky buy now bar takes over)
    const isProductDetailPage = /^\/products\/[^\/?#]+/.test(url) && !url.startsWith('/products?');
    if (
        url.startsWith('/admin') || 
        url.startsWith('/seller') || 
        isProductDetailPage
    ) return null;

    const rawUnreadNotifications = props.auth?.unread_notifications_count ?? ((user as any)?.unread_notifications_count ?? 0);
    const [unreadNotifications, setUnreadNotifications] = useState<number>(() => {
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/account/notifications')) {
            return 0;
        }
        return rawUnreadNotifications;
    });

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/account/notifications')) {
            setUnreadNotifications(0);
            return;
        }
        setUnreadNotifications(rawUnreadNotifications);
    }, [rawUnreadNotifications, url]);

    useEffect(() => {
        const handleCleared = () => {
            setUnreadNotifications(0);
        };
        window.addEventListener('customer-notifications-cleared', handleCleared);
        return () => window.removeEventListener('customer-notifications-cleared', handleCleared);
    }, []);

    const items = [
        { href: '/', icon: Home, label: t('home') || 'হোম', active: (optimisticUrl === '/' || (url === '/' && optimisticUrl === '/')) },
        { href: '/categories', icon: LayoutGrid, label: t('categories') || 'ক্যাটাগরি', active: optimisticUrl.startsWith('/categories') },
        { href: '/shops', icon: Store, label: t('shops') || 'শপ', active: optimisticUrl.startsWith('/shops') },
        { href: '/cart', icon: ShoppingCart, label: t('cart') || 'কার্ট', active: optimisticUrl.startsWith('/cart'), badge: count },
        { href: user ? '/account' : '/login', icon: User, label: t('profile') || 'প্রোফাইল', active: optimisticUrl.startsWith('/account') || optimisticUrl.startsWith('/login'), hasRedSignal: unreadNotifications > 0, notificationCount: unreadNotifications },
    ];

    const triggerInstantAction = (targetHref: string) => {
        setOptimisticUrl(targetHref);

        if (targetHref === '/cart') {
            setIsCartOpen(true);
            return;
        }

        if (targetHref === url) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        router.visit(targetHref, {
            preserveScroll: false,
            preserveState: false,
        });
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.6)] px-1 py-1 pb-[calc(0.3rem+env(safe-area-inset-bottom))] transition-all select-none">
            <ul className="flex items-center justify-around">
                {items.map((item, idx) => {
                    const Icon = item.icon;
                    const isActive = item.active;
                    
                    return (
                        <li key={idx} className="relative flex-1">
                            <button
                                type="button"
                                data-cart-target={item.href === '/cart' ? 'true' : undefined}
                                onTouchStart={(e) => {
                                    e.preventDefault();
                                    triggerInstantAction(item.href);
                                }}
                                onMouseDown={(e) => {
                                    if ('ontouchstart' in window) return; // Prevent double trigger on mobile touch devices
                                    e.preventDefault();
                                    triggerInstantAction(item.href);
                                }}
                                className="w-full relative flex flex-col items-center justify-center py-1 group cursor-pointer active:scale-90 transition-transform duration-75"
                            >
                                <div className={`relative flex items-center justify-center px-3.5 py-1 rounded-xl transition-all duration-100 ${
                                    isActive
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}>
                                    <Icon className={`w-5 h-5 transition-transform duration-100 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} />
                                    
                                    {/* Cart / Wishlist Counter Badge */}
                                    {!!item.badge && item.badge > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1 shadow-md border-2 border-white dark:border-slate-900 animate-pulse">
                                            {item.badge}
                                        </span>
                                    )}

                                    {/* Red Signal Indicator Dot / Badge for Notifications */}
                                    {!(item.badge && item.badge > 0) && (item as any).hasRedSignal && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 shadow-md shadow-red-500/50 border border-white dark:border-slate-900 animate-pulse">
                                            {((item as any).notificationCount > 99 ? '99+' : (item as any).notificationCount) || ''}
                                        </span>
                                    )}
                                </div>

                                <span className={`text-[10px] tracking-tight mt-0.5 transition-colors ${
                                    isActive
                                        ? 'text-emerald-600 dark:text-emerald-400 font-black'
                                        : 'text-slate-600 dark:text-slate-400 font-semibold'
                                }`}>
                                    {item.label}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}