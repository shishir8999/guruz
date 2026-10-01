import { create } from 'zustand';

export type Language = 'bn' | 'en' | 'hi' | 'in';

interface I18nState {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (keyOrBn: string, en?: string, hi?: string) => string;
    detectLanguage: () => Promise<void>;
}

const translations: Record<'bn' | 'en' | 'hi', Record<string, string>> = {
    bn: {
        // Navigation & Core
        support: 'সাপোর্ট সেন্টার',
        track_order: 'অর্ডার ট্র্যাক',
        became_seller: 'বিক্রেতা হোন',
        merchant_shops: 'মার্চেন্ট শপসমূহ',
        search_placeholder: 'পণ্য, ক্যাটাগরি অথবা মার্চেন্ট শপের নাম দিয়ে খুঁজুন...',
        search: 'অনুসন্ধান',
        home: 'হোম',
        categories: 'ক্যাটাগরি',
        shops: 'শপ',
        cart: 'কার্ট',
        account: 'একাউন্ট',
        login: 'লগইন',
        register: 'রেজিস্টার',
        dashboard: 'ড্যাশবোর্ড',
        profile: 'প্রোফাইল',
        logout: 'লগআউট',
        orders: 'আমার অর্ডার',
        wishlist: 'পছন্দের তালিকা',
        notifications: 'বিজ্ঞপ্তি',

        // Deals & Shopping
        live_deal: 'লাইভ ডিল',
        flash_sale_soon: 'ফ্ল্যাশ সেল শীঘ্রই!',
        buy_now: 'এখনই কিনুন',
        add_to_cart: 'কার্টে যোগ করুন',
        all_products: 'সব পণ্য দেখুন',
        popular_categories: 'জনপ্রিয় ক্যাটাগরি সমূহ',
        for_you: 'আপনার জন্য সাজানো পণ্যসমূহ',
        dhamaka_offer: 'ধামাকা অফার & ফ্ল্যাশ সেল',
        featured_products: 'জনপ্রিয় ও নির্বাচিত পণ্য',
        latest_products: 'নতুন সংগৃহীত পণ্য',
        warranty_claim: 'ওয়ারেন্টি ক্লেইম',
        save_for_later: 'পরে কিনুন',

        // Cart & Checkout
        checkout: 'চেকআউট',
        place_order: 'অর্ডার কনফার্ম করুন',
        subtotal: 'সাবটোটাল',
        shipping: 'ডেলিভারি চার্জ',
        discount: 'ডিসকাউন্ট',
        total: 'সর্বমোট',
        payment_method: 'পেমেন্ট পদ্ধতি',
        cash_on_delivery: 'ক্যাশ অন ডেলিভারি',
        free_shipping: 'ফ্রি ডেলিভারি',
        coupon_code: 'কুপন কোড',
        apply: 'প্রয়োগ করুন',
        price: 'দাম',
        quantity: 'পরিমাণ',
        items: 'আইটেম',
        empty_cart: 'আপনার কার্ট খালি',
        continue_shopping: 'কেনাকাটা চালিয়ে যান',

        // Product Details
        in_stock: 'স্টকে আছে',
        out_of_stock: 'স্টক শেষ',
        rating: 'রেটিং',
        reviews: 'রিভিউ',
        description: 'বিবরণ',
        specifications: 'বৈশিষ্ট্য',
        customer_reviews: 'ক্রেতাদের রিভিউ',
        related_products: 'সম্পর্কিত পণ্য',

        // Forms & Info
        full_name: 'পুরো নাম',
        phone_number: 'ফোন নম্বর',
        email: 'ইমেইল',
        address: 'ঠিকানা',
        city: 'শহর / জেলা',
        notes: 'অতিরিক্ত নির্দেশনা',
        save: 'সংরক্ষণ করুন',
        cancel: 'বাতিল',
        delete: 'মুছুন',
        edit: 'সম্পাদনা',

        // Value Badges
        authentic_products: '১০০% আসল পণ্য',
        fast_delivery: 'দ্রুত ডেলিভারি',
        easy_returns: 'সহজ রিটার্ন পলিসি',
        secure_payment: 'নিরাপদ পেমেন্ট গেটওয়ে',
        customer_support: '২৪/৭ গ্রাহক সেবা',
        official_warranty: 'অফিসিয়াল ওয়ারেন্টি',
    },
    en: {
        // Navigation & Core
        support: 'Support Center',
        track_order: 'Track Order',
        became_seller: 'Become a Seller',
        merchant_shops: 'Merchant Shops',
        search_placeholder: 'Search products, categories, or shops...',
        search: 'Search',
        home: 'Home',
        categories: 'Categories',
        shops: 'Shops',
        cart: 'Cart',
        account: 'Account',
        login: 'Login',
        register: 'Register',
        dashboard: 'Dashboard',
        profile: 'Profile',
        logout: 'Logout',
        orders: 'My Orders',
        wishlist: 'Wishlist',
        notifications: 'Notifications',

        // Deals & Shopping
        live_deal: 'Live Deal',
        flash_sale_soon: 'Flash Sale Soon!',
        buy_now: 'Buy Now',
        add_to_cart: 'Add to Cart',
        all_products: 'View All Products',
        popular_categories: 'Popular Categories',
        for_you: 'Recommended For You',
        dhamaka_offer: 'Flash Sale & Special Offers',
        featured_products: 'Featured Products',
        latest_products: 'Latest Products',
        warranty_claim: 'Warranty Claim',
        save_for_later: 'Save for Later',

        // Cart & Checkout
        checkout: 'Checkout',
        place_order: 'Place Order',
        subtotal: 'Subtotal',
        shipping: 'Delivery Fee',
        discount: 'Discount',
        total: 'Total',
        payment_method: 'Payment Method',
        cash_on_delivery: 'Cash on Delivery',
        free_shipping: 'Free Delivery',
        coupon_code: 'Coupon Code',
        apply: 'Apply',
        price: 'Price',
        quantity: 'Quantity',
        items: 'Items',
        empty_cart: 'Your cart is empty',
        continue_shopping: 'Continue Shopping',

        // Product Details
        in_stock: 'In Stock',
        out_of_stock: 'Out of Stock',
        rating: 'Rating',
        reviews: 'Reviews',
        description: 'Description',
        specifications: 'Specifications',
        customer_reviews: 'Customer Reviews',
        related_products: 'Related Products',

        // Forms & Info
        full_name: 'Full Name',
        phone_number: 'Phone Number',
        email: 'Email',
        address: 'Delivery Address',
        city: 'City / District',
        notes: 'Additional Notes',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',

        // Value Badges
        authentic_products: '100% Genuine Products',
        fast_delivery: 'Fast Nationwide Delivery',
        easy_returns: 'Easy Return Policy',
        secure_payment: '100% Secure Payment',
        customer_support: '24/7 Customer Support',
        official_warranty: 'Official Brand Warranty',
    },
    hi: {
        // Navigation & Core
        support: 'सहायता केंद्र',
        track_order: 'ऑर्डर ट्रैक करें',
        became_seller: 'विक्रेता बनें',
        merchant_shops: 'मर्चेंट दुकानें',
        search_placeholder: 'उत्पाद, श्रेणियां या दुकानें खोजें...',
        search: 'खोजें',
        home: 'होम',
        categories: 'श्रेणियां',
        shops: 'दुकानें',
        cart: 'कार्ट',
        account: 'खाता',
        login: 'लॉग इन',
        register: 'पंजीकरण',
        dashboard: 'डैशबोर्ड',
        profile: 'प्रोफ़ाइल',
        logout: 'लॉग आउट',
        orders: 'मेरे ऑर्डर',
        wishlist: 'विशलिस्ट',
        notifications: 'सूचनाएं',

        // Deals & Shopping
        live_deal: 'लाइव डील',
        flash_sale_soon: 'धमाका सेल जल्द!',
        buy_now: 'अभी खरीदें',
        add_to_cart: 'कार्ट में जोड़ें',
        all_products: 'सभी उत्पाद देखें',
        popular_categories: 'लोकप्रिय श्रेणियां',
        for_you: 'आपके लिए अनुशंसित',
        dhamaka_offer: 'धमाका ऑफर और फ्लैश सेल',
        featured_products: 'विशेष उत्पाद',
        latest_products: 'नवीनतम उत्पाद',
        warranty_claim: 'वारंटी दावा',
        save_for_later: 'बाद के लिए सहेजें',

        // Cart & Checkout
        checkout: 'चेकआउट',
        place_order: 'ऑर्डर कन्फर्म करें',
        subtotal: 'उप-कुल',
        shipping: 'डिलीवरी शुल्क',
        discount: 'छूट',
        total: 'कुल राशि',
        payment_method: 'भुगतान का तरीका',
        cash_on_delivery: 'कैश ऑन डिलीवरी',
        free_shipping: 'मुफ्त डिलीवरी',
        coupon_code: 'कूपन कोड',
        apply: 'लागू करें',
        price: 'मूल्य',
        quantity: 'मात्रा',
        items: 'आइटम',
        empty_cart: 'आपकी कार्ट खाली है',
        continue_shopping: 'खरीदारी जारी रखें',

        // Product Details
        in_stock: 'स्टॉक में उपलब्ध',
        out_of_stock: 'स्टॉक समाप्त',
        rating: 'रेटिंग',
        reviews: 'समीक्षाएं',
        description: 'विवरण',
        specifications: 'विशेष विवरण',
        customer_reviews: 'ग्राहक समीक्षाएं',
        related_products: 'संबंधित उत्पाद',

        // Forms & Info
        full_name: 'पूरा नाम',
        phone_number: 'फ़ोन नंबर',
        email: 'ईमेल',
        address: 'वितरण का पता',
        city: 'शहर / जिला',
        notes: 'अतिरिक्त निर्देश',
        save: 'सहेजें',
        cancel: 'रद्द करें',
        delete: 'हटाएं',
        edit: 'संपादित करें',

        // Value Badges
        authentic_products: '100% असली उत्पाद',
        fast_delivery: 'तेज़ डिलीवरी',
        easy_returns: 'आसान वापसी नीति',
        secure_payment: 'सुरक्षित भुगतान',
        customer_support: '24/7 ग्राहक सहायता',
        official_warranty: 'आधिकारिक वारंटी',
    },
};

export function getInitialLang(): Language {
    if (typeof window === 'undefined') return 'bn';
    try {
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
        const cleanLang = (lang === 'hi' ? 'in' : lang);
        try {
            localStorage.setItem('site_language', cleanLang);
            localStorage.setItem('app_lang', cleanLang);
            localStorage.setItem('app-lang-detected', 'USER_SET');
        } catch(e) {}
        set({ lang: cleanLang });

        if (typeof window !== 'undefined') {
            const gLang = cleanLang === 'in' ? 'hi' : cleanLang;
            if ((window as any).changeSiteLanguage) {
                (window as any).changeSiteLanguage(gLang);
            }
        }
    },
    t: (keyOrBn: string, en?: string, hi?: string) => {
        const currentLang = get().lang;
        const normalized: 'bn' | 'en' | 'hi' = (currentLang === 'in' || currentLang === 'hi') ? 'hi' : (currentLang === 'en' ? 'en' : 'bn');

        // 1. Direct 3-argument usage: t('বাংলা', 'English', 'हिन्दी')
        if (en !== undefined) {
            if (normalized === 'en') return en;
            if (normalized === 'hi') return hi || en;
            return keyOrBn; // 'bn'
        }

        // 2. Dictionary lookup for current language
        if (translations[normalized]?.[keyOrBn]) {
            return translations[normalized][keyOrBn];
        }

        // 3. Fallbacks
        if (normalized === 'bn' && translations['bn']?.[keyOrBn]) {
            return translations['bn'][keyOrBn];
        }
        if (normalized === 'en' && translations['en']?.[keyOrBn]) {
            return translations['en'][keyOrBn];
        }
        if (normalized === 'hi' && translations['hi']?.[keyOrBn]) {
            return translations['hi'][keyOrBn];
        }

        return keyOrBn;
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
                get().setLang('in');
                localStorage.setItem('app-lang-detected', 'IN');
            } else if (country === 'BD') {
                get().setLang('bn');
                localStorage.setItem('app-lang-detected', 'BD');
            } else if (country) {
                get().setLang('en');
                localStorage.setItem('app-lang-detected', 'GLOBAL');
            }
        } catch {}
    },
}));

export const useI18n = useI18nStore;
