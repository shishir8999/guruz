/**
 * Universal Geo-IP Auto-Detector for Guruz E-Commerce
 * Automatically routes visitors to their local country currency & language:
 * - India (IN) -> INR (₹)
 * - USA (US) & Global -> USD ($)
 * - Bangladesh (BD) -> BDT (৳)
 */

import { useI18nStore, Language } from './i18n';
import { useCurrencyStore, CurrencyCode } from './currency';

export function syncServerCurrencyToStore(serverCurrency?: any) {
    if (!serverCurrency) return;
    const curr = useCurrencyStore.getState();
    if (serverCurrency.code) {
        curr.syncWithServer(serverCurrency);
    }
}

export async function detectVisitorCountryAndApply(serverCurrency?: any) {
    if (typeof window === 'undefined') return;

    try {
        // 1. If server already identified currency (e.g. from CF-IPCountry on backend), sync immediately
        if (serverCurrency && serverCurrency.code) {
            useCurrencyStore.getState().syncWithServer(serverCurrency);
        }

        // 2. Check if URL has an explicit currency parameter e.g. ?currency=INR
        const urlParams = new URLSearchParams(window.location.search);
        const queryCurrency = urlParams.get('currency')?.toUpperCase();
        if (queryCurrency && ['BDT', 'INR', 'USD'].includes(queryCurrency)) {
            useCurrencyStore.getState().setCurrency(queryCurrency as CurrencyCode);
            document.cookie = `user_currency=${queryCurrency}; path=/; max-age=31536000`;
            return;
        }

        const manualLang = localStorage.getItem('app-lang-detected');
        const manualCurr = localStorage.getItem('app-currency-detected');
        if (manualLang === 'USER_SET' && manualCurr === 'USER_SET') {
            return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        let countryCode: string | null = null;

        // 3. Fast detection via Cloudflare CDN trace (Zero CORS, 100% reliable)
        try {
            const traceRes = await fetch('https://www.cloudflare.com/cdn-cgi/trace', { signal: controller.signal });
            if (traceRes.ok) {
                const text = await traceRes.text();
                const match = text.match(/loc=([A-Z]{2})/);
                if (match && match[1]) {
                    countryCode = match[1];
                }
            }
        } catch {}

        // Fallback 1: freeipapi.com
        if (!countryCode) {
            try {
                const res2 = await fetch('https://freeipapi.com/api/json', { signal: controller.signal });
                if (res2.ok) {
                    const data2 = await res2.json();
                    countryCode = data2?.countryCode || null;
                }
            } catch {}
        }

        // Fallback 2: ipapi.co
        if (!countryCode) {
            try {
                const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
                if (res.ok) {
                    const data = await res.json();
                    countryCode = data?.country_code || null;
                }
            } catch {}
        }

        clearTimeout(timeoutId);

        if (!countryCode) return;

        const i18n = useI18nStore.getState();
        const curr = useCurrencyStore.getState();

        let targetLang: Language = 'bn';
        let targetCurr: CurrencyCode = 'BDT';

        if (countryCode === 'IN') {
            targetLang = 'in';
            targetCurr = 'INR';
        } else if (countryCode === 'BD') {
            targetLang = 'bn';
            targetCurr = 'BDT';
        } else {
            targetLang = 'en';
            targetCurr = 'USD';
        }

        const currentSavedLang = localStorage.getItem('site_language') || localStorage.getItem('app_lang');

        // Apply Language if not manually set by user
        if (manualLang !== 'USER_SET' && currentSavedLang !== targetLang) {
            i18n.setLang(targetLang);
            localStorage.setItem('site_language', targetLang);
            localStorage.setItem('app_lang', targetLang);
            localStorage.setItem('app-lang-detected', countryCode);

            if ((window as any).changeSiteLanguage) {
                (window as any).changeSiteLanguage(targetLang);
            }
        }

        // Apply Currency if not manually set by user
        if (manualCurr !== 'USER_SET') {
            curr.setCurrency(targetCurr);
            localStorage.setItem('app-currency-detected', countryCode);
            document.cookie = `user_currency=${targetCurr}; path=/; max-age=31536000`;
        }
    } catch {
        // Fail silently
    }
}
