import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';

export default function SmsTemplates({ templates }: { templates: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, reset, processing } = useForm({
        name: '',
        body: '',
    });

    const openModal = (template: any = null) => {
        if (template) {
            setEditingId(template.id);
            setData({
                name: template.name,
                body: template.body,
            });
        } else {
            setEditingId(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setEditingId(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const options = {
            onSuccess: () => {
                closeModal();
                Swal.fire({
                    title: 'Success!',
                    text: editingId ? 'Template updated' : 'Template created',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
            }
        };

        if (editingId) {
            put(`/admin/sms/templates/${editingId}`, options);
        } else {
            post('/admin/sms/templates', options);
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this template?')) {
            router.delete(`/admin/sms/templates/${id}`, {
                onSuccess: () => {
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Template has been deleted.',
                        icon: 'success',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                }
            });
        }
    };

    return (
        <>
            <Head title="SMS Templates" />

            <div className="max-w-6xl mx-auto mb-10">
                {/* Header Card */}
                <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-500 rounded-xl p-6 mb-6 flex justify-between items-center text-white shadow-sm">
                    <h1 className="text-2xl font-bold">SMS Templates</h1>
                    <button 
                        onClick={() => openModal()}
                        className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded shadow-sm font-medium transition flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add New
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6 min-h-[400px]">
                    {templates && templates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {templates.map((template: any) => (
                                <div key={template.id} className="p-4 border border-slate-200 rounded-lg hover:border-purple-300 transition">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-slate-700">{template.name}</h3>
                                        <div className="flex gap-2">
                                            <button onClick={() => openModal(template)} className="text-slate-400 hover:text-purple-600"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(template.id)} className="text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-2 whitespace-pre-wrap">{template.body}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-16 flex flex-col items-center justify-center bg-slate-50/50">
                            <p className="text-slate-400 font-medium text-sm">No data yet.</p>
                            <button onClick={() => openModal()} className="mt-4 text-purple-600 font-bold hover:underline">Create your first template</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                            <h2 className="font-bold text-slate-800">{editingId ? 'Edit Template' : 'Add New Template'}</h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Template Name</label>
                                <input 
                                    type="text" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)} 
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" 
                                    placeholder="e.g., Order Confirmation" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Message Body</label>
                                <textarea 
                                    value={data.body} 
                                    onChange={e => setData('body', e.target.value)} 
                                    required
                                    rows={5}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" 
                                    placeholder="Hello [Name], your order [Order_ID] is confirmed." 
                                />
                                <p className="text-xs text-slate-500 mt-1">You can use variables like [Name] and [Order_ID].</p>
                            </div>
                            <div className="flex justify-end pt-4 border-t">
                                <button type="button" onClick={closeModal} className="mr-3 px-4 py-2 text-slate-500 hover:text-slate-700 font-medium">Cancel</button>
                                <button type="submit" disabled={processing} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-bold transition">
                                    {processing ? 'Saving...' : 'Save Template'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
