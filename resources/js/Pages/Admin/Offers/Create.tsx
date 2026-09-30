import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Send, Tag, FileText, Calendar, Percent, User as UserIcon } from 'lucide-react';
import Swal from 'sweetalert2';

export default function CreateOffer({ users }: { users: any[] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: '',
        title: '',
        description: '',
        promo_code: '',
        discount_percentage: '',
        valid_until: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/offers', {
            onSuccess: () => {
                reset();
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Offer sent successfully!', showConfirmButton: false, timer: 3000, timerProgressBar: true });
            }
        });
    };

    return (
        <>

            <Head title="Send Custom Offer" />
            
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Send className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black">Send Custom Offer</h2>
                    </div>
                    <p className="text-indigo-100 font-medium">Create a personalized offer and send it directly to a customer's notification inbox.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Select User */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                            <UserIcon className="w-4 h-4 text-indigo-500" />
                            Select Customer *
                        </label>
                        <select
                            value={data.user_id}
                            onChange={e => setData('user_id', e.target.value)}
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
                            required
                        >
                            <option value="">-- Choose a customer --</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                        {errors.user_id && <p className="text-red-500 text-xs mt-1 font-medium">{errors.user_id}</p>}
                    </div>

                    {/* Offer Title */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                            <Tag className="w-4 h-4 text-purple-500" />
                            Offer Title *
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={e => setData('title', e.target.value)}
                            placeholder="e.g. Special 20% Discount Just For You!"
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all font-medium"
                            required
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1 font-medium">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            Offer Description *
                        </label>
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            placeholder="Describe the offer details..."
                            rows={4}
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium resize-none"
                            required
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1 font-medium">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Promo Code */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                <Tag className="w-4 h-4 text-emerald-500" />
                                Promo Code (Optional)
                            </label>
                            <input
                                type="text"
                                value={data.promo_code}
                                onChange={e => setData('promo_code', e.target.value)}
                                placeholder="e.g. VIP2026"
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium uppercase"
                            />
                            {errors.promo_code && <p className="text-red-500 text-xs mt-1 font-medium">{errors.promo_code}</p>}
                        </div>

                        {/* Discount % */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                <Percent className="w-4 h-4 text-amber-500" />
                                Discount % (Optional)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={data.discount_percentage}
                                onChange={e => setData('discount_percentage', e.target.value)}
                                placeholder="e.g. 20"
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium"
                            />
                            {errors.discount_percentage && <p className="text-red-500 text-xs mt-1 font-medium">{errors.discount_percentage}</p>}
                        </div>
                    </div>

                    {/* Valid Until */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                            <Calendar className="w-4 h-4 text-rose-500" />
                            Valid Until (Optional)
                        </label>
                        <input
                            type="datetime-local"
                            value={data.valid_until}
                            onChange={e => setData('valid_until', e.target.value)}
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all font-medium"
                        />
                        {errors.valid_until && <p className="text-red-500 text-xs mt-1 font-medium">{errors.valid_until}</p>}
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-lg py-4 px-6 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-70 disabled:scale-100"
                        >
                            <Send className="w-5 h-5" />
                            {processing ? 'Sending...' : 'Send Custom Offer'}
                        </button>
                    </div>
                </form>
            </div>
        
</>
    );
}