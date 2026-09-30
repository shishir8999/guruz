import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    Cake, Mail, Send, CheckCircle2, Bell, MessageCircle, 
    Smartphone, Search, Gift, Clock, Users, Filter, Check, Eye, Tag, AlertCircle,
    ExternalLink, ChevronRight
} from 'lucide-react';
import Swal from 'sweetalert2';

interface CustomerItem {
    id: number;
    name: string;
    email: string;
    phone: string;
    birthday: string | null;
    is_birthday_today: boolean;
    created_at: string;
}

interface LogItem {
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    title: string;
    body: string;
    created_at: string;
}

interface BirthdayWishesProps {
    dbCustomers?: CustomerItem[];
    settings?: Record<string, string>;
    recentLogs?: LogItem[];
    todayDate?: string;
}

type Language = 'bn' | 'en' | 'hi';

interface TemplateOption {
    id: string;
    label: string;
    icon: string;
    subject: string;
    message: string;
    couponDefault?: boolean;
}

const TEMPLATES: Record<Language, TemplateOption[]> = {
    bn: [
        {
            id: 'bn_warm',
            label: 'আন্তরিক শুভেচ্ছা',
            icon: '🌸',
            subject: '🎉 শুভ জন্মদিন, {{name}}!',
            message: 'প্রিয় {{name}},\n\nআপনার শুভ জন্মদিনে জানাই আন্তরিক শুভেচ্ছা ও অভিনন্দন! Guruz পরিবারের সাথে আপনার পথচলা আরও আনন্দময় হোক। এই বিশেষ দিনে আপনার জন্য রইল একরাশ শুভকামনা।\n\n— টিম Guruz',
            couponDefault: false,
        },
        {
            id: 'bn_offer',
            label: 'উপহার ও কুপন',
            icon: '🎁',
            subject: '🎁 শুভ জন্মদিন {{name}} — আপনার জন্য স্পেশাল {{discount_value}} উপহার!',
            message: 'প্রিয় {{name}},\n\nআপনার জন্মদিনের এই বিশেষ মুহূর্তে Guruz-এর পক্ষ থেকে শুভেচ্ছা ও আন্তরিক ভালোবাসা। আপনার কেনাকাটা আরও আনন্দময় করতে নিয়ে এলাম বিশেষ {{discount_value}} ডিসকাউন্ট কুপন কোড: {{coupon_code}}। কুপনটি আজই ব্যবহার করুন!\n\n— টিম Guruz',
            couponDefault: true,
        },
    ],
    en: [
        {
            id: 'en_warm',
            label: 'Warm Wishes',
            icon: '🌟',
            subject: '🎉 Happy Birthday, {{name}}!',
            message: 'Dear {{name}},\n\nWishing you a fantastic birthday filled with happiness, success, and good health! Thank you for being a valued member of the Guruz family. Enjoy your special day!\n\nBest Wishes,\nTeam Guruz',
            couponDefault: false,
        },
        {
            id: 'en_offer',
            label: 'Gift Coupon',
            icon: '🎁',
            subject: '🎁 Happy Birthday {{name}} — A Special {{discount_value}} Gift for You!',
            message: 'Dear {{name}},\n\nWishing you a wonderful birthday filled with joy and celebration! To celebrate your special day, we are delighted to offer you an exclusive {{discount_value}} discount with coupon code: {{coupon_code}}.\n\nEnjoy shopping your favorites today!\n\nBest Wishes,\nTeam Guruz',
            couponDefault: true,
        },
    ],
    hi: [
        {
            id: 'hi_warm',
            label: 'हार्दिक शुभकामनाएं',
            icon: '🌸',
            subject: '🎉 जन्मदिन की हार्दिक शुभकामनाएं, {{name}}!',
            message: 'प्रिय {{name}},\n\nआपको जन्मदिन की हार्दिक शुभकामनाएं और बहुत-बहुत बधाई! Guruz परिवार का एक महत्वपूर्ण और मूल्यवान हिस्सा बनने के लिए आपका धन्यवाद। आपका यह खास दिन खुशियों, सफलता और अच्छे स्वास्थ्य से भरा हो।\n\nशुभकामनाओं सहित,\nटीम Guruz',
            couponDefault: false,
        },
        {
            id: 'hi_offer',
            label: 'उपहार और कूपन',
            icon: '🎁',
            subject: '🎁 जन्मदिन मुबारक {{name}} — आपके लिए विशेष {{discount_value}} उपहार!',
            message: 'प्रिय {{name}},\n\nआपके जन्मदिन के इस पावन अवसर पर Guruz की ओर से ढेर सारा प्यार और शुभकामनाएं। आपके उत्सव को और भी खास बनाने के लिए हम लाए हैं विशेष {{discount_value}} डिस्काउंट कूपন कोड: {{coupon_code}}। आज ही अपनी मनपसंद खरीदारी करें!\n\nशुभकामनाओं सहित,\nटीम Guruz',
            couponDefault: true,
        },
    ],
};

export default function BirthdayWishes({ 
    dbCustomers = [], 
    settings = {}, 
    recentLogs = [], 
    todayDate = '' 
}: BirthdayWishesProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'today'>('all');
    const [selectedIds, setSelectedIds] = useState<number[]>(() => {
        // Pre-select customers whose birthday is today, or top 5 if none
        const todayOnes = dbCustomers.filter(c => c.is_birthday_today).map(c => c.id);
        if (todayOnes.length > 0) return todayOnes;
        return dbCustomers.slice(0, 5).map(c => c.id);
    });

    const [selectedLanguage, setSelectedLanguage] = useState<Language>('bn');
    const [selectedTemplate, setSelectedTemplate] = useState('bn_warm');
    const [subject, setSubject] = useState(TEMPLATES.bn[0].subject);
    const [message, setMessage] = useState(TEMPLATES.bn[0].message);
    
    // Coupon Settings
    const [includeCoupon, setIncludeCoupon] = useState(true);
    const [couponCode, setCouponCode] = useState('BDAYGIFT20');
    const [discountValue, setDiscountValue] = useState('20%');
    const [validityDays, setValidityDays] = useState('7');

    // Channels
    const [channelInApp, setChannelInApp] = useState(true);
    const [channelEmail, setChannelEmail] = useState(true);
    const [channelWhatsApp, setChannelWhatsApp] = useState(false);
    const [channelSMS, setChannelSMS] = useState(false);

    const [isSending, setIsSending] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    // WhatsApp Dispatch Hub State
    const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
    const [sentWhatsAppIds, setSentWhatsAppIds] = useState<number[]>([]);

    const formatWhatsAppNumber = (phoneStr: string | null | undefined): string => {
        if (!phoneStr) return '';
        let digits = phoneStr.replace(/[^0-9]/g, '');
        if (digits.startsWith('0088')) {
            digits = digits.substring(2);
        } else if (digits.startsWith('880')) {
            // already has international format
        } else if (digits.startsWith('01')) {
            digits = '88' + digits;
        } else if (digits.startsWith('1') && digits.length === 10) {
            digits = '880' + digits;
        }
        return digits;
    };

    const getPersonalizedMessage = (customer: CustomerItem): string => {
        return message
            .replace(/{{name}}|{customer_name}/g, customer.name || 'গ্রাহক')
            .replace(/{{discount_value}}|{discount_value}/g, discountValue || '20%')
            .replace(/{{coupon_code}}|{coupon_code}/g, couponCode || 'BDAYGIFT20');
    };

    const openWhatsAppForCustomer = (customer: CustomerItem) => {
        const cleanPhone = formatWhatsAppNumber(customer.phone);
        if (!cleanPhone || cleanPhone.length < 10) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'warning',
                title: `${customer.name}-এর কোনো বৈধ মোবাইল নম্বর নেই!`,
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }
        const personalizedText = getPersonalizedMessage(customer);
        const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(personalizedText)}`;
        window.open(url, '_blank');
        setSentWhatsAppIds(prev => prev.includes(customer.id) ? prev : [...prev, customer.id]);
    };

    // Filter customers list
    const filteredCustomers = useMemo(() => {
        return dbCustomers.filter(c => {
            if (activeTabFilter === 'today' && !c.is_birthday_today) return false;
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                c.name?.toLowerCase().includes(q) ||
                c.email?.toLowerCase().includes(q) ||
                c.phone?.includes(q) ||
                c.id.toString().includes(q)
            );
        });
    }, [dbCustomers, searchQuery, activeTabFilter]);

    const todayCount = useMemo(() => dbCustomers.filter(c => c.is_birthday_today).length, [dbCustomers]);

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredCustomers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredCustomers.map(c => c.id));
        }
    };

    const toggleCustomer = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectOnlyTodayBirthdays = () => {
        setActiveTabFilter('today');
        const todayOnes = dbCustomers.filter(c => c.is_birthday_today).map(c => c.id);
        setSelectedIds(todayOnes.length > 0 ? todayOnes : dbCustomers.map(c => c.id));
    };

    const handleLanguageChange = (lang: Language) => {
        setSelectedLanguage(lang);
        const tpl = TEMPLATES[lang][0];
        if (tpl) {
            setSelectedTemplate(tpl.id);
            setSubject(tpl.subject);
            setMessage(tpl.message);
            if (tpl.couponDefault !== undefined) {
                setIncludeCoupon(tpl.couponDefault);
            }
        }
    };

    const applyTemplate = (tplId: string) => {
        setSelectedTemplate(tplId);
        for (const lang of (['bn', 'en', 'hi'] as Language[])) {
            const found = TEMPLATES[lang].find(t => t.id === tplId);
            if (found) {
                setSubject(found.subject);
                setMessage(found.message);
                if (found.couponDefault !== undefined) {
                    setIncludeCoupon(found.couponDefault);
                }
                break;
            }
        }
    };

    const handleSendWishes = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedIds.length === 0) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'warning',
                title: 'শুভেচ্ছা পাঠাতে অন্তত ১ জন কাস্টমার সিলেক্ট করুন!',
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }

        const activeChannels: string[] = [];
        if (channelInApp) activeChannels.push('in_app');
        if (channelEmail) activeChannels.push('email');
        if (channelSMS) activeChannels.push('sms');
        if (channelWhatsApp) activeChannels.push('whatsapp');

        if (activeChannels.length === 0) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'warning',
                title: 'অন্তত একটি চ্যানেল (ইন-অ্যাপ, ইমেইল, WhatsApp বা SMS) সিলেক্ট করুন!',
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }

        setIsSending(true);

        router.post('/admin/users/birthdays/send', {
            user_ids: selectedIds,
            subject: subject,
            message: message,
            channels: activeChannels,
            language: selectedLanguage,
            coupon_code: includeCoupon ? couponCode : null,
            discount_value: includeCoupon ? discountValue : null,
            validity_days: validityDays ? parseInt(validityDays, 10) : 7,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSending(false);
                
                const selectedCustomers = dbCustomers.filter(c => selectedIds.includes(c.id));

                // If WhatsApp is active:
                if (channelWhatsApp) {
                    if (selectedCustomers.length === 1) {
                        openWhatsAppForCustomer(selectedCustomers[0]);
                    } else if (selectedCustomers.length > 1) {
                        setWhatsAppModalOpen(true);
                    }
                }

                Swal.fire({
                    icon: 'success',
                    title: '🎉 জন্মদিনের শুভেচ্ছা সফলভাবে পাঠানো হয়েছে!',
                    html: `
                        <div style="text-align: left; font-size: 13px; line-height: 1.6; margin-top: 8px;">
                            <p style="margin: 4px 0; color: #0f172a;">✔ কাস্টমার সংখ্যা: <strong>${selectedIds.length} জন</strong></p>
                            <p style="margin: 4px 0; color: #059669;">✔ ইন-অ্যাপ নোটিফিকেশন: <strong>${channelInApp ? 'সরাসরি Customer ID নোটিফিকেশনে সেন্ড হয়েছে' : 'বন্ধ'}</strong></p>
                            <p style="margin: 4px 0; color: #2563eb;">✔ ইমেইল: <strong>${channelEmail ? 'কাস্টমারের Gmail/ইনবক্সে ডেলিভারি পাঠানো হয়েছে' : 'বন্ধ'}</strong></p>
                            ${channelWhatsApp ? `<p style="margin: 4px 0; color: #0d9488;">✔ WhatsApp: <strong>${selectedCustomers.length > 1 ? 'মেসেজিং হাব ওপেন হয়েছে (প্রতিটি ১-ক্লিকে পাঠানো যাবে)' : 'WhatsApp উইন্ডো ওপেন হয়েছে'}</strong></p>` : ''}
                            ${channelSMS ? `<p style="margin: 4px 0; color: #d97706;">✔ SMS: <strong>গেটওয়েতে পাঠানো হয়েছে</strong></p>` : ''}
                            ${includeCoupon ? `<p style="margin: 4px 0; color: #7c3aed;">✔ কুপন কোড: <strong>${couponCode} (${discountValue})</strong></p>` : ''}
                        </div>
                    `,
                    confirmButtonText: (channelWhatsApp && selectedCustomers.length > 1) ? 'WhatsApp বার্তাগুলো চেক করুন' : 'ঠিক আছে',
                    confirmButtonColor: '#10b981',
                    customClass: { popup: 'rounded-3xl p-6' }
                });
            },
            onError: (errors) => {
                setIsSending(false);
                Swal.fire({
                    icon: 'error',
                    title: 'শুভেচ্ছা পাঠাতে সমস্যা হয়েছে',
                    text: Object.values(errors).join(', ') || 'অনুগ্রহ করে পুনরায় চেষ্টা করুন।',
                    confirmButtonColor: '#ef4444'
                });
            }
        });
    };

    return (
        <>
            <Head title="Birthday Wish & Customer Greetings — Admin Panel" />

            <div className="space-y-6 max-w-full pb-12">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-600 text-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-white shrink-0 shadow-inner">
                            <Cake className="w-8 h-8 text-yellow-300 animate-bounce" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur text-[11px] font-black uppercase tracking-wider mb-1">
                                <Gift className="w-3 h-3 text-yellow-300" />
                                লাইভ বার্থডে গ্রিটিংস হাব
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Birthday Wishes & Automated Greetings</h1>
                            <p className="text-xs font-semibold text-purple-100 opacity-95 mt-1">
                                {todayDate ? `আজকের তারিখ: ${todayDate}` : 'আজকের বিশেষ দিনে কাস্টমারদের ইন-অ্যাপ নোটিফিকেশন ও জিমেইলে শুভেচ্ছা ও কুপন উপহার পাঠান।'}
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats Badges */}
                    <div className="flex items-center gap-3 relative z-10 flex-wrap">
                        <div className="bg-white/15 backdrop-blur border border-white/20 px-4 py-2.5 rounded-2xl text-center">
                            <div className="text-[10px] uppercase font-bold text-purple-200">আজকের জন্মদিন</div>
                            <div className="text-xl font-black text-yellow-300">{todayCount} জন</div>
                        </div>
                        <div className="bg-white/15 backdrop-blur border border-white/20 px-4 py-2.5 rounded-2xl text-center">
                            <div className="text-[10px] uppercase font-bold text-purple-200">মোট কাস্টমার</div>
                            <div className="text-xl font-black text-white">{dbCustomers.length}</div>
                        </div>
                    </div>

                    {/* Background decorative elements */}
                    <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT COLUMN: Customer Selection Hub (7 Cols) */}
                    <div className="xl:col-span-7 space-y-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                            
                            {/* Card Header & Tabs */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <Users className="w-5 h-5 text-indigo-600" />
                                        কাস্টমার নির্বাচন করুন ({selectedIds.length} জন নির্বাচিত)
                                    </h2>
                                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                                        যাদের শুভেচ্ছা পাঠাতে চান তাদের টিক দিন অথবা সার্চ করুন
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTabFilter('all')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                            activeTabFilter === 'all'
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                        }`}
                                    >
                                        সকল কাস্টমার ({dbCustomers.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={selectOnlyTodayBirthdays}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                            activeTabFilter === 'today'
                                                ? 'bg-pink-600 text-white shadow-xs'
                                                : 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 hover:bg-pink-100'
                                        }`}
                                    >
                                        🎂 আজকের জন্মদিন ({todayCount})
                                    </button>
                                </div>
                            </div>

                            {/* Search & Select All Bar */}
                            <div className="flex items-center gap-3 my-4">
                                <div className="relative flex-1">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Customer ID (#101), নাম, জিমেইল বা ফোন নম্বর দিয়ে খুঁজুন..."
                                        className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={toggleSelectAll}
                                    className="px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition shrink-0 cursor-pointer"
                                >
                                    {selectedIds.length === filteredCustomers.length && filteredCustomers.length > 0 ? 'সব আনসিলেক্ট' : 'সব সিলেক্ট করুন'}
                                </button>
                            </div>

                            {/* Customer List Table */}
                            <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-1">
                                {filteredCustomers.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400">
                                        <Cake className="w-12 h-12 mx-auto text-slate-300 mb-2 opacity-50" />
                                        <p className="text-xs font-bold">কোনো কাস্টমার পাওয়া যায়নি</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left text-xs">
                                        <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider z-10">
                                            <tr>
                                                <th className="p-3 w-10">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.length > 0 && selectedIds.length === filteredCustomers.length}
                                                        onChange={toggleSelectAll}
                                                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                    />
                                                </th>
                                                <th className="p-3">Customer ID & Name</th>
                                                <th className="p-3">Email (Gmail)</th>
                                                <th className="p-3">Phone</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3 text-right">হোয়াটসঅ্যাপ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                            {filteredCustomers.map((c) => {
                                                const isSelected = selectedIds.includes(c.id);
                                                return (
                                                    <tr
                                                        key={c.id}
                                                        onClick={() => toggleCustomer(c.id)}
                                                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer ${
                                                            isSelected ? 'bg-indigo-50/60 dark:bg-indigo-950/20' : ''
                                                        }`}
                                                    >
                                                        <td className="p-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => {}} // handled by tr onClick
                                                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                            />
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                                                                    {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                                        <span>{c.name}</span>
                                                                        <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded text-slate-500">
                                                                            #{c.id}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-[11px] text-slate-400">
                                                                        জয়েনিং: {c.created_at}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                                                            {c.email || 'N/A'}
                                                        </td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                                                            {c.phone || 'N/A'}
                                                        </td>
                                                        <td className="p-3">
                                                            {c.is_birthday_today ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 animate-pulse">
                                                                    🎂 আজকের জন্মদিন
                                                                </span>
                                                            ) : c.birthday ? (
                                                                <span className="text-slate-500 text-[11px]">
                                                                    {c.birthday}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400 text-[10px]">
                                                                    রেগুলার কাস্টমার
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                type="button"
                                                                onClick={() => openWhatsAppForCustomer(c)}
                                                                title="সরাসরি WhatsApp-এ জন্মদিনের শুভেচ্ছা পাঠান"
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-600 hover:text-white transition shadow-xs cursor-pointer"
                                                            >
                                                                <MessageCircle className="w-3.5 h-3.5 text-teal-600 group-hover:text-white" />
                                                                <span>WhatsApp</span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* Recent Sent Log Card */}
                        {recentLogs.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                                    <Clock className="w-4 h-4 text-purple-600" />
                                    সম্প্রতি পাঠানো জন্মদিনের শুভেচ্ছার ইতিহাস
                                </h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                                    {recentLogs.map((log) => (
                                        <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-between gap-3 border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-xl bg-pink-100 dark:bg-pink-900/50 text-pink-600 flex items-center justify-center shrink-0">
                                                    <Cake className="w-3.5 h-3.5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white">
                                                        {log.user_name} <span className="text-slate-400 font-mono text-[10px]">#{log.user_id}</span>
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 truncate max-w-xs">{log.title}</div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                                                {log.created_at}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Greeting Composer & Multi-Channel Dispatch (5 Cols) */}
                    <div className="xl:col-span-5 space-y-4">
                        <form onSubmit={handleSendWishes} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-5">
                            
                            {/* Card Title */}
                            <div>
                                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <Send className="w-5 h-5 text-indigo-600" />
                                    শুভেচ্ছা বার্তা ও চ্যানেল নির্বাচন
                                </h2>
                                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                                    কাস্টমারের Customer ID ও Gmail-এ বার্তা পৌঁছাবে
                                </p>
                            </div>

                            {/* Language Selector */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                                        শুভেচ্ছার ভাষা (Select Language)
                                    </label>
                                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                                        ৩টি ভাষায় পাঠানো যাবে
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleLanguageChange('bn')}
                                        className={`p-2.5 rounded-2xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                                            selectedLanguage === 'bn'
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                                                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        <span className="text-base">🇧🇩</span>
                                        <span>বাংলা</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleLanguageChange('en')}
                                        className={`p-2.5 rounded-2xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                                            selectedLanguage === 'en'
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                                                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        <span className="text-base">🇬🇧</span>
                                        <span>English</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleLanguageChange('hi')}
                                        className={`p-2.5 rounded-2xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                                            selectedLanguage === 'hi'
                                                ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-500/20'
                                                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        <span className="text-base">🇮🇳</span>
                                        <span>हिन्दी</span>
                                    </button>
                                </div>
                            </div>

                            {/* Template Presets for Selected Language */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                                    রেডিমেড টেমপ্লেট নির্বাচন করুন ({selectedLanguage === 'bn' ? 'বাংলা' : selectedLanguage === 'en' ? 'English' : 'हिन्दी'})
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {TEMPLATES[selectedLanguage].map((tpl) => (
                                        <button
                                            key={tpl.id}
                                            type="button"
                                            onClick={() => applyTemplate(tpl.id)}
                                            className={`p-2.5 rounded-2xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                                selectedTemplate === tpl.id
                                                    ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20'
                                                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            <span>{tpl.icon}</span>
                                            <span>{tpl.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Subject Field */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    বার্তার বিষয় (Email Subject / Title)
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    required
                                    placeholder="🎉 শুভ জন্মদিন, {{name}}!"
                                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold dark:text-white"
                                />
                            </div>

                            {/* Message Body Field */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        শুভেচ্ছা বার্তা (Message Body)
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        ট্যাগ: &#123;&#123;name&#125;&#125;, &#123;&#123;id&#125;&#125;, &#123;&#123;coupon_code&#125;&#125;
                                    </span>
                                </div>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                    rows={4}
                                    className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed dark:text-white"
                                />
                            </div>

                            {/* Delivery Channels */}
                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                                    ডেলিভারি চ্যানেল সমূহ (Active Channels)
                                </label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    
                                    {/* In-App Notification */}
                                    <label className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition ${
                                        channelInApp 
                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-300' 
                                            : 'border-slate-200 dark:border-slate-700 text-slate-500'
                                    }`}>
                                        <input
                                            type="checkbox"
                                            checked={channelInApp}
                                            onChange={(e) => setChannelInApp(e.target.checked)}
                                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                        />
                                        <div className="text-xs">
                                            <div className="font-bold flex items-center gap-1">
                                                <Bell className="w-3.5 h-3.5 text-emerald-600" />
                                                In-App নোটিফিকেশন
                                            </div>
                                            <div className="text-[10px] text-slate-400">কাস্টমার আইডি ইনবক্সে</div>
                                        </div>
                                    </label>

                                    {/* Email (Gmail) */}
                                    <label className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition ${
                                        channelEmail 
                                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-300' 
                                            : 'border-slate-200 dark:border-slate-700 text-slate-500'
                                    }`}>
                                        <input
                                            type="checkbox"
                                            checked={channelEmail}
                                            onChange={(e) => setChannelEmail(e.target.checked)}
                                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        />
                                        <div className="text-xs">
                                            <div className="font-bold flex items-center gap-1">
                                                <Mail className="w-3.5 h-3.5 text-blue-600" />
                                                Gmail / ইমেইল
                                            </div>
                                            <div className="text-[10px] text-slate-400">কাস্টমারের জিমেইলে</div>
                                        </div>
                                    </label>

                                    {/* WhatsApp */}
                                    <label className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition ${
                                        channelWhatsApp 
                                            ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-900 dark:text-teal-300' 
                                            : 'border-slate-200 dark:border-slate-700 text-slate-500'
                                    }`}>
                                        <input
                                            type="checkbox"
                                            checked={channelWhatsApp}
                                            onChange={(e) => setChannelWhatsApp(e.target.checked)}
                                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                                        />
                                        <div className="text-xs">
                                            <div className="font-bold flex items-center gap-1">
                                                <MessageCircle className="w-3.5 h-3.5 text-teal-600" />
                                                WhatsApp বার্তা
                                            </div>
                                            <div className="text-[10px] text-slate-400">ফোন নম্বরে ওয়ান-ক্লিক</div>
                                        </div>
                                    </label>

                                    {/* SMS */}
                                    <label className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition ${
                                        channelSMS 
                                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-300' 
                                            : 'border-slate-200 dark:border-slate-700 text-slate-500'
                                    }`}>
                                        <input
                                            type="checkbox"
                                            checked={channelSMS}
                                            onChange={(e) => setChannelSMS(e.target.checked)}
                                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                                        />
                                        <div className="text-xs">
                                            <div className="font-bold flex items-center gap-1">
                                                <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                                                SMS গেটওয়ে
                                            </div>
                                            <div className="text-[10px] text-slate-400">সরাসরি মোবাইলে</div>
                                        </div>
                                    </label>

                                </div>
                            </div>

                            {/* Birthday Gift Coupon Settings */}
                            <div className="bg-purple-50/60 dark:bg-purple-950/30 p-4 rounded-2xl border border-purple-200 dark:border-purple-800/60 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Gift className="w-4 h-4 text-purple-600" />
                                        <span className="text-xs font-bold text-purple-900 dark:text-purple-300">
                                            জন্মদিনের স্পেশাল কুপন উপহার
                                        </span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={includeCoupon}
                                        onChange={(e) => setIncludeCoupon(e.target.checked)}
                                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                                    />
                                </div>

                                {includeCoupon && (
                                    <div className="grid grid-cols-3 gap-2.5 pt-1">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">কুপন কোড</label>
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 rounded-xl font-bold uppercase text-purple-700 dark:text-purple-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">ডিসকাউন্ট</label>
                                            <input
                                                type="text"
                                                value={discountValue}
                                                onChange={(e) => setDiscountValue(e.target.value)}
                                                placeholder="20% বা 200৳"
                                                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 rounded-xl font-bold text-slate-800 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">মেয়াদ (দিন)</label>
                                            <input
                                                type="number"
                                                value={validityDays}
                                                onChange={(e) => setValidityDays(e.target.value)}
                                                min={1}
                                                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 rounded-xl font-bold text-slate-800 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submit & Action Buttons */}
                            <div className="pt-2 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPreviewModal(true)}
                                    className="px-4 py-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition flex items-center justify-center gap-1.5 cursor-pointer text-xs shrink-0"
                                >
                                    <Eye className="w-4 h-4" />
                                    <span>প্রিভিউ</span>
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSending || selectedIds.length === 0}
                                    className="flex-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
                                >
                                    <Send className="w-4 h-4" />
                                    {isSending 
                                        ? 'শুভেচ্ছা পাঠানো হচ্ছে...' 
                                        : `নির্বাচিত ${selectedIds.length} জনকে শুভেচ্ছা পাঠান`}
                                </button>
                            </div>

                        </form>
                    </div>

                </div>

            </div>

            {/* Live Preview Modal */}
            {showPreviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                            <div className="flex items-center gap-2">
                                <Eye className="w-5 h-5 text-indigo-600" />
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        ইমেইল লাইভ প্রিভিউ ({selectedLanguage === 'bn' ? '🇧🇩 বাংলা' : selectedLanguage === 'en' ? '🇬🇧 English' : '🇮🇳 हिन्दी'})
                                    </h3>
                                    <p className="text-[11px] text-slate-400">গ্রাহকের ইনবক্সে ঠিক যেভাবে ইমেইলটি প্রদর্শিত হবে</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPreviewModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center cursor-pointer transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Subject preview */}
                        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl mb-4 border border-slate-200 dark:border-slate-700 text-xs">
                            <span className="font-bold text-slate-500 mr-2">বিষয় (Subject):</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {subject.replace(/{{name}}|{customer_name}/g, 'Guruznet Moha').replace(/{{discount_value}}|{discount_value}/g, discountValue || '20%')}
                            </span>
                        </div>

                        {/* Visual Email Card */}
                        <div className="rounded-2xl overflow-hidden border border-pink-200 dark:border-pink-900 shadow-sm bg-[#fdf2f8]">
                            {/* Banner Header */}
                            <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 text-white text-center py-6 px-4">
                                <div className="text-3xl mb-1">🎂🎉🎈</div>
                                <h4 className="text-xl font-black">
                                    {selectedLanguage === 'bn' ? 'শুভ জন্মদিন!' : selectedLanguage === 'en' ? 'Happy Birthday!' : 'जन्मदिन मुबारक!'}
                                </h4>
                                <p className="text-xs text-pink-100 font-medium mt-1">
                                    {selectedLanguage === 'bn' 
                                        ? 'Guruz BD-এর পক্ষ থেকে জন্মদিনের শুভেচ্ছা' 
                                        : selectedLanguage === 'en' 
                                        ? 'Warm Birthday Wishes from Guruz BD' 
                                        : 'Guruz BD की ओर से हार्दिक शुभकामनाएं'}
                                </p>
                            </div>

                            {/* Body Card */}
                            <div className="bg-white p-5 text-slate-800">
                                <div className="text-xs leading-relaxed whitespace-pre-line text-slate-700 font-normal">
                                    {message
                                        .replace(/{{name}}|{customer_name}/g, 'Guruznet Moha')
                                        .replace(/{{coupon_code}}|{coupon_code}/g, couponCode || 'BDAYGIFT20')
                                        .replace(/{{discount_value}}|{discount_value}/g, discountValue || '20%')}
                                </div>

                                {includeCoupon && (
                                    <div className="mt-4 p-4 rounded-xl bg-purple-50 border-2 border-dashed border-purple-300 text-center">
                                        <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wide">
                                            {selectedLanguage === 'bn' 
                                                ? `🎁 আপনার জন্মদিনের বিশেষ কুপন উপহার (${discountValue || '20%'} ডিসকাউন্ট উপহার)`
                                                : selectedLanguage === 'en'
                                                ? `🎁 Special Birthday Gift Coupon (${discountValue || '20%'} Discount Gift)`
                                                : `🎁 आपके जन्मदिन का विशेष उपहार कूपन (${discountValue || '20%'} छूट उपहार)`}
                                        </div>
                                        <div className="inline-block bg-purple-600 text-white font-mono font-black text-lg px-4 py-1.5 rounded-lg my-2 tracking-wider shadow-xs">
                                            {couponCode || 'BDAYGIFT20'}
                                        </div>
                                        <p className="text-[11px] text-purple-600 m-0">
                                            {selectedLanguage === 'bn' 
                                                ? 'চেকআউট করার সময় কুপন কোডটি ব্যবহার করে ডিসকাউন্ট উপভোগ করুন!'
                                                : selectedLanguage === 'en'
                                                ? 'Use this coupon code at checkout to claim your birthday discount!'
                                                : 'चेकआउट करते समय इस कूपन कोड का उपयोग करके छूट का लाभ उठाएं!'}
                                        </p>
                                    </div>
                                )}

                                <div className="text-center mt-5 mb-2">
                                    <button 
                                        type="button"
                                        className="bg-emerald-600 text-white text-xs font-bold py-2.5 px-6 rounded-xl shadow-md inline-block cursor-default"
                                    >
                                        {selectedLanguage === 'bn' 
                                            ? '🛍️ কেনাকাটা শুরু করুন (Shop Now)' 
                                            : selectedLanguage === 'en' 
                                            ? '🛍️ Shop Now' 
                                            : '🛍️ अभी खरीदारी करें (Shop Now)'}
                                    </button>
                                </div>

                                <div className="text-[10px] text-slate-400 text-center mt-4 pt-3 border-t border-slate-100">
                                    {selectedLanguage === 'bn' 
                                        ? 'যেকোনো প্রয়োজনে আমাদের সাপোর্ট হেল্পলাইন: 01700000000'
                                        : selectedLanguage === 'en'
                                        ? 'Need assistance? Our support helpline: 01700000000'
                                        : 'किसी भी सहायता के लिए हमारी सपोर्ट हेल्पलाइन: 01700000000'}
                                </div>
                            </div>
                        </div>

                        {/* Close button */}
                        <div className="mt-4 pt-2 text-right">
                            <button
                                type="button"
                                onClick={() => setShowPreviewModal(false)}
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
                            >
                                বন্ধ করুন
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* WhatsApp Messaging Hub Modal */}
            {whatsAppModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-teal-50/50 dark:bg-teal-950/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-md">
                                        <MessageCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                            <span>WhatsApp ডিসপ্যাচ হাব</span>
                                            <span className="text-xs bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 font-bold px-2 py-0.5 rounded-full">
                                                {selectedIds.length} জন নির্বাচিত
                                            </span>
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            ব্রাউজারের পপআপ বিধিনিষেধের কারণে প্রতি গ্রাহককে ১-ক্লিকে বার্তা পাঠানো নিশ্চিত করুন
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setWhatsAppModalOpen(false)}
                                    className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 font-bold flex items-center justify-center cursor-pointer transition shadow-xs"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Progress bar */}
                            <div className="mt-4">
                                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                                    <span>বার্তা পাঠানোর অগ্রগতি</span>
                                    <span>
                                        {dbCustomers.filter(c => selectedIds.includes(c.id) && sentWhatsAppIds.includes(c.id)).length} / {selectedIds.length} সম্পন্ন
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-teal-500 h-full transition-all duration-300 rounded-full"
                                        style={{ 
                                            width: `${(dbCustomers.filter(c => selectedIds.includes(c.id) && sentWhatsAppIds.includes(c.id)).length / (selectedIds.length || 1)) * 100}%` 
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Customer List */}
                        <div className="p-6 overflow-y-auto max-h-[50vh] space-y-3">
                            {dbCustomers.filter(c => selectedIds.includes(c.id)).map((customer, idx) => {
                                const isSent = sentWhatsAppIds.includes(customer.id);
                                const hasPhone = !!customer.phone && customer.phone !== 'N/A';
                                
                                return (
                                    <div 
                                        key={customer.id}
                                        className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 ${
                                            isSent 
                                                ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60' 
                                                : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-xs shrink-0">
                                                {idx + 1}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 truncate">
                                                    <span>{customer.name}</span>
                                                    <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500">
                                                        #{customer.id}
                                                    </span>
                                                    {isSent && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                                                            <Check className="w-3 h-3" /> পাঠানো হয়েছে
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                                                    <span>{customer.phone || 'ফোন নম্বর নেই'}</span>
                                                    {!hasPhone && (
                                                        <span className="text-[10px] text-rose-500 font-sans font-bold">
                                                            (নম্বর নেই)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => openWhatsAppForCustomer(customer)}
                                            disabled={!hasPhone}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed ${
                                                isSent 
                                                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200' 
                                                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                                            }`}
                                        >
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            <span>{isSent ? 'আবার পাঠান' : 'WhatsApp-এ পাঠান'}</span>
                                            <ExternalLink className="w-3 h-3 opacity-70" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                            {(() => {
                                const unsentCustomers = dbCustomers.filter(c => selectedIds.includes(c.id) && !sentWhatsAppIds.includes(c.id) && c.phone && c.phone !== 'N/A');
                                return (
                                    <>
                                        {unsentCustomers.length > 0 ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (unsentCustomers[0]) {
                                                        openWhatsAppForCustomer(unsentCustomers[0]);
                                                    }
                                                }}
                                                className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                                            >
                                                <span>পরবর্তী কাস্টমারকে পাঠান ({unsentCustomers[0].name})</span>
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-4 h-4" />
                                                সবাইকে WhatsApp বার্তা পাঠানো সম্পন্ন হয়েছে!
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setWhatsAppModalOpen(false)}
                                            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer ml-auto"
                                        >
                                            সম্পন্ন / বন্ধ করুন
                                        </button>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
