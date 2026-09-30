import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    Search, 
    Filter, 
    Eye, 
    Download, 
    MoreVertical, 
    Package, 
    ChevronLeft, 
    ChevronRight, 
    Calendar, 
    AlertCircle, 
    CheckCircle2, 
    Clock, 
    Printer, 
    XCircle,
    X,
    Phone,
    Mail,
    MapPin,
    Share2,
    Building2,
    Truck,
    DollarSign,
    Edit3,
    Trash2,
    Copy
} from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

interface OrderItem {
    id?: number;
    product_name?: string;
    quantity?: number;
    price?: number;
}

interface OrderRecord {
    id: number;
    order_number: string;
    created_at: string;
    customer_name: string;
    customer_email?: string | null;
    customer_phone?: string | null;
    shipping_address?: string | null;
    city?: string | null;
    zone?: string | null;
    subtotal?: number;
    shipping_fee?: number;
    discount?: number;
    total: number;
    payment_method?: string;
    payment_status: string;
    status: string;
    courier_name?: string | null;
    courier_tracking_id?: string | null;
    notes?: string | null;
    items_count?: number;
    items?: OrderItem[];
    latest_pickup?: {
        request_number?: string;
        courier_name?: string;
        courier_consignment_id?: string;
        status?: string;
        created_at?: string;
    } | null;
}

interface OrdersProps {
    orders?: OrderRecord[];
    shop?: any;
    couriers?: Array<{ id: number; courier_name: string }>;
    shopAddress?: string;
    shopPhone?: string;
    filters?: {
        search?: string;
        status?: string;
    };
}

export default function Orders({ 
    orders = [], 
    shop = null, 
    couriers = [], 
    shopAddress = '', 
    shopPhone = '', 
    filters = {} 
}: OrdersProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState(filters.status || 'All Orders');

    const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderRecord | null>(null);
    const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<OrderRecord | null>(null);
    const [editingOrder, setEditingOrder] = useState<OrderRecord | null>(null);
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

    // Courier Pickup Request & Tracking State
    const [pickupModalOrder, setPickupModalOrder] = useState<OrderRecord | null>(null);
    const [trackingModalOrder, setTrackingModalOrder] = useState<OrderRecord | null>(null);
    const [submittingPickup, setSubmittingPickup] = useState(false);
    const [pickupForm, setPickupForm] = useState({
        courier_name: 'Steadfast Courier',
        pickup_address: shopAddress || shop?.address || 'House 42, Road 11, Block D, Banani, Dhaka',
        phone: shopPhone || '01700000000',
        parcel_count: 1,
        estimated_weight: '1.0 kg',
        cod_amount: 0,
        notes: '',
    });

    const handleDeleteOrder = (order: OrderRecord) => {
        setMenuOpenId(null);
        Swal.fire({
            title: 'অর্ডার মুছে ফেলতে চান?',
            text: `অর্ডার #${order.order_number} স্থায়ীভাবে ডিলিট হয়ে যাবে!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
            cancelButtonText: 'বাতিল'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/seller/orders/${order.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire('Deleted!', 'অর্ডারটি সফলভাবে মুছে ফেলা হয়েছে।', 'success');
                    }
                });
            }
        });
    };

    const handleSaveEditOrder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingOrder) return;
        router.put(`/seller/orders/${editingOrder.id}`, editingOrder, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingOrder(null);
                Swal.fire('Updated!', 'অর্ডার ইনফরমেশন সফলভাবে আপডেট হয়েছে।', 'success');
            }
        });
    };

    const tabs = ['All Orders', 'Processing', 'Shipped', 'Delivered', 'Pending', 'Cancelled'];

    const filteredOrders = orders.filter(o => {
        const ordNo = o.order_number || `GZ-${o.id}`;
        const name = o.customer_name || '';
        const phone = o.customer_phone || '';

        const matchesSearch = 
            ordNo.toLowerCase().includes(search.toLowerCase()) ||
            name.toLowerCase().includes(search.toLowerCase()) ||
            phone.includes(search);

        let matchesTab = true;
        if (activeTab !== 'All Orders') {
            const st = (o.status || '').toLowerCase();
            const tabLower = activeTab.toLowerCase();
            if (tabLower === 'shipped') {
                matchesTab = ['shipped', 'ready_for_pickup', 'in_transit'].includes(st);
            } else if (tabLower === 'delivered') {
                matchesTab = ['delivered', 'completed'].includes(st);
            } else {
                matchesTab = st === tabLower;
            }
        }

        return matchesSearch && matchesTab;
    });

    const openPickupModal = (order: OrderRecord) => {
        setMenuOpenId(null);
        const defaultCourier = (couriers && couriers.length > 0) ? couriers[0].courier_name : 'Steadfast Courier';
        const isPaid = (order.payment_status || '').toLowerCase() === 'paid';
        const cod = isPaid ? 0 : Number(order.total || 0);

        setPickupForm({
            courier_name: order.courier_name || defaultCourier,
            pickup_address: shopAddress || shop?.address || 'House 42, Road 11, Block D, Banani, Dhaka',
            phone: shopPhone || '01700000000',
            parcel_count: order.items_count || (order.items ? order.items.length : 1),
            estimated_weight: '1.0 kg',
            cod_amount: cod,
            notes: `Customer: ${order.customer_name}, Phone: ${order.customer_phone || ''}`,
        });
        setPickupModalOrder(order);
    };

    const handleConfirmPickupRequest = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pickupModalOrder) return;
        setSubmittingPickup(true);

        router.post(`/seller/orders/${pickupModalOrder.id}/pickup-request`, pickupForm, {
            preserveScroll: true,
            onSuccess: () => {
                setSubmittingPickup(false);
                setPickupModalOrder(null);
                Swal.fire({
                    title: 'কুরিয়ারে পাঠানো হয়েছে!',
                    text: 'ডেলিভারি পিকআপ রিকোয়েস্ট সফলভাবে কুরিয়ারে পাঠানো হয়েছে। রাইডার পার্সেল সংগ্রহ করবে।',
                    icon: 'success',
                    confirmButtonColor: '#4f46e5',
                    confirmButtonText: 'ঠিক আছে'
                });
            },
            onError: () => {
                setSubmittingPickup(false);
                Swal.fire('ত্রুটি!', 'পিকআপ রিকোয়েস্ট পাঠাতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।', 'error');
            }
        });
    };

    const handleMarkDelivered = (order: OrderRecord) => {
        setMenuOpenId(null);
        Swal.fire({
            title: 'ডেলিভারি সম্পন্ন নিশ্চিতকরণ',
            text: `অর্ডার #${order.order_number} কি গ্রাহকের কাছে সফলভাবে ডেলিভারি সম্পন্ন হয়েছে?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'হ্যাঁ, ডেলিভারি সম্পন্ন!',
            cancelButtonText: 'বাতিল'
        }).then((res) => {
            if (res.isConfirmed) {
                router.post(`/seller/orders/${order.id}/mark-delivered`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: 'ডেলিভারি সম্পন্ন!',
                            text: `অর্ডার #${order.order_number} সফলভাবে ডেলিভার্ড হিসেবে সম্পন্ন হয়েছে।`,
                            icon: 'success',
                            confirmButtonColor: '#10b981',
                            confirmButtonText: 'ঠিক আছে'
                        });
                    }
                });
            }
        });
    };

    const getStatusBadge = (status: string) => {
        const st = (status || '').toLowerCase();
        switch (st) {
            case 'delivered':
                return 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400';
            case 'processing':
                return 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400';
            case 'shipped':
                return 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-400';
            case 'cancelled':
                return 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-400';
            default: // pending
                return 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-400';
        }
    };

    const getPaymentBadge = (status: string) => {
        const st = (status || '').toLowerCase();
        switch (st) {
            case 'paid':
                return 'text-emerald-700 bg-emerald-50 border-emerald-200';
            case 'failed':
                return 'text-rose-700 bg-rose-50 border-rose-200';
            default:
                return 'text-amber-700 bg-amber-50 border-amber-200';
        }
    };

    const getPaymentColor = getPaymentBadge;

    const handleUpdateStatus = (id: number, field: 'status' | 'payment_status', val: string) => {
        setMenuOpenId(null);
        router.put(`/seller/orders/${id}`, {
            [field]: val
        }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `Order ${field.replace('_', ' ')} set to ${val}!`,
                    showConfirmButton: false,
                    timer: 2000,
                });
            }
        });
    };

    const handleSendWhatsApp = (order: OrderRecord) => {
        let phoneNum = (order.customer_phone || '').replace(/[^0-9]/g, '');
        if (phoneNum.startsWith('01')) {
            phoneNum = '88' + phoneNum;
        } else if (phoneNum.startsWith('1') && phoneNum.length === 10) {
            phoneNum = '880' + phoneNum;
        }

        const pdfDownloadUrl = `${window.location.origin}/invoices/${order.order_number}/download?download=1`;

        // 1. Send Email Notification with PDF Invoice asynchronously
        try {
            axios.post(`/seller/orders/${order.id}/send-invoice-email`);
        } catch (e) {}

        // 2. Auto trigger PDF download locally
        const pdfLink = document.createElement('a');
        pdfLink.href = pdfDownloadUrl;
        pdfLink.download = `Invoice_${order.order_number}.pdf`;
        document.body.appendChild(pdfLink);
        pdfLink.click();
        document.body.removeChild(pdfLink);

        const shopName = shop?.name || 'Guruz Store';

        // 3. Open WhatsApp web / app
        const msg = 
`📄 *অফিসিয়াল ক্যাশ মেমো / ইনভয়েস PDF — ${shopName}*
---------------------------------------
প্রিয় *${order.customer_name}*,
আপনার অর্ডারের ক্যাশ মেমো বিবরণ নিচে দেওয়া হলো:

*অর্ডার নম্বর:* #${order.order_number}
*মোট টাকা:* ৳${Number(order.total || 0).toLocaleString()}
*পেমেন্ট স্ট্যাটাস:* ${order.payment_status || 'Paid'}
*অর্ডার স্ট্যাটাস:* ${(order.status || 'Pending').toUpperCase()}
*তারিখ:* ${order.created_at || ''}

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

    const handleExportCsv = () => {
        window.location.href = '/seller/orders/export';
    };

    return (
        <>
            <Head title="Order Management — Store Orders & Web Invoices" />

            <div className="max-w-7xl mx-auto space-y-6 pb-20">
                
                {/* Header Section */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md mb-2">
                            <Package className="w-3.5 h-3.5 text-indigo-400" />
                            Store Orders & Delivery Dispatch
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Order Management</h1>
                        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                            আপনার শপের অর্ডারসমূহ প্রসেস করুন, ইনভয়েস ওয়েবে প্রিভিউ ও ডাউনলোড করুন।
                        </p>
                    </div>

                    <button 
                        onClick={handleExportCsv}
                        className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shrink-0 backdrop-blur-md z-10"
                    >
                        <Download className="w-4 h-4 text-emerald-400" /> Export CSV Report
                    </button>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Status Tabs */}
                        <div className="flex overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto gap-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                                        activeTab === tab
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                            : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        
                        {/* Search Input */}
                        <div className="relative w-full md:w-72">
                            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search order ID, customer name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Orders List Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Order ID & Date</th>
                                    <th className="px-6 py-4">Customer Details</th>
                                    <th className="px-6 py-4 text-center">Items</th>
                                    <th className="px-6 py-4 text-right">Total Amount</th>
                                    <th className="px-6 py-4 text-center">Payment Status</th>
                                    <th className="px-6 py-4 text-center">Order Status</th>
                                    <th className="px-6 py-4 text-center">Courier & Delivery</th>
                                    <th className="px-6 py-4 text-center w-36">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                {filteredOrders.map((order) => {
                                    const ordNo = order.order_number || `GZ-${order.id}`;
                                    const formattedDate = order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Recent';
                                    const st = (order.status || '').toLowerCase();

                                    return (
                                        <tr key={order.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-950/50 transition relative">
                                            <td className="px-6 py-4">
                                                <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                                                    #{ordNo}
                                                </div>
                                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
                                                    <Calendar className="w-3 h-3" /> {formattedDate}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900 dark:text-white text-sm">
                                                    {order.customer_name}
                                                </div>
                                                {order.customer_phone && (
                                                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                                        <Phone className="w-3 h-3" /> {order.customer_phone}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold">
                                                    {order.items_count || (order.items ? order.items.length : 1)} Items
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 dark:text-white text-sm">
                                                ৳{Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>

                                            {/* Payment Badge */}
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border ${getPaymentColor(order.payment_status)}`}>
                                                    {order.payment_status}
                                                </span>
                                            </td>

                                            {/* Order Status Badge */}
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border capitalize ${getStatusBadge(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>

                                            {/* Courier & Delivery Column */}
                                            <td className="px-6 py-4 text-center">
                                                {st === 'processing' && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => openPickupModal(order)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition cursor-pointer"
                                                        title="কুরিয়ারে পিকআপ রিকোয়েস্ট পাঠান"
                                                    >
                                                        <Truck className="w-3.5 h-3.5" />
                                                        <span>পিকআপ রিকোয়েস্ট</span>
                                                    </button>
                                                )}

                                                {st === 'pending' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300" title="সুপার অ্যাডমিন অর্ডারটি প্রসেসিং করলে ভেন্ডর পিকআপ রিকোয়েস্ট পাঠাতে পারবে">
                                                        <Clock className="w-3 h-3 text-amber-600" /> অ্যাডমিন পর্যালোচনায়
                                                    </span>
                                                )}

                                                {['shipped', 'ready_for_pickup', 'in_transit'].includes(st) && (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300">
                                                            <Truck className="w-3 h-3" /> {order.courier_name || 'Courier'}
                                                        </div>
                                                        {order.courier_tracking_id && (
                                                            <span className="text-[10px] font-mono bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded font-bold">
                                                                {order.courier_tracking_id}
                                                            </span>
                                                        )}
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setTrackingModalOrder(order)}
                                                                className="px-2 py-0.5 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-md transition cursor-pointer"
                                                            >
                                                                ট্র্যাক
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleMarkDelivered(order)}
                                                                className="px-2 py-0.5 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 rounded-md transition cursor-pointer"
                                                            >
                                                                ডেলিভার্ড করুন
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {['delivered', 'completed'].includes(st) && (
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ডেলিভারি সম্পন্ন
                                                        </span>
                                                        {order.courier_name && (
                                                            <span className="text-[10px] text-slate-400 font-medium">{order.courier_name}</span>
                                                        )}
                                                    </div>
                                                )}

                                                {st === 'cancelled' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-400">
                                                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> বাতিলকৃত
                                                    </span>
                                                )}
                                            </td>

                                            {/* Always Visible Action Buttons */}
                                            <td className="px-6 py-4 text-center relative">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* Eye Icon - View Details */}
                                                    <button 
                                                        type="button"
                                                        onClick={() => setSelectedOrderDetails(order)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl transition cursor-pointer border border-indigo-100 dark:border-indigo-900/50 shadow-2xs" 
                                                        title="View Order Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    {/* Printer Icon - Web Invoice Preview */}
                                                    <button 
                                                        type="button"
                                                        onClick={() => setSelectedInvoiceOrder(order)}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-xl transition cursor-pointer border border-emerald-100 dark:border-emerald-900/50 shadow-2xs" 
                                                        title="Web Invoice Preview & Download"
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                    </button>

                                                    {/* WhatsApp 1-Click PDF Invoice Button */}
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleSendWhatsApp(order)}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-xl transition cursor-pointer border border-emerald-500 shadow-2xs flex items-center gap-1 active:scale-95" 
                                                        title="1-Click Send Invoice PDF via WhatsApp"
                                                    >
                                                        <Share2 className="w-4 h-4 text-emerald-500" />
                                                    </button>

                                                    {/* Three-Dots Menu Icon */}
                                                    <div className="relative">
                                                        <button 
                                                            type="button"
                                                            onClick={() => setMenuOpenId(menuOpenId === order.id ? null : order.id)}
                                                            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer border border-slate-200 dark:border-slate-800 shadow-2xs"
                                                            title="More Actions"
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>

                                                        {/* Action Dropdown Popup */}
                                                        {menuOpenId === order.id && (
                                                            <div className="absolute right-0 top-10 z-30 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 space-y-1 text-left animate-in fade-in zoom-in duration-100">
                                                                {st === 'processing' && (
                                                                    <button 
                                                                        onClick={() => openPickupModal(order)}
                                                                        className="w-full px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl transition flex items-center gap-2 cursor-pointer"
                                                                    >
                                                                        <Truck className="w-3.5 h-3.5 text-indigo-600" /> ডেলিভারি পিকআপ রিকোয়েস্ট
                                                                    </button>
                                                                )}

                                                                {order.courier_tracking_id && (
                                                                    <button 
                                                                        onClick={() => { setTrackingModalOrder(order); setMenuOpenId(null); }}
                                                                        className="w-full px-3 py-2 text-xs font-bold text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950 rounded-xl transition flex items-center gap-2 cursor-pointer"
                                                                    >
                                                                        <Truck className="w-3.5 h-3.5 text-purple-600" /> কুরিয়ার লাইভ ট্র্যাকিং
                                                                    </button>
                                                                )}

                                                                {!['delivered', 'completed', 'cancelled'].includes(st) && (
                                                                    <button 
                                                                        onClick={() => handleMarkDelivered(order)}
                                                                        className="w-full px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-xl transition flex items-center gap-2 cursor-pointer"
                                                                    >
                                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ডেলিভারি সম্পন্ন করুন
                                                                    </button>
                                                                )}

                                                                <button 
                                                                    onClick={() => { setSelectedOrderDetails(order); setMenuOpenId(null); }}
                                                                    className="w-full px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 rounded-xl transition flex items-center gap-2 cursor-pointer"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5 text-indigo-600" /> View Order Details
                                                                </button>
                                                                <button 
                                                                    onClick={() => { setSelectedInvoiceOrder(order); setMenuOpenId(null); }}
                                                                    className="w-full px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 rounded-xl transition flex items-center gap-2 cursor-pointer"
                                                                >
                                                                    <Printer className="w-3.5 h-3.5 text-emerald-600" /> Web Invoice Preview
                                                                </button>

                                                                <button 
                                                                    onClick={() => { setEditingOrder(order); setMenuOpenId(null); }}
                                                                    className="w-full px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-xl transition flex items-center gap-2 cursor-pointer"
                                                                >
                                                                    <Edit3 className="w-3.5 h-3.5 text-blue-600" /> Edit Order Details
                                                                </button>

                                                                <button 
                                                                    onClick={() => handleDeleteOrder(order)}
                                                                    className="w-full px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition flex items-center gap-2 cursor-pointer"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Delete Order
                                                                </button>

                                                                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                                                                <span className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Set Order Status</span>

                                                                <button 
                                                                    onClick={() => handleUpdateStatus(order.id, 'status', 'delivered')}
                                                                    className="w-full px-3 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl transition flex items-center gap-2 cursor-pointer"
                                                                >
                                                                    Mark Delivered
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(order.id, 'status', 'shipped')}
                                                                    className="w-full px-3 py-1.5 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded-xl transition flex items-center gap-2 cursor-pointer"
                                                                >
                                                                    Mark Shipped
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(order.id, 'status', 'cancelled')}
                                                                    className="w-full px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-2 cursor-pointer"
                                                                >
                                                                    Mark Cancelled
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filteredOrders.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                                            <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                                                <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 flex items-center justify-center shadow-inner">
                                                    <Package className="w-8 h-8 stroke-[1.5]" />
                                                </div>
                                                <div>
                                                    <p className="font-extrabold text-base text-slate-700 dark:text-slate-200">
                                                        এখনও কোনো অর্ডার আসেনি
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                                        আপনার শপটি সম্পূর্ণ নতুন ও ফ্রেশ। ক্রেতারা প্রোডাক্ট অর্ডার করলে সমস্ত অর্ডারের তথ্য ও ইনভয়েস এই তালিকায় দেখা যাবে।
                                                    </p>
                                                </div>
                                                <Link
                                                    href="/seller/products/create"
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer mt-2"
                                                >
                                                    <Plus className="w-4 h-4" /> নতুন প্রোডাক্ট যোগ করুন
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Web Invoice Preview & Download Modal */}
            {selectedInvoiceOrder && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
                        
                        {/* Invoice Header Bar */}
                        <div className="flex items-center justify-between border-b pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black">
                                    g
                                </div>
                                <div>
                                    <h2 className="font-black text-xl tracking-tight text-slate-900">
                                        {shop?.name || 'Guruz E-Commerce Store'}
                                    </h2>
                                    <p className="text-xs text-slate-500 font-mono">
                                        Official Sales Invoice • #{selectedInvoiceOrder.order_number || `GZ-${selectedInvoiceOrder.id}`}
                                    </p>
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedInvoiceOrder(null)}
                                className="text-slate-400 hover:text-slate-700 p-1"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Customer & Order Metadata Grid */}
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Details</span>
                                <span className="font-bold text-slate-900 text-sm block mt-0.5">{selectedInvoiceOrder.customer_name}</span>
                                <span className="block text-slate-600 font-mono mt-0.5">{selectedInvoiceOrder.customer_phone}</span>
                                <span className="block text-slate-500 font-mono">{selectedInvoiceOrder.customer_email}</span>
                            </div>

                            <div className="text-right">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Invoice Date</span>
                                <span className="font-mono font-bold text-slate-900 text-xs block mt-0.5">
                                    {selectedInvoiceOrder.created_at ? new Date(selectedInvoiceOrder.created_at).toLocaleString() : 'Recent'}
                                </span>
                                <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    Payment: {selectedInvoiceOrder.payment_status} ({selectedInvoiceOrder.payment_method || 'Cash'})
                                </span>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivery Address</span>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-medium text-slate-700 flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                                <span>{selectedInvoiceOrder.shipping_address || 'Standard Delivery Location'}</span>
                            </div>
                        </div>

                        {/* Invoice Summary */}
                        <div className="border-t border-b py-4 space-y-2 text-xs font-mono">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Subtotal Amount:</span>
                                <span className="font-bold text-slate-900">৳{Number(selectedInvoiceOrder.subtotal || selectedInvoiceOrder.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>

                            {Number(selectedInvoiceOrder.shipping_fee || 0) > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Shipping Charge:</span>
                                    <span className="font-bold text-slate-900">+৳{Number(selectedInvoiceOrder.shipping_fee).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}

                            {Number(selectedInvoiceOrder.discount || 0) > 0 && (
                                <div className="flex justify-between text-rose-600">
                                    <span>Discount Applied:</span>
                                    <span>-৳{Number(selectedInvoiceOrder.discount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-base font-black text-slate-900 border-t pt-3">
                                <span>Grand Total Payable:</span>
                                <span className="text-emerald-600">৳{Number(selectedInvoiceOrder.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        {/* Print & Download Action Bar */}
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-[10px] text-slate-400 font-mono">
                                Thank you for shopping with us!
                            </span>

                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setSelectedInvoiceOrder(null)}
                                    className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                                >
                                    Close Preview
                                </button>
                                <button 
                                    onClick={() => window.print()}
                                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-500/30 transition flex items-center gap-2 cursor-pointer"
                                >
                                    <Printer className="w-4 h-4" /> Download / Print Invoice PDF
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Order Details View Modal */}
            {selectedOrderDetails && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <Eye className="w-5 h-5 text-indigo-500" /> Order Details
                            </h3>
                            <button 
                                onClick={() => setSelectedOrderDetails(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs font-medium">
                            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Order ID:</span>
                                    <span className="font-mono font-bold text-indigo-600">{selectedOrderDetails.order_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Customer:</span>
                                    <span className="font-bold">{selectedOrderDetails.customer_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Phone:</span>
                                    <span className="font-mono">{selectedOrderDetails.customer_phone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Total Amount:</span>
                                    <span className="font-mono font-bold text-emerald-600">৳{Number(selectedOrderDetails.total).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Payment Status:</span>
                                    <span className="font-bold text-emerald-600">{selectedOrderDetails.payment_status}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button 
                                onClick={() => setSelectedOrderDetails(null)}
                                className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                            >
                                Close
                            </button>
                            <button 
                                onClick={() => {
                                    const ord = selectedOrderDetails;
                                    setSelectedOrderDetails(null);
                                    setSelectedInvoiceOrder(ord);
                                }}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
                            >
                                <Printer className="w-4 h-4" /> Open Web Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Order Modal */}
            {editingOrder && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <Edit3 className="w-5 h-5 text-indigo-600" /> Edit Order #{editingOrder.order_number}
                                </h3>
                                <p className="text-xs font-medium text-slate-500 mt-0.5">অর্ডারের কাস্টমার তথ্য এবং পেমেন্ট বিবরণ পরিবর্তন করুন</p>
                            </div>
                            <button 
                                onClick={() => setEditingOrder(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEditOrder} className="space-y-4 text-xs font-medium">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Customer Name</label>
                                    <input 
                                        type="text" 
                                        value={editingOrder.customer_name || ''} 
                                        onChange={(e) => setEditingOrder({...editingOrder, customer_name: e.target.value})}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 font-bold" 
                                        required 
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Phone Number</label>
                                    <input 
                                        type="text" 
                                        value={editingOrder.customer_phone || ''} 
                                        onChange={(e) => setEditingOrder({...editingOrder, customer_phone: e.target.value})}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 font-bold" 
                                        required 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Email Address</label>
                                <input 
                                    type="email" 
                                    value={editingOrder.customer_email || ''} 
                                    onChange={(e) => setEditingOrder({...editingOrder, customer_email: e.target.value})}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500" 
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Shipping Address</label>
                                <textarea 
                                    rows={2} 
                                    value={editingOrder.shipping_address || ''} 
                                    onChange={(e) => setEditingOrder({...editingOrder, shipping_address: e.target.value})}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500" 
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Total Amount (৳)</label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        value={editingOrder.total || 0} 
                                        onChange={(e) => setEditingOrder({...editingOrder, total: parseFloat(e.target.value) || 0})}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 font-black text-emerald-600" 
                                        required 
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Payment Status</label>
                                    <select 
                                        value={editingOrder.payment_status || 'Pending'} 
                                        onChange={(e) => setEditingOrder({...editingOrder, payment_status: e.target.value})}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 font-bold"
                                    >
                                        <option value="Paid">Paid</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Failed">Failed</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Order Status</label>
                                    <select 
                                        value={editingOrder.status || 'pending'} 
                                        onChange={(e) => setEditingOrder({...editingOrder, status: e.target.value})}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 font-bold"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    type="button"
                                    onClick={() => setEditingOrder(null)}
                                    className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                                >
                                    Save Order Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Courier Delivery Pickup Request Modal */}
            {pickupModalOrder && (
                <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150 my-8">
                        <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shadow-inner">
                                    <Truck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        কুরিয়ার ডেলিভারি পিকআপ রিকোয়েস্ট
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        অর্ডার #{pickupModalOrder.order_number} — ভেন্ডর হাব থেকে কুরিয়ারে হস্তান্তর
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPickupModalOrder(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleConfirmPickupRequest} className="space-y-4 text-xs">
                            {/* 1. Select Courier */}
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2">
                                    কুরিয়ার পার্টনার নির্বাচন করুন <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {couriers.map((c) => {
                                        const isSelected = pickupForm.courier_name === c.courier_name;
                                        return (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => setPickupForm({ ...pickupForm, courier_name: c.courier_name })}
                                                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                                                    isSelected 
                                                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-sm'
                                                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300'
                                                }`}
                                            >
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                                                    <Truck className="w-4 h-4" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="font-bold text-xs truncate">{c.courier_name}</div>
                                                    <div className="text-[10px] text-slate-400">অ্যাডমিন মাস্টার API</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 2. Customer Delivery Destination */}
                            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">গ্রাহকের ডেলিভারি গন্তব্য</span>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-900 dark:text-white">{pickupModalOrder.customer_name}</span>
                                    <span className="font-mono text-indigo-600 font-bold">{pickupModalOrder.customer_phone}</span>
                                </div>
                                <div className="text-slate-600 dark:text-slate-400 text-[11px] flex items-start gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                    <span>{pickupModalOrder.shipping_address || 'ঠিকানা দেওয়া হয়নি'}{pickupModalOrder.city ? `, ${pickupModalOrder.city}` : ''}</span>
                                </div>
                            </div>

                            {/* 3. Vendor Pickup Hub Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                                        ভেন্ডর যোগাযোগের ফোন <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={pickupForm.phone}
                                        onChange={(e) => setPickupForm({ ...pickupForm, phone: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold text-xs focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                                        আনুমানিক ওজন <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={pickupForm.estimated_weight}
                                        onChange={(e) => setPickupForm({ ...pickupForm, estimated_weight: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="0.5 kg">০.৫ কেজি (0.5 kg)</option>
                                        <option value="1.0 kg">১.০ কেজি (1.0 kg)</option>
                                        <option value="1.5 kg">১.৫ কেজি (1.5 kg)</option>
                                        <option value="2.0 kg">২.০ কেজি (2.0 kg)</option>
                                        <option value="3.0 kg">৩.০ কেজি (3.0 kg)</option>
                                        <option value="5.0 kg">৫.০ কেজি (5.0 kg)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                                    ভেন্ডর পিকআপ হাবের ঠিকানা <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows={2}
                                    value={pickupForm.pickup_address}
                                    onChange={(e) => setPickupForm({ ...pickupForm, pickup_address: e.target.value })}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                                    placeholder="রাইডার যে ঠিকানায় এসে পার্সেল সংগ্রহ করবে"
                                    required
                                />
                            </div>

                            {/* 4. Parcel Count & COD */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                                        পার্সেল সংখ্যা
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={pickupForm.parcel_count}
                                        onChange={(e) => setPickupForm({ ...pickupForm, parcel_count: parseInt(e.target.value) || 1 })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                                        ক্যাশ অন ডেলিভারি (COD ৳)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={pickupForm.cod_amount}
                                        onChange={(e) => setPickupForm({ ...pickupForm, cod_amount: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-emerald-600 font-bold font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                                    রাইডারের জন্য বিশেষ নির্দেশনা / নোট
                                </label>
                                <input
                                    type="text"
                                    value={pickupForm.notes}
                                    onChange={(e) => setPickupForm({ ...pickupForm, notes: e.target.value })}
                                    placeholder="যেমন: দ্রুত ডেলিভারি বা সতর্কতার সাথে হ্যান্ডেল করুন"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setPickupModalOrder(null)}
                                    className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingPickup}
                                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    <Truck className="w-4 h-4" />
                                    <span>{submittingPickup ? 'পাঠানো হচ্ছে...' : 'কুরিয়ারে পিকআপ রিকোয়েস্ট পাঠান'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Courier Live Tracking Modal */}
            {trackingModalOrder && (
                <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center shadow-inner">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                                        কুরিয়ার লাইভ ট্র্যাকিং
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        অর্ডার #{trackingModalOrder.order_number}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setTrackingModalOrder(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 font-medium">কুরিয়ার পার্টনার:</span>
                                <span className="font-bold text-purple-600">{trackingModalOrder.courier_name || 'Steadfast Courier'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 font-medium">কনসাইনমেন্ট / ট্র্যাকিং আইডি:</span>
                                <span className="font-mono font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                                    {trackingModalOrder.courier_tracking_id || 'ST-LIVE-TRACK'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 font-medium">কাস্টমার নাম ও ফোন:</span>
                                <span className="font-bold">{trackingModalOrder.customer_name} ({trackingModalOrder.customer_phone})</span>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-4 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-200 dark:before:bg-indigo-900 text-xs">
                            <div className="relative">
                                <div className="absolute -left-[29px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950 flex items-center justify-center text-white">
                                    <CheckCircle2 className="w-3 h-3" />
                                </div>
                                <div className="font-bold text-slate-900 dark:text-white">অর্ডার গৃহীত হয়েছে</div>
                                <div className="text-[10px] text-slate-400">কাস্টমার কর্তৃক অর্ডার প্লেস সম্পন্ন</div>
                            </div>

                            <div className="relative">
                                <div className="absolute -left-[29px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950 flex items-center justify-center text-white">
                                    <CheckCircle2 className="w-3 h-3" />
                                </div>
                                <div className="font-bold text-slate-900 dark:text-white">সুপার অ্যাডমিন প্রসেসিং সম্পন্ন</div>
                                <div className="text-[10px] text-slate-400">অর্ডার যাচাই করে ভেন্ডরকে প্রস্তুত করার নির্দেশ প্রদান</div>
                            </div>

                            <div className="relative">
                                <div className="absolute -left-[29px] top-0.5 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-950 flex items-center justify-center text-white">
                                    <Truck className="w-2.5 h-2.5" />
                                </div>
                                <div className="font-bold text-indigo-600">কুরিয়ারে পিকআপ রিকোয়েস্ট সম্পন্ন</div>
                                <div className="text-[10px] text-slate-400">রাইডারের পার্সেল সংগ্রহের জন্য শিডিউল করা হয়েছে</div>
                            </div>

                            <div className="relative">
                                <div className={`absolute -left-[29px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                                    ['delivered', 'completed'].includes((trackingModalOrder.status || '').toLowerCase()) 
                                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-950' 
                                        : 'bg-slate-300 dark:bg-slate-700 text-transparent'
                                }`}>
                                    <CheckCircle2 className="w-3 h-3" />
                                </div>
                                <div className="font-bold text-slate-700 dark:text-slate-300">ডেলিভারি সম্পন্ন</div>
                                <div className="text-[10px] text-slate-400">গ্রাহকের ঠিকানায় পার্সেল হস্তান্তর</div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                            {!['delivered', 'completed'].includes((trackingModalOrder.status || '').toLowerCase()) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const o = trackingModalOrder;
                                        setTrackingModalOrder(null);
                                        handleMarkDelivered(o);
                                    }}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>ডেলিভারি সম্পন্ন নিশ্চিত করুন</span>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setTrackingModalOrder(null)}
                                className="ml-auto px-5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                            >
                                বন্ধ করুন
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Orders.layout = (page: any) => <SellerLayout children={page} />;
