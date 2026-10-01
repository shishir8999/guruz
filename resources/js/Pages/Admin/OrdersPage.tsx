import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { Edit2, MessageCircle, Trash2, CheckCircle2, CheckCheck, ChevronRight, ChevronDown, Store, X, ShoppingBag, ExternalLink, Package } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

export interface OrderProductItem {
    id: number;
    product_id?: number | null;
    product_name: string;
    product_slug?: string | null;
    product_sku?: string | null;
    product_image?: string | null;
    price: number;
    quantity: number;
    subtotal: number;
    options?: Record<string, any> | null;
}

interface OrderItem {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email?: string;
    phone: string;
    shipping_address?: string;
    city?: string;
    zone?: string;
    courier_name?: string;
    courier_tracking_id?: string;
    payment_method?: string;
    payment_status?: string;
    subtotal?: number;
    shipping_fee?: number;
    discount?: number;
    coupon_code?: string;
    total: number;
    notes?: string;
    date: string;
    shop: string;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    is_unseen?: boolean;
    admin_seen_at?: string | null;
    items?: OrderProductItem[];
}

export default function OrdersPage({ 
    initialOrders,
    statusCounts: backendStatusCounts
}: { 
    initialOrders: OrderItem[];
    statusCounts?: Record<string, number>;
}) {
    const [orders, setOrders] = useState<OrderItem[]>(initialOrders || []);
    const [statusCounts, setStatusCounts] = useState<Record<string, number>>(backendStatusCounts || {});
    const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'>('All');
    const [editingOrder, setEditingOrder] = useState<OrderItem | null>(null);
    const [editForm, setEditForm] = useState({
        customer_name: '',
        phone: '',
        customer_email: '',
        shipping_address: '',
        city: '',
        zone: '',
        total: 0,
        subtotal: 0,
        shipping_fee: 0,
        discount: 0,
        coupon_code: '',
        courier_name: '',
        courier_tracking_id: '',
        payment_method: '',
        payment_status: '',
        notes: '',
        shop: '',
        status: 'Pending' as OrderItem['status'],
    });
    const [expandedOrders, setExpandedOrders] = useState<Record<number, boolean>>({});
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBulkOperating, setIsBulkOperating] = useState<boolean>(false);

    const toggleExpand = (id: number) => {
        setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleSelectOrder = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    useEffect(() => {
        setOrders(initialOrders || []);
    }, [initialOrders]);

    useEffect(() => {
        if (backendStatusCounts) {
            setStatusCounts(backendStatusCounts);
        }
    }, [backendStatusCounts]);

    const filteredOrders = orders.filter(o => {
        if (filterStatus === 'All') return true;
        return o.status === filterStatus;
    });

    const handleSendWhatsApp = (o: OrderItem) => {
        let phoneNum = (o.phone || '').replace(/[^0-9]/g, '');
        if (phoneNum.startsWith('01')) {
            phoneNum = '88' + phoneNum;
        } else if (phoneNum.startsWith('1') && phoneNum.length === 10) {
            phoneNum = '880' + phoneNum;
        }

        const pdfDownloadUrl = `${window.location.origin}/invoices/${o.order_number}/download?download=1`;

        // 1. Send Email Notification with PDF Invoice asynchronously
        try {
            axios.post(`/orders/${o.id}/send-invoice-email`);
        } catch (e) {}

        // 2. Auto trigger PDF download locally
        const pdfLink = document.createElement('a');
        pdfLink.href = pdfDownloadUrl;
        pdfLink.download = `Invoice_${o.order_number}.pdf`;
        document.body.appendChild(pdfLink);
        pdfLink.click();
        document.body.removeChild(pdfLink);

        // 3. Open WhatsApp web / app with clean message & direct PDF download link
        const msg = 
`📄 *অফিসিয়াল ক্যাশ মেমো / ইনভয়েস PDF — ${o.shop || 'Guruz Store'}*
---------------------------------------
প্রিয় *${o.customer_name}*,
আপনার অর্ডারের ক্যাশ মেমো বিবরণ নিচে দেওয়া হলো:

*অর্ডার নম্বর:* #${o.order_number}
*মোট টাকা:* ৳${Number(o.total || 0).toLocaleString()}
*অর্ডার স্ট্যাটাস:* ${(o.status || 'Pending').toUpperCase()}
*তারিখ:* ${o.date || ''}

📥 *ইনভয়েস PDF ফাইল দেখতে বা ডাউনলোড করতে এই লিংকে ক্লিক করুন:*
${pdfDownloadUrl}

ধন্যবাদ আমাদের সাথে থাকার জন্য! 🙏`;

        const encodedMsg = encodeURIComponent(msg);
        const waUrl = `https://api.whatsapp.com/send?phone=${phoneNum}&text=${encodedMsg}`;
        window.open(waUrl, '_blank');

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `ইনভয়েস PDF ইমেইলে প্রেরিত এবং হোয়াটসঅ্যাপে ওপেন করা হয়েছে!`,
            showConfirmButton: false,
            timer: 3500,
            timerProgressBar: true
        });
    };

    const updatingStatusMap = useRef<Record<number, boolean>>({});

    const handleStatusChange = async (id: number, newStatus: OrderItem['status']) => {
        const prevOrder = orders.find(o => o.id === id);
        const oldStatus = prevOrder ? prevOrder.status : null;

        // Prevent repeated calls if status has not actually changed or is already updating
        if (!prevOrder || !newStatus || (oldStatus && oldStatus.toLowerCase() === newStatus.toLowerCase())) {
            return;
        }

        if (updatingStatusMap.current[id]) {
            return;
        }
        updatingStatusMap.current[id] = true;

        // Instant Optimistic UI update
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));

        if (oldStatus && oldStatus.toLowerCase() !== newStatus.toLowerCase()) {
            setStatusCounts(prev => ({
                ...prev,
                [oldStatus]: Math.max(0, (prev[oldStatus] || 0) - 1),
                [newStatus]: (prev[newStatus] || 0) + 1,
            }));
        }

        try {
            await axios.post(`/admin/orders/${id}/status`, { status: newStatus });
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: `স্ট্যাটাস "${newStatus}" আপডেট হয়েছে!`,
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
            });
        } catch (err) {
            router.reload({ preserveScroll: true });
        } finally {
            updatingStatusMap.current[id] = false;
        }
    };

    const handleDelete = (id: number, orderNum: string) => {
        Swal.fire({
            title: 'অর্ডার মুছে ফেলবেন?',
            text: `আপনি কি নিশ্চিত যে অর্ডার ${orderNum} মুছে ফেলতে চান?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন',
            cancelButtonText: 'বাতিল',
        }).then(async result => {
            if (result.isConfirmed) {
                const targetOrder = orders.find(o => o.id === id);
                // Instant Optimistic UI deletion
                setOrders(prev => prev.filter(o => o.id !== id));
                setSelectedIds(prev => prev.filter(item => item !== id));

                if (targetOrder) {
                    setStatusCounts(prev => ({
                        ...prev,
                        All: Math.max(0, (prev.All || 0) - 1),
                        [targetOrder.status]: Math.max(0, (prev[targetOrder.status] || 0) - 1),
                    }));
                }

                try {
                    await axios.delete(`/admin/orders/${id}`);
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: `অর্ডার ${orderNum} ডিলিট করা হয়েছে।`,
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true,
                    });
                } catch (err) {
                    router.reload({ preserveScroll: true });
                }
            }
        });
    };

    const isAllFilteredSelected = filteredOrders.length > 0 && filteredOrders.every(o => selectedIds.includes(o.id));
    const isSomeFilteredSelected = filteredOrders.some(o => selectedIds.includes(o.id)) && !isAllFilteredSelected;

    const handleToggleSelectAll = () => {
        if (isAllFilteredSelected) {
            const filteredIdSet = new Set(filteredOrders.map(o => o.id));
            setSelectedIds(prev => prev.filter(id => !filteredIdSet.has(id)));
        } else {
            const combined = new Set([...selectedIds, ...filteredOrders.map(o => o.id)]);
            setSelectedIds(Array.from(combined));
        }
    };

    const handleBulkStatusChange = async (newStatus: OrderItem['status']) => {
        if (selectedIds.length === 0 || !newStatus) return;

        const count = selectedIds.length;
        const result = await Swal.fire({
            title: 'স্ট্যাটাস পরিবর্তন নিশ্চিতকরণ',
            text: `আপনি কি নিশ্চিত যে নির্বাচিত ${count} টি অর্ডারের স্ট্যাটাস পরিবর্তন করে "${newStatus}" করতে চান?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#7c3aed',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'হ্যাঁ, পরিবর্তন করুন',
            cancelButtonText: 'বাতিল',
        });

        if (!result.isConfirmed) return;

        setIsBulkOperating(true);
        const currentSelected = [...selectedIds];

        // Optimistic UI update
        setOrders(prev => prev.map(o => currentSelected.includes(o.id) ? { ...o, status: newStatus } : o));

        try {
            const res = await axios.post('/admin/orders/bulk-status', {
                ids: currentSelected,
                status: newStatus
            });

            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: res.data?.message || `${count} টি অর্ডারের স্ট্যাটাস সফলভাবে আপডেট হয়েছে!`,
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
            });
            setSelectedIds([]);
            router.reload({ preserveScroll: true });
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'ব্যর্থ হয়েছে',
                text: err?.response?.data?.message || 'স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি।',
            });
            router.reload({ preserveScroll: true });
        } finally {
            setIsBulkOperating(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        const count = selectedIds.length;
        const result = await Swal.fire({
            title: 'অর্ডার মুছে ফেলবেন?',
            text: `আপনি কি নিশ্চিত যে নির্বাচিত ${count} টি অর্ডার একবারে মুছে ফেলতে চান? এটি পুনরুদ্ধার করা যাবে না!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#64748b',
            confirmButtonText: `হ্যাঁ, ডিলিট করুন (${count})`,
            cancelButtonText: 'বাতিল',
        });

        if (!result.isConfirmed) return;

        setIsBulkOperating(true);
        const currentSelected = [...selectedIds];

        // Optimistic UI update
        setOrders(prev => prev.filter(o => !currentSelected.includes(o.id)));
        setSelectedIds([]);

        try {
            const res = await axios.post('/admin/orders/bulk-delete', {
                ids: currentSelected
            });

            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: res.data?.message || `${count} টি অর্ডার মুছে ফেলা হয়েছে!`,
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
            });
            router.reload({ preserveScroll: true });
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'ব্যর্থ হয়েছে',
                text: err?.response?.data?.message || 'অর্ডার মুছে ফেলা সম্ভব হয়নি।',
            });
            router.reload({ preserveScroll: true });
        } finally {
            setIsBulkOperating(false);
        }
    };

    const openEdit = (o: OrderItem) => {
        setEditingOrder(o);
        setEditForm({
            customer_name: o.customer_name || '',
            phone: o.phone || '',
            customer_email: o.customer_email || '',
            shipping_address: o.shipping_address || '',
            city: o.city || '',
            zone: o.zone || '',
            total: o.total || 0,
            subtotal: o.subtotal || 0,
            shipping_fee: o.shipping_fee || 0,
            discount: o.discount || 0,
            coupon_code: o.coupon_code || '',
            courier_name: o.courier_name || '',
            courier_tracking_id: o.courier_tracking_id || '',
            payment_method: o.payment_method || 'COD',
            payment_status: o.payment_status || 'unpaid',
            notes: o.notes || '',
            shop: o.shop || '',
            status: o.status || 'Pending',
        });

        // Mark as seen immediately in local state and on backend
        if (o.is_unseen) {
            setOrders(prev => prev.map(item => item.id === o.id ? { ...item, is_unseen: false } : item));
            axios.post(`/admin/orders/${o.id}/mark-seen`).catch(() => {});
        }
    };

    const handleMarkAllSeen = () => {
        setOrders(prev => prev.map(item => ({ ...item, is_unseen: false })));
        router.post('/admin/orders/mark-all-seen', {}, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'সকল নতুন অর্ডার পঠিত হিসেবে চিহ্নিত করা হয়েছে!',
                    showConfirmButton: false,
                    timer: 2500,
                });
            }
        });
    };

    const closeEdit = () => setEditingOrder(null);

    useEffect(() => {
        if (!editingOrder) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeEdit(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [editingOrder]);

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingOrder) return;

        const oldStatus = editingOrder.status;
        const newStatus = editForm.status;

        // Instant Optimistic UI update
        const updated = { ...editingOrder, ...editForm };
        setOrders(prev => prev.map(o => o.id === editingOrder.id ? updated : o));

        if (oldStatus && newStatus && oldStatus !== newStatus) {
            setStatusCounts(prev => ({
                ...prev,
                [oldStatus]: Math.max(0, (prev[oldStatus] || 0) - 1),
                [newStatus]: (prev[newStatus] || 0) + 1,
            }));
        }

        closeEdit();

        try {
            await axios.post(`/admin/orders/${editingOrder.id}`, editForm);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'অর্ডারের তথ্য সফলভাবে আপডেট হয়েছে!',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
        } catch (err) {
            router.reload({ preserveScroll: true });
        }
    };

    const getCount = (status: string) => {
        if (statusCounts && typeof statusCounts[status] === 'number') {
            return statusCounts[status];
        }
        if (status === 'All') return orders.length;
        return orders.filter(o => o.status === status).length;
    };

    return (
        <>

            <Head title="Orders — Admin Panel" />

            <div className="space-y-6">

                {/* Header Title + Filter Pills */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Orders</h1>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            type="button"
                            onClick={handleMarkAllSeen}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition cursor-pointer whitespace-nowrap shadow-xs"
                            title="সকল নতুন অর্ডার পঠিত চিহ্নিত করুন"
                        >
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>সব পঠিত চিহ্নিত করুন</span>
                        </button>

                        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex-wrap">
                            {(['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map(st => {
                                const count = getCount(st);
                                return (
                                    <button
                                        key={st}
                                        onClick={() => setFilterStatus(st)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                                            filterStatus === st
                                                ? 'bg-purple-600 text-white shadow-xs'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                        }`}
                                    >
                                        {st}
                                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${filterStatus === st ? 'bg-purple-500/50 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Bulk Selection Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-purple-600 transition">
                            <input
                                type="checkbox"
                                checked={isAllFilteredSelected}
                                ref={el => {
                                    if (el) {
                                        el.indeterminate = isSomeFilteredSelected;
                                    }
                                }}
                                onChange={handleToggleSelectAll}
                                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 dark:border-slate-600 cursor-pointer transition"
                            />
                            <span>সব সিলেক্ট করুন</span>
                        </label>

                        {selectedIds.length > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                                {selectedIds.length} টি সিলেক্টেড
                            </span>
                        )}
                    </div>

                    {selectedIds.length > 0 ? (
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Bulk Status Select */}
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">স্ট্যাটাস পরিবর্তন:</span>
                                <select
                                    disabled={isBulkOperating}
                                    onChange={(e) => {
                                        const val = e.target.value as OrderItem['status'];
                                        if (val) {
                                            handleBulkStatusChange(val);
                                            e.target.value = '';
                                        }
                                    }}
                                    defaultValue=""
                                    className="border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-100 font-bold rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer transition"
                                >
                                    <option value="" disabled>স্ট্যাটাস নির্বাচন করুন...</option>
                                    <option value="Pending">● Pending (অপেক্ষমান)</option>
                                    <option value="Processing">● Processing (প্রসেসিং)</option>
                                    <option value="Shipped">● Shipped (শিপিং)</option>
                                    <option value="Delivered">● Delivered (ডেলিভার্ড)</option>
                                    <option value="Cancelled">● Cancelled (বাতিল)</option>
                                </select>
                            </div>

                            {/* Bulk Delete Button */}
                            <button
                                type="button"
                                disabled={isBulkOperating}
                                onClick={handleBulkDelete}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition cursor-pointer shadow-xs disabled:opacity-50"
                                title="সিলেক্ট করা সব অর্ডার মুছে ফেলুন"
                            >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                                <span>একবারে ডিলিট ({selectedIds.length})</span>
                            </button>

                            {/* Deselect All */}
                            <button
                                type="button"
                                disabled={isBulkOperating}
                                onClick={() => setSelectedIds([])}
                                className="p-1.5 rounded-xl text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                title="সিলেকশন বাতিল করুন"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
                            অর্ডার সিলেক্ট করে একসাথে স্ট্যাটাস পরিবর্তন বা একবারে ডিলিট করুন
                        </span>
                    )}
                </div>

                {/* Orders List Container */}
                <div className="space-y-3 notranslate" translate="no">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs font-semibold">
                            No orders found under {filterStatus}.
                        </div>
                    ) : (
                        filteredOrders.map(o => {
                            const isUnseen = Boolean(o.is_unseen);
                            const isPending = o.status === 'Pending';
                            const isSelected = selectedIds.includes(o.id);

                            const getStatusSelectClass = (status: OrderItem['status']) => {
                                switch (status) {
                                    case 'Pending':
                                        return 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-400 dark:border-emerald-600 text-emerald-900 dark:text-emerald-100 font-black shadow-xs ring-2 ring-emerald-400/40';
                                    case 'Processing':
                                        return 'bg-blue-100 dark:bg-blue-900/60 border-blue-400 dark:border-blue-700 text-blue-900 dark:text-blue-100 font-bold';
                                    case 'Shipped':
                                        return 'bg-purple-100 dark:bg-purple-900/60 border-purple-400 dark:border-purple-700 text-purple-900 dark:text-purple-100 font-bold';
                                    case 'Delivered':
                                        return 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold';
                                    case 'Cancelled':
                                        return 'bg-rose-100 dark:bg-rose-900/60 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 font-bold';
                                    default:
                                        return 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold';
                                }
                            };

                            const isExpanded = Boolean(expandedOrders[o.id]);

                            return (
                                <div
                                    key={o.id}
                                    className={`rounded-2xl shadow-xs transition-all duration-300 border-2 border-l-4 overflow-hidden ${
                                        isSelected
                                            ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-400 dark:border-purple-600 border-l-purple-600 ring-2 ring-purple-400/40 shadow-purple-100/50'
                                            : isUnseen
                                            ? 'bg-emerald-50/90 border-emerald-400 dark:border-emerald-700/80 border-l-emerald-500 ring-2 ring-emerald-400/25 shadow-emerald-100/50'
                                            : isPending
                                            ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900 border-l-emerald-400'
                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 border-l-slate-300 hover:border-purple-300'
                                    }`}
                                >
                                    {/* Main Row */}
                                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* Left Section: Selection Checkbox + Expand + Order Number & Customer Meta */}
                                        <div className="flex items-start gap-2.5">
                                            {/* Selection Checkbox */}
                                            <div className="pt-1.5" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectOrder(o.id)}
                                                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 dark:border-slate-600 cursor-pointer transition hover:scale-110"
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => toggleExpand(o.id)}
                                                className="mt-0.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition cursor-pointer"
                                                title={isExpanded ? 'পণ্য তালিকা হাইড করুন' : 'পণ্য তালিকা দেখুন'}
                                            >
                                                {isExpanded ? (
                                                    <ChevronDown className="w-4 h-4 text-purple-600" />
                                                ) : (
                                                    <ChevronRight className={`w-4 h-4 ${isUnseen ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
                                                )}
                                            </button>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`font-extrabold text-xs tracking-wide ${isUnseen ? 'text-emerald-950 dark:text-emerald-100 font-black' : 'text-slate-900 dark:text-white'}`}>
                                                        {o.order_number}
                                                    </span>
                                                    {isUnseen && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-xs animate-pulse">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                                            নতুন
                                                        </span>
                                                    )}
                                                    {isPending && !isUnseen && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-200/90 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-400/80 shadow-xs">
                                                            <span className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                                                            </span>
                                                            অপেক্ষমান (Pending)
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xs text-slate-500 font-semibold">
                                                    {o.customer_name} - <span className="font-mono text-slate-700 dark:text-slate-300">{o.phone}</span> - <span className="text-slate-400">{o.date}</span>
                                                </p>

                                                <div className="flex items-center gap-2 flex-wrap pt-0.5">
                                                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                                                        <Store className="w-3.5 h-3.5" /> {o.shop}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => toggleExpand(o.id)}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition cursor-pointer"
                                                    >
                                                        <Package className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                                        <span>পণ্য ({o.items?.length || 0}টি)</span>
                                                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                                    </button>

                                                    {o.items && o.items.length > 0 && !isExpanded && (
                                                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs md:max-w-md">
                                                            {o.items.map(it => `${it.product_name} (${it.quantity}টি)`).join(', ')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Section: Price + Status Dropdown + Action Buttons */}
                                        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 w-full md:w-auto mt-2 md:mt-0">
                                            
                                            {/* Price */}
                                            <span className={`font-black text-sm font-mono ${isUnseen ? 'text-emerald-950 dark:text-emerald-200' : 'text-slate-900 dark:text-white'}`}>
                                                ৳{o.total.toLocaleString()}
                                            </span>

                                            {/* Status Dropdown */}
                                            <select
                                                value={o.status}
                                                onChange={e => {
                                                    const next = e.target.value as OrderItem['status'];
                                                    if (next && o.status && next.toLowerCase() !== o.status.toLowerCase()) {
                                                        handleStatusChange(o.id, next);
                                                    }
                                                }}
                                                className={`border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer transition notranslate ${getStatusSelectClass(o.status)}`}
                                                translate="no"
                                            >
                                                <option value="Pending" className="notranslate" translate="no">● Pending</option>
                                                <option value="Processing" className="notranslate" translate="no">● Processing</option>
                                                <option value="Shipped" className="notranslate" translate="no">● Shipped</option>
                                                <option value="Delivered" className="notranslate" translate="no">● Delivered</option>
                                                <option value="Cancelled" className="notranslate" translate="no">● Cancelled</option>
                                            </select>

                                            {/* View & Edit Button */}
                                            <button
                                                onClick={() => openEdit(o)}
                                                className="border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 bg-indigo-50/60 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                                                title="অর্ডারের বিস্তারিত তথ্য দেখুন ও এডিট করুন"
                                            >
                                                <Edit2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> <span>ভিউ ও এডিট</span>
                                            </button>

                                            {/* 1-Click WhatsApp PDF Invoice Button */}
                                            <button
                                                onClick={() => handleSendWhatsApp(o)}
                                                className="border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer active:scale-95"
                                                title="এক ক্লিকে ইনভয়েস PDF কাস্টমারের হোয়াটসঅ্যাপে পাঠান"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" /> <span>WhatsApp</span>
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDelete(o.id, o.order_number)}
                                                className="border border-rose-300 text-rose-600 hover:bg-rose-50 font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> <span>Delete</span>
                                            </button>

                                        </div>
                                    </div>

                                    {/* Expanded Products Details Panel */}
                                    {isExpanded && (
                                        <div className="bg-slate-50/80 dark:bg-slate-950/50 border-t border-slate-200/80 dark:border-slate-800 p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 text-purple-700 dark:text-purple-300">
                                                    <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
                                                    <span>অর্ডারকৃত পণ্যের তালিকা ({o.items?.length || 0}টি আইটেম)</span>
                                                </h4>
                                                <span className="text-xs font-semibold text-slate-500">
                                                    সাবটোটাল: <span className="font-bold text-slate-900 dark:text-white">৳{(o.subtotal || o.total).toLocaleString()}</span>
                                                </span>
                                            </div>

                                            {(!o.items || o.items.length === 0) ? (
                                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
                                                    কোনো পণ্যের বিবরণ পাওয়া যায়নি।
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {o.items.map((item, idx) => (
                                                        <div
                                                            key={item.id || idx}
                                                            className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-300 transition"
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                {item.product_image ? (
                                                                    <img
                                                                        src={item.product_image}
                                                                        alt={item.product_name}
                                                                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
                                                                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                                                    />
                                                                ) : (
                                                                    <div className="w-12 h-12 rounded-lg bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center shrink-0 text-purple-600">
                                                                        <Package className="w-5 h-5" />
                                                                    </div>
                                                                )}
                                                                <div className="min-w-0">
                                                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={item.product_name}>
                                                                        {item.product_name}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-500 mt-0.5">
                                                                        {item.product_sku && (
                                                                            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded font-mono">
                                                                                SKU: {item.product_sku}
                                                                            </span>
                                                                        )}
                                                                        {item.options && typeof item.options === 'object' && Object.keys(item.options).length > 0 && (
                                                                            <span className="text-purple-600 dark:text-purple-400 font-medium">
                                                                                {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {item.product_slug ? (
                                                                        <a
                                                                            href={`/product/${item.product_slug}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 mt-1 font-semibold hover:underline"
                                                                        >
                                                                            <span>পণ্য দেখুন</span>
                                                                            <ExternalLink className="w-3 h-3" />
                                                                        </a>
                                                                    ) : item.product_id ? (
                                                                        <a
                                                                            href={`/product/${item.product_id}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 mt-1 font-semibold hover:underline"
                                                                        >
                                                                            <span>পণ্য দেখুন</span>
                                                                            <ExternalLink className="w-3 h-3" />
                                                                        </a>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                                    ৳{item.price.toLocaleString()} × {item.quantity}
                                                                </div>
                                                                <div className="text-xs font-black text-purple-600 dark:text-purple-400">
                                                                    ৳{item.subtotal.toLocaleString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

            </div>

            {/* Comprehensive Edit Order Modal */}
            {editingOrder && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={closeEdit}>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <Edit2 className="w-5 h-5 text-purple-600" /> Edit Full Order Details #{editingOrder.order_number}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">কাস্টমারের প্রদানকৃত সকল তথ্য ও অর্ডারের লজিস্টিক পরিবর্তন করুন</p>
                            </div>
                            <button onClick={closeEdit} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-5">
                            
                            {/* Section 0: Purchased Products Breakdown */}
                            <div className="space-y-3 bg-purple-50/60 dark:bg-purple-950/20 p-4 rounded-2xl border border-purple-200/80 dark:border-purple-800/60">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                                        <ShoppingBag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        <span>🛍️ অর্ডারকৃত পণ্যসমূহ (Purchased Products - {editingOrder.items?.length || 0}টি)</span>
                                    </h4>
                                    <span className="text-xs font-black text-purple-700 dark:text-purple-300">
                                        মোট: ৳{editingOrder.total.toLocaleString()}
                                    </span>
                                </div>

                                {(!editingOrder.items || editingOrder.items.length === 0) ? (
                                    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
                                        এই অর্ডারের জন্য কোনো পৃথক পণ্যের বিবরণ পাওয়া যায়নি।
                                    </div>
                                ) : (
                                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                                        {editingOrder.items.map((item, idx) => (
                                            <div
                                                key={item.id || idx}
                                                className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-purple-100 dark:border-purple-900/40 shadow-xs"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {item.product_image ? (
                                                        <img
                                                            src={item.product_image}
                                                            alt={item.product_name}
                                                            className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
                                                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0 text-purple-600">
                                                            <Package className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                            {item.product_name}
                                                        </h5>
                                                        <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-500 mt-0.5">
                                                            {item.product_sku && (
                                                                <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                                                                    SKU: {item.product_sku}
                                                                </span>
                                                            )}
                                                            {item.options && typeof item.options === 'object' && Object.keys(item.options).length > 0 && (
                                                                <span className="text-purple-600 dark:text-purple-400 font-medium">
                                                                    {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {item.product_slug ? (
                                                            <a
                                                                href={`/product/${item.product_slug}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 mt-1 font-semibold hover:underline"
                                                            >
                                                                <span>পণ্য দেখুন</span>
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        ) : item.product_id ? (
                                                            <a
                                                                href={`/product/${item.product_id}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 mt-1 font-semibold hover:underline"
                                                            >
                                                                <span>পণ্য দেখুন</span>
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                                                        ৳{item.price.toLocaleString()} × {item.quantity}
                                                    </div>
                                                    <div className="text-xs font-black text-purple-600 dark:text-purple-400">
                                                        ৳{item.subtotal.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Section 1: Customer Info */}
                            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700/70">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                                    <span>👤 Customer & Shipping Information (কাস্টমার ও ডেলিভারি তথ্য)</span>
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Name (নাম)</label>
                                        <input type="text" value={editForm.customer_name} onChange={e => setEditForm(f => ({ ...f, customer_name: e.target.value }))} required
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number (ফোন)</label>
                                        <input type="text" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} required
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold font-mono focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address (ইমেইল)</label>
                                        <input type="email" value={editForm.customer_email} onChange={e => setEditForm(f => ({ ...f, customer_email: e.target.value }))}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="optional@email.com" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">City / District (জেলা)</label>
                                        <input type="text" value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. Dhaka" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Zone / Thana (থানা)</label>
                                        <input type="text" value={editForm.zone} onChange={e => setEditForm(f => ({ ...f, zone: e.target.value }))}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. Mirpur" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Shipping Address (সম্পূর্ণ ঠিকানা)</label>
                                    <textarea value={editForm.shipping_address} onChange={e => setEditForm(f => ({ ...f, shipping_address: e.target.value }))} rows={2}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="House/Road details..." />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Order Notes (গ্রাহকের নোট)</label>
                                    <input type="text" value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Delivery instruction notes..." />
                                </div>
                            </div>

                            {/* Section 2: Order Financials */}
                            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700/70">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                    💰 Order Financials & Payment (মূল্য ও পেমেন্ট)
                                </h4>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subtotal (৳)</label>
                                        <input type="number" value={editForm.subtotal} onChange={e => setEditForm(f => ({ ...f, subtotal: Number(e.target.value) }))}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                                            <span>ছাড় / Discount (৳)</span>
                                            {editForm.coupon_code && (
                                                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                                                    🎟️ {editForm.coupon_code}
                                                </span>
                                            )}
                                        </label>
                                        <input type="number" value={editForm.discount} onChange={e => setEditForm(f => ({ ...f, discount: Number(e.target.value) }))}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Delivery Fee (৳)</label>
                                        <input type="number" value={editForm.shipping_fee} onChange={e => setEditForm(f => ({ ...f, shipping_fee: Number(e.target.value) }))}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Total Amount (৳)</label>
                                        <input type="number" value={editForm.total} onChange={e => setEditForm(f => ({ ...f, total: Number(e.target.value) }))} required
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                                        <select value={editForm.payment_method} onChange={e => setEditForm(f => ({ ...f, payment_method: e.target.value }))}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500">
                                            <option value="COD">Cash on Delivery (COD)</option>
                                            <option value="bkash">bKash</option>
                                            <option value="nagad">Nagad</option>
                                            <option value="card">Credit/Debit Card</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Status</label>
                                        <select value={editForm.payment_status} onChange={e => setEditForm(f => ({ ...f, payment_status: e.target.value }))}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500">
                                            <option value="unpaid">Unpaid</option>
                                            <option value="paid">Paid</option>
                                            <option value="pending">Pending</option>
                                            <option value="partial">Partial</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Courier & Status */}
                            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700/70">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                    📦 Courier Logistics & Order Status (কুরিয়ার ও স্ট্যাটাস)
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Courier Service</label>
                                        <input type="text" value={editForm.courier_name} onChange={e => setEditForm(f => ({ ...f, courier_name: e.target.value }))}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. SteadFast, Pathao" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tracking Code / ID</label>
                                        <input type="text" value={editForm.courier_tracking_id} onChange={e => setEditForm(f => ({ ...f, courier_tracking_id: e.target.value }))}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Tracking ID..." />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Order Status</label>
                                        <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value as OrderItem['status'] }))}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 notranslate" translate="no">
                                            <option value="Pending" className="notranslate" translate="no">Pending</option>
                                            <option value="Processing" className="notranslate" translate="no">Processing</option>
                                            <option value="Shipped" className="notranslate" translate="no">Shipped</option>
                                            <option value="Delivered" className="notranslate" translate="no">Delivered</option>
                                            <option value="Cancelled" className="notranslate" translate="no">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button type="button" onClick={closeEdit} className="w-1/3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs py-3 rounded-2xl transition">Cancel</button>
                                <button type="submit" className="w-2/3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-3 rounded-2xl shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> Save Full Order Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
