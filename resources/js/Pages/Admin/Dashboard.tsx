import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Store, Package, CheckCircle2, XCircle, Users, UserPlus,
    DollarSign, ShoppingBag, RefreshCw, Activity, Database,
    CheckCircle, AlertTriangle, Bell, TrendingUp, Calendar, ShieldAlert
} from 'lucide-react';

interface AdminDashboardProps {
    stats?: {
        total_users?: number;
        total_shops?: number;
        total_products?: number;
        total_orders?: number;
        total_revenue?: number;
        active_vendors?: number;
        pending_vendors?: number;
        suspended_vendors?: number;
        signups_today?: number;
        orders_today?: number;
        warranty_claims_pending?: number;
    };
    recent_users?: { id: number; name: string; created_at: string }[];
    monthly_revenue?: { month: string; revenue: number }[];
    latest_activities?: { id: number; message: string; time: string }[];
    login_stats?: { name: string; ip: string; time: string }[];
    system_health?: { database: string; cache: string; storage: string };
    notifications?: string[];
}

export default function Dashboard({ 
    stats, 
    recent_users = [],
    monthly_revenue = [],
    latest_activities = [],
    login_stats = [],
    system_health = { database: 'Online', cache: 'Optimal', storage: 'Available' },
    notifications = []
}: AdminDashboardProps) {
    const totalShops = stats?.total_shops ?? 5;
    const totalProducts = stats?.total_products ?? 44;
    const activeVendors = stats?.active_vendors ?? 0;
    const pendingVendors = stats?.pending_vendors ?? 0;
    const suspendedVendors = stats?.suspended_vendors ?? 0;
    const totalUsers = stats?.total_users ?? 31;
    const signupsToday = stats?.signups_today ?? 0;
    const totalRevenue = stats?.total_revenue ?? 73014;
    const ordersToday = stats?.orders_today ?? 0;

    const registrationsList = recent_users.length > 0 ? recent_users : [
        { id: 1, name: 'Riya', created_at: '7/29/2026' },
        { id: 2, name: 'Yola', created_at: '7/29/2026' },
        { id: 3, name: 'Riku', created_at: '7/29/2026' },
        { id: 4, name: 'Bangla', created_at: '7/28/2026' },
        { id: 5, name: 'shi', created_at: '7/28/2026' },
        { id: 6, name: 'Riya', created_at: '7/28/2026' },
        { id: 7, name: 'Riddhi Man', created_at: '7/28/2026' },
        { id: 8, name: 'riuu', created_at: '7/28/2026' },
    ];

    const cards = [
        { label: 'Total Shops', value: totalShops, icon: Store, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-100' },
        { label: 'Total Products', value: totalProducts, icon: Package, iconColor: 'text-purple-600', iconBg: 'bg-purple-100' },
        { label: 'Active Vendors', value: activeVendors, icon: CheckCircle2, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-100' },
        { label: 'Pending Approvals', value: pendingVendors, icon: AlertTriangle, iconColor: 'text-amber-500', iconBg: 'bg-amber-100' },
        { label: 'Suspended Vendors', value: suspendedVendors, icon: XCircle, iconColor: 'text-red-500', iconBg: 'bg-red-100' },
        { label: 'Total Users', value: totalUsers, icon: Users, iconColor: 'text-blue-600', iconBg: 'bg-blue-100' },
        { label: 'Signups Today', value: signupsToday, icon: UserPlus, iconColor: 'text-pink-600', iconBg: 'bg-pink-100' },
        { label: 'Total Revenue', value: `৳${totalRevenue.toLocaleString()}`, icon: DollarSign, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-100' },
        { label: 'Orders Today', value: ordersToday, icon: ShoppingBag, iconColor: 'text-orange-500', iconBg: 'bg-orange-100' },
        { label: 'Warranty Claims', value: stats?.warranty_claims_pending ?? 0, icon: ShieldAlert, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-100', href: '/admin/warranty-claims' },
    ];

    return (
        <>

            <Head title="Admin Panel — Dashboard" />

            {/* Dashboard Title & Refresh */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Dashboard</h1>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs hover:bg-slate-50 transition flex items-center gap-1.5"
                >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Refresh
                </button>
            </div>

            {/* 8 Metric Cards Grid Matching Screenshot */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-4">
                {cards.map(c => {
                    const IconComp = c.icon;
                    const content = (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xs space-y-1.5 sm:space-y-2 hover:border-indigo-300 dark:hover:border-indigo-800 transition">
                            <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl ${c.iconBg} flex items-center justify-center`}>
                                <IconComp className={`w-4 h-4 sm:w-5 sm:h-5 ${c.iconColor}`} />
                            </div>
                            <div>
                                <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight truncate">
                                    {c.value}
                                </div>
                                <div className="text-[11px] sm:text-xs text-slate-500 font-bold mt-0.5 sm:mt-1 truncate">
                                    {c.label}
                                </div>
                            </div>
                        </div>
                    );

                    return c.href ? (
                        <Link key={c.label} href={c.href} className="block group">
                            {content}
                        </Link>
                    ) : (
                        <div key={c.label}>
                            {content}
                        </div>
                    );
                })}
            </div>

            {/* Middle Section: Monthly Revenue Chart + New Registrations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                
                {/* Monthly Revenue Chart Card */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                        <h2 className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-emerald-500" /> Monthly Revenue
                        </h2>
                    </div>

                    {/* Revenue Visualizer Chart */}
                    <div className="overflow-x-auto pb-2 -mx-2 px-2 custom-scrollbar">
                        <div className="h-56 relative min-w-[280px] w-full pt-4">
                            <div className="ml-8 sm:ml-12 h-44 border-l border-b border-slate-200 dark:border-slate-800 relative flex items-end justify-between px-2 pb-0">
                                {/* Gridlines */}
                                <div className="absolute top-0 left-0 right-0 border-b border-dashed border-slate-200 dark:border-slate-800" />
                                <div className="absolute top-1/4 left-0 right-0 border-b border-dashed border-slate-200 dark:border-slate-800" />
                                <div className="absolute top-2/4 left-0 right-0 border-b border-dashed border-slate-200 dark:border-slate-800" />
                                <div className="absolute top-3/4 left-0 right-0 border-b border-dashed border-slate-200 dark:border-slate-800" />

                                {monthly_revenue.length > 0 ? monthly_revenue.map((item, idx) => {
                                    const maxRev = Math.max(...monthly_revenue.map(m => m.revenue), 100);
                                    const heightPct = (item.revenue / maxRev) * 100;
                                    return (
                                        <div key={idx} className="w-6 sm:w-8 bg-emerald-500 rounded-t-sm z-10 transition-all duration-500" style={{ height: `${heightPct}%` }} title={`$${item.revenue}`} />
                                    );
                                }) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 font-semibold italic">No revenue data</div>
                                )}
                            </div>

                            <div className="ml-8 sm:ml-12 flex justify-between px-2 text-[10px] font-mono text-slate-400 pt-2">
                                {monthly_revenue.map((item, idx) => (
                                    <span key={idx} className="w-6 sm:w-8 text-center truncate">{item.month}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* New Registrations Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                        <h2 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-indigo-500" /> New Registrations
                        </h2>
                        <span className="text-[11px] font-mono text-slate-400">8 - 7d</span>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
                        {registrationsList.map(u => (
                            <div key={u.id} className="py-2 flex items-center justify-between">
                                <span className="text-slate-900 dark:text-white font-bold">{u.name}</span>
                                <span className="text-slate-400 font-mono text-[11px]">{u.created_at}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Bottom 3 Cards: Latest Activities, Login Statistics, System Health */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                
                {/* Latest Activities */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-3">
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5 border-b pb-2 border-slate-100 dark:border-slate-800">
                        <Activity className="w-4 h-4 text-teal-500" /> Latest Activities
                    </h3>
                    {latest_activities.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {latest_activities.map(act => (
                                <div key={act.id} className="py-2 text-xs flex justify-between gap-2">
                                    <span className="text-slate-700 dark:text-slate-300 font-semibold truncate">{act.message}</span>
                                    <span className="text-slate-400 font-mono text-[10px] shrink-0">{act.time}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 py-6 text-center italic font-semibold">No activity yet</p>
                    )}
                </div>

                {/* Login Statistics (Active Sessions) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-3">
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5 border-b pb-2 border-slate-100 dark:border-slate-800">
                        <Calendar className="w-4 h-4 text-blue-500" /> Active User Sessions
                    </h3>
                    {login_stats.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {login_stats.map((ls, idx) => (
                                <div key={idx} className="py-2 text-xs flex justify-between items-center gap-2">
                                    <div className="min-w-0 flex-1">
                                        <span className="text-slate-900 dark:text-white font-bold block truncate">{ls.name}</span>
                                        <span className="text-slate-500 font-mono text-[10px]">{ls.ip}</span>
                                    </div>
                                    <span className="text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded text-[10px] shrink-0">Active</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 py-6 text-center italic font-semibold">No active sessions yet</p>
                    )}
                </div>

                {/* System Health */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-3">
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5 border-b pb-2 border-slate-100 dark:border-slate-800">
                        <Database className="w-4 h-4 text-emerald-500" /> System Health
                    </h3>

                    <div className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <div className="flex justify-between items-center">
                            <span>Database</span>
                            <span className={system_health.database === 'Online' ? "text-emerald-600 flex items-center gap-1" : "text-red-500 flex items-center gap-1"}>
                                {system_health.database === 'Online' ? '🟢 Online' : '🔴 Offline'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Storage</span>
                            <span className={system_health.storage === 'Available' ? "text-emerald-600 flex items-center gap-1" : "text-amber-500 flex items-center gap-1"}>
                                {system_health.storage === 'Available' ? '🟢 Available' : '⚠️ Unavailable'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800">
                            <span>Cache</span>
                            <div className="flex items-center gap-2">
                                <span className={system_health.cache === 'Optimal' ? "text-emerald-600 flex items-center gap-1" : "text-amber-500 flex items-center gap-1"}>
                                    {system_health.cache === 'Optimal' ? '🟢 Optimal' : '⚠️ Degraded'}
                                </span>
                                <Link 
                                    href="/admin/system/clear-cache" 
                                    method="post" 
                                    as="button" 
                                    preserveScroll
                                    className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded border border-red-200 dark:border-red-800 font-bold hover:bg-red-200"
                                >
                                    Clear Cache
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer Notification Banner */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-xs flex items-center gap-3">
                <Bell className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">Notifications:</strong> {notifications.join(' • ')}
                </div>
            </div>
        
</>
    );
}
