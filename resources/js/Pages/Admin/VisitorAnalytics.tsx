import React from 'react';
import { Head, router } from '@inertiajs/react';
import { LineChart as LineChartIcon, Users, MousePointerClick, Clock, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function VisitorAnalytics({ analytics, currentRange }: { analytics: any, currentRange: string }) {
    
    const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get('/admin/analytics/visitors', { range: e.target.value }, { preserveState: true });
    };

    return (
        <>

            <Head title="Analytics — Admin" />
            
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Visitor Analytics</h1>
                        <p className="text-xs font-semibold text-blue-100 opacity-90 mt-1">Track store traffic and visitor behavior</p>
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
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><LineChartIcon className="w-5 h-5" /></div>
                        </div>
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Page Views</h3>
                        <p className="text-2xl font-black text-slate-800 font-mono">{analytics.overview.total_page_views.toLocaleString()}</p>
                    </div>

                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Users className="w-5 h-5" /></div>
                        </div>
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Unique Visitors</h3>
                        <p className="text-2xl font-black text-slate-800 font-mono">{analytics.overview.unique_visitors.toLocaleString()}</p>
                    </div>

                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><MousePointerClick className="w-5 h-5" /></div>
                        </div>
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Bounce Rate</h3>
                        <p className="text-2xl font-black text-slate-800 font-mono">{analytics.overview.bounce_rate}</p>
                    </div>

                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Clock className="w-5 h-5" /></div>
                        </div>
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Avg Session Duration</h3>
                        <p className="text-2xl font-black text-slate-800 font-mono">{analytics.overview.avg_session_duration}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Traffic Trend Chart */}
                    <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                        <h2 className="font-bold text-slate-800 mb-4">Traffic Trend</h2>
                        <div className="h-72">
                            {analytics.traffic_trend && analytics.traffic_trend.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={analytics.traffic_trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Area yAxisId="left" type="monotone" dataKey="views" name="Page Views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                                        <Area yAxisId="right" type="monotone" dataKey="visitors" name="Unique Visitors" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400">No data available for this period</div>
                            )}
                        </div>
                    </div>

                    {/* Top Pages */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                        <h2 className="font-bold text-slate-800 mb-4">Top Pages</h2>
                        <div className="space-y-3">
                            {analytics.top_pages.map((page: any, i: number) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="font-mono text-sm text-blue-600 break-all">{page.path}</span>
                                    <span className="text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded-full border border-slate-200 whitespace-nowrap">
                                        {page.views.toLocaleString()} views
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Devices */}
                    <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                        <h2 className="font-bold text-slate-800 mb-4">Device Breakdown</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                                    <span>Mobile</span>
                                    <span>{analytics.device_breakdown.mobile}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${analytics.device_breakdown.mobile}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                                    <span>Desktop</span>
                                    <span>{analytics.device_breakdown.desktop}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${analytics.device_breakdown.desktop}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                                    <span>Tablet</span>
                                    <span>{analytics.device_breakdown.tablet}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${analytics.device_breakdown.tablet}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        
</>
    );
}
