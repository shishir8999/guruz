import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Mail, Save, Send } from 'lucide-react';
import Swal from 'sweetalert2';

export default function SmtpSettings({ smtp }: { smtp: any }) {
    const [testEmail, setTestEmail] = useState('');
    const [isSendingTest, setIsSendingTest] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        mail_mailer:       smtp?.mail_mailer       || 'smtp',
        mail_host:         smtp?.mail_host         || '',
        mail_port:         smtp?.mail_port         || 587,
        mail_username:     smtp?.mail_username     || '',
        mail_password:     smtp?.mail_password     || '',
        mail_encryption:   smtp?.mail_encryption   || 'tls',
        mail_from_address: smtp?.mail_from_address || '',
        mail_from_name:    smtp?.mail_from_name    || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/emails/smtp', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'Saved!',
                    text: 'SMTP settings updated successfully.',
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

    const handleTestMail = (e: React.FormEvent) => {
        e.preventDefault();
        if (!testEmail) return;
        setIsSendingTest(true);
        router.post('/admin/emails/smtp/test', { test_email: testEmail }, {
            preserveScroll: true,
            onFinish: () => setIsSendingTest(false),
            onSuccess: () => {
                Swal.fire('Success', 'টেস্ট ইমেইল সফলভাবে পাঠানো হয়েছে!', 'success');
            },
            onError: () => {
                Swal.fire('Error', 'ইমেইল পাঠানো যায়নি। অনুগ্রহ করে আপনার SMTP তথ্যাদি পরীক্ষা করুন।', 'error');
            }
        });
    };

    return (
        <>
            <Head title="SMTP Settings — Admin" />
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">SMTP Settings</h1>
                        <p className="text-xs font-semibold text-purple-100 opacity-90 mt-1">Configure your outgoing email server</p>
                    </div>
                    <Mail className="w-8 h-8 opacity-50" />
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-6">
                    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mail Mailer</label>
                                <select value={data.mail_mailer} onChange={e => setData('mail_mailer', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                                    <option value="smtp">SMTP</option>
                                    <option value="sendmail">Sendmail</option>
                                    <option value="mailgun">Mailgun</option>
                                    <option value="log">Log (Test)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mail Host</label>
                                <input type="text" value={data.mail_host} onChange={e => setData('mail_host', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" placeholder="smtp.gmail.com" />
                                {errors.mail_host && <p className="text-red-500 text-xs mt-1">{errors.mail_host}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mail Port</label>
                                <input type="number" value={data.mail_port} onChange={e => setData('mail_port', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mail Encryption</label>
                                <select value={data.mail_encryption} onChange={e => setData('mail_encryption', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                                    <option value="tls">TLS</option>
                                    <option value="ssl">SSL</option>
                                    <option value="">None</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mail Username</label>
                                <input type="text" value={data.mail_username} onChange={e => setData('mail_username', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mail Password</label>
                                <input type="password" value={data.mail_password} onChange={e => setData('mail_password', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">From Address</label>
                                <input type="email" value={data.mail_from_address} onChange={e => setData('mail_from_address', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" placeholder="no-reply@yoursite.com" />
                                {errors.mail_from_address && <p className="text-red-500 text-xs mt-1">{errors.mail_from_address}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">From Name</label>
                                <input type="text" value={data.mail_from_name} onChange={e => setData('mail_from_name', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" />
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer"
                            >
                                <Save className="w-4 h-4" />
                                {processing ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* 🧪 TEST EMAIL SENDER CARD */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-6 space-y-4">
                    <div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                            🧪 ইমেইল সার্ভিস টেস্ট (Test SMTP Email)
                        </h3>
                        <p className="text-xs text-slate-500">আপনার SMTP সেটিংস ঠিকভাবে কাজ করছে কিনা তা পরীক্ষা করতে একটি ইমেইল এড্রেস লিখে টেস্ট করুন।</p>
                    </div>

                    <form onSubmit={handleTestMail} className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            value={testEmail}
                            onChange={e => setTestEmail(e.target.value)}
                            placeholder="আপনার জিমেইল এড্রেস লিখুন (e.g. user@gmail.com)"
                            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                        />
                        <button
                            type="submit"
                            disabled={isSendingTest}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-sm"
                        >
                            <Send className="w-4 h-4" />
                            {isSendingTest ? 'পাঠানো হচ্ছে...' : 'টেস্ট মেইল পাঠান'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
