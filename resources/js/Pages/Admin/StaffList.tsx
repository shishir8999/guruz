import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { UserCheck, Plus, Trash2, Edit, X } from 'lucide-react';
import Swal from 'sweetalert2';

interface StaffItem {
    id: number;
    staff_id: string;
    name: string;
    designation: string;
    department: string;
    email: string;
    phone: string;
    salary: number;
    status: 'Active' | 'Inactive';
}

const emptyForm = () => ({
    name: '',
    designation: '',
    department: '',
    email: '',
    phone: '',
    salary: 20000,
    status: 'Active' as 'Active' | 'Inactive',
});

export default function StaffList({ staffList: initialStaff = [] }: { staffList?: StaffItem[] }) {
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm());
    const [processing, setProcessing] = useState(false);

    const isEditing = editingId !== null;

    // ESC key closes modal
    useEffect(() => {
        if (!showModal) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [showModal]);

    const openAdd = () => {
        setEditingId(null);
        setForm(emptyForm());
        setShowModal(true);
    };

    const openEdit = (s: StaffItem) => {
        setEditingId(s.id);
        setForm({
            name: s.name,
            designation: s.designation,
            department: s.department,
            email: s.email,
            phone: s.phone,
            salary: s.salary,
            status: s.status,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setForm(emptyForm());
    };

    const handleField = (field: string, value: string | number) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim()) {
            Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Name ও Email আবশ্যক।', showConfirmButton: false, timer: 3000 });
            return;
        }

        const savedName = form.name;
        const wasEditing = isEditing;
        const currentEditId = editingId;

        setProcessing(true);

        if (wasEditing && currentEditId !== null) {
            // UPDATE — real backend call
            router.put(`/admin/staff/${currentEditId}`, form, {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                    setProcessing(false);
                    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `${savedName} আপডেট হয়েছে!`, showConfirmButton: false, timer: 3000, timerProgressBar: true });
                },
                onError: () => {
                    setProcessing(false);
                    Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'আপডেট করতে সমস্যা হয়েছে।', showConfirmButton: false, timer: 3000 });
                },
            });
        } else {
            // STORE — real backend call
            router.post('/admin/staff/store', form, {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                    setProcessing(false);
                    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `${savedName} যোগ করা হয়েছে!`, showConfirmButton: false, timer: 3000, timerProgressBar: true });
                },
                onError: () => {
                    setProcessing(false);
                    Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'স্টাফ যোগ করতে সমস্যা হয়েছে।', showConfirmButton: false, timer: 3000 });
                },
            });
        }
    };

    const handleDelete = (s: StaffItem) => {
        Swal.fire({
            title: 'স্টাফ ডিলিট করবেন?',
            html: `<b>${s.name}</b> কে স্টাফ লিস্ট থেকে সরিয়ে দেবেন?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'হ্যাঁ, ডিলিট করো',
            cancelButtonText: 'না, বাতিল',
        }).then(result => {
            if (result.isConfirmed) {
                // DESTROY — real backend call
                router.delete(`/admin/staff/${s.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `${s.name} ডিলিট হয়েছে।`, showConfirmButton: false, timer: 3000, timerProgressBar: true });
                    },
                    onError: () => {
                        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'ডিলিট করতে সমস্যা হয়েছে।', showConfirmButton: false, timer: 3000 });
                    },
                });
            }
        });
    };

    return (
        <>
            <Head title="Staff Management — Admin Panel" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Staff Management</h1>
                    <button
                        type="button"
                        onClick={openAdd}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add Staff
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-4">STAFF ID</th>
                                    <th className="py-3 px-4">NAME</th>
                                    <th className="py-3 px-4">DESIGNATION</th>
                                    <th className="py-3 px-4">DEPARTMENT</th>
                                    <th className="py-3 px-4">EMAIL</th>
                                    <th className="py-3 px-4">PHONE</th>
                                    <th className="py-3 px-4">SALARY</th>
                                    <th className="py-3 px-4">STATUS</th>
                                    <th className="py-3 px-4 text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                {initialStaff.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-16 text-center text-slate-400 text-xs font-semibold">
                                            কোনো স্টাফ নেই। উপরে "+ Add Staff" বাটনে ক্লিক করুন।
                                        </td>
                                    </tr>
                                ) : (
                                    initialStaff.map(s => (
                                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                            <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{s.staff_id}</td>
                                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{s.name}</td>
                                            <td className="py-3.5 px-4">{s.designation}</td>
                                            <td className="py-3.5 px-4">
                                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono">{s.department}</span>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono">{s.email}</td>
                                            <td className="py-3.5 px-4 font-mono">{s.phone || '—'}</td>
                                            <td className="py-3.5 px-4 font-bold text-emerald-600">৳{Number(s.salary).toLocaleString()}</td>
                                            <td className="py-3.5 px-4">
                                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${s.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600'}`}>
                                                    {s.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(s)}
                                                        className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(s)}
                                                        className="text-rose-600 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add / Edit Staff Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-emerald-600" />
                                {isEditing ? 'স্টাফ এডিট করুন' : 'নতুন স্টাফ যোগ করুন'}
                            </h3>
                            <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => handleField('name', e.target.value)}
                                    placeholder="স্টাফের নাম"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Designation</label>
                                    <input
                                        type="text"
                                        value={form.designation}
                                        onChange={e => handleField('designation', e.target.value)}
                                        placeholder="Senior Manager"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                                    <input
                                        type="text"
                                        value={form.department}
                                        onChange={e => handleField('department', e.target.value)}
                                        placeholder="Finance"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => handleField('email', e.target.value)}
                                        placeholder="staff@guruz.com"
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        value={form.phone}
                                        onChange={e => handleField('phone', e.target.value)}
                                        placeholder="01700000000"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Monthly Salary (৳)</label>
                                    <input
                                        type="number"
                                        value={form.salary}
                                        onChange={e => handleField('salary', Number(e.target.value))}
                                        placeholder="30000"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                    <select
                                        value={form.status}
                                        onChange={e => handleField('status', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={processing}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl cursor-pointer disabled:opacity-50"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm cursor-pointer disabled:opacity-60"
                                >
                                    {processing ? 'সেভ হচ্ছে...' : (isEditing ? '✓ পরিবর্তন সেভ করো' : '+ স্টাফ সেভ করো')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
