import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'bn' | 'en' | 'hi' | 'in';

interface I18nState {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string) => string;
    detectLanguage: () => Promise<void>;
}

const translations: Record<Language, Record<string, string>> = {
    bn: {
        support: 'সাপোর্ট সেন্টার',
        track_order: 'অর্ডার ট্র্যাক',
        became_seller: 'বিক্রেতা হোন',
        merchant_shops: 'মার্চেন্ট শপসমূহ',
        search_placeholder: 'পণ্য, ক্যাটাগরি অথবা মার্চেন্ট শপের নাম দিয়ে খুঁজুন...',
        home: 'হোম',
        categories: 'ক্যাটাগরি',
        shops: 'শপ',
        cart: 'কার্ট',
        account: 'একাউন্ট',
        login: 'লগইন',
        dashboard: 'ড্যাশবোর্ড',
        profile: 'প্রোফাইল',
        logout: 'লগআউট',
        live_deal: 'লাইভ ডিল',
        flash_sale_soon: 'ফ্ল্যাশ সেল শীঘ্রই।',
        buy_now: 'কিনতে যান',
        add_to_cart: 'কার্ট যোগ করুন',
        all_products: 'সব পণ্য দেখুন',
        popular_categories: 'জনপ্রিয় ক্যাটাগরি সমূহ',
        for_you: 'আপনার জন্য সাজানো পণ্যসমূহ',
        dhamaka_offer: 'ধামাকা অফার & ফ্ল্যাশ সেল',
    },
    en: {
        support: 'Support Center',
        track_order: 'Track Order',
        became_seller: 'Become a Seller',
        merchant_shops: 'Merchant Shops',
        search_placeholder: 'Search products, categories, or shops...',
        home: 'Home',
        categories: 'Categories',
        shops: 'Shops',
        cart: 'Cart',
        account: 'Account',
        login: 'Login',
        dashboard: 'Dashboard',
        profile: 'Profile',
        logout: 'Logout',
        live_deal: 'Live Deal',
        flash_sale_soon: 'Flash Sale Soon!',
        buy_now: 'Buy Now',
        add_to_cart: 'Add to Cart',
        all_products: 'View All Products',
        popular_categories: 'Popular Categories',
        for_you: 'Recommended For You',
        dhamaka_offer: 'Flash Sale & Special Offers',
    },
    hi: {
        support: 'सहायता केंद्र',
        track_order: 'ऑर्डर ट्रैक करें',
        became_seller: 'विक्रेता बनें',
        merchant_shops: 'मर्चेंट दुकानें',
        search_placeholder: 'उत्पाद, श्रेणियां या दुकानें खोजें...',
        home: 'होम',
        categories: 'श्रेणियां',
        shops: 'दुकानें',
        cart: 'कार्ट',
        account: 'खाता',
        login: 'लॉग इन',
        dashboard: 'डैशबोर्ड',
        profile: 'प्रोफ़ाइल',
        logout: 'लॉग आउट',
        live_deal: 'लाइव डील',
        flash_sale_soon: 'धमाका सेल जल्द!',
        buy_now: 'अभी खरीदें',
        add_to_cart: 'कार्ट में जोड़ें',
        all_products: 'सभी उत्पाद देखें',
        popular_categories: 'लोकप्रिय श्रेणियां',
        for_you: 'आपके लिए अनुशंसित',
        dhamaka_offer: 'धमाका ऑफर और फ्लैश सेल',
    },
    in: {
        support: 'सहायता केंद्र',
        track_order: 'ऑर्डर ट्रैक करें',
        became_seller: 'विक्रेता बनें',
        merchant_shops: 'मर्चेंट दुकानें',
        search_placeholder: 'उत्पाद, श्रेणियां या दुकानें खोजें...',
        home: 'होम',
        categories: 'श्रेणियां',
        shops: 'दुकानें',
        cart: 'कार्ट',
        account: 'खाता',
        login: 'लॉग इन',
        dashboard: 'डैशबोर्ड',
        profile: 'प्रोफ़ाइल',
        logout: 'लॉग आउट',
        live_deal: 'लाइव डील',
        flash_sale_soon: 'धमाका सेल जल्द!',
        buy_now: 'अभी खरीदें',
        add_to_cart: 'कार्ट में जोड़ें',
        all_products: 'सभी उत्पाद देखें',
        popular_categories: 'लोकप्रिय श्रेणियां',
        for_you: 'आपके लिए अनुशंसित',
        dhamaka_offer: 'धमाका ऑफर और फ्लैश सेल',
    },
};

export function getInitialLang(): Language {
    if (typeof window === 'undefined') return 'bn';
    try {
        // 1. Check user choice in localStorage first
        const raw = localStorage.getItem('site_language') || localStorage.getItem('app_lang');
        if (raw) {
            let val = raw;
            if (raw.indexOf('{') !== -1) {
                try {
                    const parsed = JSON.parse(raw);
                    val = parsed?.state?.lang || parsed?.lang || '';
                } catch(e) {}
            }
            val = String(val).toLowerCase();
            if (val === 'en') return 'en';
            if (val === 'in' || val === 'hi') return 'in';
            if (val === 'bn') return 'bn';
        }

        // 2. Check Google Translate cookie (e.g. /auto/en, /bn/en, /auto/hi)
        const match = document.cookie.match(/googtrans=\/[^/]+\/([a-zA-Z]+)/);
        if (match && match[1]) {
            const cLang = match[1].toLowerCase();
            if (cLang === 'en') return 'en';
            if (cLang === 'hi' || cLang === 'in') return 'in';
            if (cLang === 'bn') return 'bn';
        }
    } catch(e) {}
    return 'bn';
}

export const useI18nStore = create<I18nState>((set, get) => ({
    lang: getInitialLang(),
    setLang: (lang: Language) => {
        try {
            localStorage.setItem('site_language', lang);
            localStorage.setItem('app_lang', lang);
            localStorage.setItem('app-lang-detected', 'USER_SET');
        } catch(e) {}
        set({ lang });
    },
    t: (key: string) => {
        const lang = get().lang;
        return translations[lang]?.[key] || translations['hi']?.[key] || translations['bn']?.[key] || key;
    },
    detectLanguage: async () => {
        try {
            if (localStorage.getItem('app-lang-detected') === 'USER_SET') return;
            const saved = localStorage.getItem('site_language') || localStorage.getItem('app_lang');
            if (saved && (saved.includes('en') || saved.includes('bn') || saved.includes('in') || saved.includes('hi'))) return;
            
            const match = document.cookie.match(/googtrans=\/[^/]+\/([a-zA-Z]+)/);
            if (match && match[1]) return;

            const res = await fetch('https://ipapi.co/json/').then(r => r.json());
            const country = res?.country_code;

            if (country === 'IN') {
                set({ lang: 'in' });
                localStorage.setItem('site_language', 'in');
                localStorage.setItem('app_lang', 'in');
                localStorage.setItem('app-lang-detected', 'IN');
            } else if (country === 'BD') {
                set({ lang: 'bn' });
                localStorage.setItem('site_language', 'bn');
                localStorage.setItem('app_lang', 'bn');
                localStorage.setItem('app-lang-detected', 'BD');
            } else if (country) {
                set({ lang: 'en' });
                localStorage.setItem('site_language', 'en');
                localStorage.setItem('app_lang', 'en');
                localStorage.setItem('app-lang-detected', 'GLOBAL');
            }
        } catch {}
    },
}));

export const useI18n = useI18nStore;
