import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Plane, Plus, CheckCircle2, XCircle, Trash2, X } from 'lucide-react';

interface LeaveRequest {
    id: number;
    staff_name: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

export default function StaffLeaves({ initialLeaves }: { initialLeaves?: LeaveRequest[] }) {
    const [leaves, setLeaves] = useState<LeaveRequest[]>(initialLeaves && initialLeaves.length > 0 ? initialLeaves : [
        { id: 1, staff_name: 'আব্দুর রহমান', leave_type: 'Sick Leave', start_date: '2026-08-05', end_date: '2026-08-07', reason: 'Fever and medical rest', status: 'Pending' },
    ]);
    const [showModal, setShowModal] = useState(false);
    const [staffName, setStaffName] = useState('');
    const [leaveType, setLeaveType] = useState('Casual Leave');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleCreateLeave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!staffName || !startDate || !endDate) return;

        const newLeave: LeaveRequest = {
            id: Date.now(),
            staff_name: staffName,
            leave_type: leaveType,
            start_date: startDate,
            end_date: endDate,
            reason: reason || 'Personal reason',
            status: 'Pending',
        };

        setLeaves([newLeave, ...leaves]);
        setShowModal(false);
        setStaffName('');
        setStartDate('');
        setEndDate('');
        setReason('');
        setSuccessMsg('Leave request created successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    const handleApprove = (id: number) => {
        setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Approved' } : l));
        setSuccessMsg('Leave request approved!');
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const handleReject = (id: number) => {
        setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Rejected' } : l));
        setSuccessMsg('Leave request rejected.');
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const handleDelete = (id: number) => {
        setLeaves(prev => prev.filter(l => l.id !== id));
    };

    return (
        <>

            <Head title="Leave Management — Admin Panel" />

            <div className="space-y-6">

                {/* Banner Header Card matching screenshot #4 */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-2xl p-6 shadow-md flex items-center justify-between gap-4">
                    <h1 className="text-2xl font-black tracking-tight">Leave Requests</h1>

                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add New
                    </button>
                </div>

                {/* Alert Notification */}
                {successMsg && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {successMsg}
                    </div>
                )}

                {/* Leave Requests Table / Container matching screenshot #4 */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                    {leaves.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 text-xs font-bold">
                            No data yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="py-3 px-4">STAFF</th>
                                        <th className="py-3 px-4">TYPE</th>
                                        <th className="py-3 px-4">DURATION</th>
                                        <th className="py-3 px-4">REASON</th>
                                        <th className="py-3 px-4">STATUS</th>
                                        <th className="py-3 px-4 text-right">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                    {leaves.map(l => (
                                        <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{l.staff_name}</td>
                                            <td className="py-3.5 px-4">
                                                <span className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded text-[11px] font-mono">
                                                    {l.leave_type}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-slate-500">{l.start_date} to {l.end_date}</td>
                                            <td className="py-3.5 px-4 text-slate-600">{l.reason}</td>
                                            <td className="py-3.5 px-4">
                                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                                                    l.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                                    l.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {l.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {l.status === 'Pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(l.id)}
                                                                className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg transition shadow-xs"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(l.id)}
                                                                className="px-2.5 py-1 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(l.id)}
                                                        className="text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded-lg transition"
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
                    )}
                </div>

            </div>

            {/* Add Leave Request Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <Plane className="w-5 h-5 text-purple-600" /> Create Leave Request
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateLeave} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Staff Name</label>
                                <input
                                    type="text"
                                    value={staffName}
                                    onChange={e => setStaffName(e.target.value)}
                                    placeholder="Select or type staff name"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Leave Type</label>
                                <select
                                    value={leaveType}
                                    onChange={e => setLeaveType(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold"
                                >
                                    <option value="Casual Leave">Casual Leave</option>
                                    <option value="Sick Leave">Sick Leave</option>
                                    <option value="Earned Leave">Earned Leave</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Reason</label>
                                <textarea
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    placeholder="Enter reason for leave..."
                                    rows={3}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="pt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        
</>
    );
}
