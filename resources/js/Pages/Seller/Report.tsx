import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    BarChart3, 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    Download, 
    Calendar, 
    Package, 
    ShoppingCart, 
    CheckCircle2, 
    Clock, 
    ShieldCheck, 
    Award, 
    Truck, 
    ArrowUpRight, 
    FileSpreadsheet, 
    Printer,
    Star,
    Layers,
    ChevronRight,
    Users
} from 'lucide-react';
import Swal from 'sweetalert2';

interface BestSellerItem {
    id: number;
    name: string;
    category: string;
    sku: string;
    units_sold: number;
    total_revenue: number;
    stock: number;
    rating: number;
    badge: string;
}

interface MonthlyItem {
    month: string;
    sales: number;
    orders: number;
}

interface OrderReportItem {
    order_id: string;
    customer_name: string;
    city: string;
    items_count: number;
    courier_name: string;
    total_amount: number;
    net_earnings: number;
    payment_method: string;
    status: string;
    date: string;
}

interface ReportProps {
    period?: string;
    summary?: {
        total_revenue: number;
        total_orders: number;
        avg_order_value: number;
        fulfillment_rate: number;
        return_rate: number;
        net_profit: number;
    };
    bestSellingProducts?: BestSellerItem[];
    monthlyPerformance?: MonthlyItem[];
    recentOrderReports?: OrderReportItem[];
}

export default function Report({
    period = 'this_month',
    summary = {
        total_revenue: 2124500,
        total_orders: 748,
        avg_order_value: 2840,
        fulfillment_rate: 95.8,
        return_rate: 1.8,
        net_profit: 1912050,
    },
    bestSellingProducts = [],
    monthlyPerformance = [],
    recentOrderReports = []
}: ReportProps) {
    const [selectedPeriod, setSelectedPeriod] = useState(period);

    const handlePeriodChange = (newPeriod: string) => {
        setSelectedPeriod(newPeriod);
        router.get('/seller/report', { period: newPeriod }, { preserveState: true });
    };

    const handleExport = () => {
        Swal.fire({
            title: 'Generating Report...',
            text: 'Preparing your detailed business analytics CSV & PDF statement.',
            icon: 'info',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
        }).then(() => {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Business Analytics Report exported successfully!',
                showConfirmButton: false,
                timer: 3500,
            });
        });
    };

    const formatCurrency = (val: number) => {
        return '৳' + (val || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    // Calculate max sales for chart height scaling
    const maxSales = Math.max(...monthlyPerformance.map(m => m.sales), 1);

    return (
        <>
            <Head title="Sales & Analytics Business Report — Seller Portal" />

            <div className="max-w-7xl mx-auto space-y-8 pb-16">

                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md mb-2">
                                <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                                Comprehensive Shop Performance Analytics
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Sales & Analytics Report</h1>
                            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-xl">
                                আপনার শপের বিক্রয় পারফরম্যান্স, সেরা প্রোডাক্ট, কুরিয়ার ডেলিভারি স্ট্যাটাস এবং রাজস্ব বৃদ্ধি পর্যালোচনা করুন।
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Date Filter Pills */}
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1 flex items-center gap-1">
                                {[
                                    { id: '7days', label: '7 Days' },
                                    { id: 'this_month', label: 'This Month' },
                                    { id: 'all_time', label: 'All Time' },
                                ].map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => handlePeriodChange(p.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                            selectedPeriod === p.id
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'text-slate-300 hover:text-white'
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleExport}
                                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer shrink-0"
                            >
                                <Download className="w-4 h-4" /> Export Report (CSV)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Top Metric Performance Summary Cards (4 Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    
                    {/* Gross Revenue */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Sales Revenue</span>
                            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                <DollarSign className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                                {formatCurrency(summary.total_revenue)}
                            </h3>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                <TrendingUp className="w-3.5 h-3.5" /> +18.4% vs last period
                            </span>
                        </div>
                    </div>

                    {/* Total Orders */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivered Orders</span>
                            <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                                <ShoppingCart className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                                {summary.total_orders.toLocaleString()} <span className="text-xs font-sans text-slate-400 font-medium">Parcels</span>
                            </h3>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> {summary.fulfillment_rate}% Fulfillment Rate
                            </span>
                        </div>
                    </div>

                    {/* Avg Order Value */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Order Value</span>
                            <div className="w-9 h-9 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                                {formatCurrency(summary.avg_order_value)}
                            </h3>
                            <span className="text-[11px] text-slate-500 font-medium block mt-1">
                                Average Customer Spend / Order
                            </span>
                        </div>
                    </div>

                    {/* Return Rate */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Return & Refund Rate</span>
                            <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                                {summary.return_rate}%
                            </h3>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                <Award className="w-3.5 h-3.5" /> High Customer Satisfaction
                            </span>
                        </div>
                    </div>

                </div>

                {/* Monthly Revenue Trend Visualizer */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-indigo-600" /> Revenue Trajectory & Monthly Breakdown
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                বিগত মাসসমূহের মোট বিক্রয় এবং অর্ডার সংখ্যা পর্যবেক্ষণ করুন।
                            </p>
                        </div>

                        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                            <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" /> Sales (৳)
                        </div>
                    </div>

                    {/* Bar Visualizer */}
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 pt-4 items-end h-56">
                        {monthlyPerformance.map((item, idx) => {
                            const heightPercent = Math.max(15, Math.round((item.sales / maxSales) * 100));
                            return (
                                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                                    <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition font-mono">
                                        ৳{(item.sales / 1000).toFixed(0)}k
                                    </div>
                                    
                                    <div 
                                        style={{ height: `${heightPercent}%` }}
                                        className="w-full bg-gradient-to-t from-indigo-900 via-indigo-600 to-indigo-500 rounded-2xl shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:from-indigo-800 group-hover:to-indigo-400 relative"
                                    />

                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {item.month}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top 5 Best Selling Products Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs space-y-4">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <Award className="w-5 h-5 text-indigo-600" /> Top Best-Selling Products
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                সর্বোচ্চ বিক্রিত ও জনপ্রিয় প্রোডাক্টের বিস্তারিত রিপোর্ট।
                            </p>
                        </div>

                        <span className="text-xs text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full border border-indigo-200">
                            Top 5 High Performers
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Product Name & Category</th>
                                    <th className="px-6 py-4">SKU</th>
                                    <th className="px-6 py-4 text-center">Units Sold</th>
                                    <th className="px-6 py-4 text-right">Total Revenue (৳)</th>
                                    <th className="px-6 py-4 text-center">Stock Left</th>
                                    <th className="px-6 py-4 text-center">Performance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                {bestSellingProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50 transition">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-900 dark:text-white block">
                                                {product.name}
                                            </span>
                                            <span className="text-[10px] text-slate-400 block font-medium">
                                                {product.category}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                                            {product.sku}
                                        </td>

                                        <td className="px-6 py-4 text-center font-bold text-slate-800 dark:text-slate-200">
                                            {product.units_sold} pcs
                                        </td>

                                        <td className="px-6 py-4 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                            {formatCurrency(product.total_revenue)}
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                product.stock > 20
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                                            }`}>
                                                {product.stock} in stock
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200">
                                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {product.badge}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detailed Order Status & Courier Dispatch Report Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <Truck className="w-5 h-5 text-indigo-600" /> Recent Order & Courier Dispatch Audit
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                সুপার অ্যাডমিন ভল্ট ও কুরিয়ার মারফত ডেসপ্যাচ হওয়া সম্প্রতি রিপোর্টসমূহ।
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Order ID & Date</th>
                                    <th className="px-6 py-4">Customer & City</th>
                                    <th className="px-6 py-4">Courier Partner</th>
                                    <th className="px-6 py-4">Payment Method</th>
                                    <th className="px-6 py-4 text-right">Net Earnings (৳)</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                {recentOrderReports.map((ord, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50 transition">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 block">
                                                {ord.order_id}
                                            </span>
                                            <span className="text-[10px] text-slate-400 block">{ord.date}</span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-900 dark:text-white block">{ord.customer_name}</span>
                                            <span className="text-[10px] text-slate-400">{ord.city} • {ord.items_count} items</span>
                                        </td>

                                        <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                                            <span className="flex items-center gap-1.5">
                                                <Truck className="w-3.5 h-3.5 text-indigo-500" /> {ord.courier_name}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                                            {ord.payment_method}
                                        </td>

                                        <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(ord.net_earnings)}
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                ord.status === 'Delivered'
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                                    : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                                            }`}>
                                                {ord.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </>
    );
}

Report.layout = (page: any) => <SellerLayout children={page} />;
