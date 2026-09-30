import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Package, Plus, Check, Edit2, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';

interface PlanItem {
    id: number;
    name: string;
    price: number;
    billing_cycle: 'Monthly' | 'Yearly';
    max_products: number;
    max_staff: number;
    active: boolean;
}
import { router } from '@inertiajs/react';

interface PlanItem {
    id: number;
    name: string;
    price: number;
    billing_cycle: 'Monthly' | 'Yearly';
    max_products: number;
    max_staff: number;
    active: boolean;
}

export default function BillingPlans({ initialPlans = [] }: { initialPlans?: PlanItem[] }) {
    const [plans, setPlans] = useState<PlanItem[]>(initialPlans);

    useEffect(() => {
        if (initialPlans && initialPlans.length > 0) {
            setPlans(initialPlans);
        }
    }, [initialPlans]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);

    const [planName, setPlanName] = useState('');
    const [planPrice, setPlanPrice] = useState('');
    const [maxProducts, setMaxProducts] = useState('');
    const [maxStaff, setMaxStaff] = useState('');

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowAddModal(false);
                setEditingPlan(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const resetForm = () => {
        setPlanName('');
        setPlanPrice('');
        setMaxProducts('');
        setMaxStaff('');
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const openEditModal = (plan: PlanItem) => {
        setEditingPlan(plan);
        setPlanName(plan.name);
        setPlanPrice(String(plan.price));
        setMaxProducts(String(plan.max_products));
        setMaxStaff(String(plan.max_staff));
    };

    const handleCreatePlan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!planName.trim() || !planPrice) return;

        router.post('/admin/finance/billing-plans', {
            name: planName.trim(),
            price: Number(planPrice),
            billing_cycle: 'Monthly',
            max_products: Number(maxProducts) || 500,
            max_staff: Number(maxStaff) || 5,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowAddModal(false);
                resetForm();
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `প্ল্যান তৈরি হয়েছে!`,
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        });
    };

    const handleUpdatePlan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPlan || !planName.trim()) return;

        router.put(`/admin/finance/billing-plans/${editingPlan.id}`, {
            name: planName.trim(),
            price: Number(planPrice),
            billing_cycle: editingPlan.billing_cycle,
            max_products: Number(maxProducts) || 500,
            max_staff: Number(maxStaff) || 5,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingPlan(null);
                resetForm();
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'প্ল্যান সফলভাবে আপডেট হয়েছে!',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        });
    };

    const togglePlanStatus = (id: number) => {
        setPlans(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
        router.post(`/admin/finance/billing-plans/${id}/toggle`, {}, {
            preserveScroll: true,
        });
    };

    const handleDeletePlan = (plan: PlanItem) => {
        Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: `আপনি কি "${plan.name}" প্ল্যানটি মুছে ফেলতে চান?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'হ্যাঁ, মুছুন',
            cancelButtonText: 'বাতিল'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/finance/billing-plans/${plan.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'প্ল্যান মুছে ফেলা হয়েছে!',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                        });
                    }
                });
            }
        });
    };

    return (
        <>
            <Head title="Subscription Plans — Admin Panel" />

            <div className="space-y-6">

                {/* Banner Header Card */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-2xl p-6 shadow-md flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Subscription Plans</h1>
                        <p className="text-xs font-semibold text-purple-100 opacity-90 mt-1">
                            Manage SaaS pricing plans
                        </p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add New
                    </button>
                </div>

                {/* Plans Grid Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map(p => (
                        <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-black text-slate-900 dark:text-white">{p.name}</h3>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => openEditModal(p)}
                                            className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition"
                                            title="Edit Plan"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeletePlan(p)}
                                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                                            title="Delete Plan"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="text-3xl font-black text-slate-900 dark:text-white">
                                    ৳{p.price.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/month</span>
                                </div>

                                <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-500" /> Up to {p.max_products.toLocaleString()} Products
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-500" /> Up to {p.max_staff} Staff Accounts
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-500" /> WhatsApp & SMS Invoicing
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-500" /> 24/7 Dedicated Support
                                    </li>
                                </ul>
                            </div>

                            <button
                                onClick={() => togglePlanStatus(p.id)}
                                className={`w-full text-xs font-bold py-2.5 rounded-xl transition shadow-xs cursor-pointer ${
                                    p.active
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                }`}
                            >
                                {p.active ? 'Plan Active' : 'Enable Plan'}
                            </button>
                        </div>
                    ))}
                </div>

            </div>

            {/* Add New Plan Modal */}
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
                                <Package className="w-5 h-5 text-purple-600" /> Create Subscription Plan
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreatePlan} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Plan Name</label>
                                <input
                                    type="text"
                                    value={planName}
                                    onChange={e => setPlanName(e.target.value)}
                                    placeholder="e.g. Diamond SaaS"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Monthly Price (৳)</label>
                                <input
                                    type="number"
                                    value={planPrice}
                                    onChange={e => setPlanPrice(e.target.value)}
                                    placeholder="1990"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Max Products</label>
                                    <input
                                        type="number"
                                        value={maxProducts}
                                        onChange={e => setMaxProducts(e.target.value)}
                                        placeholder="500"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Max Staff</label>
                                    <input
                                        type="number"
                                        value={maxStaff}
                                        onChange={e => setMaxStaff(e.target.value)}
                                        placeholder="5"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold"
                                    />
                                </div>
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
                                    Save Plan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Plan Modal */}
            {editingPlan && (
                <div 
                    onClick={() => setEditingPlan(null)}
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
                >
                    <div 
                        onClick={e => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
                    >
                        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-indigo-600" /> Edit Subscription Plan
                            </h3>
                            <button onClick={() => setEditingPlan(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdatePlan} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Plan Name</label>
                                <input
                                    type="text"
                                    value={planName}
                                    onChange={e => setPlanName(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Monthly Price (৳)</label>
                                <input
                                    type="number"
                                    value={planPrice}
                                    onChange={e => setPlanPrice(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Max Products</label>
                                    <input
                                        type="number"
                                        value={maxProducts}
                                        onChange={e => setMaxProducts(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Max Staff</label>
                                    <input
                                        type="number"
                                        value={maxStaff}
                                        onChange={e => setMaxStaff(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="pt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingPlan(null)}
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
