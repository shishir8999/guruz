import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Send, Plus, Edit2, Trash2, MessageCircle, X } from 'lucide-react';
import Swal from 'sweetalert2';

export default function WhatsAppMarketing({ templates }: { templates: any[] }) {
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [orderId, setOrderId] = useState('');
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, reset, processing } = useForm({
        name: '',
        body: '',
    });

    const openModal = (template: any = null, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
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

    const handleSaveTemplate = (e: React.FormEvent) => {
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
            put(`/admin/sms/whatsapp/templates/${editingId}`, options);
        } else {
            post('/admin/sms/whatsapp/templates', options);
        }
    };

    const handleDeleteTemplate = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this template?')) {
            router.delete(`/admin/sms/whatsapp/templates/${id}`, {
                onSuccess: () => {
                    if (selectedTemplate?.id === id) {
                        setSelectedTemplate(null);
                    }
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

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTemplate || !customerPhone) return;

        let finalMessage = selectedTemplate.body || selectedTemplate.message;
        finalMessage = finalMessage.replace(/\[Name\]/g, customerName || 'Customer');
        finalMessage = finalMessage.replace(/\[Order_ID\]/g, orderId || 'N/A');
        
        // Encode for WhatsApp URL
        const encodedMessage = encodeURIComponent(finalMessage);
        
        // Format phone number (ensure international format without + for wa.me)
        let phone = customerPhone.replace(/\D/g, '');
        if (phone.startsWith('01')) {
            phone = '88' + phone; // Bangladesh code
        }

        const waUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
        window.open(waUrl, '_blank');
    };

    return (
        <>
            <Head title="WhatsApp Marketing — Admin" />
            
            <div className="space-y-6 max-w-6xl mx-auto mb-10">
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">WhatsApp Management</h1>
                        <p className="text-xs font-semibold text-emerald-100 opacity-90 mt-1">Manage templates and send direct messages</p>
                    </div>
                    <MessageCircle className="w-8 h-8 opacity-50" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Templates List */}
                    <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs h-[fit-content] max-h-[800px] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-slate-800">Message Templates</h2>
                            <button onClick={() => openModal()} className="text-emerald-600 p-1 bg-emerald-50 rounded-lg hover:bg-emerald-100"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="space-y-2">
                            {templates && templates.length > 0 ? templates.map(t => (
                                <div 
                                    key={t.id} 
                                    onClick={() => setSelectedTemplate(t)}
                                    className={`p-3 rounded-xl border cursor-pointer transition ${selectedTemplate?.id === t.id ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-200 hover:border-emerald-300'}`}
                                >
                                    <div className="font-bold text-xs text-slate-800 flex justify-between items-center">
                                        {t.name}
                                        <div className="flex gap-1">
                                            <button onClick={(e) => openModal(t, e)} className="p-1 text-slate-400 hover:text-emerald-600"><Edit2 className="w-3 h-3" /></button>
                                            <button onClick={(e) => handleDeleteTemplate(t.id, e)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{t.body || t.message}</p>
                                </div>
                            )) : (
                                <div className="p-6 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                                    No templates yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sender View */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                        <h2 className="font-bold text-slate-800 mb-4">Send Direct WhatsApp Message</h2>
                        {selectedTemplate ? (
                            <form onSubmit={handleSend} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Customer Phone Number</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={customerPhone}
                                            onChange={e => setCustomerPhone(e.target.value)}
                                            placeholder="e.g. 01712345678" 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name (Optional)</label>
                                        <input 
                                            type="text" 
                                            value={customerName}
                                            onChange={e => setCustomerName(e.target.value)}
                                            placeholder="e.g. Tanvir Ahmed" 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" 
                                        />
                                    </div>
                                </div>
                                {(selectedTemplate.body || selectedTemplate.message).includes('[Order_ID]') && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Order ID</label>
                                        <input 
                                            type="text" 
                                            value={orderId}
                                            onChange={e => setOrderId(e.target.value)}
                                            placeholder="e.g. ORD-12345" 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" 
                                        />
                                    </div>
                                )}

                                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 mt-4 relative">
                                    <h3 className="text-[10px] font-bold text-emerald-800 uppercase mb-2">Message Preview</h3>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                                        {(selectedTemplate.body || selectedTemplate.message)
                                            .replace(/\[Name\]/g, customerName || 'Customer')
                                            .replace(/\[Order_ID\]/g, orderId || 'N/A')
                                        }
                                    </p>
                                </div>

                                <div className="pt-2 flex justify-end">
                                    <button type="submit" className="bg-[#25D366] hover:bg-[#1DA851] text-white font-bold px-6 py-2.5 rounded-xl transition flex items-center gap-2">
                                        <Send className="w-4 h-4" /> Open in WhatsApp
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                                <p className="text-sm font-semibold">Select a template from the list to start sending</p>
                            </div>
                        )}
                    </div>
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
                        <form onSubmit={handleSaveTemplate} className="p-6 space-y-4">
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
                                <button type="submit" disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-bold transition">
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
