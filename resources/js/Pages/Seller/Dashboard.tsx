import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import {
    Package, ShoppingCart, TrendingDown, TrendingUp, PiggyBank,
    Users, CalendarClock, Coins, Truck, Wallet,
    User, ClipboardList, AlertCircle, RefreshCw, ChevronDown
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

interface SellerDashboardProps {
    stats?: any;
    shop?: any;
    recent_orders?: any[];
}

const mockChartData = [
    { name: '1', Purchases: 0, Sales: 0, Expenses: 0 },
    { name: '7', Purchases: 0, Sales: 0, Expenses: 0 },
    { name: '13', Purchases: 0, Sales: 0, Expenses: 0 },
    { name: '19', Purchases: 0, Sales: 0, Expenses: 0 },
    { name: '25', Purchases: 0, Sales: 0, Expenses: 0 },
    { name: '31', Purchases: 0, Sales: 0, Expenses: 0 },
];

const formatCurrency = (val: any) => {
    const num = Number(val || 0);
    return `৳ ${num.toFixed(2)}`;
};

const formatDue = (val: any) => {
    const num = Number(val || 0);
    return num > 0 ? `৳ ${num.toFixed(2)}` : '0';
};

export default function SellerDashboard({ stats, shop, recent_orders }: SellerDashboardProps) {
    const { props } = usePage<any>();
    const user = props.auth?.user;
    const orders = recent_orders || stats?.recent_orders || [];
    
    const userName = user?.name || 'shishir';

    const metrics = [
        {
            label: 'মোট প্রোডাক্ট',
            value: stats?.total_products ?? 0,
            icon: Package,
            topBar: 'bg-[#38bdf8]',
            iconBg: 'bg-[#38bdf8]',
        },
        {
            label: 'মোট ক্রয়',
            value: formatCurrency(stats?.total_purchases),
            icon: ShoppingCart,
            topBar: 'bg-[#fb923c]',
            iconBg: 'bg-[#fb923c]',
        },
        {
            label: 'মোট খরচ',
            value: formatCurrency(stats?.total_expenses),
            icon: TrendingDown,
            topBar: 'bg-[#2dd4bf]',
            iconBg: 'bg-[#2dd4bf]',
        },
        {
            label: 'মোট বিক্রয়',
            value: formatCurrency(stats?.total_revenue),
            icon: TrendingUp,
            topBar: 'bg-[#22c55e]',
            iconBg: 'bg-[#22c55e]',
        },
        {
            label: 'নীট লাভ',
            value: formatCurrency(stats?.net_profit),
            icon: PiggyBank,
            topBar: 'bg-[#c084fc]',
            iconBg: 'bg-[#c084fc]',
        },
        {
            label: 'শপের আয়',
            value: formatCurrency(stats?.packly_earnings || stats?.shop_earnings),
            icon: Users,
            topBar: 'bg-[#06b6d4]',
            iconBg: 'bg-[#06b6d4]',
        },
        {
            label: 'বকেয়া ক্রয়',
            value: formatDue(stats?.total_purchase_due),
            icon: CalendarClock,
            topBar: 'bg-[#fb923c]',
            iconBg: 'bg-[#fb923c]',
        },
        {
            label: 'অন্যান্য বকেয়া',
            value: formatDue(stats?.others_due),
            icon: Coins,
            topBar: 'bg-[#f43f5e]',
            iconBg: 'bg-[#f43f5e]',
        },
    ];

    const orderSummary = [
        { label: 'Pending', value: stats?.order_summary?.pending || 0, color: 'bg-blue-500' },
        { label: 'Delivered', value: stats?.order_summary?.delivered || 0, color: 'bg-emerald-500' },
        { label: 'Cancelled', value: stats?.order_summary?.cancelled || 0, color: 'bg-amber-500' },
        { label: 'Returned', value: stats?.order_summary?.returned || 0, color: 'bg-rose-500' },
        { label: 'Processing', value: stats?.order_summary?.processing || 0, color: 'bg-purple-500' },
    ];

    return (
        <>

            <Head title="Seller Dashboard" />

            <div className="space-y-6">
                
                {/* Pending Status Banner */}
                {shop?.status === 'pending' && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                            <span className="text-sm font-medium">আপনার শপটি pending! অ্যাডমিন অনুমোদনের পর প্রোডাক্ট লাইভ হবে।</span>
                        </div>
                    </div>
                )}

                {/* Welcome Banner */}
                <div className="bg-emerald-500 rounded-lg p-6 text-white flex flex-col md:flex-row items-center justify-between shadow-md relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-400 rounded-full opacity-50 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-emerald-600 rounded-full opacity-50 blur-2xl"></div>
                    
                    <div className="relative z-10 mb-4 md:mb-0">
                        <p className="text-emerald-100 text-sm mb-1">সেলার ড্যাশবোর্ড / স্বাগতম! <span className="text-xl">👋</span></p>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            {shop?.name || userName} <span className="text-emerald-200 text-lg font-normal">/ আজকের ব্যবসার সংক্ষিপ্ত বিবরণ</span>
                        </h1>
                    </div>
                    
                    <div className="relative z-10 flex gap-3">
                        {(shop?.status === 'pending' || shop?.is_approved === false || shop?.is_approved === 0) ? (
                            <button
                                type="button"
                                onClick={() => {
                                    Swal.fire({
                                        title: 'অ্যাকশন স্থগিত! 🔒',
                                        text: 'আপনার সেলার একাউন্টটি এখনও অনুমোদন অপেক্ষায় (Pending Super Admin Approval) আছে। সুপার অ্যাডমিন অনুমোদন দেওয়ার পর প্রোডাক্ট যুক্ত বা পরিচালনা করা যাবে।',
                                        icon: 'warning',
                                        confirmButtonText: 'ঠিক আছে',
                                        confirmButtonColor: '#10b981',
                                    });
                                }}
                                className="bg-white/20 text-white hover:bg-white/30 font-bold py-2 px-4 rounded shadow-sm flex items-center gap-2 transition cursor-pointer border border-white/30 backdrop-blur-md"
                            >
                                <Package className="w-4 h-4 text-amber-300" />
                                + Product (লক করা 🔒)
                            </button>
                        ) : (
                            <>
                                <Link href="/seller/pos" className="bg-white text-emerald-600 hover:bg-emerald-50 font-bold py-2 px-4 rounded shadow-sm flex items-center gap-2 transition">
                                    <ShoppingCart className="w-4 h-4" />
                                    POS Sale
                                </Link>
                                <Link href="/seller/products/create" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-4 rounded shadow-sm flex items-center gap-2 transition border border-emerald-600">
                                    <Package className="w-4 h-4" />
                                    + Product
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* ─── METRICS GRID ─── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {metrics.map((metric, idx) => (
                        <div 
                            key={idx} 
                            className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                        >
                            {/* Top colored accent bar */}
                            <div className={`h-[3.5px] w-full ${metric.topBar}`} />

                            <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-slate-500 mb-1.5 truncate">{metric.label}</p>
                                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">{metric.value}</h3>
                                </div>
                                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${metric.iconBg} flex items-center justify-center text-white shadow-xs shrink-0`}>
                                    <metric.icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ─── CHARTS & SUMMARY ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Line Chart */}
                    <div className="lg:col-span-3 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-sm font-semibold text-slate-800">বিক্রয় ও ক্রয়</h2>
                            <div className="relative">
                                <select className="appearance-none bg-white border border-slate-200 rounded-md py-1.5 pl-3 pr-8 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500">
                                    <option>This Month</option>
                                    <option>Last Month</option>
                                    <option>This Year</option>
                                </select>
                                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                            
                            <div className="ml-auto flex items-center gap-4 text-[10px] text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></div> ক্রয় (Purchases)
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div> বিক্রয় (Sales)
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-yellow-400 rounded-sm"></div> খরচ (Expenses)
                                </div>
                            </div>
                        </div>

                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={mockChartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fill: '#64748b' }} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fill: '#64748b' }}
                                        domain={[0, 2]}
                                        ticks={[0, 0.5, 1.0, 1.5, 2.0]}
                                        tickFormatter={(value) => value.toFixed(2)}
                                    />
                                    <RechartsTooltip />
                                    <Line type="monotone" dataKey="Purchases" stroke="#10b981" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="Sales" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="Expenses" stroke="#facc15" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-sm font-semibold text-slate-800">অর্ডার সারসংক্ষেপ</h2>
                            <div className="relative">
                                <select className="appearance-none bg-slate-100 border border-transparent rounded py-1 px-2.5 pr-6 text-xs text-slate-600 focus:outline-none">
                                    <option>All</option>
                                    <option>Today</option>
                                    <option>This Week</option>
                                </select>
                                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center flex-1 relative mb-6">
                            <h3 className="text-3xl font-black text-slate-800 mb-1">{stats?.total_orders || 0}</h3>
                            <p className="text-[10px] text-slate-400">মোট অর্ডার</p>
                            
                            {/* Decorative line to mimic the chart in screenshot */}
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-20 bg-slate-200 rounded-full"></div>
                            <div className="absolute right-0 bottom-0 w-24 h-1.5 bg-slate-200 rounded-full origin-right"></div>
                        </div>

                        <div className="space-y-2.5 mt-auto">
                            {orderSummary.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${item.color}`}></div>
                                        {item.label}
                                    </div>
                                    <span className="font-semibold">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── MARKETPLACE SUMMARY ─── */}
                <div>
                    <h2 className="text-xs font-semibold text-slate-800 mb-3">মার্কেটপ্লেস সারসংক্ষেপ</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Available Campaign */}
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm h-64 flex flex-col">
                            <div className="flex items-center justify-between p-4 border-b border-transparent">
                                <h3 className="text-xs font-semibold text-slate-800">চলমান ক্যাম্পেইন</h3>
                                <button className="text-xs font-bold text-emerald-500 hover:underline">সব দেখুন</button>
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center pt-2 pb-6">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                    <AlertCircle className="w-8 h-8 text-slate-300" />
                                </div>
                                <p className="text-xs text-slate-500">কোন ক্যাম্পেইন নেই</p>
                            </div>
                        </div>

                        {/* Top Selling Product */}
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm h-64 flex flex-col">
                            <div className="p-4 border-b border-slate-100">
                                <h3 className="text-xs font-semibold text-slate-800">টপ সেলিং প্রোডাক্ট</h3>
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center pt-2 pb-6">
                                <div className="relative w-32 h-32 mb-2">
                                    {/* Mock Illustration */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-24 bg-slate-100 rounded-t-full relative flex items-center justify-center">
                                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white absolute -bottom-2 z-10">
                                                <RefreshCw className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500">No Top Selling Product found</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── RECENT ORDERS ─── */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between p-4 border-b border-transparent">
                        <h3 className="text-xs font-semibold text-slate-800">সাম্প্রতিক অর্ডার সমূহ</h3>
                        <Link href="/seller/orders" className="text-xs font-bold text-emerald-500 hover:underline">সব দেখুন</Link>
                    </div>
                    {orders.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                        <th className="p-3 font-semibold">Order ID</th>
                                        <th className="p-3 font-semibold">Customer</th>
                                        <th className="p-3 font-semibold">Total</th>
                                        <th className="p-3 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order: any, idx: number) => (
                                        <tr key={idx} className="border-t border-slate-100 text-sm hover:bg-slate-50 transition-colors">
                                            <td className="p-3 text-emerald-600 font-medium">#{order.order_number}</td>
                                            <td className="p-3 text-slate-700">{order.customer_name}</td>
                                            <td className="p-3 font-medium">৳ {order.total}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    order.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                                                    order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3 text-emerald-600 border border-emerald-100">
                                <Package className="w-6 h-6" />
                            </div>
                            <h4 className="text-sm font-semibold text-slate-800 mb-1">এখনও কোনো অর্ডার আসেনি</h4>
                            <p className="text-xs text-slate-500 max-w-sm">
                                আপনার ভেন্ডর অ্যাকাউন্টটি সম্পূর্ণ নতুন ও ফ্রেশ। কোনো ক্রেতা আপনার প্রোডাক্ট অর্ডার করলে সমস্ত রিয়েল অর্ডার এখানে দেখা যাবে।
                            </p>
                        </div>
                    )}
                </div>

            </div>
        
</>
    );
}
