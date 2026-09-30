import { Link, usePage, router } from '@inertiajs/react';
import {
    ShoppingCart, Search, User, LogOut, LayoutDashboard,
    Store, Package, Heart, Headset, MapPin, Sun, Moon,
    Award, Menu, Mic, Camera, X, DollarSign, ChevronDown, Check,
    Smartphone, Laptop, Watch, Wifi, Gamepad2, Zap, Layers, Home, Globe, MessageCircle, Bell
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useCartStore } from '@/lib/cart';
import { useI18nStore, Language } from '@/lib/i18n';
import { useCurrencyStore, CurrencyCode } from '@/lib/currency';
import { useThemeStore } from '@/lib/theme';
import GlobalThemeEffects from '@/Components/GlobalThemeEffects';
import SummerEntranceOverlay from '@/Components/SummerEntranceOverlay';
import AutumnEntranceOverlay from '@/Components/AutumnEntranceOverlay';
import DurgaPujaEntranceOverlay from '@/Components/DurgaPujaEntranceOverlay';
import DeepavaliEntranceOverlay from '@/Components/DeepavaliEntranceOverlay';
import NewYearEntranceOverlay from '@/Components/NewYearEntranceOverlay';
import { CartDrawer } from '@/Components/CartDrawer';
import { useWishlistStore } from '@/lib/wishlist';
import { WishlistPopup } from '@/Components/WishlistPopup';
import { CartPopup } from '@/Components/CartPopup';
import RegistrationSuccessPopup from '@/Components/RegistrationSuccessPopup';
import { SignupOfferPopup } from '@/Components/SignupOfferPopup';
import { translateDOM } from '@/lib/domTranslator';
import axios from 'axios';

interface AuthUser {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
}

interface PageProps {
    auth: {
        user: AuthUser | null;
        roles: string[];
        isAdmin: boolean;
        isVendor: boolean;
        wishlist_ids?: number[];
    };
    siteSettings?: {
        site_logo?: string | null;
        site_title?: string;
        support_phone?: string;
    };
    [key: string]: any;
}

const searchTerms = [
    "iPhone 15 Pro Max...",
    "Samsung Galaxy S24 Ultra...",
    "MacBook Air M3...",
    "Sony Headphones...",
    "Smart TVs...",
    "Gaming Consoles...",
    "স্মার্টফোন এবং গ্যাজেট...",
    "ল্যাপটপ এবং ডেস্কটপ..."
];

export function Header() {
    const { props } = usePage<PageProps>();
    const auth = props.auth;
    const siteSettings = props.siteSettings;
    const user = auth?.user ?? null;
    const isAdmin = auth?.isAdmin ?? false;
    const isVendor = auth?.isVendor ?? false;
    const flash = (props as any).flash || {};

    const isMessagesPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/account/messages');
    const isNotificationsPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/account/notifications');
    const effectiveUnreadMessages = isMessagesPage ? 0 : (auth?.unread_messages_count || 0);

    const rawUnreadNotifs = auth?.unread_notifications_count || (user as any)?.unread_notifications_count || 0;
    const [unreadNotifsState, setUnreadNotifsState] = useState<number>(() => isNotificationsPage ? 0 : rawUnreadNotifs);

    useEffect(() => {
        if (isNotificationsPage) {
            setUnreadNotifsState(0);
            return;
        }
        setUnreadNotifsState(rawUnreadNotifs);
    }, [rawUnreadNotifs, isNotificationsPage]);

    useEffect(() => {
        const handleCleared = () => {
            setUnreadNotifsState(0);
        };
        window.addEventListener('customer-notifications-cleared', handleCleared);
        return () => window.removeEventListener('customer-notifications-cleared', handleCleared);
    }, []);

    const effectiveUnreadNotifs = isNotificationsPage ? 0 : unreadNotifsState;
    const totalProfileBadge = effectiveUnreadMessages + effectiveUnreadNotifs;

    const count = useCartStore(s => s.items.reduce((a, b) => a + b.quantity, 0));
    const { wishlistIds, initWishlist, isInitialized } = useWishlistStore();
    const sharedWishlistIds: number[] = auth?.wishlist_ids || [];

    useEffect(() => {
        if (!isInitialized && sharedWishlistIds.length > 0) {
            initWishlist(sharedWishlistIds);
        }
    }, [isInitialized]);

    const wishlistCount = isInitialized ? wishlistIds.length : sharedWishlistIds.length;
    const { lang, setLang, t, detectLanguage } = useI18nStore();
    const locale = lang || 'bn';
    const { currency, setCurrency, detectLocation } = useCurrencyStore();
    const { theme, toggleTheme, setTheme } = useThemeStore();

    const [q, setQ] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const [listening, setListening] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isOpen: cartOpen, setIsOpen: setCartOpen } = useCartStore();
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const raw = localStorage.getItem('site_language') || localStorage.getItem('app_lang');
            if (raw) {
                const s = String(raw).toLowerCase();
                if (s.includes('en')) return 'en';
                if (s.includes('in') || s.includes('hi')) return 'in';
                if (s.includes('bn')) return 'bn';
            }
        }
        return (lang === 'en' ? 'en' : (lang === 'in' || lang === 'hi' ? 'in' : 'bn'));
    });

    useEffect(() => {
        if (lang === 'en') setSelectedLanguage('en');
        else if (lang === 'in' || lang === 'hi') setSelectedLanguage('in');
        else if (lang === 'bn') setSelectedLanguage('bn');
    }, [lang]);
    const [currDropdownOpen, setCurrDropdownOpen] = useState(false);
    const [liveVisitors, setLiveVisitors] = useState(342);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const mobileDropdownRef = useRef<HTMLDivElement>(null);
    const mobileScrolledDropdownRef = useRef<HTMLDivElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    // Typewriter effect state
    const [placeholderText, setPlaceholderText] = useState("");
    const [termIndex, setTermIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    // Live Search Suggestions State
    const [suggestions, setSuggestions] = useState<{ categories: any[], products: any[] }>({ categories: [], products: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const desktopSearchRef = useRef<HTMLFormElement>(null);
    const mobileSearchRef = useRef<HTMLFormElement>(null);

    // Image Search States
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Graceful fallback for broken logo URL
    const [logoError, setLogoError] = useState(false);
    useEffect(() => {
        setLogoError(false);
    }, [siteSettings?.site_logo]);
    const [imageSearchModalOpen, setImageSearchModalOpen] = useState(false);

    const activeProductNames: string[] = siteSettings?.search_product_names || [];
    const currentTerms = activeProductNames.length > 0
        ? activeProductNames.map((n: string) => (n.length > 30 ? n.substring(0, 30) + '...' : n))
        : searchTerms;

    useEffect(() => {
        let typingSpeed = isDeleting ? 30 : 80;
        const validTermIndex = termIndex % currentTerms.length;
        const targetTerm = currentTerms[validTermIndex] || "Search...";
        
        if (!isDeleting && placeholderText === targetTerm) {
            typingSpeed = 2000;
            setIsDeleting(true);
        } else if (isDeleting && placeholderText === "") {
            setIsDeleting(false);
            setTermIndex((prev) => (prev + 1) % currentTerms.length);
            typingSpeed = 400;
        }

        const timeout = setTimeout(() => {
            if (isDeleting) {
                setPlaceholderText(targetTerm.substring(0, placeholderText.length - 1));
            } else {
                setPlaceholderText(targetTerm.substring(0, placeholderText.length + 1));
            }
        }, typingSpeed);

        return () => clearTimeout(timeout);
    }, [placeholderText, isDeleting, termIndex, currentTerms]);

    const visitorWidget = siteSettings?.visitor_widget;
    const minVisitors = Number(visitorWidget?.live_visitor_min_count || 200);
    const maxVisitors = Number(visitorWidget?.live_visitor_max_count || 500);
    const baseVisitors = Number(visitorWidget?.live_visitor_base_count || Math.round((minVisitors + maxVisitors) / 2));
    const labelText = visitorWidget?.live_visitor_label_text || 'LIVE';
    const prefixText = visitorWidget?.live_visitor_prefix_text !== undefined ? visitorWidget.live_visitor_prefix_text : '🔴';
    const suffixText = visitorWidget?.live_visitor_suffix_text || '';

    useEffect(() => {
        let isMounted = true;

        const fetchLiveCount = async () => {
            try {
                const res = await fetch('/api/live-visitors', {
                    headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted && typeof data.count === 'number') {
                        setLiveVisitors(Math.min(Math.max(data.count, minVisitors), maxVisitors));
                    }
                }
            } catch (e) {}
        };

        fetchLiveCount();
        const pollInterval = setInterval(fetchLiveCount, 15000);

        // 🌊 Smooth realistic micro-fluctuation (+/- 1 to 3 visitors) every 4.5s
        const fluctuationInterval = setInterval(() => {
            if (!isMounted) return;
            setLiveVisitors(prev => {
                const delta = Math.floor(Math.random() * 7) - 3; // -3 to +3
                const nextVal = prev + delta;
                return Math.min(Math.max(nextVal, minVisitors), maxVisitors);
            });
        }, 4500);

        return () => {
            isMounted = false;
            clearInterval(pollInterval);
            clearInterval(fluctuationInterval);
        };
    }, [minVisitors, maxVisitors]);

    useEffect(() => {
        detectLocation();
        detectLanguage();

        const onScroll = () => {
            if (window.scrollY > 100) {
                setScrolled(true);
            } else if (window.scrollY < 30) {
                setScrolled(false);
            }
        };

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            const inDesktop = dropdownRef.current && dropdownRef.current.contains(target);
            const inMobile = mobileDropdownRef.current && mobileDropdownRef.current.contains(target);
            const inMobileScrolled = mobileScrolledDropdownRef.current && mobileScrolledDropdownRef.current.contains(target);
            if (!inDesktop && !inMobile && !inMobileScrolled) {
                setLangDropdownOpen(false);
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('scroll', onScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!q.trim()) {
            setSuggestions({ categories: [], products: [] });
            setShowSuggestions(false);
            return;
        }

        setShowSuggestions(true);
        setIsSearching(true);

        const delayDebounceFn = setTimeout(() => {
            axios.get(`/search/suggestions?q=${encodeURIComponent(q.trim())}`)
                .then(res => {
                    setSuggestions(res.data);
                })
                .catch(err => console.error(err))
                .finally(() => setIsSearching(false));
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [q]);

    useEffect(() => {
        const handleClickOutsideSearch = (e: MouseEvent) => {
            if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target as Node)) {
                if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
                    setShowSuggestions(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutsideSearch);
        return () => document.removeEventListener('mousedown', handleClickOutsideSearch);
    }, []);

    // Voice Search Logic
    useEffect(() => {
        if (!listening) return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Your browser does not support Voice Search.');
            setListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = lang === 'bn' ? 'bn-BD' : (lang === 'hi' ? 'hi-IN' : 'en-US');
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setQ(transcript);
            setListening(false);
            setShowSuggestions(true);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setListening(false);
        };

        recognition.onend = () => {
            setListening(false);
        };

        try {
            recognition.start();
        } catch (e) {
            setListening(false);
        }

        return () => {
            try { recognition.stop(); } catch(e) {}
        };
    }, [listening, lang]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        setShowSuggestions(false);
        if (q.trim()) router.visit(`/products?search=${encodeURIComponent(q.trim())}`);
    };

    const handleImageSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setImageSearchModalOpen(true);
        setIsUploadingImage(true);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post('/search/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success && response.data.redirect_url) {
                setTimeout(() => {
                    setImageSearchModalOpen(false);
                    setIsUploadingImage(false);
                    router.visit(response.data.redirect_url);
                }, 800);
            }
        } catch (error) {
            console.error('Image search failed:', error);
            setIsUploadingImage(false);
            alert('ছবিটি দিয়ে সার্চ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
        }
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    const triggerGoogleTranslate = (langCode: string) => {
        const targetLang = langCode || 'bn';

        try { 
            localStorage.setItem('site_language', targetLang); 
            localStorage.setItem('app_lang', targetLang); 
        } catch(e) {}

        const host = window.location.hostname;
        const isIpOrLocal = /^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host === 'localhost';
        const rootDomain = isIpOrLocal ? host : '.' + host.split('.').slice(-2).join('.');

        // 1. Clear old translate cookies
        const past = 'Thu, 01 Jan 1970 00:00:00 UTC';
        document.cookie = `googtrans=; expires=${past}; path=/;`;
        document.cookie = `googtrans=; expires=${past}; path=/; domain=${host};`;
        if (!isIpOrLocal) {
            document.cookie = `googtrans=; expires=${past}; path=/; domain=${rootDomain};`;
        }

        // 2. Set new cookies
        const cookieVal = `/auto/${targetLang}`;
        document.cookie = `googtrans=${cookieVal}; path=/;`;
        document.cookie = `googtrans=/bn/${targetLang}; path=/;`;
        if (!isIpOrLocal) {
            document.cookie = `googtrans=${cookieVal}; path=/; domain=${host};`;
            document.cookie = `googtrans=${cookieVal}; path=/; domain=${rootDomain};`;
            document.cookie = `googtrans=/bn/${targetLang}; path=/; domain=${host};`;
            document.cookie = `googtrans=/bn/${targetLang}; path=/; domain=${rootDomain};`;
        }

        // 3. Trigger Google Translate combo box if present in DOM
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (select) {
            select.value = targetLang;
            select.dispatchEvent(new Event('change'));
        }

        // 4. Reload to ensure full DOM translation
        setTimeout(() => {
            window.location.reload();
        }, 120);
    };

    const changeLanguage = (newLang: string) => {
        const cleanLang = (newLang === 'hi' ? 'in' : newLang);
        setSelectedLanguage(cleanLang);
        setLang(cleanLang as any);
        setLangDropdownOpen(false);
        
        try {
            localStorage.setItem('site_language', cleanLang);
            localStorage.setItem('app_lang', cleanLang);
            localStorage.setItem('app-lang-detected', 'USER_SET');
        } catch(e) {}

        const gLang = cleanLang === 'in' ? 'hi' : cleanLang;

        if (typeof window !== 'undefined') {
            if ((window as any).changeSiteLanguage) {
                (window as any).changeSiteLanguage(gLang);
            } else {
                window.location.reload();
            }
        }
    };

    const languageOptions = [
        { code: 'bn', displayCode: 'bn', name: 'Bengali', nativeName: 'বাংলা (bn)' },
        { code: 'en', displayCode: 'en', name: 'English', nativeName: 'English (en)' },
        { code: 'in', displayCode: 'in', name: 'Hindi', nativeName: 'हिन्दी / India (in)' },
    ];

    const displayLang = useMemo(() => {
        if (lang === 'en') return 'en';
        if (lang === 'in' || lang === 'hi') return 'in';
        if (lang === 'bn') return 'bn';
        return 'bn';
    }, [lang]);

    const currentLangObj = languageOptions.find(l => l.code === lang || (l.code === 'in' && lang === 'hi')) || languageOptions[0];

    const mobileCategories = [
        { name: 'স্মার্টফোন ও গ্যাজেট', icon: Smartphone, slug: 'smartphones-gadgets' },
        { name: 'হেডফোন ও অডিও', icon: Headset, slug: 'headphones-audio' },
        { name: 'কম্পিউটার ও ল্যাপটপ', icon: Laptop, slug: 'computer-laptops' },
        { name: 'স্মার্টওয়াচ ও ব্যান্ড', icon: Watch, slug: 'smartwatches-bands' },
        { name: 'রাউটার ও নেটওয়ার্কিং', icon: Wifi, slug: 'routers-networking' },
        { name: 'গেমিং ও এক্সেসরিজ', icon: Gamepad2, slug: 'gaming-accessories' },
        { name: 'চার্জার ও পাওয়ার ব্যাংক', icon: Zap, slug: 'chargers-powerbanks' },
    ];

    const renderSuggestionsDropdown = () => {
        if (!showSuggestions || !q.trim()) return null;

        return (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] py-2 z-50 overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-200">
                {isSearching ? (
                    <div className="px-4 py-6 flex flex-col items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Searching...</span>
                    </div>
                ) : suggestions.categories.length === 0 && suggestions.products.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm font-bold text-slate-500 dark:text-slate-400">
                        No results found
                    </div>
                ) : (
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {suggestions.categories.length > 0 && (
                            <div className="mb-2">
                                <div className="px-4 py-1.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-800/80">Categories</div>
                                {suggestions.categories.map((cat: any) => (
                                    <Link key={cat.id} href={`/products?category=${cat.slug}`} onClick={() => setShowSuggestions(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                        {cat.image_url ? (
                                            <img src={cat.image_url} alt={cat.name} className="w-8 h-8 rounded-lg object-cover bg-white shadow-sm" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                                <Menu className="w-4 h-4 text-slate-400" />
                                            </div>
                                        )}
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{cat.name}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                        {suggestions.products.length > 0 && (
                            <div>
                                <div className="px-4 py-1.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-800/80">Products</div>
                                {suggestions.products.map((prod: any) => (
                                    <Link key={prod.id} href={`/product/${prod.slug}`} onClick={() => setShowSuggestions(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition group">
                                        {prod.primary_image_url ? (
                                            <img src={prod.primary_image_url} alt={prod.name} className="w-10 h-10 rounded-lg object-cover bg-white shadow-sm" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                                <Package className="w-5 h-5 text-slate-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{prod.name}</h4>
                                            <div className="text-[11px] font-black text-emerald-600 mt-0.5">
                                                ৳{Number(prod.sale_price || prod.price).toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const isThemeActive = !!siteSettings?.active_theme && (siteSettings?.active_theme?.active === true) && (siteSettings?.active_theme?.visibleOnSite !== false);
    const activeEffect = isThemeActive ? (siteSettings?.active_theme?.effectType || siteSettings?.active_theme?.id) : null;
    const isSummerThemeActive = activeEffect === 'grishmo' || activeEffect === 'Grishmo';
    const isMonsoonThemeActive = activeEffect === 'borsha' || activeEffect === 'Borsha' || activeEffect === 'ashar' || activeEffect === 'Ashar' || activeEffect === 'shrabon' || activeEffect === 'Shrabon' || activeEffect === 'Rain';
    const isAutumnThemeActive = activeEffect === 'sharat' || activeEffect === 'Sharat' || activeEffect === 'bhadro' || activeEffect === 'Bhadro';
    const isDurgaPujaThemeActive = activeEffect === 'durga_puja' || activeEffect === 'DurgaPuja' || activeEffect === 'durga';
    const isDeepavaliThemeActive = activeEffect === 'deepavali' || activeEffect === 'Deepavali' || activeEffect === 'diwali' || activeEffect === 'kartik';
    const isNewYearThemeActive = activeEffect === 'new_year' || activeEffect === 'NewYear' || activeEffect === 'newyear';

    return (
        <>
            <SummerEntranceOverlay active={isSummerThemeActive} />
            <AutumnEntranceOverlay active={isAutumnThemeActive} />
            <DurgaPujaEntranceOverlay active={isDurgaPujaThemeActive} />
            <DeepavaliEntranceOverlay active={isDeepavaliThemeActive} />
            <NewYearEntranceOverlay active={isNewYearThemeActive} />
            <GlobalThemeEffects activeTheme={siteSettings?.active_theme} />
            <header className="sticky top-0 z-[100] w-full transition-all duration-300 shadow-md">
                {/* === DESKTOP HEADER === */}
            <div className="hidden md:block">
                
                {/* 1. TOP WHITE UTILITY BAR */}
                <div 
                    className={`bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-all duration-300 relative z-50 ${
                        scrolled ? 'max-h-0 opacity-0 py-0 border-none overflow-hidden' : 'max-h-10 opacity-100 py-1 overflow-visible'
                    }`}
                >
                    <div className="mx-auto max-w-7xl px-4 h-7 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {/* Left Support */}
                        <div className="flex items-center gap-4">
                            <a href={`tel:${siteSettings?.support_phone || '01700000000'}`} className="flex items-center gap-1.5 hover:text-blue-900 dark:hover:text-blue-400 font-bold">
                                <Headset className="w-4 h-4 text-orange-500" />
                                {t('support')}
                            </a>
                        </div>

                        {/* Right Tracking, Currency, Language & Dark Mode */}
                        <div className="flex items-center gap-4">
                            <Link href="/track" className="flex items-center gap-1.5 hover:text-blue-900 dark:hover:text-blue-400 font-bold">
                                <MapPin className="w-3.5 h-3.5" />
                                {t('track_order')}
                            </Link>

                            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />

                            {/* Currency Selector (BDT ৳ / INR ₹ / USD $) */}
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700 text-[11px] font-black text-slate-800 dark:text-slate-200">
                                <DollarSign className="w-3 h-3 text-emerald-600" />
                                <select 
                                    value={currency} 
                                    onChange={e => setCurrency(e.target.value as CurrencyCode)}
                                    className="bg-transparent border-none text-[11px] font-black focus:outline-none cursor-pointer py-0 pl-0 pr-4"
                                >
                                    <option value="BDT">৳ BDT (বাংলাদেশ)</option>
                                    <option value="INR">₹ INR (India)</option>
                                    <option value="USD">$ USD (Global)</option>
                                </select>
                            </div>

                            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />

                            {/* Desktop Language Switcher Globe Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLangDropdownOpen(!langDropdownOpen);
                                    }}
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition border border-slate-300 dark:border-slate-700 text-[11px] font-black text-slate-800 dark:text-slate-200 cursor-pointer notranslate"
                                    translate="no"
                                    title="Select Language"
                                >
                                    <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-amber-400" />
                                    <span className="text-[11px] font-black uppercase notranslate" translate="no">{selectedLanguage}</span>
                                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                                </button>
                                
                                {langDropdownOpen && (
                                    <div 
                                        className="absolute top-full right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-[99999] animate-in fade-in zoom-in-95 duration-100"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider mb-1">
                                            Select Language
                                        </div>
                                        <div className="space-y-1">
                                            {languageOptions.map(opt => {
                                                const isSelected = selectedLanguage === opt.code;
                                                return (
                                                    <button
                                                        key={opt.code}
                                                        type="button"
                                                        onClick={() => changeLanguage(opt.code)}
                                                        className={`w-full text-left px-3 py-2.5 text-xs font-black rounded-xl flex items-center justify-between transition cursor-pointer ${
                                                            isSelected 
                                                                ? 'bg-amber-500 text-slate-950 shadow-xs' 
                                                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2 py-0.5">
                                                            <span className="text-xs font-bold">{opt.nativeName}</span>
                                                        </div>
                                                        {isSelected && <Check className="w-4 h-4 text-slate-950 stroke-[3]" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />

                            {/* Sun & Moon Single Toggle Button */}
                            <button
                                type="button"
                                onClick={toggleTheme}
                                title={theme === 'dark' ? "লাইট মোড চালু করুন (Switch to Light Mode)" : "ডার্ক মোড চালু করুন (Switch to Dark Mode)"}
                                className="w-7 h-7 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-indigo-400 shadow-2xs transition-all duration-200 cursor-pointer active:scale-90 group"
                                aria-label="Toggle Theme"
                            >
                                {theme === 'dark' ? (
                                    <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400/20 group-hover:rotate-12 transition-transform duration-300" />
                                ) : (
                                    <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20 group-hover:rotate-45 transition-transform duration-300" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. MAIN HEADER BAR WITH SEASONAL THEME PALETTES */}
                <div className={`transition-all duration-300 ${
                    isSummerThemeActive 
                        ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 border-b-2 border-yellow-300 shadow-[0_4px_25px_rgba(245,158,11,0.4)]' 
                        : isMonsoonThemeActive 
                        ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 border-b-2 border-lime-400/80 shadow-[0_4px_25px_rgba(132,204,22,0.3)]'
                        : isAutumnThemeActive
                        ? 'bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-600 border-b-2 border-white/80 shadow-[0_4px_25px_rgba(14,165,233,0.4)]'
                        : isDurgaPujaThemeActive
                        ? 'bg-gradient-to-r from-red-600 via-amber-600 to-rose-700 border-b-2 border-yellow-300 shadow-[0_4px_25px_rgba(239,68,68,0.4)]'
                        : isDeepavaliThemeActive
                        ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 border-b-2 border-yellow-300 shadow-[0_4px_25px_rgba(245,158,11,0.4)]'
                        : 'bg-[#0052cc] dark:bg-slate-950'
                } ${scrolled ? 'py-2 shadow-xl' : 'py-3'}`}
                style={
                    !isSummerThemeActive && !isMonsoonThemeActive && !isAutumnThemeActive && !isDurgaPujaThemeActive && !isDeepavaliThemeActive && !isNewYearThemeActive && theme !== 'dark' && siteSettings?.theme_colors?.header_bg
                        ? { backgroundColor: siteSettings.theme_colors.header_bg }
                        : {}
                }
                >
                    <div className="mx-auto max-w-7xl px-4 flex items-center justify-between gap-4">
                        
                        {/* Logo Left */}
                        <Link href="/" prefetch="hover" className="shrink-0 flex items-center group py-0.5">
                            {siteSettings?.site_logo && !logoError ? (
                                <img 
                                    src={siteSettings.site_logo} 
                                    alt={siteSettings.site_title || 'Logo'} 
                                    className="h-11 sm:h-13 md:h-14 lg:h-15 w-auto max-w-[190px] sm:max-w-[240px] md:max-w-[280px] object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-[1.02]" 
                                    onError={() => setLogoError(true)}
                                />
                            ) : (
                                <div className="flex items-center gap-1">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-black text-xl border-2 border-white shadow-md">
                                        g
                                    </div>
                                    <span className="text-white font-black text-2xl tracking-tight">
                                        guruz
                                    </span>
                                </div>
                            )}
                        </Link>

                        {/* Glassmorphism Animated Search Bar */}
                        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto group relative" ref={desktopSearchRef}>
                            <div className={`flex items-center gap-2 bg-white/10 border ${
                                isSummerThemeActive 
                                    ? 'border-amber-200/50 bg-amber-950/20 shadow-[0_0_20px_rgba(251,191,36,0.3)]' 
                                    : isMonsoonThemeActive 
                                    ? 'border-cyan-400/50 bg-slate-900/90 shadow-[inset_0_2px_15px_rgba(6,182,212,0.35)]'
                                    : isAutumnThemeActive
                                    ? 'border-white/60 bg-sky-950/20 shadow-[0_0_20px_rgba(224,242,254,0.4)] relative'
                                    : isDurgaPujaThemeActive
                                    ? 'border-yellow-300/60 bg-red-950/30 shadow-[0_0_20px_rgba(245,158,11,0.4)] relative'
                                    : isDeepavaliThemeActive
                                    ? 'border-yellow-300/60 bg-amber-950/30 shadow-[0_0_20px_rgba(245,158,11,0.4)] relative'
                                    : isNewYearThemeActive
                                    ? 'border-amber-300/60 bg-purple-950/30 shadow-[0_0_20px_rgba(168,85,247,0.4)] relative'
                                    : 'border-white/20'
                            } hover:bg-white/15 focus-within:bg-white/20 focus-within:border-white/40 focus-within:ring-2 rounded-full px-3 py-1.5 backdrop-blur-md transition-all duration-300 text-white`}>
                                
                                {/* ☁️ Floating Soft Cloud Motifs around Search Bar */}
                                {isAutumnThemeActive && (
                                    <>
                                        <div className="absolute -top-3.5 left-6 text-sm pointer-events-none animate-bounce">☁️</div>
                                        <div className="absolute -bottom-3.5 right-12 text-sm pointer-events-none animate-pulse">☁️</div>
                                    </>
                                )}

                                <div className="w-7 h-7 rounded-full bg-white border border-white/30 flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-0.5">
                                    {siteSettings?.site_logo && !logoError ? (
                                        <img 
                                            src={siteSettings.site_logo} 
                                            alt="Logo" 
                                            className="w-full h-full object-contain rounded-full" 
                                            onError={() => setLogoError(true)}
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-black text-xs">
                                            g
                                        </div>
                                    )}
                                </div>

                                <input
                                    type="text"
                                    value={q}
                                    onFocus={() => setShowSuggestions(true)}
                                    onChange={e => setQ(e.target.value)}
                                    placeholder={listening ? "কথা বলুন..." : (placeholderText || "Search...")}
                                    className="flex-1 bg-transparent border-none text-xs sm:text-sm text-white placeholder:text-white/70 focus:outline-none focus:ring-0 px-2 font-medium"
                                />

                                {/* ☀️ Summer Theme Pulsating Minimal Sun Icon */}
                                {isSummerThemeActive && (
                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20 border border-yellow-200/50 text-amber-200 text-xs font-black shrink-0 animate-pulse shadow-xs" title="গ্রীষ্মকাল থিম একটিভ">
                                        <Sun className="w-4 h-4 text-amber-300 animate-spin-slow" />
                                        <span className="hidden lg:inline text-[10px] font-black uppercase tracking-wider text-yellow-200">গ্রীষ্মকাল ☀️</span>
                                    </div>
                                )}

                                {/* 🌧️ Monsoon Theme Rain & Lightning Badge */}
                                {isMonsoonThemeActive && (
                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-300/50 text-cyan-200 text-xs font-black shrink-0 animate-pulse shadow-xs" title="বর্ষাকাল থিম একটিভ">
                                        <span className="text-xs">🌧️⚡</span>
                                        <span className="hidden lg:inline text-[10px] font-black uppercase tracking-wider text-lime-400">বর্ষাকাল</span>
                                    </div>
                                )}

                                {/* 🌾 Autumn Theme Kashful & Shiuli Badge */}
                                {isAutumnThemeActive && (
                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 border border-white/60 text-white text-xs font-black shrink-0 animate-pulse shadow-xs" title="শরৎকাল থিম একটিভ">
                                        <span className="text-xs">🌾🌸</span>
                                        <span className="hidden lg:inline text-[10px] font-black uppercase tracking-wider text-white">শরৎকাল</span>
                                    </div>
                                )}

                                {/* 🪔 Durga Puja Theme Om & Pradip Badge */}
                                {isDurgaPujaThemeActive && (
                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20 border border-yellow-300/60 text-yellow-200 text-xs font-black shrink-0 animate-pulse shadow-xs" title="দুর্গাপূজা থিম একটিভ">
                                        <span className="text-xs">🕉️🪔</span>
                                        <span className="hidden lg:inline text-[10px] font-black uppercase tracking-wider text-yellow-200">দুর্গাপূজা</span>
                                    </div>
                                )}

                                {/* 🪔 Deepavali Theme Fireworks & Pradip Badge */}
                                {isDeepavaliThemeActive && (
                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-400/20 border border-yellow-300/60 text-yellow-100 text-xs font-black shrink-0 animate-pulse shadow-xs" title="দীপাবলি থিম একটিভ">
                                        <span className="text-xs">🪔🎆</span>
                                        <span className="hidden lg:inline text-[10px] font-black uppercase tracking-wider text-yellow-100">দীপাবলি</span>
                                    </div>
                                )}

                                {/* 🎆 Happy New Year Fireworks & Sparklers Badge */}
                                {isNewYearThemeActive && (
                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-500/20 border border-amber-300/60 text-amber-200 text-xs font-black shrink-0 animate-pulse shadow-xs" title="নববর্ষ থিম একটিভ">
                                        <span className="text-xs">🎆🎉</span>
                                        <span className="hidden lg:inline text-[10px] font-black uppercase tracking-wider text-amber-200">নববর্ষ ২০২৬</span>
                                    </div>
                                )}

                                {q && (
                                    <button type="button" onClick={() => setQ('')} className="p-1 text-white/60 hover:text-white transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}

                                <div className="h-5 w-px bg-white/20 mx-1" />

                                <button
                                    type="button"
                                    onClick={() => setListening(!listening)}
                                    className="p-1.5 rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    {listening ? (
                                        <div className="flex items-center justify-center gap-[2px] h-4">
                                            <div className="w-[3px] h-full bg-red-400 rounded-full animate-voice-1"></div>
                                            <div className="w-[3px] h-full bg-emerald-400 rounded-full animate-voice-2"></div>
                                            <div className="w-[3px] h-full bg-blue-400 rounded-full animate-voice-3"></div>
                                            <div className="w-[3px] h-full bg-amber-400 rounded-full animate-voice-4"></div>
                                        </div>
                                    ) : (
                                        <Mic className="w-4 h-4" />
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className={`p-1.5 rounded-full ${isMonsoonThemeActive ? 'text-lime-400' : isAutumnThemeActive ? 'text-white' : 'text-amber-300'} hover:bg-white/10 transition`}
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                                <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSearch} />

                                <button
                                    type="submit"
                                    className={`w-8 h-8 rounded-full ${
                                        isSummerThemeActive 
                                            ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 font-black' 
                                            : isMonsoonThemeActive
                                            ? 'bg-lime-500 hover:bg-lime-400 text-slate-950 font-black shadow-[0_0_10px_rgba(132,204,22,0.6)]'
                                            : isAutumnThemeActive
                                            ? 'bg-white hover:bg-sky-50 text-sky-700 font-black shadow-md'
                                            : 'bg-[#3b82f6] hover:bg-blue-600 text-white'
                                    } flex items-center justify-center shrink-0 shadow-sm transition active:scale-95`}
                                >
                                    <Search className="w-4 h-4" strokeWidth={2.5} />
                                </button>
                            </div>
                            {renderSuggestionsDropdown()}
                        </form>

                        {/* Right Action Icons */}
                        <div className="flex items-center gap-3 sm:gap-4 text-white shrink-0">
                            {/* Live Visitor Counter */}
                            <div className="flex flex-col items-center justify-center px-2.5 py-0.5 rounded-lg border border-red-500/30 bg-red-500/10 shadow-sm mr-1 sm:mr-2 tooltip-trigger relative group">
                                <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black text-red-400 uppercase tracking-widest relative">
                                    {prefixText ? (
                                        <span>{prefixText}</span>
                                    ) : (
                                        <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-red-500"></span>
                                        </span>
                                    )}
                                    <span>{labelText}</span>
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-white tracking-wide leading-none mt-0.5 flex items-center gap-0.5">
                                    <span>{liveVisitors}</span>
                                    {suffixText && <span className="text-[10px] font-medium opacity-90">{suffixText}</span>}
                                </span>
                                {/* Tooltip */}
                                <div className="absolute top-full mt-2 w-max px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
                                    Current active visitors
                                </div>
                            </div>

                            {user ? (
                                <div className="relative group">
                                    <button className="flex flex-col items-center hover:text-amber-300 relative cursor-pointer">
                                        <span className="relative">
                                            <User className="w-5 h-5 mb-0.5" />
                                            {totalProfileBadge > 0 && (
                                                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-black rounded-full min-w-4 h-4 flex items-center justify-center px-1 shadow animate-pulse">
                                                    {totalProfileBadge > 99 ? '99+' : totalProfileBadge}
                                                </span>
                                            )}
                                        </span>
                                        <span className="text-[10px] font-extrabold tracking-wide uppercase max-w-[70px] truncate">PROFILE</span>
                                    </button>
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-slate-800 dark:text-slate-100">
                                        <div className="px-4 py-3 text-xs font-bold border-b border-slate-100 dark:border-slate-800 truncate mb-1">{user.email}</div>
                                        
                                        <Link href="/account" className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <LayoutDashboard className="w-4 h-4 text-slate-500 dark:text-slate-400" /> ড্যাশবোর্ড
                                        </Link>

                                        <Link href="/account/notifications" className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Bell className="w-4 h-4 text-rose-500" /> নোটিফিকেশন
                                            </div>
                                            {effectiveUnreadNotifs > 0 && (
                                                <span className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse">
                                                    {effectiveUnreadNotifs > 99 ? '99+' : effectiveUnreadNotifs}
                                                </span>
                                            )}
                                        </Link>
                                        
                                        <Link href="/account/orders" className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <Package className="w-4 h-4 text-slate-500 dark:text-slate-400" /> আমার অর্ডার
                                        </Link>
                                        
                                        <Link href="/account/favorites" className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <Heart className="w-4 h-4 text-slate-500 dark:text-slate-400" /> উইশলিস্ট
                                        </Link>
                                        
                                        <Link href="/account/messages" className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <MessageCircle className="w-4 h-4 text-slate-500 dark:text-slate-400" /> মেসেজ
                                            </div>
                                            {effectiveUnreadMessages > 0 && (
                                                <span className="min-w-[18px] h-[18px] px-1 bg-orange-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse">
                                                    {effectiveUnreadMessages > 99 ? '99+' : effectiveUnreadMessages}
                                                </span>
                                            )}
                                        </Link>

                                        {isAdmin && (
                                            <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors mt-1 border-t border-slate-50 dark:border-slate-800">
                                                <LayoutDashboard className="w-4 h-4" /> Admin Panel
                                            </Link>
                                        )}
                                        {isVendor && (
                                            <Link href="/seller" className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors mt-1">
                                                <Store className="w-4 h-4" /> Vendor Panel
                                            </Link>
                                        )}
                                        
                                        <hr className="my-1 border-slate-100 dark:border-slate-800" />
                                        
                                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 w-full transition-colors">
                                            <LogOut className="w-4 h-4" /> লগআউট
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <Link href="/login" className="flex flex-col items-center hover:text-amber-300 text-[10px] font-extrabold tracking-wide uppercase">
                                    <User className="w-5 h-5 mb-0.5" strokeWidth={2.2} />
                                    ACCOUNT
                                </Link>
                            )}

                            {/* Notification Bell with Red Signal Badge */}
                            <Link 
                                href={user ? "/account/notifications" : "/login"} 
                                className="relative flex flex-col items-center hover:text-amber-300 text-[10px] font-extrabold tracking-wide uppercase cursor-pointer"
                                title="নোটিফিকেশন"
                            >
                                <span className="relative">
                                    <Bell className="w-5 h-5 mb-0.5" strokeWidth={2.2} />
                                    {effectiveUnreadNotifs > 0 && (
                                        <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-black rounded-full min-w-4 h-4 flex items-center justify-center px-1 shadow-md shadow-red-500/50 animate-pulse">
                                            {effectiveUnreadNotifs > 99 
                                                ? '99+' 
                                                : effectiveUnreadNotifs}
                                        </span>
                                    )}
                                </span>
                                NOTICES
                            </Link>

                            <button type="button" data-cart-target="true" onClick={() => setCartOpen(true)} className="relative flex flex-col items-center hover:text-amber-300 text-[10px] font-extrabold tracking-wide uppercase cursor-pointer">
                                <span className="relative">
                                    <ShoppingCart className="w-5 h-5 mb-0.5" strokeWidth={2.2} />
                                    <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white text-[9px] font-black rounded-full min-w-4 h-4 flex items-center justify-center px-1 shadow">
                                        {count}
                                    </span>
                                </span>
                                CART
                            </button>

                            <Link href="/account/favorites" data-wishlist-target="true" className="relative flex flex-col items-center hover:text-amber-300 text-[10px] font-extrabold tracking-wide uppercase">
                                <span className="relative">
                                    <Heart className="w-5 h-5 mb-0.5" strokeWidth={2.2} />
                                    {wishlistCount > 0 && (
                                        <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-black rounded-full min-w-4 h-4 flex items-center justify-center px-1 shadow animate-pulse">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </span>
                                WISHLIST
                            </Link>

                            <a 
                                href="/warranty-claim" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex flex-col items-center hover:text-amber-300 text-[10px] font-black tracking-wide uppercase text-amber-300 cursor-pointer"
                            >
                                <Award className="w-5 h-5 mb-0.5 text-amber-400" strokeWidth={2.2} />
                                WARRANTY CLAIM
                            </a>
                        </div>
                    </div>
                </div>

                {/* ☁️ STORMY CLOUD LAYER ABOVE MENU BAR FOR MONSOON THEME */}
                {isMonsoonThemeActive && (
                    <div className="w-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-b border-slate-600/40 py-1 px-4 text-center flex items-center justify-center gap-3 text-[11px] font-black text-slate-200 uppercase tracking-widest relative overflow-hidden backdrop-blur-md shadow-inner">
                        <span className="animate-pulse">☁️ 🌧️ মেঘলা বর্ষা আকাশ (Monsoon Storm Clouds) 🌧️ ⚡</span>
                    </div>
                )}

                {/* ☁️ CLOUD & SHIULI LAYER ABOVE MENU BAR FOR AUTUMN THEME */}
                {isAutumnThemeActive && (
                    <div className="w-full bg-gradient-to-r from-sky-200 via-sky-100 to-sky-200 border-b border-sky-300/50 py-1 px-4 text-center flex items-center justify-center gap-3 text-[11px] font-black text-sky-900 uppercase tracking-widest relative overflow-hidden backdrop-blur-md shadow-inner">
                        <span className="animate-pulse">🌾 ☁️ শুভ্র কাশফুল ও শিউলি সুবাস (Autumn Sky) 🌸 🏵️</span>
                    </div>
                )}

                {/* 🪔 DURGA PUJA LAYER ABOVE MENU BAR */}
                {isDurgaPujaThemeActive && (
                    <div className="w-full bg-gradient-to-r from-red-900 via-amber-800 to-red-900 border-b border-yellow-500/50 py-1 px-4 text-center flex items-center justify-center gap-3 text-[11px] font-black text-amber-200 uppercase tracking-widest relative overflow-hidden backdrop-blur-md shadow-inner">
                        <span className="animate-pulse">🪔 🕉️ শারদীয় দুর্গাপূজা স্পেশাল (Durga Puja Special) 🌺 🪔</span>
                    </div>
                )}

                {/* 🪔 DEEPAVALI LAYER ABOVE MENU BAR */}
                {isDeepavaliThemeActive && (
                    <div className="w-full bg-gradient-to-r from-amber-900 via-yellow-700 to-amber-900 border-b border-yellow-400/50 py-1 px-4 text-center flex items-center justify-center gap-3 text-[11px] font-black text-yellow-100 uppercase tracking-widest relative overflow-hidden backdrop-blur-md shadow-inner">
                        <span className="animate-pulse">🪔 শুভ দীপাবলি ও কালীপূজা (Happy Diwali) 🎆 🪔</span>
                    </div>
                )}

                {/* 🎆 NEW YEAR LAYER ABOVE MENU BAR */}
                {isNewYearThemeActive && (
                    <div className="w-full bg-gradient-to-r from-purple-950 via-indigo-900 to-pink-950 border-b border-amber-400/50 py-1 px-4 text-center flex items-center justify-center gap-3 text-[11px] font-black text-amber-200 uppercase tracking-widest relative overflow-hidden backdrop-blur-md shadow-inner">
                        <span className="animate-pulse">🎆 🎉 হ্যাপি নিউ ইয়ার ২০২৬ সেলিব্রেশন (Happy New Year 2026) 🥳 🥂</span>
                    </div>
                )}

                {/* 3. SUB-NAVIGATION BAR */}
                <div className={`border-b text-xs font-bold transition-colors duration-300 ${
                    isMonsoonThemeActive 
                        ? 'bg-slate-900 text-slate-100 border-slate-800' 
                        : isAutumnThemeActive
                        ? 'bg-sky-50 text-sky-950 border-sky-200'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                }`}>
                    <div className="mx-auto max-w-7xl px-4 h-9 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link href="/categories" prefetch="hover" className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-extrabold">
                                <Menu className="w-4 h-4" />
                                {t('categories')}
                            </Link>
                            <Link href="/products" prefetch="hover" className="hover:text-blue-600">
                                {t('all_products')}
                            </Link>
                            <Link href="/brands" prefetch="hover" className="hover:text-blue-600 font-semibold">
                                {locale === 'bn' ? 'ব্র্যান্ডসমূহ' : 'Brands'}
                            </Link>
                            <Link href="/shops" prefetch="hover" className="hover:text-blue-600">
                                {t('shops')}
                            </Link>
                        </div>

                        <div className="flex items-center gap-5 text-slate-600 dark:text-slate-400 text-xs">
                            <Link href="/track" prefetch="hover" className="flex items-center gap-1 hover:text-blue-600">
                                <MapPin className="w-3.5 h-3.5 text-slate-500" /> {t('track_order')}
                            </Link>
                            <a href={`tel:${siteSettings?.support_phone || '01700000000'}`} className="flex items-center gap-1 hover:text-blue-600">
                                <Headset className="w-3.5 h-3.5 text-slate-500" /> {t('support')}
                            </a>
                            <Link href="/vendor" prefetch="hover" className="flex items-center gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded font-extrabold hover:bg-emerald-100">
                                📋 {t('became_seller')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* === MOBILE STICKY HEADER (100% LIGHT/DARK SYNC) === */}
            <div 
                className="md:hidden bg-white dark:bg-slate-950 text-slate-800 dark:text-white px-3 py-2 transition-all duration-300 ease-in-out border-b border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-visible relative z-50"
            >
                {/* TOP ROW: Logo & Menu Header (Collapses smoothly on scroll) */}
                <div 
                    className={`flex items-center justify-between gap-2 transition-all duration-300 ease-in-out relative z-50 ${
                        scrolled 
                            ? 'max-h-0 opacity-0 mb-0 py-0 scale-95 pointer-events-none overflow-hidden' 
                            : 'max-h-12 opacity-100 mb-2 py-0.5 scale-100 overflow-visible'
                    }`}
                >
                    {/* Left Hamburger + Logo */}
                    <div className="flex items-center gap-2.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-1 text-slate-800 dark:text-white hover:text-orange-500 shrink-0 cursor-pointer"
                            aria-label="Open Navigation Menu"
                        >
                            <Menu className="w-6 h-6 stroke-[2.5]" />
                        </button>

                        <Link href="/" prefetch="hover" className="flex items-center shrink-0 group py-0.5">
                            {siteSettings?.site_logo && !logoError ? (
                                <img 
                                    src={siteSettings.site_logo} 
                                    alt={siteSettings.site_title || 'Guruz'} 
                                    className="h-8 sm:h-9 w-auto max-w-[130px] sm:max-w-[170px] object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-[1.02]" 
                                    onError={() => setLogoError(true)}
                                />
                            ) : (
                                <>
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-black text-sm border border-slate-200 dark:border-white/20 shadow-sm">
                                        g
                                    </div>
                                    <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                        guruz
                                    </span>
                                </>
                            )}
                        </Link>
                    </div>

                    {/* Right Controls: Single Sun/Moon Toggle + Compact Language Globe Button */}
                    <div className="flex items-center gap-1.5 shrink-0 relative z-50">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            title={theme === 'dark' ? "লাইট মোড চালু করুন (Switch to Light Mode)" : "ডার্ক মোড চালু করুন (Switch to Dark Mode)"}
                            className="w-7 h-7 rounded-full flex items-center justify-center bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all duration-200 cursor-pointer active:scale-90 shrink-0"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? (
                                <Moon className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
                            ) : (
                                <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                            )}
                        </button>

                        <div className="relative" ref={mobileDropdownRef}>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLangDropdownOpen(!langDropdownOpen);
                                }}
                                className="h-7 px-2.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white flex items-center gap-1.5 shadow-xs hover:border-slate-500 active:scale-95 transition shrink-0 cursor-pointer notranslate"
                                translate="no"
                                title="Change Language"
                            >
                                <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-amber-400" />
                                <span className="text-[11px] font-black tracking-tight uppercase notranslate" translate="no">
                                    {selectedLanguage === 'bn' ? 'BN' : selectedLanguage === 'en' ? 'EN' : 'IN'}
                                </span>
                                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                            </button>

                            {langDropdownOpen && (
                                <div 
                                    className="absolute top-full right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-[999999] animate-in fade-in zoom-in-95 duration-100"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider mb-1">
                                        ভাষা / Select Language
                                    </div>
                                    <div className="space-y-1">
                                        {languageOptions.map(opt => {
                                            const isSelected = selectedLanguage === opt.code;
                                            return (
                                                <button
                                                    key={opt.code}
                                                    type="button"
                                                    onClick={() => changeLanguage(opt.code)}
                                                    className={`w-full text-left px-3 py-2.5 text-xs font-black rounded-xl flex items-center justify-between transition cursor-pointer ${
                                                        isSelected 
                                                            ? 'bg-amber-500 text-slate-950 shadow-xs' 
                                                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 py-0.5">
                                                        <span className="text-xs font-bold">{opt.nativeName}</span>
                                                    </div>
                                                    {isSelected && <Check className="w-4 h-4 text-slate-950 stroke-[3]" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* BOTTOM ROW: Search Bar & Quick Controls */}
                <div className="flex items-center gap-2 w-full">
                    {/* Inline Hamburger Menu Icon when scrolled */}
                    {scrolled && (
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-1 text-slate-800 dark:text-white hover:text-orange-500 shrink-0 transition cursor-pointer"
                            aria-label="Open Navigation Menu"
                        >
                            <Menu className="w-5 h-5 stroke-[2.5]" />
                        </button>
                    )}

                    <form onSubmit={handleSearch} className="flex-1 min-w-0 relative" ref={mobileSearchRef}>
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-1 focus-within:ring-emerald-500/30 rounded-full px-2.5 py-1.5 shadow-xs text-slate-900 dark:text-white transition-all duration-300">
                            
                            {/* Circle Logo Icon inside search bar */}
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white dark:bg-[#0a1829] border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                {siteSettings?.site_logo && !logoError ? (
                                    <img 
                                        src={siteSettings.site_logo} 
                                        alt="Logo" 
                                        className="w-4 h-4 object-contain" 
                                        onError={() => setLogoError(true)}
                                    />
                                ) : (
                                    <span className="text-orange-500 font-black text-xs">g</span>
                                )}
                            </div>

                            <input
                                type="text"
                                value={q}
                                onFocus={() => setShowSuggestions(true)}
                                onChange={e => setQ(e.target.value)}
                                placeholder={listening ? "কথা বলুন..." : "সার্চ করুন প্রোডাক্ট, ব্র্যান্ড, ক্যাটাগরি..."}
                                className="flex-1 bg-transparent border-none text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none min-w-0 px-1 font-medium"
                            />

                            {/* Voice Mic Icon */}
                            <button
                                type="button"
                                onClick={() => setListening(!listening)}
                                className="p-0.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 shrink-0 cursor-pointer"
                                title="Voice Search"
                            >
                                {listening ? (
                                    <div className="flex items-center justify-center gap-[2px] h-3.5">
                                        <div className="w-[2.5px] h-full bg-red-400 rounded-full animate-voice-1"></div>
                                        <div className="w-[2.5px] h-full bg-emerald-400 rounded-full animate-voice-2"></div>
                                        <div className="w-[2.5px] h-full bg-blue-400 rounded-full animate-voice-3"></div>
                                        <div className="w-[2.5px] h-full bg-amber-400 rounded-full animate-voice-4"></div>
                                    </div>
                                ) : (
                                    <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                )}
                            </button>

                            {/* Camera Icon */}
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="p-0.5 text-blue-600 dark:text-blue-400 hover:text-blue-500 shrink-0 cursor-pointer"
                                title="Image Search"
                            >
                                <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </button>
                            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSearch} />
                        </div>
                        {renderSuggestionsDropdown()}
                    </form>

                    {/* Inline Theme & Language Controls when scrolled */}
                    {scrolled && (
                        <div className="flex items-center gap-1.5 shrink-0 transition">
                            <button
                                type="button"
                                onClick={toggleTheme}
                                title={theme === 'dark' ? "লাইট মোড চালু করুন (Switch to Light Mode)" : "ডার্ক মোড চালু করুন (Switch to Dark Mode)"}
                                className="w-7 h-7 rounded-full flex items-center justify-center bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all duration-200 cursor-pointer active:scale-90 shrink-0"
                                aria-label="Toggle Theme"
                            >
                                {theme === 'dark' ? (
                                    <Moon className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
                                ) : (
                                    <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                                )}
                            </button>

                            <div className="relative" ref={mobileScrolledDropdownRef}>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLangDropdownOpen(!langDropdownOpen);
                                    }}
                                    className="h-7 px-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white flex items-center gap-1 shadow-xs hover:border-slate-500 active:scale-95 transition shrink-0 cursor-pointer notranslate"
                                    translate="no"
                                    title="Change Language"
                                >
                                    <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-amber-400" />
                                    <span className="text-[10px] font-black uppercase notranslate" translate="no">
                                        {selectedLanguage === 'bn' ? 'BN' : selectedLanguage === 'en' ? 'EN' : 'IN'}
                                    </span>
                                </button>

                                {langDropdownOpen && (
                                    <div 
                                        className="absolute top-full right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-[999999] animate-in fade-in zoom-in-95 duration-100"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider mb-1">
                                            ভাষা / Select Language
                                        </div>
                                        <div className="space-y-1">
                                            {languageOptions.map(opt => {
                                                const isSelected = selectedLanguage === opt.code;
                                                return (
                                                    <button
                                                        key={opt.code}
                                                        type="button"
                                                        onClick={() => changeLanguage(opt.code)}
                                                        className={`w-full text-left px-3 py-2.5 text-xs font-black rounded-xl flex items-center justify-between transition cursor-pointer ${
                                                            isSelected 
                                                                ? 'bg-amber-500 text-slate-950 shadow-xs' 
                                                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2 py-0.5">
                                                            <span className="text-xs font-bold">{opt.nativeName}</span>
                                                        </div>
                                                        {isSelected && <Check className="w-4 h-4 text-slate-950 stroke-[3]" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Full-width 2-Column Mobile Drawer Menu */}
                {mobileMenuOpen && (
                    <div className="mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-xs font-bold text-slate-800 dark:text-white shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-2 gap-3">
                            {/* Left Column: Pages */}
                            <div className="space-y-1.5 border-r border-slate-100 dark:border-slate-800 pr-2">
                                <div className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Layers className="w-3 h-3" /> পেজসমূহ
                                </div>

                                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1.5 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition">
                                    <Home className="w-3.5 h-3.5 text-blue-600" /> {t('home')}
                                </Link>

                                <Link href="/categories" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1.5 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition">
                                    <Menu className="w-3.5 h-3.5 text-emerald-600" /> {t('categories')}
                                </Link>

                                <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1.5 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition">
                                    <Package className="w-3.5 h-3.5 text-blue-600" /> {t('all_products')}
                                </Link>

                                <Link href="/brands" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1.5 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition">
                                    <Award className="w-3.5 h-3.5 text-amber-500" /> {locale === 'bn' ? 'ব্র্যান্ডসমূহ' : 'Brands'}
                                </Link>

                                <Link href="/shops" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1.5 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition">
                                    <Store className="w-3.5 h-3.5 text-purple-600" /> {t('shops')}
                                </Link>

                                <Link href="/track" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1.5 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition">
                                    <MapPin className="w-3.5 h-3.5 text-orange-500" /> {t('track_order')}
                                </Link>

                                <Link href="/vendor" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1.5 p-1.5 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-xl text-emerald-600 dark:text-emerald-400 font-extrabold transition">
                                    📋 {t('became_seller')}
                                </Link>

                                <button type="button" onClick={() => { setMobileMenuOpen(false); setCartOpen(true); }} className="w-full flex items-center gap-1.5 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition">
                                    <ShoppingCart className="w-3.5 h-3.5 text-orange-500" /> {t('cart')}
                                    {count > 0 && <span className="ml-auto bg-orange-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">{count}</span>}
                                </button>
                                
                                <Link href="/warranty-claim" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1.5 p-1.5 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-xl text-amber-600 dark:text-amber-400 transition">
                                    <Award className="w-3.5 h-3.5 text-amber-500" /> {t('warranty_claim')}
                                </Link>

                                {user ? (
                                    <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1.5 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition">
                                        <User className="w-3.5 h-3.5 text-teal-600" /> Profile
                                    </Link>
                                ) : (
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1.5 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-blue-600 transition">
                                        <User className="w-3.5 h-3.5" /> Account
                                    </Link>
                                )}
                            </div>

                            {/* Right Column: Categories */}
                            <div className="space-y-1">
                                <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Menu className="w-3 h-3" /> ক্যাটাগরি সমূহ
                                </div>

                                {mobileCategories.map(cat => {
                                    const IconComp = cat.icon;
                                    return (
                                        <Link
                                            key={cat.slug}
                                            href={`/products?category=${cat.slug}`}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-1.5 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition truncate"
                                        >
                                            <IconComp className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                            <span className="truncate">{cat.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Language Selector Inside Mobile Drawer */}
                        <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-amber-400" /> ভাষা / Language
                                </span>
                                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">
                                    {selectedLanguage === 'bn' ? 'বাংলা' : selectedLanguage === 'en' ? 'English' : 'हिन्दी'}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                                {languageOptions.map(opt => {
                                    const isSelected = selectedLanguage === opt.code;
                                    return (
                                        <button
                                            key={opt.code}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMobileMenuOpen(false);
                                                changeLanguage(opt.code);
                                            }}
                                            className={`flex items-center justify-center py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                                isSelected
                                                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50'
                                            }`}
                                        >
                                            <span>{opt.displayCode.toUpperCase()}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            </header>

            {/* Image Search Preview & Analysis Modal */}
            {imageSearchModalOpen && (
                <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 text-white max-w-sm w-full shadow-2xl space-y-4 text-center">
                        <h3 className="font-extrabold text-base flex items-center justify-center gap-2 text-white">
                            <Camera className="w-5 h-5 text-emerald-400 animate-bounce" />
                            <span>ইমেজ সার্চ (Visual Search)</span>
                        </h3>

                        {imagePreview && (
                            <div className="relative w-40 h-40 mx-auto rounded-2xl overflow-hidden border-2 border-emerald-500/80 shadow-lg group">
                                <img src={imagePreview} alt="Image Search Preview" className="w-full h-full object-cover" />
                                {isUploadingImage && (
                                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
                                        <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-[11px] font-bold text-emerald-300 tracking-wide animate-pulse">পণ্য খোজা হচ্ছে...</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <p className="text-xs text-slate-300 font-medium leading-relaxed">
                            {isUploadingImage 
                                ? 'আপনার আপলোডকৃত ছবির সাথে সামঞ্জস্যপূর্ণ সেরা পণ্যগুলো সার্চ করা হচ্ছে...' 
                                : 'পণ্য খুঁজে পাওয়া গেছে! পেজ রিডাইরেক্ট হচ্ছে...'}
                        </p>

                        <button
                            type="button"
                            onClick={() => setImageSearchModalOpen(false)}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-300 transition cursor-pointer"
                        >
                            বাতিল করুন
                        </button>
                    </div>
                </div>
            )}

            <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
            <WishlistPopup />
            <CartPopup />
            {flash?.registered && <RegistrationSuccessPopup />}
            <SignupOfferPopup />
        </>
    );
}