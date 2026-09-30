import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { RefreshCw, Search, Filter, BookOpen, Eye, Edit, Trash2, Plus, FileText } from 'lucide-react';
import Swal from 'sweetalert2';

export default function KnowledgeBase({ initialArticles }: { initialArticles?: any[] }) {
    const [search, setSearch] = useState('');

    const [articles, setArticles] = useState(initialArticles && initialArticles.length > 0 ? initialArticles : [
        { id: '#KB-3001', title: 'Getting Started Guide', category: 'General', views: '1.2k', date: '2 days ago', status: 'Published' },
        { id: '#KB-3002', title: 'How to Return an Item', category: 'Returns & Refunds', views: '850', date: '1 week ago', status: 'Published' },
        { id: '#KB-3003', title: 'Shipping Policy Overview', category: 'Shipping', views: '420', date: '3 weeks ago', status: 'Draft' },
        { id: '#KB-3004', title: 'Managing Your Account Settings', category: 'Account', views: '2.1k', date: '1 month ago', status: 'Published' },
    ]);

    return (
        <>

            <Head title="Knowledge Base — Admin" />

            <div className="space-y-6 max-w-full">
                
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded">
                                Forms & Leads
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">Live Feature Module</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Knowledge Base</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Create and manage help articles, FAQs, and documentation.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                Swal.fire({
                                    title: 'Refreshed!',
                                    text: 'Data refreshed successfully.',
                                    icon: 'success',
                                    toast: true,
                                    position: 'top-end',
                                    timer: 3000,
                                    showConfirmButton: false,
                                    timerProgressBar: true,
                                });
                            }}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                        <button 
                            onClick={() => Swal.fire({ title: 'New Article', text: 'Opening article editor...', icon: 'info', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false })} 
                            className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" /> Add Article
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
                                placeholder="Search articles..."
                                className="w-full pl-9 pr-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white dark:bg-slate-950 transition"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            <button 
                                onClick={() => Swal.fire({ title: 'Filter', text: 'Filter options coming soon.', icon: 'info', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false })} 
                                className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                            >
                                <Filter className="w-4 h-4" /> Filter
                            </button>
                        </div>
                    </div>

                    {/* Content Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-4">Article ID</th>
                                    <th className="py-3 px-4">Title</th>
                                    <th className="py-3 px-4">Category</th>
                                    <th className="py-3 px-4">Views</th>
                                    <th className="py-3 px-4">Last Updated</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                {articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase())).map((article, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group">
                                        <td className="py-3 px-4 font-mono text-violet-600 dark:text-violet-400 font-bold">{article.id}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-slate-400" />
                                                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[250px]" title={article.title}>
                                                    {article.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono text-slate-600 dark:text-slate-300">
                                                {article.category}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>{article.views}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-500">{article.date}</td>
                                        <td className="py-3 px-4">
                                            {article.status === 'Published' && <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">Published</span>}
                                            {article.status === 'Draft' && <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold">Draft</span>}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => {
                                                        Swal.fire({
                                                            title: 'Edit Article Title',
                                                            input: 'text',
                                                            inputValue: article.title,
                                                            showCancelButton: true,
                                                            confirmButtonText: 'Save',
                                                        }).then((result) => {
                                                            if (result.isConfirmed && result.value) {
                                                                const newArticles = [...articles];
                                                                newArticles[idx].title = result.value;
                                                                setArticles(newArticles);
                                                                Swal.fire('Saved!', '', 'success');
                                                            }
                                                        });
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-lg transition" title="Edit Article"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        Swal.fire({
                                                            title: 'Are you sure?',
                                                            text: "You won't be able to revert this!",
                                                            icon: 'warning',
                                                            showCancelButton: true,
                                                            confirmButtonColor: '#d33',
                                                            cancelButtonColor: '#3085d6',
                                                            confirmButtonText: 'Yes, delete it!'
                                                        }).then((result) => {
                                                            if (result.isConfirmed) {
                                                                setArticles(articles.filter((_, i) => i !== idx));
                                                                Swal.fire('Deleted!', 'The article has been deleted.', 'success');
                                                            }
                                                        });
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition" title="Delete"
                                                >
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