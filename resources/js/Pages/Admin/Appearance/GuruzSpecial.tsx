import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { RefreshCw, Search, Filter, Plus, Edit, Trash2, LayoutTemplate, Star, Crown, Zap } from 'lucide-react';

export default function GuruzSpecial() {
    const [search, setSearch] = useState('');

    const specialBlocks = [
        { id: '#GS-001', name: 'Festive Mega Sale Banner', type: 'Hero Banner', position: 'Top', icon: Star, status: 'Active' },
        { id: '#GS-002', name: 'Deal of the Day Timer', type: 'Countdown', position: 'Middle', icon: Zap, status: 'Active' },
        { id: '#GS-003', name: 'Exclusive Premium Brands', type: 'Grid Layout', position: 'Bottom', icon: Crown, status: 'Draft' },
        { id: '#GS-004', name: 'Trending Products Showcase', type: 'Carousel', position: 'Middle', icon: LayoutTemplate, status: 'Active' },
    ];

    return (
        <>

            <Head title="Guruz Special — Admin" />

            <div className="space-y-6 max-w-full">
                
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
                                Customization / Appearance
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">Live Feature Module</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Guruz Special</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Manage exclusive layout blocks and special UI elements for your storefront.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5">
                            <Plus className="w-4 h-4" /> Add Special Block
                        </button>
                    </div>
                </div>

                {/* Main Feature Content Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
                    
                    {/* Filter and Search Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-4 border-slate-100 dark:border-slate-800">
                        <div className="relative w-full sm:w-80">
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search special blocks..."
                                className="w-full pl-9 pr-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950 transition"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            <button className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5">
                                <Filter className="w-4 h-4" /> Filter
                            </button>
                        </div>
                    </div>

                    {/* Content Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-4">Block ID</th>
                                    <th className="py-3 px-4">Block Name</th>
                                    <th className="py-3 px-4">Type</th>
                                    <th className="py-3 px-4">Position</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                {specialBlocks.map((block, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group">
                                        <td className="py-3 px-4 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{block.id}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                                    <block.icon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                                </div>
                                                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[250px]" title={block.name}>
                                                    {block.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono text-slate-600 dark:text-slate-300">
                                                {block.type}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-500">{block.position}</td>
                                        <td className="py-3 px-4">
                                            {block.status === 'Active' && <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">Active</span>}
                                            {block.status === 'Draft' && <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold">Draft</span>}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition" title="Edit Block">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
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