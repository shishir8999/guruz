import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { RefreshCw, Search, Mail, Eye, Trash2, User, Clock, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Submissions({ initialSubmissions }: { initialSubmissions?: any[] }) {
    const [search, setSearch] = useState('');
    
    const [submissions, setSubmissions] = useState(initialSubmissions && initialSubmissions.length > 0 ? initialSubmissions : [
        { id: '#SUB-001', name: 'Alice Cooper', email: 'alice@example.com', subject: 'Partnership Inquiry', date: '2 hours ago', status: 'Unread' },
        { id: '#SUB-002', name: 'Bob Smith', email: 'bob@example.com', subject: 'Pricing Question', date: '5 hours ago', status: 'Read' },
        { id: '#SUB-003', name: 'Charlie Davis', email: 'charlie@example.com', subject: 'Technical Issue', date: 'Yesterday', status: 'Replied' },
    ]);

    return (
        <>
            <Head title="Contact Forms & Leads — Admin" />
            
            <div className="space-y-6 max-w-full">
                
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-700 dark:text-fuchsia-300 px-2 py-0.5 rounded">
                                Forms & Leads
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">Live Feature Module</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Contact Submissions</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Manage leads and messages from your contact forms.
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
                                placeholder="Search submissions..."
                                className="w-full pl-9 pr-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500 bg-white dark:bg-slate-950 transition"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>
                    </div>

                    {/* Content Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-4">Sub ID</th>
                                    <th className="py-3 px-4">Sender</th>
                                    <th className="py-3 px-4">Subject</th>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                {submissions.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.subject.toLowerCase().includes(search.toLowerCase())).map((sub, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group">
                                        <td className="py-3 px-4 font-mono text-fuchsia-600 dark:text-fuchsia-400 font-bold">{sub.id}</td>
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400"/> {sub.name}</div>
                                            <div className="text-[10px] text-slate-400">{sub.email}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-slate-900 dark:text-white font-medium truncate max-w-[200px]" title={sub.subject}>
                                                {sub.subject}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{sub.date}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {sub.status === 'Unread' && <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold">Unread</span>}
                                            {sub.status === 'Read' && <span className="bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-400 text-[10px] px-2 py-0.5 rounded-full font-bold">Read</span>}
                                            {sub.status === 'Replied' && <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">Replied</span>}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => Swal.fire({ title: 'Message Content', text: 'Viewing full message content...', icon: 'info', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false })} 
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition" title="View Message"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        Swal.fire({
                                                            title: 'Edit Status',
                                                            input: 'select',
                                                            inputOptions: {
                                                                'Unread': 'Unread',
                                                                'Read': 'Read',
                                                                'Replied': 'Replied',
                                                            },
                                                            inputValue: sub.status,
                                                            showCancelButton: true,
                                                            confirmButtonText: 'Save',
                                                        }).then((result) => {
                                                            if (result.isConfirmed && result.value) {
                                                                const newSubs = [...submissions];
                                                                newSubs[idx].status = result.value;
                                                                setSubmissions(newSubs);
                                                                Swal.fire('Saved!', '', 'success');
                                                            }
                                                        });
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition" title="Edit Status"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
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
                                                                setSubmissions(submissions.filter((_, i) => i !== idx));
                                                                Swal.fire('Deleted!', 'The submission has been deleted.', 'success');
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
