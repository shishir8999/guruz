import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { RefreshCw, Users, Eye, Clock, TrendingDown, ArrowUpRight, ArrowDownRight, Monitor, Smartphone, Globe, MapPin } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VisitorAnalyticsProps {
    chartData?: Array<{ name: string; visitors: number; views: number }>;
    topPages?: Array<{ path: string; views: string | number; bounce: string }>;
    stats?: {
        totalVisitors: number;
        pageViews: number;
        avgDuration: string;
        bounceRate: string;
    };
}

export default function VisitorAnalytics({ chartData: initialChartData, topPages: initialTopPages, stats: initialStats }: VisitorAnalyticsProps) {
    const [dateRange, setDateRange] = useState('Last 7 Days');

    const chartData = initialChartData && initialChartData.length > 0 ? initialChartData : [
        { name: 'Mon', visitors: 4000, views: 6400 },
        { name: 'Tue', visitors: 3000, views: 5398 },
        { name: 'Wed', visitors: 2000, views: 8800 },
        { name: 'Thu', visitors: 2780, views: 3908 },
        { name: 'Fri', visitors: 1890, views: 4800 },
        { name: 'Sat', visitors: 2390, views: 3800 },
        { name: 'Sun', visitors: 3490, views: 4300 },
    ];

    const topPages = initialTopPages && initialTopPages.length > 0 ? initialTopPages : [
        { path: '/', views: '12,450', bounce: '42%' },
        { path: '/products/summer-collection', views: '8,230', bounce: '38%' },
        { path: '/categories/electronics', views: '5,120', bounce: '45%' },
        { path: '/checkout', views: '3,890', bounce: '12%' },
        { path: '/blog/latest-trends', views: '2,450', bounce: '65%' },
    ];

    return (
        <>

            <Head title="Visitor Analytics — Admin" />

            <div className="space-y-6 max-w-full">
                
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-700 dark:text-fuchsia-300 px-2 py-0.5 rounded">
                                Analytics
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">Live Feature Module</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Visitor Analytics</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Monitor your website traffic, user behavior, and engagement metrics.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-2 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition cursor-pointer outline-none"
                        >
                            <option>Today</option>
                            <option>Yesterday</option>
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>This Month</option>
                        </select>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { title: 'Total Visitors', value: initialStats ? initialStats.totalVisitors.toLocaleString() : '24,592', change: '+12.5%', isUp: true, icon: Users, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/40' },
                        { title: 'Page Views', value: initialStats ? initialStats.pageViews.toLocaleString() : '86,401', change: '+18.2%', isUp: true, icon: Eye, color: 'text-fuchsia-500', bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/40' },
                        { title: 'Avg. Session Duration', value: initialStats?.avgDuration || '2m 45s', change: '-3.1%', isUp: false, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/40' },
                        { title: 'Bounce Rate', value: initialStats?.bounceRate || '42.3%', change: '-1.5%', isUp: true, icon: TrendingDown, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/40' },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between group hover:border-fuchsia-200 dark:hover:border-fuchsia-800 transition">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{stat.title}</p>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
                                </div>
                                <div className={`p-2 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-1 text-[11px] font-bold">
                                {stat.isUp ? (
                                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
                                )}
                                <span className={stat.isUp ? 'text-emerald-500' : 'text-rose-500'}>{stat.change}</span>
                                <span className="text-slate-400 ml-1">vs previous period</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Main Chart Area */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide">Traffic Overview</h2>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="views" stroke="#d946ef" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                                    <Area type="monotone" dataKey="visitors" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Right Side Widgets */}
                    <div className="space-y-6">
                        {/* Device Breakdown */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
                            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide mb-4">Devices</h2>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1.5">
                                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300"><Smartphone className="w-3.5 h-3.5" /> Mobile</div>
                                        <span className="text-slate-900 dark:text-white">65%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                        <div className="bg-fuchsia-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1.5">
                                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300"><Monitor className="w-3.5 h-3.5" /> Desktop</div>
                                        <span className="text-slate-900 dark:text-white">32%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1.5">
                                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300"><Monitor className="w-3.5 h-3.5" /> Tablet</div>
                                        <span className="text-slate-900 dark:text-white">3%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '3%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Locations */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
                            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide mb-4">Top Locations</h2>
                            <ul className="space-y-3">
                                {[
                                    { country: 'Bangladesh', users: '15.2k', percent: '62%' },
                                    { country: 'United States', users: '4.1k', percent: '16%' },
                                    { country: 'India', users: '2.3k', percent: '9%' },
                                    { country: 'United Kingdom', users: '1.2k', percent: '5%' },
                                ].map((loc, idx) => (
                                    <li key={idx} className="flex justify-between items-center text-xs font-bold">
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {loc.country}
                                        </div>
                                        <div className="text-slate-500 flex items-center gap-3">
                                            <span>{loc.users}</span>
                                            <span className="w-10 text-right text-slate-900 dark:text-white">{loc.percent}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Top Pages Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide">Top Pages</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-6">Page Path</th>
                                    <th className="py-3 px-6 text-right">Views</th>
                                    <th className="py-3 px-6 text-right">Bounce Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                {topPages.map((page, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                        <td className="py-3 px-6">
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-3.5 h-3.5 text-slate-400" />
                                                <a href="#" className="text-fuchsia-600 dark:text-fuchsia-400 hover:underline">{page.path}</a>
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-right text-slate-900 dark:text-white font-mono">{page.views}</td>
                                        <td className="py-3 px-6 text-right text-slate-500">{page.bounce}</td>
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