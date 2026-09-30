import { router } from '@inertiajs/react';

const prefetchedUrls = new Map<string, number>();
const PREFETCH_CACHE_TTL = 30000;

function shouldPrefetch(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    if (url.startsWith('#') || url.startsWith('javascript:') || url.startsWith('tel:') || url.startsWith('mailto:')) return false;
    if (/\.(zip|pdf|docx?|xlsx?|csv|png|jpe?g|gif|webp|svg|mp4|mp3)$/i.test(url)) return false;
    if (url.includes('/logout') || url.includes('/delete') || url.includes('/destroy')) return false;

    try {
        const parsed = new URL(url, window.location.origin);
        if (parsed.origin !== window.location.origin) return false;
        if (parsed.pathname === window.location.pathname && parsed.search === window.location.search) return false;

        const now = Date.now();
        const lastPrefetch = prefetchedUrls.get(parsed.pathname + parsed.search);
        if (lastPrefetch && (now - lastPrefetch) < PREFETCH_CACHE_TTL) return false;

        return true;
    } catch {
        return false;
    }
}

export function prefetchUrl(url: string) {
    if (!shouldPrefetch(url)) return;

    try {
        const parsed = new URL(url, window.location.origin);
        const target = parsed.pathname + parsed.search;
        prefetchedUrls.set(target, Date.now());

        if (typeof (router as any).prefetch === 'function') {
            (router as any).prefetch(target, { method: 'get' }, { cacheFor: '1m' });
        }
    } catch {}
}

export function initInstantNavigation() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    let hoverTimeout: any = null;

    const handlePointerOver = (e: MouseEvent | TouchEvent) => {
        const target = (e.target as HTMLElement)?.closest('a[href], [data-href]');
        if (!target) return;

        const href = target.getAttribute('href') || target.getAttribute('data-href');
        if (!href) return;

        if (e.type === 'touchstart') {
            prefetchUrl(href);
            return;
        }

        if (hoverTimeout) clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
            prefetchUrl(href);
        }, 40);
    };

    const handlePointerOut = () => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            hoverTimeout = null;
        }
    };

    document.addEventListener('mouseover', handlePointerOver, { passive: true });
    document.addEventListener('mouseout', handlePointerOut, { passive: true });
    document.addEventListener('touchstart', handlePointerOver, { passive: true });
}
