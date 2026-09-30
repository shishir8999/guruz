import { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Search, FileText, Mail, Phone, Calendar, 
    MessageCircle, Send, X, ExternalLink, 
    Loader2, CheckCheck, Store, Clock, Zap
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Shop {
    id: number; name: string; slug: string; status: string; logo_url: string | null;
    contact_phone: string | null; contact_email: string | null;
    created_at: string;
    created_at_formatted?: string;
    rating: number; followers: number;
    owner: { id: number; name: string; email: string; phone?: string };
    products_count?: number;
    total_sales?: number;
    total_earned?: number;
    kyc_status?: string | null;
    commission_rate?: number | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    pending:   { label: 'pending', color: 'text-amber-700',  bg: 'bg-amber-100' },
    approved:  { label: 'approved',  color: 'text-emerald-700',  bg: 'bg-emerald-100' },
    rejected:  { label: 'rejected', color: 'text-red-700',  bg: 'bg-red-100' },
    suspended: { label: 'suspended',  color: 'text-gray-700',   bg: 'bg-gray-100' },
};

export default function AdminShops({
    shops, filters, statusCounts
}: {
    shops: { data: Shop[]; current_page: number; last_page: number; total: number };
    filters: any;
    statusCounts?: { all: number; pending: number; approved: number; suspended: number; rejected: number };
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');

    // 💬 Live Chat with Vendor State
    const [selectedShopForChat, setSelectedShopForChat] = useState<Shop | null>(null);
    const [chatMessages, setChatMessages] = useState<Array<{ id: number; body: string; is_admin: boolean; sender_name: string; created_at: string }>>([]);
    const [chatLoading, setChatLoading] = useState<boolean>(false);
    const [chatSending, setChatSending] = useState<boolean>(false);
    const [chatInput, setChatInput] = useState<string>('');
    const chatBodyRef = useRef<HTMLDivElement>(null);

    const scrollChatToBottom = (smooth = true) => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTo({
                top: chatBodyRef.current.scrollHeight,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }
    };

    useEffect(() => {
        if (selectedShopForChat) {
            scrollChatToBottom(false);
        }
    }, [chatMessages, selectedShopForChat]);

    // Open chat modal & fetch history
    const openChatModal = async (shop: Shop) => {
        setSelectedShopForChat(shop);
        setChatLoading(true);
        setChatMessages([]);
        setChatInput('');
        try {
            const res = await fetch(`/api/admin/shop-messages/${shop.id}`, {
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin',
            });
            if (res.ok) {
                const data = await res.json();
                setChatMessages(data.messages || []);
            }
        } catch (e) {
            console.error('Failed to load shop messages:', e);
        } finally {
            setChatLoading(false);
        }
    };

    // Polling active shop messages every 3 seconds
    useEffect(() => {
        if (!selectedShopForChat) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/admin/shop-messages/${selectedShopForChat.id}`, {
                    headers: { 'Accept': 'application/json' },
                    credentials: 'same-origin',
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.messages) {
                        setChatMessages(prev => {
                            if (JSON.stringify(prev) !== JSON.stringify(data.messages)) {
                                return data.messages;
                            }
                            return prev;
                        });
                    }
                }
            } catch (err) {}
        }, 3000);

        return () => clearInterval(interval);
    }, [selectedShopForChat]);

    // Send chat message to vendor
    const handleSendShopMessage = async (customText?: string, alsoOpenWhatsApp: boolean = false) => {
        const text = (customText !== undefined ? customText : chatInput).trim();
        if (!text || !selectedShopForChat) return;

        // 1. Immediately trigger WhatsApp if requested (bypasses browser popup blockers)
        if (alsoOpenWhatsApp) {
            const rawPhone = selectedShopForChat.phone || selectedShopForChat.owner?.phone || '';
            let cleanPhone = rawPhone.replace(/[^0-9]/g, '');
            if (cleanPhone.startsWith('01')) {
                cleanPhone = '88' + cleanPhone;
            }
            if (cleanPhone) {
                const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
                window.open(waUrl, '_blank');
            }
        }

        // 2. Immediate optimistic update: Show message in UI and clear input
        const tempId = Date.now();
        const optimisticMsg = {
            id: tempId,
            body: text,
            is_admin: true,
            sender_name: 'Super Admin',
            created_at: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages(prev => [...prev, optimisticMsg]);
        setChatInput('');

        setTimeout(() => {
            if (chatBodyRef.current) {
                chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
            }
        }, 50);

        // 3. Save to database via API
        setChatSending(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch('/api/admin/send-shop-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    shop_id: selectedShopForChat.id,
                    body: text,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.message) {
                    setChatMessages(prev => prev.map(m => m.id === tempId ? data.message : m));
                }
            } else {
                console.error('Server error sending message:', res.status);
            }
        } catch (error) {
            console.error('Failed to send shop message:', error);
        } finally {
            setChatSending(false);
        }
    };

    const quickAdminTemplates = [
        'আপনার ভেন্ডর শপটি সফলভাবে অনুমোদন করা হয়েছে! এখন আপনি আনলিমিটেড প্রোডাক্ট আপলোড করতে পারবেন।',
        'অনুগ্রহ করে আপনার সঠিক ট্রেড লাইসেন্স বা এনআইডি সাবমিট করুন।',
        'আপনার অ্যাকাউন্টের তথ্যাবলী যাচাই করা হচ্ছে, দ্রুত কনফার্মেশন পাবেন।',
        'কোনো প্রশ্ন বা সহায়তার প্রয়োজন হলে আমাদের সাথে মেসেজ করতে পারেন।'
    ];

    const applyFilters = (statusVal: string, searchVal: string) => {
        router.get('/admin/shops', { search: searchVal, status: statusVal }, { preserveState: true });
    };

    const handleTabClick = (status: string) => {
        setStatusFilter(status);
        applyFilters(status, search);
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            applyFilters(statusFilter, search);
        }
    };

    const handleQuickApprove = (shopId: number, shopName: string) => {
        Swal.fire({
            title: `শপ "${shopName}" অনুমোদন করবেন?`,
            text: 'অনুমোদন করার সাথে সাথে ভেন্ডরের অ্যাকাউন্টটি অ্যাক্টিভ হবে এবং প্রোডাক্ট ক্রেতাদের কাছে লাইভ হবে।',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'হ্যাঁ, অনুমোদন করুন',
            cancelButtonText: 'বাতিল',
            confirmButtonColor: '#10b981',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/admin/shops/${shopId}/update-status`, { status: 'approved' }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire('সফল!', 'ভেন্ডর শপটি সফলভাবে অনুমোদন করা হয়েছে।', 'success');
                    }
                });
            }
        });
    };

    const suspend = (id: number) => router.post(`/admin/shops/${id}/suspend`, {}, { preserveState: false });

    const counts = {
        all: statusCounts?.all ?? shops.total,
        pending: statusCounts?.pending ?? 0,
        approved: statusCounts?.approved ?? 0,
        suspended: statusCounts?.suspended ?? 0,
        rejected: statusCounts?.rejected ?? 0,
    };

    return (
        <>

            <Head title="Shops / Vendors" />

            <div className="max-w-[1600px] mx-auto space-y-6">
                
                {/* Main Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* Header Row */}
                    <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Shops / Vendors</h1>
                        
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={handleSearch}
                                    placeholder="Search shops, emails, phone..."
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#10b981] text-[13px] font-medium"
                                />
                            </div>
                            
                            <button 
                                onClick={() => {
                                    Swal.fire({
                                        title: 'Coming Soon',
                                        text: 'New Shop creation module is under development.',
                                        icon: 'info',
                                        confirmButtonText: 'Okay'
                                    });
                                }}
                                className="whitespace-nowrap px-4 py-2 bg-[#10b981] hover:bg-emerald-600 text-white text-[13px] font-bold rounded-lg transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                            >
                                <span>+ New Shop</span>
                            </button>
                        </div>
                    </div>

                    {/* Status Filter Tabs with Counter Badges */}
                    <div className="flex items-center gap-1.5 border-b border-slate-100 px-6 pt-2 overflow-x-auto bg-slate-50/50">
                        {[
                            { key: '', label: 'All Shops', count: counts.all },
                            { key: 'pending', label: 'Vendor Approvals (পেন্ডিং)', count: counts.pending, isPending: true },
                            { key: 'approved', label: 'Approved / Active', count: counts.approved },
                            { key: 'suspended', label: 'Suspended', count: counts.suspended },
                            { key: 'rejected', label: 'Rejected', count: counts.rejected },
                        ].map(tab => {
                            const isActive = (statusFilter === tab.key) || (!statusFilter && tab.key === '');
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => handleTabClick(tab.key)}
                                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                                        isActive
                                            ? 'border-emerald-600 text-emerald-700 bg-white shadow-2xs rounded-t-lg'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/60 rounded-t-lg'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    {tab.count !== undefined && (
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                            tab.isPending && tab.count > 0
                                                ? 'bg-rose-500 text-white animate-pulse shadow-xs'
                                                : isActive
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-slate-200 text-slate-600'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Table Container */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-white border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 w-12">SHOP</th>
                                    <th className="px-6 py-4">VENDOR CONTACT (EMAIL / PHONE)</th>
                                    <th className="px-6 py-4">CREATED DATE & TIME</th>
                                    <th className="px-6 py-4 text-center">PRODUCTS</th>
                                    <th className="px-6 py-4 text-center">লাইভ মেসেজ</th>
                                    <th className="px-6 py-4 text-center">STATUS</th>
                                    <th className="px-6 py-4 text-center">VERIFIED</th>
                                    <th className="px-6 py-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {shops.data.map((shop) => (
                                    <tr key={shop.id} className="hover:bg-slate-50/50 transition-colors">
                                        
                                        {/* Shop Info (Logo + Name) */}
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                                                    {shop.logo_url ? (
                                                        <img src={shop.logo_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-xs">
                                                            {shop.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-800 text-[13px]">{shop.name}</div>
                                                    <div className="text-[11px] text-slate-500">{shop.slug}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Vendor Contact (Email & Phone) */}
                                        <td className="px-6 py-3 text-[12px] text-slate-700">
                                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                                <Mail size={12} className="text-slate-400 shrink-0" />
                                                <span className="truncate">{shop.owner?.email || shop.contact_email || 'N/A'}</span>
                                            </div>
                                            <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5 mt-0.5">
                                                <Phone size={11} className="text-emerald-500 shrink-0" />
                                                <span>{shop.owner?.phone || shop.contact_phone || 'N/A'}</span>
                                            </div>
                                        </td>

                                        {/* Created Date & Time */}
                                        <td className="px-6 py-3 text-[12px] text-slate-700">
                                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                                <Calendar size={12} className="text-slate-400 shrink-0" />
                                                <span>{shop.created_at_formatted || shop.created_at}</span>
                                            </div>
                                        </td>
                                        
                                        {/* Products */}
                                        <td className="px-6 py-3 text-center text-[13px] font-medium text-slate-800">
                                            {shop.products_count ?? '0'}
                                        </td>

                                        {/* Live Message */}
                                        <td className="px-6 py-3 text-center">
                                            <button 
                                                type="button"
                                                onClick={() => openChatModal(shop)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-lg transition text-[11px] font-bold cursor-pointer shadow-xs active:scale-95"
                                                title="ভেন্ডরকে সরাসরি লাইভ মেসেজ পাঠান"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                <span>মেসেজ</span>
                                            </button>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-3 text-center">
                                            {shop.status === 'pending' ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse flex items-center gap-1 shadow-2xs">
                                                        ⏳ Pending
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickApprove(shop.id, shop.name)}
                                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                                                        title="Approve Vendor Shop"
                                                    >
                                                        ✓ Approve
                                                    </button>
                                                </div>
                                            ) : (
                                                <select 
                                                    className="px-3 py-1.5 text-[12px] font-semibold border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-slate-300 appearance-none bg-white pr-8 relative cursor-pointer shadow-sm"
                                                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231e293b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
                                                    value={shop.status === 'active' ? 'approved' : shop.status === 'closed' ? 'rejected' : shop.status}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        Swal.fire({
                                                            title: 'Change Status?',
                                                            text: `Are you sure you want to change the status to ${val}?`,
                                                            icon: 'warning',
                                                            showCancelButton: true,
                                                            confirmButtonText: 'Yes, change it'
                                                        }).then((result) => {
                                                            if (result.isConfirmed) {
                                                                router.post(`/admin/shops/${shop.id}/update-status`, { status: val }, {
                                                                    preserveScroll: true,
                                                                    onSuccess: () => {
                                                                        Swal.fire('Success', 'Shop status updated!', 'success');
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="approved">Approved</option>
                                                    <option value="rejected">Rejected</option>
                                                    <option value="suspended">Suspended</option>
                                                </select>
                                            )}
                                        </td>

                                        {/* Verified */}
                                        <td className="px-6 py-3 text-center">
                                            {shop.kyc_status === 'approved' ? (
                                                <span className="text-[#10b981] font-bold text-lg">✓</span>
                                            ) : (
                                                <span className="text-slate-400 font-bold text-lg">✕</span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <a 
                                                    href={`/admin/shops/${shop.id}/impersonate`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1.5 bg-[#10b981] text-white text-[11px] font-bold rounded-lg hover:bg-emerald-600 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                                                    title="নতুন ট্যাবে ভেন্ডর প্যানেল ওপেন করুন"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                                                    Login
                                                </a>
                                                <button 
                                                    className="p-1 text-red-400 hover:text-red-600 transition cursor-pointer"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {shops.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">
                                            No shops found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {shops.last_page > 1 && (
                        <div className="flex justify-between items-center p-4 border-t border-slate-100 bg-white">
                            <span className="text-sm font-medium text-slate-500">
                                Page {shops.current_page} of {shops.last_page}
                            </span>
                            <div className="flex gap-2">
                                <button 
                                    disabled={shops.current_page === 1}
                                    onClick={() => router.get(`/admin/shops?page=${shops.current_page - 1}&search=${search}`)}
                                    className="px-4 py-1.5 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition shadow-sm cursor-pointer"
                                >
                                    Previous
                                </button>
                                <button 
                                    disabled={shops.current_page === shops.last_page}
                                    onClick={() => router.get(`/admin/shops?page=${shops.current_page + 1}&search=${search}`)}
                                    className="px-4 py-1.5 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition shadow-sm cursor-pointer"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* 💬 Live Chat with Vendor Modal */}
            {selectedShopForChat && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col h-[650px] max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0 shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm overflow-hidden">
                                        {selectedShopForChat.logo_url ? (
                                            <img src={selectedShopForChat.logo_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            selectedShopForChat.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-base text-white truncate max-w-xs">
                                            {selectedShopForChat.name}
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                            ভেন্ডর লাইভ
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                                        <span>মালিক: {selectedShopForChat.owner?.name || 'ভেন্ডর'}</span>
                                        {selectedShopForChat.owner?.phone && (
                                            <>
                                                <span>•</span>
                                                <span className="text-teal-300 font-mono">{selectedShopForChat.owner.phone}</span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                                {selectedShopForChat.owner?.id && (
                                    <a
                                        href={`/admin/messages?user_id=${selectedShopForChat.owner.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                                        title="সম্পূর্ণ মেসেঞ্জার আলাদা ট্যাবে ওপেন করুন"
                                    >
                                        <ExternalLink size={13} />
                                        <span className="hidden sm:inline">মেসেঞ্জার</span>
                                    </a>
                                )}
                                {(() => {
                                    const rawPh = selectedShopForChat.phone || selectedShopForChat.owner?.phone || '';
                                    let clPh = rawPh.replace(/[^0-9]/g, '');
                                    if (clPh.startsWith('01')) clPh = '88' + clPh;
                                    return clPh ? (
                                        <a
                                            href={`https://wa.me/${clPh}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-2.5 py-1.5 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-95 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                                            title="ভেন্ডরের হোয়াটসঅ্যাপে সরাসরি চ্যাট ওপেন করুন"
                                        >
                                            <svg className="w-3.5 h-3.5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                            </svg>
                                            <span className="hidden sm:inline">WhatsApp</span>
                                        </a>
                                    ) : null;
                                })()}
                                <button
                                    type="button"
                                    onClick={() => setSelectedShopForChat(null)}
                                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                    title="বন্ধ করুন"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body / Chat Messages */}
                        <div 
                            ref={chatBodyRef}
                            className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/60"
                        >
                            {/* Vendor Shop Info Banner */}
                            <div className="p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between text-xs text-slate-600 shadow-2xs">
                                <div className="flex items-center gap-2">
                                    <Store size={14} className="text-teal-600" />
                                    <span>দোকান স্ট্যাটাস:</span>
                                    <span className="font-bold uppercase text-slate-800">{selectedShopForChat.status}</span>
                                </div>
                                <div className="text-[11px] text-slate-400">
                                    তৈরি: {selectedShopForChat.created_at_formatted || selectedShopForChat.created_at}
                                </div>
                            </div>

                            {chatLoading ? (
                                <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
                                    <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                                    <span className="text-xs">মেসেজ লোড হচ্ছে...</span>
                                </div>
                            ) : chatMessages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                                    <MessageCircle className="w-10 h-10 stroke-[1.2] mb-2 text-slate-300" />
                                    <p className="text-xs font-bold text-slate-600">ভেন্ডরের সাথে কোনো পূর্ববর্তী মেসেজ নেই</p>
                                    <p className="text-[11px] mt-1 text-slate-400">একটি মেসেজ লিখে সরাসরি ভেন্ডর প্যানেলে পাঠিয়ে দিন।</p>
                                </div>
                            ) : (
                                chatMessages.map((msg) => {
                                    const isAdmin = msg.is_admin;
                                    return (
                                        <div 
                                            key={msg.id}
                                            className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                                        >
                                            <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                                                {!isAdmin && (
                                                    <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mb-1" title="ভেন্ডর">
                                                        {selectedShopForChat.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}

                                                <div className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-xs ${
                                                    isAdmin 
                                                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-br-xs font-normal' 
                                                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                                                }`}>
                                                    <div className="whitespace-pre-wrap break-words">
                                                        {msg.body}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 px-1 ${isAdmin ? 'pr-1' : 'pl-9'}`}>
                                                <Clock className="w-2.5 h-2.5" />
                                                <span>{msg.created_at}</span>
                                                {isAdmin && (
                                                    <CheckCheck className="w-3 h-3 text-teal-600 ml-0.5" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Quick Preset Buttons */}
                        <div className="px-4 py-2 bg-slate-100/90 border-t border-slate-200 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
                                <Zap className="w-3 h-3 text-amber-500" />
                                কুইক রিপ্লাই:
                            </span>
                            {quickAdminTemplates.map((template, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSendShopMessage(template)}
                                    disabled={chatSending}
                                    className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300 border border-slate-200 rounded-lg whitespace-nowrap transition cursor-pointer shrink-0 disabled:opacity-50"
                                >
                                    {template.length > 35 ? template.substring(0, 35) + '...' : template}
                                </button>
                            ))}
                        </div>

                        {/* Composer Form */}
                        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendShopMessage();
                                }} 
                                className="flex items-end gap-2"
                            >
                                <div className="relative flex-1">
                                    <textarea
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendShopMessage();
                                            }
                                        }}
                                        rows={1}
                                        placeholder={`মেসেজ লিখুন... (Enter দিলে সেন্ড হবে)`}
                                        className="w-full resize-none px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition placeholder:text-slate-400"
                                        style={{ minHeight: '42px' }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={!chatInput.trim() || chatSending}
                                    className="h-[42px] px-4 sm:px-5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 shrink-0"
                                >
                                    {chatSending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <span>পাঠান</span>
                                            <Send className="w-3.5 h-3.5" />
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleSendShopMessage(undefined, true)}
                                    disabled={!chatInput.trim() || chatSending}
                                    className="h-[42px] px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 shrink-0"
                                    title="ভেন্ডরের ড্যাশবোর্ডের ভিতরেও মেসেজ যাবে এবং হোয়াটসঅ্যাপেও যাবে"
                                >
                                    <svg className="w-3.5 h-3.5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                    </svg>
                                    <span className="hidden sm:inline">হোয়াটসঅ্যাপেও যাবে</span>
                                    <span className="sm:hidden">WhatsApp</span>
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            )}
        
</>
    );
}
