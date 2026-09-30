import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Plus, Edit2, Trash2, Sliders, X } from 'lucide-react';
import Swal from 'sweetalert2';

interface AttributeItem {
    id: number;
    name: string;
    values?: string | string[];
    type?: string;
    is_active?: boolean;
    active?: boolean;
}

export default function AttributesPage({ attributes: initialAttributes = [] }: { attributes?: AttributeItem[] }) {
    const attributes: AttributeItem[] = initialAttributes;

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingAttr, setEditingAttr] = useState<AttributeItem | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [values, setValues] = useState('');

    // Handle ESC key to close modals
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowAddModal(false);
                setEditingAttr(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const resetForm = () => {
        setName('');
        setValues('');
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const openEditModal = (attr: AttributeItem) => {
        setEditingAttr(attr);
        setName(attr.name);
        setValues(Array.isArray(attr.values) ? attr.values.join(', ') : (attr.values || ''));
    };

    const handleAddAttribute = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        const valArr = values.trim() ? values.split(',').map(v => v.trim()).filter(Boolean) : [];
        router.post('/admin/attributes', { name: name.trim(), values: valArr }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowAddModal(false);
                resetForm();
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Attribute added successfully!', showConfirmButton: false, timer: 3000, timerProgressBar: true });
            },
            onError: () => {
                Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to add attribute.', showConfirmButton: false, timer: 3000 });
            },
        });
    };

    const handleUpdateAttribute = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAttr || !name.trim()) return;
        const valArr = values.trim() ? values.split(',').map(v => v.trim()).filter(Boolean) : [];
        router.put(`/admin/attributes/${editingAttr.id}`, { name: name.trim(), values: valArr }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingAttr(null);
                resetForm();
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Attribute updated successfully!', showConfirmButton: false, timer: 3000, timerProgressBar: true });
            },
        });
    };

    const toggleActive = (id: number) => {
        router.put(`/admin/attributes/${id}`, { _toggle: true }, { preserveScroll: true });
    };

    const handleDelete = (attr: AttributeItem) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Are you sure you want to delete the attribute "${attr.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/attributes/${attr.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Attribute deleted successfully!', showConfirmButton: false, timer: 3000, timerProgressBar: true });
                    },
                });
            }
        });
    };

    return (
        <>
            <Head title="Attributes — Admin Panel" />

            <div className="space-y-6">

                {/* Banner Header Card */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-2xl p-6 shadow-md flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Attributes</h1>
                        <p className="text-xs font-semibold text-purple-100 opacity-90 mt-1">
                            e.g. Color: Red, Blue - Size: S, M, L
                        </p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> New Attribute
                    </button>
                </div>

                {/* Attributes Table Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-4">NAME</th>
                                    <th className="py-3 px-4">VALUES</th>
                                    <th className="py-3 px-4">ACTIVE</th>
                                    <th className="py-3 px-4 text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                {attributes.map(a => (
                                    <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{a.name}</td>
                                        <td className="py-3.5 px-4">
                                            <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-[11px] font-mono">
                                                {Array.isArray(a.values) ? a.values.join(', ') : (a.values || '—')}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <button
                                                onClick={() => toggleActive(a.id)}
                                                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold transition cursor-pointer ${
                                                    (a.is_active ?? a.active) ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {(a.is_active ?? a.active) ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(a)}
                                                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 text-xs font-bold px-3 py-1 rounded-xl transition flex items-center gap-1 cursor-pointer border border-indigo-200 dark:border-indigo-900/50"
                                                >
                                                    <Edit2 className="w-3 h-3" /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(a)}
                                                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 text-xs font-bold px-3 py-1 rounded-xl transition flex items-center gap-1 cursor-pointer border border-rose-200 dark:border-rose-900/50"
                                                >
                                                    <Trash2 className="w-3 h-3" /> Delete
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

            {/* New Attribute Modal */}
            {showAddModal && (
                <div 
                    onClick={() => setShowAddModal(false)}
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
                >
                    <div 
                        onClick={e => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
                    >
                        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <Sliders className="w-5 h-5 text-purple-600" /> Add Product Attribute
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddAttribute} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Attribute Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Color, Size, Storage"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Attribute Values (comma separated)</label>
                                <input
                                    type="text"
                                    value={values}
                                    onChange={e => setValues(e.target.value)}
                                    placeholder="e.g. Red, Blue, Green, Black"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="pt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl hover:bg-slate-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition"
                                >
                                    Save Attribute
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Attribute Modal */}
            {editingAttr && (
                <div 
                    onClick={() => setEditingAttr(null)}
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
                >
                    <div 
                        onClick={e => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
                    >
                        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-indigo-600" /> Edit Product Attribute
                            </h3>
                            <button onClick={() => setEditingAttr(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateAttribute} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Attribute Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Attribute Values (comma separated)</label>
                                <input
                                    type="text"
                                    value={values}
                                    onChange={e => setValues(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="pt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingAttr(null)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl hover:bg-slate-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
