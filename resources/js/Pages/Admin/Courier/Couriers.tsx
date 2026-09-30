import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Truck, Edit2, Trash2, Plus, X, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Couriers({ couriers }: { couriers: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [editingCourier, setEditingCourier] = useState<any>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        _method: 'POST',
        name: '',
        logo: null as File | null,
        delivery_fee: 60,
        phone: '',
        is_active: true,
        code: '',
        email: '',
        tracking_url_template: '',
        per_kg_fee: 15,
        cod_fee_percent: 1,
        sort_order: 0,
        coverage_areas: 'Dhaka, Chittagong, Sylhet',
        api_endpoint: '',
        api_key: '',
        api_secret: '',
        notes: '',
    });

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setData('_method', 'POST');
        setEditingCourier(null);
        setLogoPreview(null);
        setIsModalOpen(true);
    };

    const openEditModal = (courier: any) => {
        reset();
        clearErrors();
        setEditingCourier(courier);
        setData({
            _method: 'PUT',
            name: courier.name || '',
            logo: null,
            delivery_fee: courier.delivery_fee || 0,
            phone: courier.phone || '',
            is_active: courier.is_active !== undefined ? courier.is_active : true,
            code: courier.code || '',
            email: courier.email || '',
            tracking_url_template: courier.tracking_url_template || '',
            per_kg_fee: courier.per_kg_fee || 0,
            cod_fee_percent: courier.cod_fee_percent || 0,
            sort_order: courier.sort_order || 0,
            coverage_areas: courier.coverage_areas || '',
            api_endpoint: courier.base_url || '',
            api_key: courier.api_key || '',
            api_secret: courier.api_secret || '',
            notes: courier.notes || '',
        });
        setLogoPreview(courier.logo || null);
        setIsModalOpen(true);
    };

    const handleDelete = (courier: any) => {
        Swal.fire({
            title: 'Delete Courier?',
            text: `Are you sure you want to delete ${courier.name}? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/couriers/${courier.id}`, {
                    onSuccess: () => {
                        Swal.fire('Deleted!', 'Courier has been deleted.', 'success');
                    },
                    onError: (errs) => {
                        Swal.fire('Error!', 'Failed to delete courier.', 'error');
                    }
                });
            }
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const submitRoute = editingCourier 
                ? `/admin/couriers/${editingCourier.id}`
                : `/admin/couriers`;

            post(submitRoute, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    Swal.fire({
                        title: 'Success!',
                        text: 'Courier saved successfully.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                },
                onError: (errs) => {
                    console.error("Form submission errors:", errs);
                    const errorMessages = Object.values(errs).join('\n');
                    Swal.fire({
                        title: 'Validation Error',
                        text: errorMessages,
                        icon: 'error',
                        confirmButtonColor: '#ef4444'
                    });
                }
            });
        } catch (error: any) {
            Swal.fire({
                title: 'Javascript Error!',
                text: error?.toString() || 'Unknown error occurred in submit handler',
                icon: 'error',
                confirmButtonColor: '#ef4444'
            });
        }
    };

    return (
        <>

            <Head title="Couriers — Admin" />
            
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Courier Management</h1>
                    <button 
                        onClick={openCreateModal}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 text-sm shadow-xs"
                    >
                        <Plus className="w-4 h-4" /> New Courier
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-100">
                            <tr>
                                <th className="py-3 px-4">Courier Name</th>
                                <th className="py-3 px-4">API Key</th>
                                <th className="py-3 px-4">Total Deliveries</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {couriers.map(courier => (
                                <tr key={courier.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center text-orange-600 overflow-hidden">
                                            {courier.logo ? <img src={courier.logo} alt={courier.name} className="w-full h-full object-cover" /> : <Truck className="w-4 h-4" />}
                                        </div>
                                        {courier.name}
                                    </td>
                                    <td className="py-3 px-4 text-slate-500 font-mono">
                                        {courier.api_key || 'Not Configured'}
                                    </td>
                                    <td className="py-3 px-4 text-slate-500">{courier.deliveries || 0}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${courier.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {courier.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => openEditModal(courier)}
                                                className="text-purple-600 hover:bg-purple-50 p-1.5 rounded-lg tooltip" 
                                                title="Edit Settings"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(courier)}
                                                className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg tooltip"
                                                title="Delete Courier"
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

            {/* Modal */}
            {isModalOpen && (
                <div 
                    onClick={() => setIsModalOpen(false)}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                >
                    <div 
                        onClick={e => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                {editingCourier ? 'Edit Courier' : 'New Courier'}
                            </h2>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={submit} className="flex flex-col h-full overflow-hidden">
                            <div className="p-6 overflow-y-auto space-y-6">
                            {/* Logo */}
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 text-xs font-medium overflow-hidden">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                                    ) : (
                                        "Logo"
                                    )}
                                </div>
                                <div>
                                    <input 
                                        type="file" 
                                        id="logo-upload" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                    />
                                    <label 
                                        htmlFor="logo-upload"
                                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                                    >
                                        <Upload className="w-4 h-4" /> Upload logo
                                    </label>
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Courier name</label>
                                    <input type="text" placeholder="e.g. Pathao, Steadfast, Sundarban" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                    {errors.name && <div className="text-rose-500 text-xs mt-1">{errors.name}</div>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Delivery fee (৳)</label>
                                        <input type="number" value={data.delivery_fee} onChange={e => setData('delivery_fee', Number(e.target.value))} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                        {errors.delivery_fee && <div className="text-rose-500 text-xs mt-1">{errors.delivery_fee}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact phone</label>
                                        <input type="text" placeholder="Optional" value={data.phone} onChange={e => setData('phone', e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                        {errors.phone && <div className="text-rose-500 text-xs mt-1">{errors.phone}</div>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} id="activeCheck" className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                                    <label htmlFor="activeCheck" className="text-sm font-medium text-slate-700 dark:text-slate-300">Active (visible at checkout)</label>
                                </div>
                            </div>

                            {/* Advanced Settings */}
                            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                                <button 
                                    type="button"
                                    onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-sm transition"
                                >
                                    <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                        {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        Advanced settings
                                    </div>
                                    <span className="text-xs text-slate-500 font-medium">Code, fees, coverage, API</span>
                                </button>
                                
                                {isAdvancedOpen && (
                                    <div className="p-4 space-y-4 border-t border-slate-200 dark:border-slate-800">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Code (unique)</label>
                                                <input type="text" placeholder="auto from name" value={data.code} onChange={e => setData('code', e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                                {errors.code && <div className="text-rose-500 text-xs mt-1">{errors.code}</div>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Email</label>
                                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                                {errors.email && <div className="text-rose-500 text-xs mt-1">{errors.email}</div>}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tracking URL Template <span className="text-slate-400 font-normal">(use {'{tracking_no}'})</span></label>
                                            <input type="text" value={data.tracking_url_template} onChange={e => setData('tracking_url_template', e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                            {errors.tracking_url_template && <div className="text-rose-500 text-xs mt-1">{errors.tracking_url_template}</div>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Per KG Fee (৳)</label>
                                                <input type="number" value={data.per_kg_fee} onChange={e => setData('per_kg_fee', Number(e.target.value))} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                                {errors.per_kg_fee && <div className="text-rose-500 text-xs mt-1">{errors.per_kg_fee}</div>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">COD Fee %</label>
                                                <input type="number" value={data.cod_fee_percent} onChange={e => setData('cod_fee_percent', Number(e.target.value))} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                                {errors.cod_fee_percent && <div className="text-rose-500 text-xs mt-1">{errors.cod_fee_percent}</div>}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sort Order</label>
                                            <input type="number" value={data.sort_order} onChange={e => setData('sort_order', Number(e.target.value))} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                            {errors.sort_order && <div className="text-rose-500 text-xs mt-1">{errors.sort_order}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Coverage Areas <span className="text-slate-400 font-normal">(comma-separated, empty = all)</span></label>
                                            <input type="text" value={data.coverage_areas} onChange={e => setData('coverage_areas', e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                            {errors.coverage_areas && <div className="text-rose-500 text-xs mt-1">{errors.coverage_areas}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">API Endpoint</label>
                                            <input type="text" value={data.api_endpoint} onChange={e => setData('api_endpoint', e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                            {errors.api_endpoint && <div className="text-rose-500 text-xs mt-1">{errors.api_endpoint}</div>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">API Key</label>
                                                <input type="text" value={data.api_key} onChange={e => setData('api_key', e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                                {errors.api_key && <div className="text-rose-500 text-xs mt-1">{errors.api_key}</div>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">API Secret</label>
                                                <input type="password" value={data.api_secret} onChange={e => setData('api_secret', e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                                {errors.api_secret && <div className="text-rose-500 text-xs mt-1">{errors.api_secret}</div>}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                                            <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" rows={3}></textarea>
                                            {errors.notes && <div className="text-rose-500 text-xs mt-1">{errors.notes}</div>}
                                        </div>
                                    </div>
                                )}
                            </div>
                            </div>
                        
                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 font-medium text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
                                >
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition shadow-sm disabled:opacity-50">
                                    {processing ? 'Saving...' : 'Save Courier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        
</>
    );
}
