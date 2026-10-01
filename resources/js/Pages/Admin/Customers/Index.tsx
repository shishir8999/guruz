import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { 
    Users, Search, Download, ShieldBan, CheckCircle2, UserX, X, LogIn, Trash2, Clock, Eye,
    Laptop, Smartphone, Tablet, MapPin, LogOut, Gift, XCircle, Edit3
} from 'lucide-react';
import { SiWhatsapp } from '@icons-pack/react-simple-icons';
import Swal from 'sweetalert2';
import BonusCouponMessageModal, { BonusCouponMessageData } from '@/Components/BonusCouponMessageModal';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'blocked' | 'suspended';
    created_at: string;
    created_at_date?: string;
    created_at_time?: string;
    created_at_full?: string;
    last_login_at: string | null;
    admin_seen_at?: string | null;
    is_new?: boolean;
    orders_count: number;
    total_spent: number;
    roles?: string[];
    device?: string;
    ip_address?: string;
    location?: string;
    login_count?: number;
    logout_count?: number;
    bonus_coupon_enabled?: boolean;
}

interface Pagination {
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export default function CustomerManagement({ customers, counts, filters, bonus_coupon_message }: { 
    customers?: { data: Customer[] } & Pagination,
    counts?: { all: number; customer: number; vendor: number; admin: number; new_today?: number },
    filters?: { search?: string; status?: string; role?: string },
    bonus_coupon_message?: BonusCouponMessageData,
}) {
    const customerData = customers?.data || [];
    const [search, setSearch] = useState(filters?.search || '');
    const [activeRole, setActiveRole] = useState(filters?.role || 'all');
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [currentCouponMessage, setCurrentCouponMessage] = useState<BonusCouponMessageData | undefined>(bonus_coupon_message);

    // 🟢 New user highlight and automatic fade management
    const [unseenIds, setUnseenIds] = useState<Set<number>>(() => {
        return new Set(customerData.filter(u => u.is_new).map(u => u.id));
    });
    const [isFading, setIsFading] = useState(false);
    const markSeenTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (unseenIds.size === 0) return;

        // Auto-fade after 5 seconds of viewing the new users
        markSeenTimeoutRef.current = setTimeout(() => {
            setIsFading(true);

            // Notify backend that admin has seen the new users
            fetch('/api/admin/customers/mark-seen', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({}),
            }).then(() => {
                setTimeout(() => {
                    setUnseenIds(new Set());
                    setIsFading(false);
                }, 1200);
            }).catch(err => console.error('Mark seen error:', err));
        }, 5000);

        return () => {
            if (markSeenTimeoutRef.current) {
                clearTimeout(markSeenTimeoutRef.current);
            }
        };
    }, []);

    const handleMarkAllSeenNow = () => {
        setIsFading(true);
        fetch('/api/admin/customers/mark-seen', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({}),
        }).then(() => {
            setTimeout(() => {
                setUnseenIds(new Set());
                setIsFading(false);
            }, 500);
        }).catch(err => console.error('Mark seen error:', err));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/customers', { search, role: activeRole === 'all' ? '' : activeRole }, { preserveState: true });
    };

    const handleFilter = (roleKey: string) => {
        setActiveRole(roleKey);
        router.get('/admin/customers', { search, role: roleKey === 'all' ? '' : roleKey }, { preserveState: true });
    };

    const handleStatusUpdate = (user: Customer, newStatus: string) => {
        Swal.fire({
            title: 'Change Customer Status?',
            text: `Are you sure you want to change the status to "${newStatus}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Change',
            cancelButtonText: 'No, Cancel',
        }).then(result => {
            if (result.isConfirmed) {
                router.put(`/admin/customers/${user.id}/status`, { status: newStatus }, { preserveScroll: true });
            }
        });
    };

    const handleToggleRole = (userId: number, roleName: string) => {
        router.put(`/admin/users/${userId}/role`, { role: roleName }, { preserveScroll: true });
    };

    const handleLoginAs = (userId: number) => {
        router.post(`/admin/users/${userId}/impersonate`);
    };

    const handleDelete = (userId: number) => {
        Swal.fire({
            title: 'Delete Customer?',
            text: 'Are you sure you want to delete this customer? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'No, Cancel',
        }).then(result => {
            if (result.isConfirmed) {
                router.delete(`/admin/users/${userId}`);
            }
        });
    };

    const [couponStatuses, setCouponStatuses] = useState<Record<number, boolean>>(() => {
        const map: Record<number, boolean> = {};
        customerData.forEach(u => {
            map[u.id] = u.bonus_coupon_enabled ?? true;
        });
        return map;
    });

    useEffect(() => {
        setCouponStatuses(() => {
            const map: Record<number, boolean> = {};
            customerData.forEach(u => {
                map[u.id] = u.bonus_coupon_enabled ?? true;
            });
            return map;
        });
    }, [customers]);

    const handleToggleBonusCoupon = async (userId: number) => {
        const currentVal = couponStatuses[userId] ?? true;
        const newVal = !currentVal;
        
        // Optimistic UI update
        setCouponStatuses(prev => ({ ...prev, [userId]: newVal }));

        try {
            const res = await axios.post(`/admin/customers/${userId}/toggle-bonus-coupon`, { enabled: newVal });

            if (res.data && res.data.success) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: newVal ? 'বোনাস কুপন চালু করা হয়েছে!' : 'বোনাস কুপন বন্ধ করা হয়েছে!',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
            } else {
                setCouponStatuses(prev => ({ ...prev, [userId]: currentVal }));
                Swal.fire('Error', res.data?.message || 'কুপন স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি।', 'error');
            }
        } catch (err: any) {
            setCouponStatuses(prev => ({ ...prev, [userId]: currentVal }));
            Swal.fire('Error', err?.response?.data?.message || 'কুপন স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি।', 'error');
        }
    };

    const handleBulkBonusCoupon = (enableAll: boolean) => {
        Swal.fire({
            title: enableAll ? 'সব কুপন অন করবেন?' : 'সব কুপন বন্ধ করবেন?',
            text: enableAll 
                ? 'এক ক্লিকে সকল ইউজারের জন্য বোনাস কুপন চালু হয়ে যাবে।' 
                : 'এক ক্লিকে সকল ইউজারের বোনাস কুপন বন্ধ হয়ে যাবে।',
            icon: enableAll ? 'question' : 'warning',
            showCancelButton: true,
            confirmButtonColor: enableAll ? '#16a34a' : '#e11d48',
            cancelButtonColor: '#64748b',
            confirmButtonText: enableAll ? 'হ্যাঁ, সব অন করুন' : 'হ্যাঁ, সব বন্ধ করুন',
            cancelButtonText: 'বাতিল'
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Optimistic UI update
                setCouponStatuses(prev => {
                    const next = { ...prev };
                    customerData.forEach(u => {
                        next[u.id] = enableAll;
                    });
                    return next;
                });

                try {
                    const res = await axios.post('/admin/customers/bulk-bonus-coupon', { enabled: enableAll });

                    if (res.data && res.data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: enableAll ? 'সব কুপন চালু সফল!' : 'সব কুপন বন্ধ সফল!',
                            text: enableAll ? 'সকল ইউজারের জন্য বোনাস কুপন সফলভাবে অন করা হয়েছে।' : 'সকল ইউজারের জন্য বোনাস কুপন সফলভাবে অফ করা হয়েছে।',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    } else {
                        router.reload();
                    }
                } catch (err) {
                    router.reload();
                    Swal.fire('Error', 'সকল কুপন পরিবর্তন করতে সমস্যা হয়েছে।', 'error');
                }
            }
        });
    };

    const totalCount = counts?.all ?? customers?.total ?? customerData.length;
    const customerCount = counts?.customer ?? totalCount;
    const vendorCount = counts?.vendor ?? 5;
    const adminCount = counts?.admin ?? 4;
    const newTodayCount = counts?.new_today ?? unseenIds.size;

    return (
        <>
            <Head title="Admin Panel — Customer Management" />

            <div className="space-y-4">
                
                {/* Header Title + Search Bar matching Users page style */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                        Users ({totalCount})
                    </h1>

                    {/* Search Input Bar & Master Bulk Controls */}
                    <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
                        {/* 1-Click Master Bulk Coupon Controls */}
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 p-1 rounded-xl shadow-2xs">
                            <span className="text-[11px] font-black text-slate-500 px-1.5 flex items-center gap-1">
                                <Gift className="w-3.5 h-3.5 text-indigo-600" />
                                <span>কুপন মাস্টার:</span>
                            </span>
                            <button
                                type="button"
                                onClick={() => handleBulkBonusCoupon(true)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs active:scale-95"
                                title="এক ক্লিকে সকল ইউজারের বোনাস কুপন চালু করুন"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>সব অন</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleBulkBonusCoupon(false)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer bg-rose-600 hover:bg-rose-700 text-white shadow-2xs active:scale-95"
                                title="এক ক্লিকে সকল ইউজারের বোনাস কুপন বন্ধ করুন"
                            >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>সব বন্ধ</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsMessageModalOpen(true)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 shadow-2xs active:scale-95 ml-0.5"
                                title="কাস্টমার ড্যাশবোর্ডে প্রদর্শিত বোনাস কুপন বার্তা এডিট করুন"
                            >
                                <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                                <span>বার্তা এডিট</span>
                            </button>
                        </div>

                        <div className="w-full md:w-56">
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch(e)}
                                placeholder="Search name, phone, id..."
                                className="w-full bg-white border border-slate-200/80 rounded-xl px-4 py-2 text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
                            />
                        </div>
                        <a
                            href={`/admin/customers/export?search=${search}&role=${activeRole}`}
                            target="_blank"
                            className="bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 font-bold text-xs px-4 py-2 rounded-xl shadow-2xs transition flex items-center gap-2 whitespace-nowrap"
                        >
                            <Download className="w-4 h-4 text-slate-500" /> Export
                        </a>
                    </div>
                </div>

                {/* Filter Pills matching screenshot */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => handleFilter('all')}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                            activeRole === 'all' || activeRole === ''
                                ? 'bg-[#16a34a] text-white shadow-2xs'
                                : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        all ({totalCount})
                    </button>

                    {newTodayCount > 0 && (
                        <button
                            onClick={() => handleFilter('new_today')}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                                activeRole === 'new_today'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                            }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                            নতুন ইউজার ({newTodayCount})
                        </button>
                    )}

                    <button
                        onClick={() => handleFilter('customer')}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                            activeRole === 'customer'
                                ? 'bg-[#16a34a] text-white shadow-2xs'
                                : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        customer ({customerCount})
                    </button>

                    <button
                        onClick={() => handleFilter('vendor')}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                            activeRole === 'vendor'
                                ? 'bg-[#16a34a] text-white shadow-2xs'
                                : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        vendor ({vendorCount})
                    </button>

                    <button
                        onClick={() => handleFilter('admin')}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                            activeRole === 'admin'
                                ? 'bg-[#16a34a] text-white shadow-2xs'
                                : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        admin ({adminCount})
                    </button>
                </div>

                {/* Light Green Alert Banner if there are unseen new users */}
                {unseenIds.size > 0 && !isFading && (
                    <div className="flex items-center justify-between p-3 px-4 bg-emerald-50/90 border border-emerald-200/90 rounded-2xl text-xs text-emerald-900 font-medium transition-all duration-1000">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-2.5 w-2.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span>
                                <strong>{unseenIds.size} জন নতুন ইউজার</strong> যুক্ত হয়েছেন (হালকা সবুজ টোনে চিহ্নিত)। ৫ সেকেন্ড পর স্বয়ংক্রিয়ভাবে স্বাভাবিক হয়ে যাবে।
                            </span>
                        </div>
                        <button
                            onClick={handleMarkAllSeenNow}
                            className="px-3 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold transition cursor-pointer shadow-2xs whitespace-nowrap"
                        >
                            এখনই স্বাভাবিক করুন
                        </button>
                    </div>
                )}

                {/* Table matching screenshot */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-white border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[11px] tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-5">USER</th>
                                    <th className="py-3.5 px-4">CUSTOMER ID</th>
                                    <th className="py-3.5 px-4">DEVICE & IP</th>
                                    <th className="py-3.5 px-4">LOCATION</th>
                                    <th className="py-3.5 px-4">LOGINS / LOGOUTS</th>
                                    <th className="py-3.5 px-4">PHONE</th>
                                    <th className="py-3.5 px-4 text-indigo-600 font-black">EMAIL</th>
                                    <th className="py-3.5 px-4">JOINED</th>
                                    <th className="py-3.5 px-4">ROLES</th>
                                    <th className="py-3.5 px-4 text-center">বোনাস কুপন</th>
                                    <th className="py-3.5 px-5">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {customerData.length > 0 ? customerData.map((user) => {
                                    const isNew = unseenIds.has(user.id);
                                    return (
                                    <tr 
                                        key={user.id} 
                                        className={`transition-all duration-1000 ease-out ${
                                            isNew
                                                ? isFading
                                                    ? 'bg-transparent border-l-4 border-l-transparent'
                                                    : 'bg-emerald-50/75 hover:bg-emerald-100/70 border-l-4 border-l-emerald-500'
                                                : 'hover:bg-slate-50/70 border-l-4 border-l-transparent'
                                        }`}
                                    >
                                        
                                        {/* USER */}
                                        <td className="py-3.5 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors duration-1000 ${
                                                    isNew && !isFading
                                                        ? 'bg-emerald-200 text-emerald-900 border-2 border-emerald-400 ring-2 ring-emerald-300/40'
                                                        : 'bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]'
                                                }`}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-bold text-slate-800 text-xs">{user.name}</span>
                                                        {isNew && !isFading && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-2xs animate-pulse">
                                                                <CheckCircle2 size={9} />
                                                                নতুন ইউজার
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* CUSTOMER ID */}
                                        <td className="py-3.5 px-4">
                                            <span className="bg-[#f0f0ff] border border-indigo-100 text-indigo-600 text-xs font-bold font-mono px-3 py-1 rounded-xl tracking-wide inline-block">
                                                ID: {1000000 + user.id}
                                            </span>
                                        </td>

                                        {/* DEVICE & IP */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                                    {(user.device || '').toLowerCase().includes('mobile') || (user.device || '').toLowerCase().includes('ios') || (user.device || '').toLowerCase().includes('android') ? (
                                                        <Smartphone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                                    ) : (user.device || '').toLowerCase().includes('tablet') || (user.device || '').toLowerCase().includes('ipad') ? (
                                                        <Tablet className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                                    ) : (
                                                        <Laptop className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                                                    )}
                                                    <span className="truncate max-w-[170px]" title={user.device || 'Windows (Chrome) - Desktop'}>
                                                        {user.device || 'Windows (Chrome) - Desktop'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                                        {user.ip_address || '127.0.0.1'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* LOCATION */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                                <span className="text-slate-700" title={user.location || 'Dhaka, Bangladesh'}>
                                                    {user.location || 'Dhaka, Bangladesh'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* LOGINS / LOGOUTS */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <span 
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black" 
                                                    title="মোট লগইন সংখ্যা"
                                                >
                                                    <LogIn size={11} className="text-emerald-600 stroke-[2.5]" />
                                                    <span>লগইন: {user.login_count ?? 1}</span>
                                                </span>
                                                <span 
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-black" 
                                                    title="মোট লগআউট সংখ্যা"
                                                >
                                                    <LogOut size={11} className="text-rose-600 stroke-[2.5]" />
                                                    <span>লগআউট: {user.logout_count ?? 0}</span>
                                                </span>
                                            </div>
                                        </td>

                                        {/* PHONE */}
                                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                                            {user.phone && user.phone !== '-' ? user.phone : '—'}
                                        </td>

                                        {/* EMAIL */}
                                        <td className="py-3.5 px-4 text-slate-800 font-bold text-xs select-all">
                                            {user.email || '—'}
                                        </td>

                                        {/* JOINED */}
                                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                                            <div>
                                                <div className="font-bold text-slate-800 text-xs">
                                                    {user.created_at_date || (user.created_at ? new Date(user.created_at).toLocaleDateString() : '—')}
                                                </div>
                                                <div className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1 mt-0.5 whitespace-nowrap">
                                                    <Clock size={11} className="text-emerald-500 shrink-0" />
                                                    <span>{user.created_at_time || (user.created_at ? new Date(user.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:00 AM')}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* ROLES */}
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-1.5">
                                                {['customer', 'vendor', 'admin'].map(rName => {
                                                    const hasRole = Array.isArray(user.roles) && user.roles.includes(rName);
                                                    return (
                                                        <button
                                                             key={rName}
                                                             type="button"
                                                             onClick={() => handleToggleRole(user.id, rName)}
                                                             title={`Click to ${hasRole ? 'remove' : 'assign'} ${rName} role`}
                                                             className={`px-3 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                                                                 hasRole
                                                                     ? 'bg-[#16a34a] text-white shadow-2xs'
                                                                     : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                                                             }`}
                                                         >
                                                             {rName}
                                                         </button>
                                                     );
                                                 })}
                                             </div>
                                         </td>

                                        {/* BONUS COUPON TOGGLE */}
                                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                            <div className="flex flex-col items-center justify-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleBonusCoupon(user.id)}
                                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                                        (couponStatuses[user.id] ?? true) ? 'bg-emerald-600' : 'bg-slate-300'
                                                    }`}
                                                    title={(couponStatuses[user.id] ?? true) ? 'কুপন চালু আছে (ক্লিক করে বন্ধ করুন)' : 'কুপন বন্ধ আছে (ক্লিক করে চালু করুন)'}
                                                >
                                                    <span
                                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                                            (couponStatuses[user.id] ?? true) ? 'translate-x-5' : 'translate-x-0'
                                                        }`}
                                                    />
                                                </button>
                                                <span className={`text-[10px] font-black uppercase tracking-wider ${
                                                    (couponStatuses[user.id] ?? true) ? 'text-emerald-700' : 'text-slate-400'
                                                }`}>
                                                    {(couponStatuses[user.id] ?? true) ? 'অন (Active)' : 'বন্ধ (Off)'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="py-3.5 px-5">
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={`/admin/users/${user.id}/impersonate`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                                                    title="Open account in new tab"
                                                >
                                                    <LogIn className="w-3.5 h-3.5" /> Login as
                                                </a>

                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                );
                            }) : null}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {customers.total > customers.data.length && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-xs text-slate-500 font-medium">
                            Showing {customers.data.length} of {customers.total} customers
                        </div>
                        <div className="flex gap-1">
                            {customers.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`px-3 py-1.5 text-xs rounded-lg font-bold transition ${
                                        link.active ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bonus Coupon Empty Message Customizer Modal */}
            <BonusCouponMessageModal
                isOpen={isMessageModalOpen}
                onClose={() => setIsMessageModalOpen(false)}
                initialData={currentCouponMessage}
                onSuccess={(updated) => setCurrentCouponMessage(updated)}
            />
        </>
    );
}
