import React from 'react';
import { Head, router } from '@inertiajs/react';
import { BarChart3, TrendingUp, Package, Users, Download, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportsDashboard({ reports, currentRange }: { reports: any, currentRange: string }) {
    
    const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get('/admin/reports/all', { range: e.target.value }, { preserveState: true });
    };

    return (
        <>

            <Head title="Reports — Admin" />
            
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Business Reports</h1>
                        <p className="text-xs font-semibold text-amber-100 opacity-90 mt-1">Comprehensive overview of your store's performance</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="bg-white/20 rounded-xl px-3 py-2 flex items-center gap-2 border border-white/20">
                            <Calendar className="w-4 h-4" />
                            <select 
                                value={currentRange}
                                onChange={handleRangeChange}
                                className="bg-transparent text-white text-sm font-bold focus:outline-none cursor-pointer [&>option]:text-slate-800"
                            >
                                <option value="today">Today</option>
                                <option value="this_week">This Week</option>
                                <option value="this_month">This Month</option>
                                <option value="this_year">This Year</option>
                            </select>
                        </div>
                        <a href={`/admin/reports/export?range=${currentRange}`} target="_blank" className="bg-white text-amber-600 hover:bg-amber-50 font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 text-sm shadow-xs">
                            <Download className="w-4 h-4" /> Export CSV
                        </a>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
                        </div>
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</h3>
                        <p className="text-2xl font-black text-slate-800 font-mono">৳{reports.sales.total_revenue.toLocaleString()}</p>
                    </div>

                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Package className="w-5 h-5" /></div>
                        </div>
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Orders</h3>
                        <p className="text-2xl font-black text-slate-800 font-mono">{reports.orders.total_orders}</p>
                    </div>

                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Users className="w-5 h-5" /></div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+45 new</span>
                        </div>
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Customers</h3>
                        <p className="text-2xl font-black text-slate-800 font-mono">{reports.customers.total_customers}</p>
                    </div>

                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><BarChart3 className="w-5 h-5" /></div>
                        </div>
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Avg Order Value</h3>
                        <p className="text-2xl font-black text-slate-800 font-mono">৳{reports.sales.average_order_value.toLocaleString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sales Trend Chart */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs col-span-1 lg:col-span-2">
                        <h2 className="font-bold text-slate-800 mb-4">Sales Trend</h2>
                        <div className="h-72">
                            {reports.sales.trend && reports.sales.trend.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={reports.sales.trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `৳${value}`} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Area type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400">No data available for this period</div>
                            )}
                        </div>
                    </div>

                    {/* Top Selling Products */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                        <h2 className="font-bold text-slate-800 mb-4">Top Selling Products</h2>
                        <div className="space-y-4">
                            {reports.inventory.top_selling.map((item: any, i: number) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">
                                            #{i + 1}
                                        </div>
                                        <p className="font-bold text-sm text-slate-700">{item.name}</p>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                        {item.sold} sold
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Status Breakdown */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                        <h2 className="font-bold text-slate-800 mb-4">Order Breakdown</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-600">Completed</span>
                                <span className="font-mono font-bold text-emerald-600">{reports.orders.completed}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-600">Pending</span>
                                <span className="font-mono font-bold text-amber-600">{reports.orders.pending}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-600">Returned/Canceled</span>
                                <span className="font-mono font-bold text-rose-600">{reports.orders.canceled + reports.orders.returned}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        
</>
    );
}
