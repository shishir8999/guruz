import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Truck, Package } from 'lucide-react';
import Swal from 'sweetalert2';

export default function PickupRequests() {
    const dummyRequests = [
        { id: '#PR-1001', seller: 'Tech Store BD', items: 12, date: 'Oct 15, 2026', time: '10:00 AM', status: 'Pending' },
        { id: '#PR-1002', seller: 'Fashion Hub', items: 5, date: 'Oct 15, 2026', time: '11:30 AM', status: 'Accepted' },
        { id: '#PR-1003', seller: 'Gadget Gear', items: 20, date: 'Oct 14, 2026', time: '02:00 PM', status: 'Completed' },
        { id: '#PR-1004', seller: 'Book Worm', items: 3, date: 'Oct 14, 2026', time: '04:15 PM', status: 'Rejected' },
    ];

    const [requests, setRequests] = useState(dummyRequests);
    const [activeTab, setActiveTab] = useState('All');

    const tabs = [
        { name: 'All', count: requests.length },
        { name: 'Pending', count: requests.filter(r => r.status === 'Pending').length },
        { name: 'Accepted', count: requests.filter(r => r.status === 'Accepted').length },
        { name: 'Completed', count: requests.filter(r => r.status === 'Completed').length },
        { name: 'Rejected', count: requests.filter(r => r.status === 'Rejected').length },
    ];

    const filteredRequests = activeTab === 'All' ? requests : requests.filter(r => r.status === activeTab);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'Accepted': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Rejected': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
            default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        }
    };

    const handleAction = (id: string, action: string) => {
        Swal.fire({
            title: `${action} Request?`,
            text: `Are you sure you want to ${action.toLowerCase()} this pickup request?`,
            icon: action === 'Reject' ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonColor: action === 'Reject' ? '#ef4444' : '#10b981',
            cancelButtonColor: '#64748b',
            confirmButtonText: `Yes, ${action.toLowerCase()} it!`
        }).then((result) => {
            if (result.isConfirmed) {
                if(action === 'Accept') {
                    setRequests(requests.map(r => r.id === id ? {...r, status: 'Accepted'} : r));
                } else if (action === 'Reject') {
                    setRequests(requests.map(r => r.id === id ? {...r, status: 'Rejected'} : r));
                }
                Swal.fire(`${action}ed!`, `Request has been ${action.toLowerCase()}ed.`, 'success');
            }
        });
    }

    const handleDelete = (id: string) => {
        Swal.fire({
            title: 'Delete Request?',
            text: 'Are you sure you want to delete this pickup request? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                setRequests(requests.filter(r => r.id !== id));
                Swal.fire('Deleted!', 'Request has been deleted.', 'success');
            }
        });
    };

    const handleEdit = (id: string) => {
        Swal.fire({
            title: 'Edit Request',
            text: 'Edit modal would open here to change pickup schedule or items.',
            icon: 'info',
            confirmButtonColor: '#3b82f6',
        });
    };

    return (
        <>
            <Head title="Pickup Requests" />

            <div className="max-w-6xl space-y-6">
                
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-white">
                        <Truck className="w-6 h-6 text-emerald-600" />
                        <h1 className="text-2xl font-bold tracking-tight">Pickup Requests</h1>
                    </div>
                    <p className="text-sm text-slate-500">
                        Seller pickup requests waiting for courier assignment
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap items-center gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${
                                activeTab === tab.name
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            {tab.name}
                            {tab.count !== null && (
                                <span className={`text-xs ${activeTab === tab.name ? 'text-emerald-100' : 'text-slate-400'}`}>
                                    ({tab.count})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Table or Empty State */}
                {filteredRequests.length > 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Request ID</th>
                                        <th className="px-6 py-4">Seller</th>
                                        <th className="px-6 py-4">Items</th>
                                        <th className="px-6 py-4">Schedule</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredRequests.map((request) => (
                                        <tr key={request.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                                {request.id}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                                {request.seller}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                                {request.items} pkgs
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                                {request.date} <br/>
                                                <span className="text-xs text-slate-400">{request.time}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(request.status)}`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    {request.status === 'Pending' && (
                                                        <>
                                                            <button onClick={() => handleAction(request.id, 'Accept')} className="text-emerald-600 hover:text-emerald-700 font-bold text-xs transition">
                                                                Accept
                                                            </button>
                                                            <button onClick={() => handleAction(request.id, 'Reject')} className="text-rose-600 hover:text-rose-700 font-bold text-xs transition">
                                                                Reject
                                                            </button>
                                                            <span className="w-px h-3 bg-slate-300 dark:bg-slate-600"></span>
                                                        </>
                                                    )}
                                                    <button onClick={() => handleEdit(request.id)} className="text-blue-600 hover:text-blue-700 font-bold text-xs transition">
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDelete(request.id)} className="text-slate-600 hover:text-rose-600 font-bold text-xs transition">
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center min-h-[400px]">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                            <Truck className="w-8 h-8" />
                        </div>
                        <p className="text-slate-500 font-medium">No pickup requests found for '{activeTab}'</p>
                    </div>
                )}
            </div>
        
</>
    );
}
