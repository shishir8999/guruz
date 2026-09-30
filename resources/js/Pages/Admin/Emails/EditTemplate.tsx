import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Mail, CheckCircle2, Save, ArrowLeft } from 'lucide-react';

interface EmailTemplate {
    id: number;
    name: string;
    subject: string;
    body_html: string;
    variables?: string[];
}

interface Props {
    template: EmailTemplate;
}

export default function EditTemplate({ template }: Props) {
    const [subject, setSubject] = useState(template.subject || '');
    const [bodyHtml, setBodyHtml] = useState(template.body_html || '');
    const [successMsg, setSuccessMsg] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        router.post(`/admin/email-templates/${template.id}/update`, {
            subject,
            body_html: bodyHtml
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMsg('Template updated successfully!');
                setSaving(false);
                setTimeout(() => setSuccessMsg(''), 4000);
            },
            onError: () => {
                setSaving(false);
            }
        });
    };

    return (
        <>

            <Head title={`Edit ${template.name} — Admin`} />

            <div className="space-y-6 max-w-4xl">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                            <Mail className="w-6 h-6" /> Edit: {template.name}
                        </h1>
                        <p className="text-xs font-semibold text-purple-100 opacity-90 mt-1">
                            Customize the subject and content of this email template.
                        </p>
                    </div>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                </div>

                {successMsg && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="font-bold text-sm">{successMsg}</span>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-6">
                    <form onSubmit={handleSave} className="space-y-6">
                        
                        <div>
                            <label className="block text-sm font-extrabold text-slate-800 dark:text-white mb-1.5">
                                Template Name
                            </label>
                            <input
                                type="text"
                                value={template.name}
                                disabled
                                className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-extrabold text-slate-800 dark:text-white mb-1.5">
                                Email Subject <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-extrabold text-slate-800 dark:text-white mb-1.5">
                                Email Body (HTML) <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                value={bodyHtml}
                                onChange={(e) => setBodyHtml(e.target.value)}
                                rows={14}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all dark:text-white resize-y"
                                required
                            />
                        </div>

                        {/* Live Preview */}
                        <div>
                            <label className="block text-sm font-extrabold text-slate-800 dark:text-white mb-1.5">
                                📧 Live Preview
                            </label>
                            <div 
                                className="w-full bg-white border border-slate-200 rounded-xl p-5 min-h-[120px] prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: bodyHtml }}
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition shadow-sm shadow-purple-200 flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        
</>
    );
}
