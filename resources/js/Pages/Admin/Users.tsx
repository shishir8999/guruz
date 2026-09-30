import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { 
    Search, LogIn, Trash2, KeyRound, CheckCircle2, Clock,
    Laptop, Smartphone, Tablet, MapPin, LogOut, Gift, XCircle, Edit3
} from 'lucide-react';
import Swal from 'sweetalert2';
import BonusCouponMessageModal, { BonusCouponMessageData } from '@/Components/BonusCouponMessageModal';

interface UserData {
    id: number;
    name: string;
    email: string;
    phone?: string;
    customer_id?: string;
    created_at: string;
    created_at_date?: string;
    created_at_time?: string;
    created_at_full?: string;
    roles: string[];
    device?: string;
    ip_address?: string;
    location?: string;
    login_count?: number;
    logout_count?: number;
    bonus_coupon_enabled?: boolean;
}

interface AdminUsersProps {
    users: {
        data: UserData[];
        total: number;
        current_page: number;
        last_page: number;
    };
    counts?: {
        all: number;
        customer: number;
        vendor: number;
        admin: number;
    };
    filters?: {
        search?: string;
        role?: string;
    };
    bonus_coupon_message?: BonusCouponMessageData;
}

export default function AdminUsers({ users, counts, filters, bonus_coupon_message }: AdminUsersProps) {
    const { errors, flash } = usePage().props as any;

    const [search, setSearch] = useState(filters?.search ?? '');
    const [activeRoleFilter, setActiveRoleFilter] = useState(filters?.role ?? 'all');
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [currentCouponMessage, setCurrentCouponMessage] = useState<BonusCouponMessageData | undefined>(bonus_coupon_message);

    const [passwordPrompt, setPasswordPrompt] = useState<{ isOpen: boolean, action: Function | null, message: string }>({ isOpen: false, action: null, message: '' });
    const [adminPassword, setAdminPassword] = useState('');

    const totalUsersCount = counts?.all ?? users?.total ?? 3;
    const customerCount = counts?.customer ?? 1;
    const vendorCount = counts?.vendor ?? 2;
    const adminCount = counts?.admin ?? 1;

    const userList: UserData[] = (users?.data && users.data.length > 0) ? users.data : [
        { id: 1, name: 'Riya', email: 'b05fa0b7@guruz.com', phone: '-', customer_id: 'ID: 1000062', created_at: '8/1/2026', roles: ['vendor', 'admin'] },
        { id: 2, name: 'Yola', email: 'c11e1486@guruz.com', phone: '-', customer_id: 'ID: 1000061', created_at: '8/1/2026', roles: ['vendor'] },
        { id: 3, name: 'Riku', email: '0d917fe9@guruz.com', phone: '-', customer_id: 'ID: 1000060', created_at: '8/1/2026', roles: ['customer'] },
    ];

    const applySearch = () => {
        router.get('/admin/users', { search, role: activeRoleFilter === 'all' ? '' : activeRoleFilter }, { preserveState: true });
    };

    const handleRoleFilter = (roleKey: string) => {
        setActiveRoleFilter(roleKey);
        router.get('/admin/users', { search, role: roleKey === 'all' ? '' : roleKey }, { preserveState: true });
    };

    const requirePassword = (message: string, action: Function) => {
        setAdminPassword('');
        setPasswordPrompt({ isOpen: true, message, action });
    };

    const confirmPasswordAction = () => {
        if (!adminPassword) return;
        if (passwordPrompt.action) {
            passwordPrompt.action(adminPassword);
        }
        setPasswordPrompt({ isOpen: false, action: null, message: '' });
    };

    const handleToggleRole = (userId: number, roleName: string) => {
        requirePassword(`Toggling the '${roleName}' role requires password verification.`, (password: string) => {
            router.post(route('users.assign-role', userId), { role: roleName, password }, { preserveState: true, preserveScroll: true });
        });
    };

    const handleLoginAs = (userId: number) => {
        router.post(`/admin/users/${userId}/impersonate`);
    };

    const handleDeleteUser = (userId: number) => {
        Swal.fire({
            title: 'Delete User?',
            text: 'Are you sure you want to delete this user? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'No, Cancel',
        }).then(result => {
            if (result.isConfirmed) {
                router.delete(`/admin/users/${userId}`, { preserveState: false });
            }
        });
    };

    const [couponStatuses, setCouponStatuses] = useState<Record<number, boolean>>(() => {
        const map: Record<number, boolean> = {};
        userList.forEach(u => {
            map[u.id] = u.bonus_coupon_enabled ?? true;
        });
        return map;
    });

    React.useEffect(() => {
        setCouponStatuses(() => {
            const map: Record<number, boolean> = {};
            userList.forEach(u => {
                map[u.id] = u.bonus_coupon_enabled ?? true;
            });
            return map;
        });
    }, [users]);

    const handleToggleBonusCoupon = async (userId: number) => {
        const currentVal = couponStatuses[userId] ?? true;
        const newVal = !currentVal;
        
        // Optimistic UI update
        setCouponStatuses(prev => ({ ...prev, [userId]: newVal }));

        try {
            const response = await fetch(`/admin/users/${userId}/toggle-bonus-coupon`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ enabled: newVal }),
            });

            if (response.ok) {
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
                Swal.fire('Error', 'কুপন স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি।', 'error');
            }
        } catch (err) {
            setCouponStatuses(prev => ({ ...prev, [userId]: currentVal }));
            Swal.fire('Error', 'সার্ভারে সংযোগ করতে ব্যর্থ হয়েছে।', 'error');
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
                    userList.forEach(u => {
                        next[u.id] = enableAll;
                    });
                    return next;
                });

                try {
                    const response = await fetch('/admin/users/bulk-bonus-coupon', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                        },
                        body: JSON.stringify({ enabled: enableAll }),
                    });

                    if (response.ok) {
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
                }
            }
        });
    };

    return (
        <>

            <Head title="Users — Admin Panel" />

            <div className="space-y-4">
                
                {/* Header Title + Search Bar matching screenshot */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                            Users ({totalUsersCount})
                        </h1>
                        <Link 
                            href="/admin/customers/loyalty" 
                            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                        >
                            <span>👑 VIP Loyalty Tiers Setup</span>
                        </Link>
                    </div>

                    {/* Master Bulk Coupon Controls & Search Bar */}
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
                                onKeyDown={e => e.key === 'Enter' && applySearch()}
                                placeholder="Search name, phone, id..."
                                className="w-full bg-white border border-slate-200/80 rounded-xl px-4 py-2 text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
                            />
                        </div>
                    </div>
                </div>

                {/* Filter Pills matching screenshot row */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => handleRoleFilter('all')}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                            activeRoleFilter === 'all'
                                ? 'bg-[#16a34a] text-white shadow-2xs'
                                : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        all ({totalUsersCount})
                    </button>

                    <button
                        onClick={() => handleRoleFilter('customer')}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                            activeRoleFilter === 'customer'
                                ? 'bg-[#16a34a] text-white shadow-2xs'
                                : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        customer ({customerCount})
                    </button>

                    <button
                        onClick={() => handleRoleFilter('vendor')}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                            activeRoleFilter === 'vendor'
                                ? 'bg-[#16a34a] text-white shadow-2xs'
                                : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        vendor ({vendorCount})
                    </button>

                    <button
                        onClick={() => handleRoleFilter('admin')}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                            activeRoleFilter === 'admin'
                                ? 'bg-[#16a34a] text-white shadow-2xs'
                                : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        admin ({adminCount})
                    </button>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {flash.success}
                    </div>
                )}
                {errors?.password && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-xl flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-red-600" />
                        {errors.password}
                    </div>
                )}

                {/* Users Table Card matching screenshot */}
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
                                    <th className="py-3.5 px-4">JOINED</th>
                                    <th className="py-3.5 px-4">ROLES</th>
                                    <th className="py-3.5 px-4 text-center">বোনাস কুপন</th>
                                    <th className="py-3.5 px-5">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {userList.map(u => {
                                    const firstLetter = u.name ? u.name.charAt(0).toUpperCase() : 'U';
                                    const isCustomer = u.roles ? u.roles.includes('customer') : true;
                                    const isVendor = u.roles ? u.roles.includes('vendor') : false;
                                    const isAdmin = u.roles ? u.roles.includes('admin') : false;

                                    return (
                                        <tr key={u.id} className="hover:bg-slate-50/70 transition">
                                            
                                            {/* USER */}
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] flex items-center justify-center font-bold text-xs shrink-0">
                                                        {firstLetter}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-xs">
                                                            {u.name}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 font-normal">
                                                            {u.email ? (u.email.includes('@') ? u.email.split('@')[0].slice(0, 8) + '..' : u.email) : 'user_id'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* CUSTOMER ID */}
                                            <td className="py-3.5 px-4">
                                                <span className="bg-[#f0f0ff] border border-indigo-100 text-indigo-600 text-xs font-bold font-mono px-3 py-1 rounded-xl tracking-wide inline-block">
                                                    {u.customer_id || `ID: ${1000000 + u.id}`}
                                                </span>
                                            </td>

                                            {/* DEVICE & IP */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                                        {(u.device || '').toLowerCase().includes('mobile') || (u.device || '').toLowerCase().includes('ios') || (u.device || '').toLowerCase().includes('android') ? (
                                                            <Smartphone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                                        ) : (u.device || '').toLowerCase().includes('tablet') || (u.device || '').toLowerCase().includes('ipad') ? (
                                                            <Tablet className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                                        ) : (
                                                            <Laptop className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                                                        )}
                                                        <span className="truncate max-w-[170px]" title={u.device || 'Windows (Chrome) - Desktop'}>
                                                            {u.device || 'Windows (Chrome) - Desktop'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                                            {u.ip_address || '127.0.0.1'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* LOCATION */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                                    <span className="text-slate-700" title={u.location || 'Dhaka, Bangladesh'}>
                                                        {u.location || 'Dhaka, Bangladesh'}
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
                                                        <span>লগইন: {u.login_count ?? 1}</span>
                                                    </span>
                                                    <span 
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-black" 
                                                        title="মোট লগআউট সংখ্যা"
                                                    >
                                                        <LogOut size={11} className="text-rose-600 stroke-[2.5]" />
                                                        <span>লগআউট: {u.logout_count ?? 0}</span>
                                                    </span>
                                                </div>
                                            </td>

                                            {/* PHONE */}
                                            <td className="py-3.5 px-4 text-slate-600 font-medium">
                                                {u.phone && u.phone !== '-' ? u.phone : '—'}
                                            </td>

                                            {/* JOINED */}
                                            <td className="py-3.5 px-4 text-slate-500 font-medium">
                                                <div>
                                                    <div className="font-bold text-slate-800 text-xs">
                                                        {u.created_at_date || u.created_at || '8/1/2026'}
                                                    </div>
                                                    <div className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1 mt-0.5">
                                                        <Clock size={11} className="text-emerald-500 shrink-0" />
                                                        <span>{u.created_at_time || '12:00 AM'}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* ROLES matching exact pills in screenshot */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => handleToggleRole(u.id, 'customer')}
                                                        className={`text-[11px] px-3 py-1 rounded-full font-semibold transition cursor-pointer ${
                                                            isCustomer
                                                                ? 'bg-[#16a34a] text-white shadow-2xs'
                                                                : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        customer
                                                    </button>

                                                    <button
                                                        onClick={() => handleToggleRole(u.id, 'vendor')}
                                                        className={`text-[11px] px-3 py-1 rounded-full font-semibold transition cursor-pointer ${
                                                            isVendor
                                                                ? 'bg-[#16a34a] text-white shadow-2xs'
                                                                : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        vendor
                                                    </button>

                                                    <button
                                                        onClick={() => handleToggleRole(u.id, 'admin')}
                                                        className={`text-[11px] px-3 py-1 rounded-full font-semibold transition cursor-pointer ${
                                                            isAdmin
                                                                ? 'bg-[#16a34a] text-white shadow-2xs'
                                                                : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        admin
                                                    </button>
                                                </div>
                                            </td>

                                            {/* BONUS COUPON TOGGLE */}
                                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                <div className="flex flex-col items-center justify-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleBonusCoupon(u.id)}
                                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                                            (couponStatuses[u.id] ?? true) ? 'bg-emerald-600' : 'bg-slate-300'
                                                        }`}
                                                        title={(couponStatuses[u.id] ?? true) ? 'কুপন চালু আছে (ক্লিক করে বন্ধ করুন)' : 'কুপন বন্ধ আছে (ক্লিক করে চালু করুন)'}
                                                    >
                                                        <span
                                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                                                (couponStatuses[u.id] ?? true) ? 'translate-x-5' : 'translate-x-0'
                                                            }`}
                                                        />
                                                    </button>
                                                    <span className={`text-[10px] font-black uppercase tracking-wider ${
                                                        (couponStatuses[u.id] ?? true) ? 'text-emerald-700' : 'text-slate-400'
                                                    }`}>
                                                        {(couponStatuses[u.id] ?? true) ? 'অন (Active)' : 'বন্ধ (Off)'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* ACTIONS matching exact purple and red buttons in screenshot */}
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={`/admin/users/${u.id}/impersonate`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                                                        title="Open account in new tab"
                                                    >
                                                        <LogIn className="w-3.5 h-3.5" /> Login as
                                                    </a>

                                                    <button
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        className="bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Password Verification Modal */}
            {passwordPrompt.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 mx-auto">
                                <KeyRound className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">Security Verification</h2>
                            <p className="text-xs text-center text-slate-500 font-semibold mb-6">{passwordPrompt.message}</p>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Admin Password</label>
                                    <input 
                                        type="password" 
                                        value={adminPassword}
                                        onChange={e => setAdminPassword(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder="Enter your password to confirm..."
                                        autoFocus
                                        onKeyDown={e => e.key === 'Enter' && confirmPasswordAction()}
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button 
                                        onClick={() => setPasswordPrompt({ isOpen: false, action: null, message: '' })}
                                        className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs py-3 rounded-xl transition"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={confirmPasswordAction}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-xs"
                                    >
                                        Verify & Proceed
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
