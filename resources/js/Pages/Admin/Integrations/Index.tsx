import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { RefreshCw, Settings, CheckCircle2, XCircle, Search, Mail, CreditCard, BarChart2, MessageSquare, Plug, LayoutGrid } from 'lucide-react';

export default function Integrations() {
    const [search, setSearch] = useState('');

    const integrations = [
        {
            id: 1,
            name: 'Stripe Payment Gateway',
            description: 'Accept credit card payments globally with Stripe.',
            category: 'Payments',
            status: 'active',
            icon: <CreditCard className="w-8 h-8 text-indigo-500" />,
            color: 'indigo'
        },
        {
            id: 2,
            name: 'Google Analytics 4',
            description: 'Track visitor behavior and sales conversions.',
            category: 'Analytics',
            status: 'active',
            icon: <BarChart2 className="w-8 h-8 text-amber-500" />,
            color: 'amber'
        },
        {
            id: 3,
            name: 'Mailchimp',
            description: 'Sync customers and send automated marketing emails.',
            category: 'Marketing',
            status: 'inactive',
            icon: <Mail className="w-8 h-8 text-yellow-500" />,
            color: 'yellow'
        },
        {
            id: 4,
            name: 'WhatsApp Chat',
            description: 'Allow customers to chat directly via WhatsApp.',
            category: 'Support',
            status: 'active',
            icon: <MessageSquare className="w-8 h-8 text-emerald-500" />,
            color: 'emerald'
        },
        {
            id: 5,
            name: 'Facebook Pixel',
            description: 'Track ad conversions and build target audiences.',
            category: 'Marketing',
            status: 'inactive',
            icon: <LayoutGrid className="w-8 h-8 text-blue-500" />,
            color: 'blue'
        },
        {
            id: 6,
            name: 'PayPal',
            description: 'Accept payments securely using PayPal accounts.',
            category: 'Payments',
            status: 'active',
            icon: <Plug className="w-8 h-8 text-cyan-600" />,
            color: 'cyan'
        }
    ];

    const filteredIntegrations = integrations.filter(i => 
        i.name.toLowerCase().includes(search.toLowerCase()) || 
        i.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>

            <Head title="Integrations — Admin" />

            <div className="space-y-6 max-w-full">
                
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded">
                                Integrations
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">Live Feature Module</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">App Integrations</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Connect your store with third-party tools and services.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search apps..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold rounded-xl pl-9 pr-4 py-2 w-full sm:w-64 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:text-white transition"
                            />
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 flex-shrink-0"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                    </div>
                </div>

                {/* Integrations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredIntegrations.map((app) => (
                        <div key={app.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-colors group">
                            <div className="p-6 flex-1 flex flex-col items-center text-center">
                                <div className={`w-16 h-16 rounded-2xl bg-${app.color}-50 dark:bg-${app.color}-900/20 border border-${app.color}-100 dark:border-${app.color}-800/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    {app.icon}
                                </div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                                    {app.name}
                                </h3>
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mb-3">
                                    {app.category}
                                </span>
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                                    {app.description}
                                </p>
                            </div>
                            
                            <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {app.status === 'active' ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Connected</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Disconnected</span>
                                        </>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked={app.status === 'active'} />
                                        <div className="w-9 h-5 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                    </label>
                                    {app.status === 'active' && (
                                        <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition">
                                            <Settings className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredIntegrations.length === 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                        <Plug className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No integrations found</h3>
                        <p className="text-sm font-semibold text-slate-500">Try adjusting your search query.</p>
                    </div>
                )}
            </div>
        
</>
    );
}