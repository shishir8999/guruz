import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Send, CheckCircle2, AlertCircle, Mail } from 'lucide-react';

export default function BulkEmail() {
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!to || !subject || !body) return;

        setSending(true);
        setErrorMsg('');
        router.post('/admin/emails/bulk/send', {
            to,
            subject,
            body,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSending(false);
                setSuccessMsg('Bulk email sent successfully!');
                setTo('');
                setSubject('');
                setBody('');
                setTimeout(() => setSuccessMsg(''), 5000);
            },
            onError: (errors: any) => {
                setSending(false);
                setErrorMsg(errors?.to || errors?.subject || errors?.body || 'Failed to send emails. Please check SMTP settings.');
                setTimeout(() => setErrorMsg(''), 5000);
            }
        });
    };

    return (
        <>

            <Head title="Bulk Email — Admin" />
            <div className="space-y-5 max-w-3xl">

                {/* Header Banner */}
                <div className="bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-400 text-white rounded-2xl px-6 py-5 shadow-lg">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight">Bulk Email</h1>
                    <p className="text-xs font-semibold text-white/80 mt-1">Send email to multiple recipients (requires SMTP setup)</p>
                </div>

                {/* Success Message */}
                {successMsg && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="font-bold text-sm">{successMsg}</span>
                    </div>
                )}

                {/* Error Message */}
                {errorMsg && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm">
                        <AlertCircle className="w-5 h-5 text-rose-600" />
                        <span className="font-bold text-sm">{errorMsg}</span>
                    </div>
                )}

                {/* Form */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-6">
                    <form onSubmit={handleSend} className="space-y-5">

                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                To (Comma-Separated)
                            </label>
                            <input
                                type="text"
                                value={to}
                                onChange={e => setTo(e.target.value)}
                                placeholder="user1@example.com, user2@example.com"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:text-white transition"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                Subject
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                placeholder="Enter email subject"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:text-white transition"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                Body
                            </label>
                            <textarea
                                value={body}
                                onChange={e => setBody(e.target.value)}
                                rows={8}
                                placeholder="Write your email content here..."
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:text-white transition resize-y"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={sending}
                            className="bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-700 hover:to-fuchsia-600 disabled:opacity-50 text-white font-extrabold text-sm px-6 py-2.5 rounded-xl transition shadow-sm flex items-center gap-2"
                        >
                            <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send'}
                        </button>

                    </form>
                </div>
            </div>
        
</>
    );
}
