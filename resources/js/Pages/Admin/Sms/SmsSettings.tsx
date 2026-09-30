import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { MessageSquare, Save, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function SmsSettings({ gateways }: { gateways: any }) {
    const { flash } = usePage<any>().props;

    const { data, setData, post, processing } = useForm({
        twilio_active:      gateways?.twilio?.active   ? '1' : '0',
        twilio_sid:         gateways?.twilio?.sid       || '',
        twilio_token:       gateways?.twilio?.token     || '',
        twilio_from:        gateways?.twilio?.from      || '',
        bulksmsbd_active:   gateways?.bulksmsbd?.active ? '1' : '0',
        bulksmsbd_api_key:  gateways?.bulksmsbd?.api_key   || '',
        bulksmsbd_sender_id:gateways?.bulksmsbd?.sender_id || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/sms/gateway', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'Saved!',
                    text: 'SMS Gateway settings updated successfully.',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    timer: 3000,
                    showConfirmButton: false,
                    timerProgressBar: true,
                });
            }
        });
    };

    return (
        <>
            <Head title="SMS Gateway — Admin" />
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">SMS Gateway</h1>
                        <p className="text-xs font-semibold text-emerald-100 opacity-90 mt-1">Configure your SMS API Providers</p>
                    </div>
                    <MessageSquare className="w-8 h-8 opacity-50" />
                </div>

                {flash?.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {flash.success}
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-6">
                    <form onSubmit={handleSubmit} className="space-y-6 text-sm">

                        {/* Twilio Section */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-slate-800 dark:text-white">Twilio SMS</h3>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <span className="text-xs text-slate-500">Active</span>
                                    <button
                                        type="button"
                                        onClick={() => setData('twilio_active', data.twilio_active === '1' ? '0' : '1')}
                                        className={`w-10 h-5 flex items-center rounded-full p-0.5 transition ${data.twilio_active === '1' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${data.twilio_active === '1' ? 'translate-x-5' : ''}`} />
                                    </button>
                                </label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Twilio SID</label>
                                    <input type="text" value={data.twilio_sid} onChange={e => setData('twilio_sid', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" placeholder="ACxxxxxxxxxxxxxxxx" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Twilio Auth Token</label>
                                    <input type="password" value={data.twilio_token} onChange={e => setData('twilio_token', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">From Number</label>
                                    <input type="text" value={data.twilio_from} onChange={e => setData('twilio_from', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" placeholder="+1234567890" />
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* BulkSMSBD Section */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-slate-800 dark:text-white">BulkSMSBD (Bangladesh)</h3>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <span className="text-xs text-slate-500">Active</span>
                                    <button
                                        type="button"
                                        onClick={() => setData('bulksmsbd_active', data.bulksmsbd_active === '1' ? '0' : '1')}
                                        className={`w-10 h-5 flex items-center rounded-full p-0.5 transition ${data.bulksmsbd_active === '1' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${data.bulksmsbd_active === '1' ? 'translate-x-5' : ''}`} />
                                    </button>
                                </label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">API Key</label>
                                    <input type="text" value={data.bulksmsbd_api_key} onChange={e => setData('bulksmsbd_api_key', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Sender ID</label>
                                    <input type="text" value={data.bulksmsbd_sender_id} onChange={e => setData('bulksmsbd_sender_id', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl transition flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {processing ? 'Saving...' : 'Save Gateways'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
