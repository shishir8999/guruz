import React from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    ShoppingBag, Wallet, Crown, User, Heart, MessageCircle, LogOut, ArrowLeft, Bell, Tag, ChevronRight, LayoutDashboard, Camera, Copy, Check
} from 'lucide-react';
import { Header } from '@/Components/Header';
import { Footer } from '@/Components/Footer';
import { TopNoticeBar } from '@/Components/TopNoticeBar';
import { NoticeMarquee } from '@/Components/NoticeMarquee';
import { MobileBottomNav } from '@/Components/MobileBottomNav';

interface CustomerLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function CustomerLayout({ children, title = 'Dashboard' }: CustomerLayoutProps) {
    const { props, url } = usePage<any>();
    const user = props.auth?.user || props.user || {};
    const unreadMessages = (typeof window !== 'undefined' && window.location.pathname.startsWith('/account/messages')) ? 0 : (props.auth?.unread_messages_count ?? 0);
    const rawUnreadNotifs = props.auth?.unread_notifications_count ?? (props.auth?.user?.unread_notifications_count ?? 0);
    const [unreadNotifications, setUnreadNotifications] = React.useState<number>(() => {
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/account/notifications')) {
            return 0;
        }
        return rawUnreadNotifs;
    });

    React.useEffect(() => {
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/account/notifications')) {
            setUnreadNotifications(0);
            return;
        }
        setUnreadNotifications(rawUnreadNotifs);
    }, [rawUnreadNotifs, url]);

    React.useEffect(() => {
        const handleCleared = () => {
            setUnreadNotifications(0);
        };
        window.addEventListener('customer-notifications-cleared', handleCleared);
        return () => window.removeEventListener('customer-notifications-cleared', handleCleared);
    }, []);

    const currentPath = (url ? url.split('?')[0] : (typeof window !== 'undefined' ? window.location.pathname : ''));
    const isAccountHome = currentPath === '/account' || currentPath === '/account/';

    const handleLogout = () => {
        router.post('/logout');
    };

    const navItems = [
        { label: 'Dashboard', desc: 'এক নজরে অ্যাকাউন্ট সামারি', href: '/account', icon: LayoutDashboard, iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60', cardBorder: 'border-emerald-200 hover:border-emerald-400', cardBg: 'bg-white hover:bg-emerald-50/40', arrowBg: 'bg-emerald-50 group-hover:bg-emerald-600 text-emerald-500 group-hover:text-white', badge: 0 },
        { label: 'My Orders', desc: 'অর্ডার তালিকা ও অবস্থান', href: '/account/orders', icon: ShoppingBag, iconBg: 'bg-blue-50 text-blue-600 border border-blue-200/60', cardBorder: 'border-blue-200/90 hover:border-blue-400', cardBg: 'bg-white hover:bg-blue-50/40', arrowBg: 'bg-blue-50 group-hover:bg-blue-600 text-blue-500 group-hover:text-white', badge: 0 },
        { label: 'My Wallet', desc: 'ওয়ালেট ব্যালেন্স ও ক্যাশব্যাক', href: '/account/wallet', icon: Wallet, iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60', cardBorder: 'border-emerald-200/90 hover:border-emerald-400', cardBg: 'bg-white hover:bg-emerald-50/40', arrowBg: 'bg-emerald-50 group-hover:bg-emerald-600 text-emerald-500 group-hover:text-white', badge: 0 },
        { label: 'VIP Loyalty', desc: 'মেম্বারশিপ টায়ার ও পয়েন্ট', href: '/account/loyalty', icon: Crown, iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/60', cardBorder: 'border-amber-200/90 hover:border-amber-400', cardBg: 'bg-white hover:bg-amber-50/40', arrowBg: 'bg-amber-50 group-hover:bg-amber-600 text-amber-500 group-hover:text-white', badge: 0 },
        { label: 'Notifications', desc: 'সিস্টেম ও অফার নোটিফিকেশন', href: '/account/notifications', icon: Bell, iconBg: 'bg-rose-50 text-rose-600 border border-rose-200/60', cardBorder: 'border-rose-200/90 hover:border-rose-400', cardBg: 'bg-white hover:bg-rose-50/40', arrowBg: 'bg-rose-50 group-hover:bg-rose-600 text-rose-500 group-hover:text-white', badge: unreadNotifications, isRedBadge: true },
        { label: 'My Offers', desc: 'কুপন ও প্রোমো কোড', href: '/account/offers', icon: Tag, iconBg: 'bg-purple-50 text-purple-600 border border-purple-200/60', cardBorder: 'border-purple-200/90 hover:border-purple-400', cardBg: 'bg-white hover:bg-purple-50/40', arrowBg: 'bg-purple-50 group-hover:bg-purple-600 text-purple-500 group-hover:text-white', badge: 0 },
        { label: 'Profile & Password', desc: 'ব্যক্তিগত তথ্য ও পাসওয়ার্ড', href: '/account/profile', icon: User, iconBg: 'bg-sky-50 text-sky-600 border border-sky-200/60', cardBorder: 'border-sky-200/90 hover:border-sky-400', cardBg: 'bg-white hover:bg-sky-50/40', arrowBg: 'bg-sky-50 group-hover:bg-sky-600 text-sky-500 group-hover:text-white', badge: 0 },
        { label: 'Wishlist', desc: 'পছন্দের সেভ করা আইটেম', href: '/account/favorites', icon: Heart, iconBg: 'bg-pink-50 text-pink-600 border border-pink-200/60', cardBorder: 'border-pink-200/90 hover:border-pink-400', cardBg: 'bg-white hover:bg-pink-50/40', arrowBg: 'bg-pink-50 group-hover:bg-pink-600 text-pink-500 group-hover:text-white', badge: 0 },
        { label: 'Messages', desc: 'কাস্টমার সাপোর্ট ও মেসেজ', href: '/account/messages', icon: MessageCircle, iconBg: 'bg-teal-50 text-teal-600 border border-teal-200/60', cardBorder: 'border-teal-200/90 hover:border-teal-400', cardBg: 'bg-white hover:bg-teal-50/40', arrowBg: 'bg-teal-50 group-hover:bg-teal-600 text-teal-500 group-hover:text-white', badge: unreadMessages, isRedBadge: false },
    ];

    const siteSettings = props.siteSettings || {};
    const profileCardSetting = siteSettings.profile_discount_card || {};
    const isProfileDiscountActive = profileCardSetting.is_active ?? true;
    const discountText = profileCardSetting.discount_percentage || '২%';
    const completionPercent = user?.profile_completion_percentage ?? 0;
    const isProfileComplete = user?.is_profile_complete || completionPercent >= 100;

    const renderProfileCompletionBanner = () => {
        if (isProfileComplete || !isProfileDiscountActive) return null;

        return (
            <Link
                href="/account/profile"
                className="w-full bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border-2 border-amber-300/90 shadow-xs flex items-center justify-between gap-2.5 sm:gap-3.5 hover:border-amber-400 active:scale-[0.99] transition-all group mb-4 sm:mb-6 box-border overflow-hidden"
            >
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-amber-400 flex items-center justify-center text-white shrink-0 shadow-sm font-black text-xs sm:text-sm">
                        <span>{completionPercent}%</span>
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-[11px] sm:text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                            আপনার প্রোফাইল <span className="text-orange-600 dark:text-orange-400 font-extrabold">{completionPercent}%</span> সম্পূর্ণ হয়েছে। সম্পূর্ণ করুন এবং পান অতিরিক্ত <span className="text-orange-600 dark:text-orange-400 font-black">{discountText} ডিসকাউন্ট!</span>
                        </p>

                        {/* Animated Progress Bar */}
                        <div className="w-full max-w-[140px] sm:max-w-[200px] bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 sm:h-2 overflow-hidden border border-amber-200/70 dark:border-slate-700">
                            <div 
                                className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 h-full rounded-full transition-all duration-700 shadow-xs" 
                                style={{ width: `${completionPercent}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <span className="hidden sm:inline-flex items-center px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold text-xs rounded-full border border-amber-300/70 shadow-2xs">
                        {completionPercent}% সম্পন্ন
                    </span>
                    <div className="text-orange-500 group-hover:translate-x-1 transition-transform shrink-0 font-black text-xs sm:text-sm">
                        <ChevronRight size={16} />
                    </div>
                </div>
            </Link>
        );
    };

    const mobileNavItems = navItems.filter(item => item.href !== '/account');

    const activeItem = navItems.find(item => currentPath === item.href || (item.href !== '/account' && currentPath.startsWith(item.href)));

    const [copiedId, setCopiedId] = React.useState(false);
    const userDisplayId = user?.customer_id || (user?.id ? `GZ-${String(user.id).padStart(5, '0')}` : 'GZ-00001');

    const handleCopyId = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(userDisplayId);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    const initial = user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U');

    // Dynamic VIP / Loyalty Tier Mapping (Ensures Mobile & Desktop show identical tier)
    const vipTierMap: Record<string, { label: string; badge: string; bg: string; text: string; border: string }> = {
        beginner: { label: 'Beginner', badge: '⭐', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
        bronze:   { label: 'Bronze',   badge: '🥉', bg: 'bg-amber-50',  text: 'text-amber-700', border: 'border-amber-200' },
        silver:   { label: 'Silver',   badge: '🥈', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
        gold:     { label: 'Gold',     badge: '🥇', bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-300' },
        platinum: { label: 'Platinum', badge: '💎', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
        diamond:  { label: 'Diamond',  badge: '👑', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    };

    const rawVipLevel = (user?.vip_level || 'Beginner');
    const userVipKey = String(rawVipLevel).toLowerCase();
    const userTier = vipTierMap[userVipKey] || {
        label: rawVipLevel,
        badge: '⭐',
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200'
    };

    return (
        <div className="min-h-screen bg-[#f8f9fb] flex flex-col justify-between font-sans text-slate-800 pb-16 md:pb-0 w-full max-w-[100vw] overflow-x-clip">
            <div className="w-full max-w-full">
                {/* ─── TOP ANNOUNCEMENT & MAIN HEADER ─── */}
                <TopNoticeBar />
                <NoticeMarquee />
                <Header />

                {/* ─── MAIN CONTAINER ─── */}
                <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 w-full box-border">
                    
                    {/* ══════════════════════════════════════════════════════════════
                        1. DESKTOP VIEW (Original Left Sidebar + Main Content Side-by-Side)
                       ══════════════════════════════════════════════════════════════ */}
                    <div className="hidden md:grid md:grid-cols-12 md:gap-8 items-start">
                        {/* Desktop Left Sidebar Navigation */}
                        <aside className="md:col-span-3 space-y-4 sticky top-24">
                            {/* Profile Card */}
                            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 text-center space-y-3">
                                <div className="flex flex-col items-center">
                                    <Link 
                                        href="/account/profile"
                                        title="প্রোফাইল ছবি পরিবর্তন করতে ক্লিক করুন"
                                        className="relative group block w-[76px] h-[76px] rounded-full mx-auto cursor-pointer focus:outline-none"
                                    >
                                        {/* 🌟 Premium Gradient Border Ring */}
                                        <div className="w-full h-full rounded-full p-[2.5px] bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-500 shadow-md shadow-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-300">
                                            <div className="w-full h-full rounded-full bg-white p-[2px]">
                                                <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center overflow-hidden relative">
                                                    {user?.avatar_url ? (
                                                        <img 
                                                            src={user.avatar_url} 
                                                            alt={user?.name || 'Avatar'} 
                                                            className="w-full h-full object-cover rounded-full absolute inset-0 z-10 group-hover:scale-105 transition-transform duration-300" 
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <span className="select-none font-black">{initial}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 🌟 Smooth Dark Overlay on Hover */}
                                        <div className="absolute inset-0 rounded-full bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
                                            <Camera className="w-5 h-5 mb-0.5 text-white" />
                                            <span className="text-[9px] font-black tracking-tight text-white">ছবি পরিবর্তন</span>
                                        </div>

                                        {/* 🌟 Crisp Modern Floating Edit Button (Replaces ugly green blob) */}
                                        <div 
                                            className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-white text-emerald-600 shadow-md border-2 border-white flex items-center justify-center z-30 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 group-hover:scale-110"
                                            title="ছবি পরিবর্তন করুন"
                                        >
                                            <Camera size={13} className="stroke-[2.3] transition-colors" />
                                        </div>
                                    </Link>
                                </div>

                                <div>
                                    <h3 className="font-extrabold text-slate-900 text-base">{user?.name || 'Customer Account'}</h3>
                                    <p className="text-xs text-slate-400 font-medium truncate max-w-[200px] mx-auto">{user?.email || 'user@example.com'}</p>
                                </div>

                                {/* ─── COLORFUL USER ID WITH COPY BUTTON ─── */}
                                <div className="flex items-center justify-center pt-0.5">
                                    <div 
                                        onClick={handleCopyId}
                                        title="ইউজার আইডি কপি করতে ক্লিক করুন"
                                        className="group/uid relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50/80 to-indigo-50 border border-emerald-200/90 hover:border-emerald-400 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer active:scale-95 select-none"
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded-md border border-emerald-200/60 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            ID
                                        </span>

                                        <span className="font-mono font-black text-xs text-slate-800 tracking-wider">
                                            {userDisplayId}
                                        </span>

                                        <span className="text-slate-400 group-hover/uid:text-emerald-600 transition-colors ml-0.5 flex items-center">
                                            {copiedId ? (
                                                <span className="flex items-center gap-0.5 text-[10px] font-black text-emerald-600 animate-in fade-in">
                                                    <Check size={12} className="text-emerald-600 stroke-[2.5]" />
                                                    <span className="text-[10px]">কপি</span>
                                                </span>
                                            ) : (
                                                <Copy size={12} className="stroke-[2.5]" />
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-0.5">
                                    <Link
                                        href="/account/loyalty"
                                        title="মেম্বারশিপ টায়ার ও রিওয়ার্ডস"
                                        className={`inline-flex items-center gap-1 px-3 py-1 ${userTier.bg} ${userTier.text} text-[11px] font-extrabold rounded-full border ${userTier.border} hover:opacity-90 transition`}
                                    >
                                        <span>{userTier.badge}</span>
                                        <span>{userTier.label} Member</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Sidebar Links */}
                            <div className="bg-white rounded-2xl p-2 shadow-xs border border-slate-100 space-y-1">
                                {navItems.map((item, idx) => {
                                    const IconComp = item.icon;
                                    const isActive = currentPath === item.href || (item.href !== '/account' && currentPath.startsWith(item.href));

                                    return (
                                        <Link
                                            key={idx}
                                            href={item.href}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                                                isActive
                                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <IconComp size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                                                <span>{item.label}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {item.badge > 0 && (
                                                    <span className={`min-w-[20px] h-5 flex items-center justify-center px-1.5 rounded-full text-[10px] font-black shadow-sm ${
                                                        isActive
                                                            ? 'bg-white text-emerald-700'
                                                            : (item.isRedBadge ? 'bg-red-500 text-white shadow-md shadow-red-500/40 animate-pulse' : 'bg-orange-500 text-white animate-pulse')
                                                    }`}>
                                                        {item.badge}
                                                    </span>
                                                )}
                                                <ChevronRight size={14} className={isActive ? 'text-white/80' : 'text-slate-300'} />
                                            </div>
                                        </Link>
                                    );
                                })}

                                <div className="pt-2 border-t border-slate-100 mt-2">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                                    >
                                        <LogOut size={18} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        </aside>

                        {/* Desktop Main Content Area */}
                        <main className="md:col-span-9 bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-100 min-h-[600px]">
                            {!isAccountHome && renderProfileCompletionBanner()}
                            {children}
                        </main>
                    </div>


                    {/* ══════════════════════════════════════════════════════════════
                        2. MOBILE VIEW (Ultra-Compact Shortcut Layout)
                       ══════════════════════════════════════════════════════════════ */}
                    <div className="block md:hidden w-full max-w-full">
                        {/* Mobile Ultra-Compact Header */}
                        {isAccountHome ? (
                            /* Home Profile Bar: Colorful & Clean Mobile Profile Card */
                            <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-100 mb-4 flex items-center justify-between gap-3 w-full max-w-full box-border">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <Link 
                                        href="/account/profile"
                                        title="প্রোফাইল ছবি পরিবর্তন করুন"
                                        className="relative block w-14 h-14 rounded-full shrink-0 group focus:outline-none"
                                    >
                                        {/* Mobile Gradient Border Ring */}
                                        <div className="w-full h-full rounded-full p-[2px] bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-500 shadow-sm">
                                            <div className="w-full h-full rounded-full bg-white p-[1.5px]">
                                                <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-sm flex items-center justify-center overflow-hidden relative">
                                                    {user?.avatar_url ? (
                                                        <img 
                                                            src={user.avatar_url} 
                                                            alt="" 
                                                            className="w-full h-full object-cover rounded-full absolute inset-0 z-10" 
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <span className="select-none">{initial}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mobile Crisp White Edit Badge */}
                                        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white text-emerald-600 shadow-sm border border-slate-200 flex items-center justify-center z-20">
                                            <Camera size={10} className="stroke-[2.2]" />
                                        </div>
                                    </Link>

                                    <div className="min-w-0 flex-1 space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <h2 className="text-sm font-black text-slate-900 truncate leading-tight">{user?.name || 'Customer Account'}</h2>
                                            <Link
                                                href="/account/loyalty"
                                                title="মেম্বারশিপ টায়ার ও রিওয়ার্ডস"
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 ${userTier.bg} ${userTier.text} text-[10px] font-extrabold rounded-full border ${userTier.border} shrink-0 hover:opacity-90 transition`}
                                            >
                                                <span>{userTier.badge}</span>
                                                <span>{userTier.label}</span>
                                            </Link>
                                        </div>
                                        <p className="text-[11px] text-slate-400 font-medium truncate">{user?.email || 'user@example.com'}</p>
                                        
                                        {/* Mobile Colorful User ID Badge with Copy */}
                                        <div 
                                            onClick={handleCopyId}
                                            title="ইউজার আইডি কপি করুন"
                                            className="group/mob relative inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-gradient-to-r from-emerald-50 via-teal-50/80 to-indigo-50 border border-emerald-200/90 text-[10px] font-mono font-black text-slate-800 active:scale-95 shadow-2xs cursor-pointer select-none"
                                        >
                                            <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100/90 px-1 py-0.2 rounded border border-emerald-200/60">ID</span>
                                            <span className="tracking-wide">{userDisplayId}</span>
                                            <span className="text-slate-400 group-hover/mob:text-emerald-600">
                                                {copiedId ? (
                                                    <span className="text-[9px] font-black text-emerald-600 flex items-center gap-0.5">
                                                        <Check size={10} className="text-emerald-600 stroke-[2.5]" />
                                                        <span>কপি</span>
                                                    </span>
                                                ) : (
                                                    <Copy size={10} className="stroke-[2.5]" />
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    href="/"
                                    className="px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-xl shrink-0 flex items-center gap-1 shadow-xs active:scale-95 transition"
                                >
                                    <ArrowLeft size={12} className="text-emerald-400" />
                                    <span>Website</span>
                                </Link>
                            </div>
                        ) : (
                            /* Sub-Page Top Navigation Bar: Slim 1-line */
                            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-100 mb-4 flex items-center justify-between gap-2.5 w-full max-w-full box-border">
                                <Link
                                    href="/account"
                                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl transition shadow-md shadow-emerald-600/20 active:scale-95 shrink-0"
                                >
                                    <LayoutDashboard size={14} />
                                    <span>← Dashboard (ড্যাশবোর্ড)</span>
                                </Link>

                                {activeItem && (
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className={`w-7 h-7 rounded-lg ${activeItem.iconBg} flex items-center justify-center font-bold shrink-0`}>
                                            <activeItem.icon size={14} />
                                        </div>
                                        <span className="text-xs font-black text-slate-900 truncate">{activeItem.label}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Profile Completion Banner for Mobile (only on subpages) */}
                        {!isAccountHome && renderProfileCompletionBanner()}

                        {/* Main Content Area on Mobile (Always renders Dashboard on /account and page content on subpages) */}
                        <div className="bg-white rounded-2xl p-3.5 sm:p-6 shadow-xs border border-slate-100 w-full max-w-full box-border">
                            <main className="relative z-10 min-h-[400px]">
                                {children}
                            </main>
                        </div>

                        {/* Mobile Additional Account Options Grid (displayed on /account below Dashboard) */}
                        {isAccountHome && (
                            <div className="mt-4 bg-white rounded-2xl p-4 shadow-xs border border-slate-100 space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">অন্যান্য অ্যাকাউন্ট অপশন (More Options)</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {mobileNavItems.map((item, idx) => {
                                        const IconComp = item.icon;
                                        return (
                                            <Link
                                                key={idx}
                                                href={item.href}
                                                className={`flex items-center gap-2.5 p-2.5 rounded-xl ${item.cardBg} border ${item.cardBorder} shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all group`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}>
                                                    <IconComp size={15} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-extrabold text-xs text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                                                        {item.label}
                                                    </p>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>

                                <div className="pt-2 border-t border-slate-100">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl p-3 text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer"
                                    >
                                        <LogOut size={15} />
                                        <span>Logout (লগআউট)</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* ─── MAIN FOOTER & MOBILE NAV ─── */}
            <Footer />
            <MobileBottomNav />
        </div>
    );
}
