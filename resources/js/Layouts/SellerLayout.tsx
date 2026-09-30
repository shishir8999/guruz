import React, { useState, useRef } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, Package, ShoppingCart, Wallet, Star,
    Store, Settings, LogOut, User, Truck, ClipboardList,
    DollarSign, Shield, Zap, BarChart3, Heart, MessageCircle,
    Crown, Plus, Search, Bell, ChevronDown, ChevronUp, ChevronRight,
    Users, Video, HelpCircle, FileText, BellRing, UserCheck, AlertTriangle, TrendingUp, RefreshCw,
    Camera, Check, Copy, Globe, Palette, X, Layers, Menu, CheckCircle2
} from 'lucide-react';
import ErrorBoundary from '../Components/ErrorBoundary';
import Swal from 'sweetalert2';
import { NoticeMarquee } from '../Components/NoticeMarquee';

interface SellerLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function SellerLayout({ children, title = 'Dashboard' }: SellerLayoutProps) {
    const { props } = usePage<any>();
    const user = props.auth?.user;
    const sellerCounts = props.sellerCounts || {};
    const unreadMessages = props.auth?.unread_messages_count ?? 0;
    const userNotifications: any[] = props.auth?.notifications || [];
    const unreadNotifCount = props.auth?.unread_notifications_count ?? userNotifications.filter((n: any) => !n.is_read).length;
    const totalBellCount = unreadNotifCount + (sellerCounts.pending_orders || 0) + (sellerCounts.pending_category_requests || 0);

    const [approvalBannerDismissed, setApprovalBannerDismissed] = useState(() => {
        if (typeof window !== 'undefined') {
            return sessionStorage.getItem('vendor_approval_banner_dismissed') === 'true';
        }
        return false;
    });

    const handleMarkAllNotificationsRead = () => {
        router.post('/notifications/read-all', {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'সকল নোটিফিকেশন পঠিত হিসেবে চিহ্নিত করা হয়েছে!',
                    showConfirmButton: false,
                    timer: 2000
                });
            }
        });
    };

    const handleDismissApprovalBanner = () => {
        setApprovalBannerDismissed(true);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('vendor_approval_banner_dismissed', 'true');
        }
        handleMarkAllNotificationsRead();
    };

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const handleLogout = () => {
        router.post('/logout');
    };

    const initials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'S';

    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // Vendor Panel Theme & Color Studio
    interface VendorTheme {
        id: string;
        label: string;
        bgClass: string;
        sidebarClass: string;
        headerClass: string;
        activeMenuClass: string;
        textColor: string;
        previewColors: string[];
    }

    const themeOptions: VendorTheme[] = [
        {
            id: 'cyberpunk',
            label: '🌈 Neon Cyberpunk (ভাইব্রেন্ট বেগুনি-গোলাপী)',
            bgClass: 'bg-gradient-to-br from-[#0F0C20] via-[#161032] to-[#210D35] text-white',
            sidebarClass: 'bg-[#150F2E] border-purple-900/60 text-white',
            headerClass: 'bg-[#1D143D] border-purple-900/60 text-white',
            activeMenuClass: 'border-pink-500 bg-gradient-to-r from-pink-500/30 to-purple-600/20 text-pink-300 ring-1 ring-pink-500/50 font-bold',
            textColor: 'text-white',
            previewColors: ['#0F0C20', '#150F2E', '#EC4899']
        },
        {
            id: 'sapphire',
            label: '💙 Royal Sapphire (রয়্যাল ব্লু)',
            bgClass: 'bg-gradient-to-br from-[#0A192F] via-[#0D2547] to-[#0A192F] text-white',
            sidebarClass: 'bg-[#0E2038] border-blue-900/60 text-white',
            headerClass: 'bg-[#11294D] border-blue-900/60 text-white',
            activeMenuClass: 'border-cyan-400 bg-gradient-to-r from-cyan-500/30 to-blue-600/20 text-cyan-200 ring-1 ring-cyan-400/50 font-bold',
            textColor: 'text-white',
            previewColors: ['#0A192F', '#0E2038', '#06B6D4']
        },
        {
            id: 'emerald',
            label: '🟢 Emerald Mint (এমেরাল্ড গ্রিন)',
            bgClass: 'bg-gradient-to-br from-[#064E3B] via-[#022C22] to-[#065F46] text-white',
            sidebarClass: 'bg-[#023326] border-emerald-900/60 text-white',
            headerClass: 'bg-[#064E3B] border-emerald-800/60 text-white',
            activeMenuClass: 'border-emerald-400 bg-gradient-to-r from-emerald-500/30 to-teal-600/20 text-emerald-200 ring-1 ring-emerald-400/50 font-bold',
            textColor: 'text-white',
            previewColors: ['#064E3B', '#023326', '#10B981']
        },
        {
            id: 'sunset',
            label: '🧡 Sunset Fire (সানসেট অরেঞ্জ)',
            bgClass: 'bg-gradient-to-br from-[#4C0519] via-[#881337] to-[#450A0A] text-white',
            sidebarClass: 'bg-[#3A0413] border-rose-950/80 text-white',
            headerClass: 'bg-[#5C0922] border-rose-900/60 text-white',
            activeMenuClass: 'border-amber-400 bg-gradient-to-r from-amber-500/30 to-rose-600/20 text-amber-200 ring-1 ring-amber-400/50 font-bold',
            textColor: 'text-white',
            previewColors: ['#4C0519', '#3A0413', '#F59E0B']
        },
        {
            id: 'amethyst',
            label: '🟣 Royal Amethyst (রয়্যাল ভায়োলেট)',
            bgClass: 'bg-gradient-to-br from-[#2E1065] via-[#3B0764] to-[#4C1D95] text-white',
            sidebarClass: 'bg-[#240A53] border-purple-900/60 text-white',
            headerClass: 'bg-[#3B0764] border-purple-800/60 text-white',
            activeMenuClass: 'border-fuchsia-400 bg-gradient-to-r from-fuchsia-500/30 to-purple-600/20 text-fuchsia-200 ring-1 ring-fuchsia-400/50 font-bold',
            textColor: 'text-white',
            previewColors: ['#2E1065', '#240A53', '#E087FF']
        },
        {
            id: 'dark',
            label: '🌑 Dark Obsidian (নাইট মোড)',
            bgClass: 'bg-slate-950 text-white',
            sidebarClass: 'bg-slate-900 border-slate-800 text-white',
            headerClass: 'bg-slate-900 border-slate-800 text-white',
            activeMenuClass: 'border-emerald-500 bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40 font-bold',
            textColor: 'text-white',
            previewColors: ['#020617', '#0F172A', '#10B981']
        },
        {
            id: 'slate',
            label: '⚪ Classic Light (ডিফল্ট ক্লাসিক)',
            bgClass: 'bg-[#F8F9FA] text-slate-800',
            sidebarClass: 'bg-white border-slate-200 text-slate-800',
            headerClass: 'bg-white border-slate-200 text-slate-800',
            activeMenuClass: 'border-emerald-500 bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-emerald-500/5 text-emerald-950 font-extrabold ring-1 ring-emerald-500/30',
            textColor: 'text-slate-800',
            previewColors: ['#F8F9FA', '#FFFFFF', '#10B981']
        },
    ];

    const [selectedThemeId, setSelectedThemeId] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('seller_panel_bg_theme') || 'cyberpunk';
        }
        return 'cyberpunk';
    });

    const [customSidebarBg, setCustomSidebarBg] = useState(() => {
        return (typeof window !== 'undefined' && localStorage.getItem('seller_custom_sidebar_bg')) || '#150F2E';
    });
    const [customHeaderBg, setCustomHeaderBg] = useState(() => {
        return (typeof window !== 'undefined' && localStorage.getItem('seller_custom_header_bg')) || '#1D143D';
    });
    const [customMainBg, setCustomMainBg] = useState(() => {
        return (typeof window !== 'undefined' && localStorage.getItem('seller_custom_main_bg')) || '#0F0C20';
    });
    const [customAccent, setCustomAccent] = useState(() => {
        return (typeof window !== 'undefined' && localStorage.getItem('seller_custom_accent')) || '#ec4899';
    });
    const [customTextColor, setCustomTextColor] = useState(() => {
        return (typeof window !== 'undefined' && localStorage.getItem('seller_custom_text_color')) || '#ffffff';
    });
    const [isCustomMode, setIsCustomMode] = useState<boolean>(() => {
        return (typeof window !== 'undefined' && localStorage.getItem('seller_panel_is_custom') === 'true') || false;
    });

    const [themeTab, setThemeTab] = useState<'presets' | 'custom'>('presets');
    const [showThemeModal, setShowThemeModal] = useState(false);

    const handleSelectTheme = (themeId: string) => {
        setSelectedThemeId(themeId);
        setIsCustomMode(false);
        if (typeof window !== 'undefined') {
            localStorage.setItem('seller_panel_bg_theme', themeId);
            localStorage.setItem('seller_panel_is_custom', 'false');
        }
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'ভেন্ডর প্যানেল ব্যাকগ্রাউন্ড থিম আপডেট হয়েছে!',
            showConfirmButton: false,
            timer: 2000,
        });
        setShowThemeModal(false);
    };

    const handleSaveCustomTheme = () => {
        setIsCustomMode(true);
        if (typeof window !== 'undefined') {
            localStorage.setItem('seller_custom_sidebar_bg', customSidebarBg);
            localStorage.setItem('seller_custom_header_bg', customHeaderBg);
            localStorage.setItem('seller_custom_main_bg', customMainBg);
            localStorage.setItem('seller_custom_accent', customAccent);
            localStorage.setItem('seller_custom_text_color', customTextColor);
            localStorage.setItem('seller_panel_is_custom', 'true');
        }
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'আপনার কাস্টম কালার কম্বিনেশন সেভ ও অ্যাপ্লাই হয়েছে!',
            showConfirmButton: false,
            timer: 2000,
        });
        setShowThemeModal(false);
    };

    const currentTheme = themeOptions.find(t => t.id === selectedThemeId) || themeOptions[0];

    // Vendor Header Controls state
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);

    // Multi-Language List (BD, US, IN)
    const languagesList = [
        { code: 'bn', label: 'বাংলা', flag: '🇧🇩', name: 'Bengali' },
        { code: 'en', label: 'English', flag: '🇺🇸', name: 'English' },
        { code: 'hi', label: 'हिन्दी', flag: '🇮🇳', name: 'Hindi' },
    ];

    // International Currencies List (BDT, USD, INR)
    const currenciesList = [
        { code: 'BDT', symbol: '৳', flag: '🇧🇩', name: 'Bangladeshi Taka', rate: 1.0 },
        { code: 'USD', symbol: '$', flag: '🇺🇸', name: 'US Dollar', rate: 0.0084 },
        { code: 'INR', symbol: '₹', flag: '🇮🇳', name: 'Indian Rupee', rate: 0.70 },
    ];

    const [currentLangObj, setCurrentLangObj] = useState(languagesList[0]);
    const [currentCurrencyObj, setCurrentCurrencyObj] = useState(currenciesList[0]);
    const [detectedCountry, setDetectedCountry] = useState<string>('Bangladesh 🇧🇩');

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            // 1. Language restore
            const savedLangCode = localStorage.getItem('site_language') || 'bn';
            const matchLang = languagesList.find(l => l.code === savedLangCode) || languagesList[0];
            setCurrentLangObj(matchLang);

            // 2. Currency restore or Auto-detect
            const savedCurrCode = localStorage.getItem('site_currency');
            if (savedCurrCode) {
                const matchCurr = currenciesList.find(c => c.code === savedCurrCode);
                if (matchCurr) setCurrentCurrencyObj(matchCurr);
            } else {
                try {
                    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
                    if (timeZone.includes('America') || timeZone.includes('US')) {
                        setCurrentCurrencyObj(currenciesList.find(c => c.code === 'USD') || currenciesList[1]);
                        setDetectedCountry('United States 🇺🇸');
                    } else if (timeZone.includes('Kolkata') || timeZone.includes('Calcutta')) {
                        setCurrentCurrencyObj(currenciesList.find(c => c.code === 'INR') || currenciesList[2]);
                        setDetectedCountry('India 🇮🇳');
                    } else {
                        setCurrentCurrencyObj(currenciesList[0]);
                        setDetectedCountry('Bangladesh 🇧🇩');
                    }
                } catch (e) {
                    setCurrentCurrencyObj(currenciesList[0]);
                }
            }
        }
    }, []);

    const handleSelectLanguage = (lang: typeof languagesList[0]) => {
        setCurrentLangObj(lang);
        if (typeof window !== 'undefined') {
            localStorage.setItem('site_language', lang.code);
            document.cookie = `googtrans=/auto/${lang.code}; path=/; domain=${window.location.hostname}`;
            document.cookie = `googtrans=/auto/${lang.code}; path=/`;

            const translateCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
            if (translateCombo) {
                translateCombo.value = lang.code;
                translateCombo.dispatchEvent(new Event('change'));
            } else {
                window.location.reload();
            }
        }
        setShowLangMenu(false);
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `ওয়েবসাইটের ভাষা পরিবর্তিত হয়েছে: ${lang.flag} ${lang.label}`,
            showConfirmButton: false,
            timer: 2000
        });
    };

    const handleSelectCurrency = (curr: typeof currenciesList[0]) => {
        setCurrentCurrencyObj(curr);
        if (typeof window !== 'undefined') {
            localStorage.setItem('site_currency', curr.code);
        }
        setShowLangMenu(false);
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `কারেন্সি পরিወর্তন করা হয়েছে: ${curr.flag} ${curr.symbol} ${curr.code}`,
            showConfirmButton: false,
            timer: 2000
        });
    };

    // Vendor ID & Avatar state
    const userAvatar = user?.avatar_url || user?.profile_photo_path || user?.avatar || user?.shop?.logo_url;
    const [copiedId, setCopiedId] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(userAvatar || null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (userAvatar) {
            setAvatarPreview(userAvatar);
        }
    }, [userAvatar]);

    const vendorId = `ID9404`;

    const handleCopyVendorId = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(vendorId);
            setCopiedId(true);
            setTimeout(() => setCopiedId(false), 2500);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: `Vendor ID (${vendorId}) copied to clipboard!`,
                showConfirmButton: false,
                timer: 2000,
            });
        }
    };

    const handleAvatarClick = () => {
        avatarInputRef.current?.click();
    };

    const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);

            const formData = new FormData();
            formData.append('avatar', file);

            router.post('/seller/profile/avatar', formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    Swal.fire({
                        html: `
                            <div style="padding: 10px 4px 6px; display: flex; flex-direction: column; align-items: center; text-align: center; font-family: inherit;">
                                <!-- Glowing Ring Avatar with Success Badge -->
                                <div style="position: relative; margin-bottom: 14px;">
                                    <div style="width: 86px; height: 86px; border-radius: 50%; padding: 3px; background: linear-gradient(135deg, #10b981, #06b6d4, #6366f1); box-shadow: 0 8px 20px -4px rgba(16, 185, 129, 0.45); display: flex; align-items: center; justify-content: center;">
                                        <img src="${previewUrl}" alt="Profile Preview" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; background: #ffffff;" />
                                    </div>
                                    <div style="position: absolute; bottom: -2px; right: -2px; width: 26px; height: 26px; background: #10b981; border: 2.5px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: 900; box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
                                        ✓
                                    </div>
                                </div>

                                <!-- Title -->
                                <h3 style="font-size: 16px; font-weight: 900; color: #0f172a; margin: 0 0 6px 0; line-height: 1.35;">
                                    প্রোফাইল ছবি সেভ হয়েছে! 🎉
                                </h3>

                                <!-- Description -->
                                <p style="font-size: 12px; font-weight: 500; color: #64748b; margin: 0 0 16px 0; line-height: 1.5; max-width: 270px;">
                                    আপনার নতুন ছবিটি ড্যাশবোর্ড ও শপ প্রোফাইলে সফলভাবে আপডেট করা হয়েছে।
                                </p>

                                <!-- Button -->
                                <button id="swal-profile-close-btn" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; font-size: 13px; font-weight: 800; padding: 10px 24px; border-radius: 14px; border: none; cursor: pointer; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35); width: 100%; max-width: 190px; transition: transform 0.1s ease;">
                                    ঠিক আছে
                                </button>
                            </div>
                        `,
                        showConfirmButton: false,
                        width: '340px',
                        padding: '1.25rem',
                        background: '#ffffff',
                        backdrop: `rgba(15, 23, 42, 0.65)`,
                        customClass: {
                            popup: 'rounded-3xl shadow-2xl border border-slate-100/80 overflow-hidden',
                        },
                        didOpen: () => {
                            const btn = document.getElementById('swal-profile-close-btn');
                            if (btn) {
                                btn.onclick = () => Swal.close();
                            }
                        },
                        timer: 3500,
                        timerProgressBar: true,
                    });
                },
                onError: () => {
                    Swal.fire({
                        icon: 'error',
                        title: 'আপলোড সফল হয়নি!',
                        text: 'অনুগ্রহ করে একটি ছবি নির্বাচন করুন (সর্বোচ্চ সাইজ ১০ এমবি)।',
                        confirmButtonText: 'ঠিক আছে',
                        confirmButtonColor: '#ef4444',
                        width: '340px',
                        customClass: {
                            popup: 'rounded-3xl shadow-2xl p-6 text-center border border-slate-100',
                            confirmButton: 'px-8 py-2.5 rounded-xl font-bold text-xs shadow-md cursor-pointer',
                        }
                    });
                }
            });
        }
    };

    const toggleMenu = (menu: string) => {
        setOpenMenu(prev => prev === menu ? null : menu);
    };

    const isGroupActive = React.useCallback((paths: string[]) => {
        return paths.some(p => currentPath === p || currentPath.startsWith(p + '/'));
    }, [currentPath]);

    React.useEffect(() => {
        if (isGroupActive(['/seller/products', '/seller/unit', '/seller/attributes', '/seller/brand', '/seller/import', '/seller/pos'])) {
            setOpenMenu('Product');
        } else if (isGroupActive(['/seller/stock'])) {
            setOpenMenu('Stock');
        } else if (isGroupActive(['/seller/supplier', '/seller/customer'])) {
            setOpenMenu('Contact');
        }
    }, [isGroupActive]);

    return (
        <ErrorBoundary>
            <div 
                className={`h-screen ${isCustomMode ? '' : currentTheme.bgClass} flex flex-col font-sans transition-colors duration-300 overflow-hidden`}
                style={isCustomMode ? { backgroundColor: customMainBg, color: '#ffffff' } : undefined}
            >
            {/* ─── ANNOUNCEMENT & NOTICE TOP BARS ─── */}
            <div className="shrink-0 z-40 shadow-sm border-b border-slate-200/40">
                <NoticeMarquee />
            </div>

            {/* ─── TOP HEADER ─── */}
            <header 
                className={`h-16 ${isCustomMode ? '' : currentTheme.headerClass} border-b border-slate-200/40 flex items-center justify-between px-2.5 sm:px-6 shrink-0 z-30 transition-colors duration-300`}
                style={isCustomMode ? { backgroundColor: customHeaderBg, color: '#ffffff' } : undefined}
            >
                <div className="flex items-center gap-1.5 sm:gap-6 shrink-0">
                    {/* Mobile Hamburger Menu Toggle */}
                    <button
                        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                        className="md:hidden p-2 rounded-xl bg-slate-900 text-white border border-slate-700 hover:bg-slate-800 transition cursor-pointer active:scale-95 shrink-0"
                        title="মেনু নেভিগেশন খুলুন"
                    >
                        {mobileSidebarOpen ? <X className="w-5 h-5 text-rose-400" /> : <Menu className="w-5 h-5 text-emerald-400" />}
                    </button>

                    {/* Logo Area */}
                    <Link href="/" className="flex items-center gap-2">
                        {props.siteSettings?.site_logo ? (
                            <img src={props.siteSettings.site_logo} alt={props.siteSettings.site_title || 'Logo'} className="max-h-8 object-contain" />
                        ) : (
                            <>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-black text-lg border-2 border-white shadow-sm">
                                    g
                                </div>
                                <span className="text-xl font-black tracking-tight">
                                    guruz
                                </span>
                            </>
                        )}
                    </Link>

                    {/* Search */}
                    <div className="relative w-full max-w-md hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search here" 
                            className="w-full pl-9 pr-4 py-2 bg-white/10 dark:bg-slate-950/40 border border-slate-200/30 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
                    {/* Quick Action (+) Button & Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowQuickActions(!showQuickActions);
                                setShowNotifications(false);
                            }}
                            className="w-9 h-9 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md border border-emerald-500 transition cursor-pointer active:scale-95"
                            title="দ্রুত নতুন কিছু যুক্ত করুন"
                        >
                            <Plus className={`w-5 h-5 transition-transform duration-200 ${showQuickActions ? 'rotate-45' : ''}`} />
                        </button>

                        {showQuickActions && (
                            <>
                                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 sm:hidden" onClick={() => setShowQuickActions(false)} />
                                <div className="fixed sm:absolute top-20 sm:top-auto left-3 right-3 sm:left-auto sm:right-0 sm:mt-2 w-auto sm:w-64 max-w-xs mx-auto sm:mx-0 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                                <div className="text-[10px] font-black uppercase text-slate-400 px-3 py-1.5 border-b border-slate-800 tracking-wider">
                                    ⚡ কুইক এ্যাকশন মেনু
                                </div>
                                <div className="space-y-0.5 mt-1">
                                    <Link
                                        href="/seller/products/create"
                                        onClick={() => setShowQuickActions(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl hover:bg-purple-600/30 hover:text-purple-300 transition"
                                    >
                                        <Package className="w-4 h-4 text-emerald-400" />
                                        <span>নতুন প্রোডাক্ট যোগ করুন</span>
                                    </Link>
                                    <Link
                                        href="/seller/pos"
                                        onClick={() => setShowQuickActions(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl hover:bg-purple-600/30 hover:text-purple-300 transition"
                                    >
                                        <ShoppingCart className="w-4 h-4 text-blue-400" />
                                        <span>POS নতুন বিক্রয়</span>
                                    </Link>
                                    <Link
                                        href="/seller/coupons"
                                        onClick={() => setShowQuickActions(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl hover:bg-purple-600/30 hover:text-purple-300 transition"
                                    >
                                        <Zap className="w-4 h-4 text-amber-400" />
                                        <span>নতুন কুপন ডিসকাউন্ট</span>
                                    </Link>
                                    <Link
                                        href="/seller/custom-domain"
                                        onClick={() => setShowQuickActions(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl hover:bg-purple-600/30 hover:text-purple-300 transition"
                                    >
                                        <Globe className="w-4 h-4 text-pink-400" />
                                        <span>কাস্টম ডোমেইন সেটিংস</span>
                                    </Link>
                                </div>
                            </div>
                            </>
                        )}
                    </div>
                    
                    {/* ─── DYNAMIC MULTI-LANGUAGE & AUTO CURRENCY SELECTOR ─── */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowLangMenu(!showLangMenu);
                                setShowQuickActions(false);
                                setShowNotifications(false);
                            }}
                            className="flex items-center gap-1 sm:gap-2 px-1.5 py-1.5 sm:px-3.5 sm:py-1.5 bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 rounded-xl text-xs font-extrabold text-white shadow-md transition active:scale-95 cursor-pointer shrink-0"
                            title="ভাষা ও কারেন্সি পরিবর্তন করুন"
                        >
                            <span className="text-sm">{currentLangObj.flag}</span>
                            <span className="uppercase text-xs font-black tracking-wider text-white">{currentLangObj.code.split('-')[0]}</span>
                            <span className="text-slate-600 font-bold">|</span>
                            <span className="text-emerald-400 font-black tracking-tight">{currentCurrencyObj.symbol} {currentCurrencyObj.code}</span>
                            <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform duration-200 ${showLangMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showLangMenu && (
                            <>
                                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 sm:hidden" onClick={() => setShowLangMenu(false)} />
                                <div className="fixed sm:absolute top-20 sm:top-auto left-3 right-3 sm:left-auto sm:right-0 sm:mt-2 w-auto sm:w-80 max-w-sm mx-auto sm:mx-0 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                                
                                {/* Auto Country Detect Badge */}
                                <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-[11px] flex items-center justify-between">
                                    <span className="text-slate-400 font-semibold flex items-center gap-1">
                                        📍 অটো দেশ শনাক্ত:
                                    </span>
                                    <span className="font-extrabold text-emerald-400">{detectedCountry}</span>
                                </div>

                                {/* Section 1: Multi-Language Switcher */}
                                <div>
                                    <div className="text-[10px] font-black uppercase text-purple-400 mb-1.5 flex items-center gap-1 px-1">
                                        <Globe className="w-3 h-3" /> সিলেক্ট করুন ভাষা (Google Instant Translate)
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto custom-scrollbar pr-1">
                                        {languagesList.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => handleSelectLanguage(lang)}
                                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                                                    currentLangObj.code === lang.code
                                                        ? 'bg-purple-600 text-white shadow-xs'
                                                        : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300'
                                                }`}
                                            >
                                                <span className="text-base">{lang.flag}</span>
                                                <span className="truncate">{lang.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Section 2: Auto Currency Converter */}
                                <div className="pt-2 border-t border-slate-800">
                                    <div className="text-[10px] font-black uppercase text-amber-400 mb-1.5 flex items-center gap-1 px-1">
                                        <DollarSign className="w-3 h-3" /> আন্তর্জাতিক কারেন্সি পছন্দ
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {currenciesList.map((curr) => (
                                            <button
                                                key={curr.code}
                                                onClick={() => handleSelectCurrency(curr)}
                                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                                    currentCurrencyObj.code === curr.code
                                                        ? 'bg-emerald-600 text-white shadow-xs'
                                                        : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300'
                                                }`}
                                            >
                                                <span className="flex items-center gap-1.5">
                                                    <span>{curr.flag}</span>
                                                    <span>{curr.code}</span>
                                                </span>
                                                <span className="font-mono font-black text-amber-300">{curr.symbol}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                            </div>
                            </>
                        )}
                    </div>

                    {/* POS SALE Button */}
                    <Link
                        href="/seller/pos"
                        className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition shadow-md border border-emerald-500 active:scale-95 cursor-pointer"
                        title="Point of Sale (POS) শপ কাউন্টার প্যানেলে যান"
                    >
                        <ShoppingCart className="w-4 h-4 text-white" />
                        <span>POS SALE</span>
                    </Link>

                    {/* Theme Background Color Palette Picker */}
                    <button
                        onClick={() => setShowThemeModal(true)}
                        className="flex items-center gap-1.5 p-2 sm:px-4 sm:py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black transition shadow-md border border-purple-500 active:scale-95 cursor-pointer shrink-0"
                        title="ভেন্ডর প্যানেল ব্যাকগ্রাউন্ড থিম কালার সিলেক্ট করুন"
                    >
                        <Palette className="w-4 h-4 text-white" />
                        <span className="hidden sm:inline">Theme Studio</span>
                    </button>

                    {/* Live Support Messages Icon */}
                    <Link
                        href="/seller/messages"
                        className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 text-teal-400 font-bold transition shadow-md cursor-pointer active:scale-95 shrink-0"
                        title="কাস্টমার সাপোর্ট ও মেসেজ"
                    >
                        <MessageCircle className="w-4 h-4 text-teal-300" />
                        {unreadMessages > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-orange-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-slate-900 shadow-md animate-pulse">
                                {unreadMessages > 99 ? '99+' : unreadMessages}
                            </span>
                        )}
                    </Link>

                    {/* Notification Bell Dropdown */}
                    <div className="relative shrink-0">
                        <button
                            onClick={() => {
                                setShowNotifications(!showNotifications);
                                setShowQuickActions(false);
                            }}
                            className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 text-amber-400 font-bold transition shadow-md cursor-pointer active:scale-95"
                            title="নোটিফিকেশন ও অ্যালার্টস"
                        >
                            <Bell className="w-4 h-4 text-amber-300" />
                            {totalBellCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-slate-900 shadow-md animate-pulse">
                                    {totalBellCount > 99 ? '99+' : totalBellCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <>
                                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 sm:hidden" onClick={() => setShowNotifications(false)} />
                                <div className="fixed sm:absolute top-20 sm:top-auto left-3 right-3 sm:left-auto sm:right-0 sm:mt-2 w-auto sm:w-80 max-w-sm mx-auto sm:mx-0 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                                    <div className="flex items-center gap-2">
                                        <Bell className="w-4 h-4 text-amber-400" />
                                        <h4 className="font-extrabold text-xs">নোটিফিকেশন হাব</h4>
                                    </div>
                                    <button
                                        onClick={handleMarkAllNotificationsRead}
                                        className="text-[10px] text-purple-400 hover:text-purple-300 font-bold hover:underline cursor-pointer"
                                    >
                                        সব পড়া হিসেবে চিহ্নিত করুন
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                                    {/* 1. Real User Notifications from Database (Approval, System, etc.) */}
                                    {userNotifications.length > 0 && userNotifications.map((notif: any) => (
                                        <Link
                                            key={notif.id}
                                            href={notif.link || '/seller'}
                                            onClick={() => setShowNotifications(false)}
                                            className={`flex items-start gap-3 p-3 rounded-2xl transition group border ${
                                                notif.type === 'vendor_approved' 
                                                    ? 'bg-emerald-950/40 border-emerald-500/40 hover:border-emerald-400' 
                                                    : !notif.is_read 
                                                        ? 'bg-slate-950/90 border-purple-500/40 hover:border-purple-400' 
                                                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                                            }`}
                                        >
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold border ${
                                                notif.type === 'vendor_approved'
                                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                    : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                            }`}>
                                                {notif.type === 'vendor_approved' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Bell className="w-4 h-4 text-purple-400" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-1">
                                                    <p className={`text-xs font-bold truncate ${notif.type === 'vendor_approved' ? 'text-emerald-300' : 'text-slate-200'}`}>
                                                        {notif.title}
                                                    </p>
                                                    {!notif.is_read && (
                                                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-300/85 mt-0.5 leading-snug line-clamp-2">
                                                    {notif.body}
                                                </p>
                                                <span className="text-[9px] text-slate-400 mt-1 block font-mono">
                                                    {notif.created_at}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}

                                    {/* 2. Real Pending Orders Alert (only show if count > 0) */}
                                    {(sellerCounts.pending_orders || 0) > 0 && (
                                        <Link
                                            href="/seller/orders"
                                            onClick={() => setShowNotifications(false)}
                                            className="flex items-start gap-3 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/40 transition group"
                                        >
                                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold border border-emerald-500/30">
                                                <ShoppingCart className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold group-hover:text-emerald-400 transition">নতুন পেন্ডিং অর্ডার</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    আপনার মোট <span className="text-emerald-400 font-bold">{sellerCounts.pending_orders}</span> টি অর্ডার প্রক্রিয়াকরণের জন্য বাকি আছে।
                                                </p>
                                            </div>
                                        </Link>
                                    )}

                                    {/* 3. Real Category Requests Alert (only show if count > 0) */}
                                    {(sellerCounts.pending_category_requests || 0) > 0 && (
                                        <Link
                                            href="/seller/category-request"
                                            onClick={() => setShowNotifications(false)}
                                            className="flex items-start gap-3 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/40 transition group"
                                        >
                                            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 font-bold border border-purple-500/30">
                                                <ClipboardList className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold group-hover:text-purple-400 transition">ক্যাটাগরি আবেদন স্ট্যাটাস</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    <span className="text-purple-400 font-bold">{sellerCounts.pending_category_requests}</span> টি আবেদন পর্যালোচনায় আছে।
                                                </p>
                                            </div>
                                        </Link>
                                    )}

                                    {/* 4. Empty State if nothing is pending */}
                                    {userNotifications.length === 0 && (sellerCounts.pending_orders || 0) === 0 && (sellerCounts.pending_category_requests || 0) === 0 && (
                                        <div className="py-6 text-center text-slate-400">
                                            <Bell className="w-7 h-7 mx-auto mb-2 opacity-30 text-slate-500" />
                                            <p className="text-xs font-bold text-slate-300">কোনো নতুন নোটিফিকেশন নেই</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">সব গুরুত্বপূর্ণ আপডেট এখানে দেখা যাবে</p>
                                        </div>
                                    )}

                                    {/* 5. System Notices Link */}
                                    <Link
                                        href="/seller/notice"
                                        onClick={() => setShowNotifications(false)}
                                        className="flex items-start gap-3 p-2 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition group"
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 font-bold">
                                            <BellRing className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-bold text-slate-300 group-hover:text-amber-300 transition">গুরুত্বপূর্ণ ভেন্ডর নোটিশ</p>
                                            <p className="text-[10px] text-slate-500">এডমিন প্যানেলের সাধারণ ঘোষণা ও নোটিশসমূহ দেখুন</p>
                                        </div>
                                    </Link>
                                </div>

                                <div className="pt-1 border-t border-slate-800 text-center">
                                    <Link
                                        href="/seller/notice"
                                        onClick={() => setShowNotifications(false)}
                                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
                                    >
                                        সব নোটিশ ও এলার্ট দেখুন →
                                    </Link>
                                </div>
                            </div>
                            </>
                        )}
                    </div>

                    {/* Avatar Profile Upload Clicker */}
                    <div onClick={handleAvatarClick} className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 ring-2 ring-white/50 shadow-sm cursor-pointer ml-1 active:scale-95 transition-transform" title="প্রোফাইল ছবি পরিবর্তন করতে ক্লিক করুন">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt={user?.name || 'Avatar'} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            initials
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Backdrop Overlay */}
            {mobileSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            <div className="flex flex-1 overflow-hidden relative">
                {/* ─── LEFT SIDEBAR ─── */}
                <aside 
                    translate="no"
                    className={`notranslate w-72 md:w-64 ${isCustomMode ? '' : currentTheme.sidebarClass} border-r border-slate-200/30 flex flex-col shrink-0 overflow-y-auto custom-scrollbar h-full transition-all duration-300 fixed md:static inset-y-0 left-0 z-50 ${mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}`}
                    style={isCustomMode ? { backgroundColor: customSidebarBg, color: '#ffffff' } : undefined}
                >
                    
                    {/* Hidden Avatar File Input */}
                    <input 
                        type="file" 
                        ref={avatarInputRef} 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarFileSelect} 
                    />

                    {/* Profile Section */}
                    <div className="flex flex-col items-center py-8 px-4">
                        <div 
                            onClick={handleAvatarClick}
                            className="w-20 h-20 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center text-3xl font-bold mb-3 relative group cursor-pointer ring-4 ring-white/20 shadow-md"
                            title="Click to Upload Profile Picture"
                        >
                            {avatarPreview ? (
                                <img src={avatarPreview} alt={user?.name || 'Avatar'} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                initials
                            )}
                            <div className="absolute bottom-0 right-0 w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform">
                                <Camera className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        
                        <h2 className="text-lg font-bold">{user?.name || 'shishir barai'}</h2>
                        
                        {/* Copyable Vendor ID */}
                        <div 
                            onClick={handleCopyVendorId}
                            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-xs font-bold font-mono mt-1.5 cursor-pointer transition shadow-2xs border border-white/20 active:scale-95"
                            title="Click to copy Vendor ID"
                        >
                            <span>{vendorId}</span>
                            {copiedId ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400 animate-in zoom-in" />
                            ) : (
                                <Copy className="w-3.5 h-3.5 opacity-60" />
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 pb-10 space-y-6">
                        {/* Helper renderer for colorful links */}
                        {(() => {
                            const renderItem = (
                                href: string,
                                icon: React.ReactNode,
                                label: string,
                                iconColorClass: string,
                                badge?: number,
                                exact: boolean = false
                            ) => {
                                const isActive = exact 
                                    ? (currentPath === href) 
                                    : (currentPath === href || (href !== '/seller' && currentPath.startsWith(href)));

                                const activeStyle = isActive && isCustomMode ? {
                                    borderLeftColor: customAccent,
                                    backgroundColor: customAccent + '30',
                                    color: '#ffffff'
                                } : undefined;

                                const isLightMode = !isCustomMode && currentTheme.id === 'slate';

                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setMobileSidebarOpen(false)}
                                        style={activeStyle}
                                        className={`flex items-center justify-between px-4 py-2.5 mx-3 my-1 rounded-xl text-xs font-bold transition-all duration-200 border-l-4 ${
                                            isActive
                                                ? (isCustomMode ? 'border-l-4 font-black shadow-xs ring-1 ring-white/20 text-white' : currentTheme.activeMenuClass)
                                                : (isLightMode 
                                                    ? 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-100 opacity-90 hover:opacity-100' 
                                                    : 'border-transparent text-white/90 hover:text-white hover:bg-white/10 opacity-90 hover:opacity-100')
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`p-1.5 rounded-lg flex items-center justify-center transition-transform ${
                                                isActive ? 'bg-emerald-500 text-white shadow-sm scale-110' : iconColorClass
                                            }`}>
                                                {icon}
                                            </span>
                                            <span className={`text-xs ${isActive ? 'font-black' : 'font-semibold'} ${isLightMode && !isActive ? 'text-slate-800' : 'text-white'}`}>
                                                {label}
                                            </span>
                                        </div>

                                        {badge !== undefined && badge > 0 && (
                                            <span className="px-1.5 py-0.5 min-w-[20px] h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border border-white/40 shadow-xs animate-pulse leading-none">
                                                {badge > 999 ? '999+' : badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            };

                            const isLightMode = !isCustomMode && currentTheme.id === 'slate';

                            return (
                                <>
                                    {/* PRODUCT & INVENTORY */}
                                    <div>
                                        <p className="px-6 text-[10px] font-bold text-slate-400 tracking-wider mb-2 uppercase">Product & Inventory</p>
                                        
                                        {renderItem('/seller', <LayoutDashboard className="w-4 h-4" />, 'Dashboard', 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400', undefined, true)}

                                        {/* Product Dropdown */}
                                        <div>
                                            <button 
                                                onClick={() => toggleMenu('Product')} 
                                                className={`w-full flex items-center justify-between px-4 py-2.5 mx-3 my-1 rounded-xl text-xs font-bold transition-all duration-200 border-l-4 ${
                                                    isGroupActive(['/seller/products']) 
                                                        ? 'border-indigo-500 bg-gradient-to-r from-indigo-500/20 via-indigo-500/10 to-transparent text-white font-extrabold ring-1 ring-indigo-500/30' 
                                                        : (isLightMode 
                                                            ? 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-100' 
                                                            : 'border-transparent text-white/90 hover:text-white hover:bg-white/10')
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`p-1.5 rounded-lg flex items-center justify-center ${isGroupActive(['/seller/products']) ? 'bg-indigo-600 text-white shadow-sm' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'}`}>
                                                        <Package className="w-4 h-4" />
                                                    </span>
                                                    <span className={`text-xs font-semibold ${isLightMode ? 'text-slate-800' : 'text-white'}`}>Product</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {sellerCounts.pending_category_requests > 0 && (
                                                        <span className="w-5 h-5 min-w-[20px] min-h-[20px] rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border border-white/40 shadow-xs animate-pulse">
                                                            {sellerCounts.pending_category_requests}
                                                        </span>
                                                    )}
                                                    <ChevronDown className={`w-4 h-4 transition-transform ${openMenu === 'Product' ? 'rotate-180' : ''}`} />
                                                </div>
                                            </button>
                                            {openMenu === 'Product' && (
                                                <div className="flex flex-col py-1 mx-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800 my-1 space-y-0.5">
                                                    <Link href="/seller/products/create" className="pl-10 pr-4 py-2 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-lg">Add Product</Link>
                                                    <Link href="/seller/products" className="pl-10 pr-4 py-2 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-lg">Product List</Link>
                                                    <Link href="/seller/unit" className="pl-10 pr-4 py-2 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-lg">Unit</Link>
                                                    <Link href="/seller/attributes" className="pl-10 pr-4 py-2 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-lg">Attributes</Link>
                                                    <Link href="/seller/attributes?type=Color" className="pl-12 pr-4 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-purple-600 hover:bg-purple-50/50 flex items-center gap-2 rounded-lg">
                                                        <span className="w-2 h-2 rounded-full bg-purple-500"></span> Colors (কালার)
                                                    </Link>
                                                    <Link href="/seller/attributes?type=Size" className="pl-12 pr-4 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 flex items-center gap-2 rounded-lg">
                                                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Sizes (সাইজ)
                                                    </Link>
                                                    <Link href="/seller/attributes?type=Material" className="pl-12 pr-4 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/50 flex items-center gap-2 rounded-lg">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Materials (ম্যাটেরিয়াল)
                                                    </Link>
                                                    <Link href="/seller/brand" className="pl-10 pr-4 py-2 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-lg">Brand</Link>
                                                    <Link href="/seller/import" className="pl-10 pr-4 py-2 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-lg">Import product by CSV</Link>
                                                </div>
                                            )}
                                        </div>

                                        {renderItem('/seller/purchase', <ShoppingCart className="w-4 h-4" />, 'Purchase', 'bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400', sellerCounts.pending_purchases)}
                                        {renderItem('/seller/sales', <TrendingUp className="w-4 h-4" />, 'Sales', 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400')}
                                        {renderItem('/seller/fraud-check', <Shield className="w-4 h-4" />, 'Fraud Check', 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400')}

                                        {/* Stock Dropdown */}
                                        <div>
                                            <button 
                                                onClick={() => toggleMenu('Stock')} 
                                                className={`w-full flex items-center justify-between px-4 py-2.5 mx-3 my-1 rounded-xl text-xs font-bold transition-all duration-200 border-l-4 ${
                                                    isGroupActive(['/seller/stock']) 
                                                        ? 'border-teal-500 bg-gradient-to-r from-teal-500/20 via-teal-500/10 to-transparent text-white font-extrabold ring-1 ring-teal-500/30' 
                                                        : (isLightMode 
                                                            ? 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-100' 
                                                            : 'border-transparent text-white/90 hover:text-white hover:bg-white/10')
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`p-1.5 rounded-lg flex items-center justify-center ${isGroupActive(['/seller/stock']) ? 'bg-teal-600 text-white shadow-sm' : 'bg-teal-100 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400'}`}>
                                                        <Package className="w-4 h-4" />
                                                    </span>
                                                    <span className={`text-xs font-semibold ${isLightMode ? 'text-slate-800' : 'text-white'}`}>Stock</span>
                                                </div>
                                                <ChevronDown className={`w-4 h-4 transition-transform ${openMenu === 'Stock' ? 'rotate-180' : ''}`} />
                                            </button>
                                            {openMenu === 'Stock' && (
                                                <div className="flex flex-col py-1 mx-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800 my-1">
                                                    <Link href="/seller/stock" className="pl-10 pr-4 py-2 text-xs font-semibold text-slate-600 hover:text-teal-600 hover:bg-teal-50/50 rounded-lg">Stock List</Link>
                                                </div>
                                            )}
                                        </div>

                                        {renderItem('/seller/warehouse', <Store className="w-4 h-4" />, 'Warehouse', 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400')}
                                        {renderItem('/seller/contact', <Users className="w-4 h-4" />, 'Contact', 'bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400', sellerCounts.total_contacts)}
                                    </div>

                                    {/* ORDERS & RETURNS */}
                                    <div>
                                        <p className="px-6 text-[10px] font-bold text-slate-400 tracking-wider mb-2 uppercase">Orders & Returns</p>
                                        
                                        {renderItem('/seller/orders', <Package className="w-4 h-4" />, 'My Orders', 'bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400', sellerCounts.pending_orders)}
                                        {renderItem('/seller/invoices', <FileText className="w-4 h-4" />, 'Invoices', 'bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400')}
                                        {renderItem('/seller/returns', <RefreshCw className="w-4 h-4" />, 'Returns', 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400', sellerCounts.pending_returns)}
                                        {renderItem('/seller/reviews', <Star className="w-4 h-4" />, 'Review List', 'bg-amber-100 text-amber-500 dark:bg-amber-950/60 dark:text-amber-400', sellerCounts.pending_reviews)}
                                        {renderItem('/seller/bargain-offers', <Star className="w-4 h-4" />, 'Bargain Offers', 'bg-pink-100 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400', sellerCounts.pending_bargain_offers)}
                                    </div>

                                    {/* E-SHOP MANAGEMENT */}
                                    <div>
                                        <p className="px-6 text-[10px] font-bold text-slate-400 tracking-wider mb-2 uppercase">E-Shop Management</p>
                                        
                                        {renderItem('/seller/my-shop', <Store className="w-4 h-4" />, user?.shop?.name || 'My Shop', 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400')}
                                        {renderItem('/seller/custom-domain', <Globe className="w-4 h-4" />, 'Custom Domain', 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400')}
                                        {renderItem('/seller/payouts', <Wallet className="w-4 h-4" />, 'Payouts', 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400', sellerCounts.pending_payouts)}
                                        {renderItem('/seller/messages', <MessageCircle className="w-4 h-4" />, 'লাইভ মেসেজ / Support', 'bg-teal-100 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400', unreadMessages)}
                                        {renderItem('/seller/help', <HelpCircle className="w-4 h-4" />, 'Help Center', 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400', sellerCounts.pending_help_tickets)}
                                        {renderItem('/seller/comments', <MessageCircle className="w-4 h-4" />, 'Product Comments', 'bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400', sellerCounts.pending_comments)}
                                        {renderItem('/seller/notice', <BellRing className="w-4 h-4" />, 'Notice', 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400', sellerCounts.unread_notices)}
                                        {renderItem('/seller/category-request', <ClipboardList className="w-4 h-4" />, 'Category Request', 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400', sellerCounts.pending_category_requests)}
                                        {renderItem('/seller/pickup-request', <Truck className="w-4 h-4" />, 'Pickup Request', 'bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400', sellerCounts.pending_pickup_requests)}
                                        {renderItem('/seller/moderator', <UserCheck className="w-4 h-4" />, 'Moderator Management', 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400')}
                                    </div>

                                    {/* FINANCE MANAGEMENT */}
                                    <div>
                                        <p className="px-6 text-[10px] font-bold text-slate-400 tracking-wider mb-2 uppercase">Finance Management</p>
                                        
                                        {renderItem('/seller/banking', <DollarSign className="w-4 h-4" />, 'Banking', 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400')}
                                        {renderItem('/seller/courier-settings', <Truck className="w-4 h-4" />, 'Courier Settings', 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400')}
                                        {renderItem('/seller/accounts', <Wallet className="w-4 h-4" />, 'Accounts', 'bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400')}
                                        {renderItem('/seller/report', <FileText className="w-4 h-4" />, 'Report', 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400', sellerCounts.pending_reports)}
                                        {renderItem('/seller/report-issue', <AlertTriangle className="w-4 h-4" />, 'Report Issue', 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400', sellerCounts.pending_reports)}
                                        {renderItem('/seller/optimizer', <Zap className="w-4 h-4" />, 'Store & SEO Optimizer', 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 ring-2 ring-emerald-500/20')}
                                        {renderItem('/seller/marketing', <BellRing className="w-4 h-4" />, 'Marketing & Pixels', 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400')}
                                        {renderItem('/seller/settings', <Settings className="w-4 h-4" />, 'Shop Settings', 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300')}
                                    </div>
                                </>
                            );
                        })()}
                        
                        <div className="px-5 mt-4 mb-4">
                            <Link
                                href="/"
                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 bg-white hover:bg-slate-100 transition border border-slate-200 shadow-xs"
                            >
                                <Store className="w-4 h-4 shrink-0 text-emerald-600" />
                                <span className="font-extrabold text-slate-900" style={{ color: '#0f172a' }}>Back to Store</span>
                            </Link>
                        </div>
                        
                        {/* Logout at bottom */}
                        <div className="px-5 mt-2 mb-8">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition border border-rose-200"
                            >
                                <LogOut className="w-4 h-4 shrink-0 text-rose-600" />
                                <span className="font-extrabold text-rose-600" style={{ color: '#e11d48' }}>Logout</span>
                            </button>
                        </div>

                    </nav>
                </aside>

                {/* ─── MAIN CONTENT ─── */}
                <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar pb-24 md:pb-8">
                    {/* ⚠️ PENDING APPROVAL WARNING BANNER */}
                    {(props.auth?.user?.shop?.status === 'pending' || props.auth?.user?.shop?.is_approved === false || props.auth?.user?.shop?.is_approved === 0) && (
                        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0 font-bold">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-amber-100 flex items-center gap-2">
                                        আপনার সেলার অ্যাকাউন্টটি অনুমোদন অপেক্ষায় আছে (Pending Super Admin Approval)
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-amber-200/80 mt-0.5 leading-relaxed">
                                        সুপার অ্যাডমিন আপনার দোকান ও তথ্যাদি যাচাই করে অনুমোদন (Approve) করলে আপনার শপ ও প্রোডাক্ট ক্রেতাদের কাছে লাইভ হবে এবং প্রোডাক্ট বিক্রি শুরু করা যাবে।
                                    </p>
                                </div>
                            </div>
                            <span className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-500/30">
                                ⏳ পেন্ডিং (Pending)
                            </span>
                        </div>
                    )}

                    {/* 🎉 APPROVED SUCCESS BANNER */}
                    {!approvalBannerDismissed && props.auth?.user?.shop && (props.auth?.user?.shop?.status === 'active' || props.auth?.user?.shop?.status === 'approved') && Boolean(props.auth?.user?.shop?.is_approved) && (
                        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border-2 border-emerald-500/30 text-emerald-950 dark:text-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold border border-emerald-500/30">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-emerald-200 flex items-center gap-2">
                                        🎉 অভিনন্দন! আপনার ভেন্ডর শপ অনুমোদিত হয়েছে
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-emerald-200/80 mt-0.5 leading-relaxed">
                                        সুপার অ্যাডমিন কর্তৃক আপনার দোকান সফলভাবে অনুমোদিত হয়েছে। এখন আপনি সম্পূর্ণ সেলার ফিচার ব্যবহার করতে পারবেন ও আনলিমিটেড প্রোডাক্ট আপলোড করতে পারবেন।
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Link
                                    href="/seller/products/create"
                                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" /> পণ্য যোগ করুন
                                </Link>
                                <button
                                    onClick={handleDismissApprovalBanner}
                                    className="p-1.5 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer"
                                    title="ব্যানার বন্ধ করুন"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {children}
                </main>
            </div>
            </div>

            {/* Vendor Theme Background Selector Modal */}
            {showThemeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5 relative">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold border border-purple-500/30">
                                    <Palette className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-base">ভেন্ডর থিম ও কালার স্টুডিও</h3>
                                    <p className="text-[11px] text-slate-400">সাইডবার, হেডার ও ড্যাশবোর্ডের সব কালার পরিবর্তন করুন</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowThemeModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
                            >
                                <X className="w-4.5 h-4.5" />
                            </button>
                        </div>

                        {/* Modal Tab Controls */}
                        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                            <button
                                onClick={() => setThemeTab('presets')}
                                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                                    themeTab === 'presets' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <Layers className="w-3.5 h-3.5" />
                                ভাইব্রেন্ট প্রেসেট থিম
                            </button>
                            <button
                                onClick={() => setThemeTab('custom')}
                                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                                    themeTab === 'custom' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <Palette className="w-3.5 h-3.5" />
                                🎛️ কাস্টম কালার স্টুডিও
                            </button>
                        </div>

                        {/* Tab 1: Presets */}
                        {themeTab === 'presets' && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                                    {themeOptions.map((t) => {
                                        const isSelected = !isCustomMode && t.id === selectedThemeId;
                                        return (
                                            <button
                                                key={t.id}
                                                onClick={() => handleSelectTheme(t.id)}
                                                className={`flex items-center gap-3 p-3 rounded-2xl border transition text-left cursor-pointer ${
                                                    isSelected 
                                                        ? 'border-purple-500 bg-purple-500/20 font-bold ring-2 ring-purple-500/40' 
                                                        : 'border-slate-800 bg-slate-950/60 hover:border-purple-500/40 hover:bg-slate-800/80'
                                                }`}
                                            >
                                                <div className="flex -space-x-2 shrink-0">
                                                    <div className="w-6 h-6 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: t.previewColors[0] }} />
                                                    <div className="w-6 h-6 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: t.previewColors[1] }} />
                                                    <div className="w-6 h-6 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: t.previewColors[2] }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-xs font-bold block truncate">{t.label}</span>
                                                </div>
                                                {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Custom Color Studio Pickers */}
                        {themeTab === 'custom' && (
                            <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                                <p className="text-xs text-purple-300/80 bg-purple-950/40 border border-purple-900/50 p-3 rounded-xl">
                                    এখানে আপনি ভেন্ডর প্যানেলের সাইডবার, টপ হেডার বার, ড্যাশবোর্ড ব্যাকগ্রাউন্ড, টেক্সট কালার এবং একটিভ মেনুর জন্য ইচ্ছামত যেকোনো কালার বেছে নিতে পারেন।
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Sidebar BG Picker */}
                                    <div className="space-y-1.5 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                                        <label className="text-xs font-bold text-slate-300 block">সাইডবার ব্যাকগ্রাউন্ড (Sidebar BG)</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="color" 
                                                value={customSidebarBg}
                                                onChange={e => setCustomSidebarBg(e.target.value)}
                                                className="w-9 h-9 rounded-xl border border-slate-700 bg-transparent cursor-pointer"
                                            />
                                            <input 
                                                type="text" 
                                                value={customSidebarBg}
                                                onChange={e => setCustomSidebarBg(e.target.value)}
                                                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Header BG Picker */}
                                    <div className="space-y-1.5 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                                        <label className="text-xs font-bold text-slate-300 block">টপ হেডার বার (Header BG)</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="color" 
                                                value={customHeaderBg}
                                                onChange={e => setCustomHeaderBg(e.target.value)}
                                                className="w-9 h-9 rounded-xl border border-slate-700 bg-transparent cursor-pointer"
                                            />
                                            <input 
                                                type="text" 
                                                value={customHeaderBg}
                                                onChange={e => setCustomHeaderBg(e.target.value)}
                                                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Dashboard BG Picker */}
                                    <div className="space-y-1.5 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                                        <label className="text-xs font-bold text-slate-300 block">ড্যাশবোর্ড ব্যাকগ্রাউন্ড (Main BG)</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="color" 
                                                value={customMainBg}
                                                onChange={e => setCustomMainBg(e.target.value)}
                                                className="w-9 h-9 rounded-xl border border-slate-700 bg-transparent cursor-pointer"
                                            />
                                            <input 
                                                type="text" 
                                                value={customMainBg}
                                                onChange={e => setCustomMainBg(e.target.value)}
                                                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Text Color Picker */}
                                    <div className="space-y-1.5 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                                        <label className="text-xs font-bold text-slate-300 block">টেক্সটের কালার (Text Color)</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="color" 
                                                value={customTextColor}
                                                onChange={e => setCustomTextColor(e.target.value)}
                                                className="w-9 h-9 rounded-xl border border-slate-700 bg-transparent cursor-pointer"
                                            />
                                            <input 
                                                type="text" 
                                                value={customTextColor}
                                                onChange={e => setCustomTextColor(e.target.value)}
                                                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Accent Color Picker */}
                                    <div className="space-y-1.5 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 sm:col-span-2">
                                        <label className="text-xs font-bold text-slate-300 block">একটিভ মেনু হাইলাইট (Accent Color)</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="color" 
                                                value={customAccent}
                                                onChange={e => setCustomAccent(e.target.value)}
                                                className="w-9 h-9 rounded-xl border border-slate-700 bg-transparent cursor-pointer"
                                            />
                                            <input 
                                                type="text" 
                                                value={customAccent}
                                                onChange={e => setCustomAccent(e.target.value)}
                                                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveCustomTheme}
                                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                                >
                                    <Palette className="w-4 h-4" />
                                    কাস্টম কালার কম্বিনেশন সেভ ও অ্যাপ্লাই করুন
                                </button>
                            </div>
                        )}

                        <div className="pt-2 flex justify-end">
                            <button
                                onClick={() => setShowThemeModal(false)}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
                            >
                                বন্ধ করুন
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── MOBILE BOTTOM NAVIGATION BAR ─── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09152a]/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl text-white">
                <Link
                    href="/seller"
                    className={`flex flex-col items-center gap-1 text-[10px] font-bold transition px-2 py-1 rounded-xl ${currentPath === '/seller' ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-white'}`}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>ড্যাশবোর্ড</span>
                </Link>

                <Link
                    href="/seller/products"
                    className={`flex flex-col items-center gap-1 text-[10px] font-bold transition px-2 py-1 rounded-xl ${currentPath.startsWith('/seller/product') ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-white'}`}
                >
                    <Package className="w-5 h-5" />
                    <span>পণ্য</span>
                </Link>

                <Link
                    href="/seller/pos"
                    className={`flex flex-col items-center gap-1 text-[10px] font-bold transition px-2 py-1 rounded-xl ${currentPath === '/seller/pos' ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-white'}`}
                >
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center -mt-3 shadow-lg border-2 border-[#09152a]">
                        <ShoppingCart className="w-4 h-4" />
                    </div>
                    <span className="-mt-1">POS সেল</span>
                </Link>

                <Link
                    href="/seller/invoices"
                    className={`flex flex-col items-center gap-1 text-[10px] font-bold transition px-2 py-1 rounded-xl ${currentPath === '/seller/invoices' ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-white'}`}
                >
                    <FileText className="w-5 h-5" />
                    <span>ইনভয়েস</span>
                </Link>

                <button
                    onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                    className={`flex flex-col items-center gap-1 text-[10px] font-bold transition px-2 py-1 rounded-xl ${mobileSidebarOpen ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-white'}`}
                >
                    <Menu className="w-5 h-5" />
                    <span>মেনু</span>
                </button>
            </nav>
        </ErrorBoundary>
    );
}
