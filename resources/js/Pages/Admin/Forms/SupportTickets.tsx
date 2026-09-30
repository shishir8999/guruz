import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { RefreshCw, Search, Filter, MessageCircle, AlertCircle, Clock, CheckCircle2, Eye, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function SupportTickets() {
    const [search, setSearch] = useState('');

    const [tickets, setTickets] = useState([
        { id: '#TKT-2001', customer: 'John Doe', email: 'john@example.com', subject: 'Order not received yet', priority: 'High', date: '10 mins ago', status: 'Open' },
        { id: '#TKT-2002', customer: 'Sarah Smith', email: 'sarah.s@example.com', subject: 'Refund request for defective item', priority: 'Medium', date: '1 hour ago', status: 'In Progress' },
        { id: '#TKT-2003', customer: 'David Mark', email: 'david@example.com', subject: 'How to use promo code?', priority: 'Low', date: '3 hours ago', status: 'Resolved' },
        { id: '#TKT-2004', customer: 'Mike Johnson', email: 'mike.j@example.com', subject: 'Account login issue', priority: 'High', date: 'Yesterday', status: 'Closed' },
    ]);

    return (
        <>

            <Head title="Support Tickets — Admin" />

            <div className="space-y-6 max-w-full">
                
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded">
                                Forms & Leads
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">Live Feature Module</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Support Tickets</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Manage customer inquiries, complaints, and support requests.
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
                                placeholder="Search tickets..."
                                className="w-full pl-9 pr-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-950 transition"
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
                                    <th className="py-3 px-4">Ticket ID</th>
                                    <th className="py-3 px-4">Customer</th>
                                    <th className="py-3 px-4">Subject</th>
                                    <th className="py-3 px-4">Priority</th>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                {tickets.filter(t => t.subject.toLowerCase().includes(search.toLowerCase()) || t.customer.toLowerCase().includes(search.toLowerCase())).map((ticket, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group">
                                        <td className="py-3 px-4 font-mono text-teal-600 dark:text-teal-400 font-bold">{ticket.id}</td>
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-slate-900 dark:text-white">{ticket.customer}</div>
                                            <div className="text-[10px] text-slate-400">{ticket.email}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <MessageCircle className="w-4 h-4 text-slate-400" />
                                                <span className="text-slate-900 dark:text-white font-medium truncate max-w-[200px]" title={ticket.subject}>
                                                    {ticket.subject}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {ticket.priority === 'High' && <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold"><AlertCircle className="w-3.5 h-3.5" /> High</span>}
                                            {ticket.priority === 'Medium' && <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold"><Clock className="w-3.5 h-3.5" /> Medium</span>}
                                            {ticket.priority === 'Low' && <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Low</span>}
                                        </td>
                                        <td className="py-3 px-4 text-slate-500">{ticket.date}</td>
                                        <td className="py-3 px-4">
                                            {ticket.status === 'Open' && <span className="bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-400 text-[10px] px-2 py-0.5 rounded-full font-bold">Open</span>}
                                            {ticket.status === 'In Progress' && <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold">In Progress</span>}
                                            {ticket.status === 'Resolved' && <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">Resolved</span>}
                                            {ticket.status === 'Closed' && <span className="bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-bold">Closed</span>}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => {
                                                        Swal.fire({
                                                            title: 'Edit Status',
                                                            input: 'select',
                                                            inputOptions: {
                                                                'Open': 'Open',
                                                                'In Progress': 'In Progress',
                                                                'Resolved': 'Resolved',
                                                                'Closed': 'Closed'
                                                            },
                                                            inputValue: ticket.status,
                                                            showCancelButton: true,
                                                            confirmButtonText: 'Save',
                                                        }).then((result) => {
                                                            if (result.isConfirmed && result.value) {
                                                                const newTickets = [...tickets];
                                                                newTickets[idx].status = result.value;
                                                                setTickets(newTickets);
                                                                Swal.fire('Saved!', '', 'success');
                                                            }
                                                        });
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition" title="View Ticket"
                                                >
                                                    <Eye className="w-4 h-4" />
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
                                                                setTickets(tickets.filter((_, i) => i !== idx));
                                                                Swal.fire('Deleted!', 'The ticket has been deleted.', 'success');
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