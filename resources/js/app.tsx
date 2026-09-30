import './bootstrap';
import '../css/app.css';

// Prevent Google Translate and extensions from crashing React DOM reconciliation
if (typeof window !== 'undefined' && typeof Node === 'function' && Node.prototype) {
    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
        if (referenceNode && referenceNode.parentNode !== this) {
            return originalInsertBefore.call(this, newNode, null) as T;
        }
        return originalInsertBefore.call(this, newNode, referenceNode) as T;
    };

    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
        if (child.parentNode !== this) {
            return child;
        }
        return originalRemoveChild.call(this, child) as T;
    };
}

import { createRoot } from 'react-dom/client';
import { createInertiaApp, router } from '@inertiajs/react';

// Prevent disruptive Inertia development error iframe modal (e.g. 404 / 500 overlay)
router.on('invalid', (event: any) => {
    event.preventDefault();
    console.warn('[Inertia] Intercepted non-Inertia/error response:', event?.detail?.response?.status);
});
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import AdminLayout from './Layouts/AdminLayout';
import SellerLayout from './Layouts/SellerLayout';
import CustomerLayout from './Layouts/CustomerLayout';
import ErrorBoundary from './Components/ErrorBoundary';
import { FlyToCartOverlay } from './Components/FlyToCart';
import { FlyToWishlistOverlay } from './Components/FlyToWishlist';
import { detectVisitorCountryAndApply } from './lib/geoDetection';
import { initInstantNavigation } from './lib/instantPrefetch';

// Auto-detect visitor country for language and currency & handle interactive clicked text states
if (typeof window !== 'undefined') {
    detectVisitorCountryAndApply();
    initInstantNavigation();

    // 🎯 Keep clicked text/clickable element color changed while clicked
    let activeClickedElement: HTMLElement | null = null;
    document.addEventListener('click', (e) => {
        const target = (e.target as HTMLElement)?.closest('a, button, [role="button"], .cursor-pointer, nav li, tab, [data-clickable]');
        if (!target) return;

        if (activeClickedElement && activeClickedElement !== target) {
            activeClickedElement.classList.remove('is-clicked-active');
        }

        activeClickedElement = target as HTMLElement;
        activeClickedElement.classList.add('is-clicked-active');
    }, { passive: true });
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        return resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx'))
            .then((module: any) => {
                let page = module.default;
                if (name.startsWith('Admin/')) {
                    page.layout = page.layout || ((page: any) => <AdminLayout children={page} />);
                } else if (name.startsWith('Seller/')) {
                    page.layout = page.layout || ((page: any) => <SellerLayout children={page} />);
                } else if (name.startsWith('Account/')) {
                    page.layout = page.layout || ((page: any) => <CustomerLayout children={page} />);
                }
                return module;
            });
    },
    setup({ el, App, props }) {
        // Sync server currency (CF-IPCountry, session, or cookie) to client Zustand store
        const serverCurrency = (props.initialPage?.props as any)?.currency;
        if (serverCurrency) {
            detectVisitorCountryAndApply(serverCurrency);
        } else {
            detectVisitorCountryAndApply();
        }

        const root = createRoot(el);
        root.render(
            <ErrorBoundary>
                <App {...props} />
                <FlyToCartOverlay />
                <FlyToWishlistOverlay />
            </ErrorBoundary>
        );

        // Function to apply theme colors from server to CSS root variables
        const applyThemeColors = (colors: any) => {
            if (!colors || typeof document === 'undefined') return;
            const docRoot = document.documentElement;
            Object.keys(colors).forEach((key) => {
                const val = colors[key];
                if (val && typeof val === 'string') {
                    const cssVar = `--theme-${key.replace(/_/g, '-')}`;
                    docRoot.style.setProperty(cssVar, val);
                }
            });
        };

        const pageProps = props.initialPage.props as any;
        applyThemeColors(pageProps?.siteSettings?.theme_colors);

        // Keep theme colors synchronized across Inertia page transitions
        window.addEventListener('inertia:success', (e: any) => {
            const currentProps = e.detail?.page?.props;
            if (currentProps?.siteSettings?.theme_colors) {
                applyThemeColors(currentProps.siteSettings.theme_colors);
            }
        });
    },
    progress: {
        delay: 150,
        color: '#8b5cf6',
        includeCSS: true,
        showSpinner: false,
    },
});
