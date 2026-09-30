import { Head, useForm, Link } from '@inertiajs/react';
import React, { FormEventHandler } from 'react';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/email/verification-notification');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="ইমেইল ভেরিফাই করুন" />
            
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
                <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 p-8 text-center border-b border-emerald-100 dark:border-emerald-800/50">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <Mail className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                            ইমেইল ভেরিফাই করুন
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">
                            অ্যাকাউন্ট সুরক্ষিত রাখতে আপনার ইমেইলটি ভেরিফাই করা প্রয়োজন।
                        </p>
                    </div>

                    <div className="p-8">
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-6 text-center leading-relaxed">
                            রেজিস্ট্রেশন করার জন্য ধন্যবাদ! আপনার অ্যাকাউন্টে সম্পূর্ণ এক্সেস পেতে, আমরা আপনার ইমেইলে একটি ভেরিফিকেশন লিঙ্ক পাঠিয়েছি। দয়া করে আপনার ইনবক্স চেক করে লিঙ্কটিতে ক্লিক করুন। ইমেইল না পেলে নিচের বাটনে ক্লিক করে পুনরায় পাঠাতে পারেন।
                        </div>

                        {status === 'verification-link-sent' && (
                            <div className="mb-6 font-medium text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-lg flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" />
                                আপনার ইমেইলে নতুন একটি ভেরিফিকেশন লিঙ্ক পাঠানো হয়েছে।
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <button
                                disabled={processing}
                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 group disabled:opacity-70"
                            >
                                ভেরিফিকেশন ইমেইল পুনরায় পাঠান
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            
                            <div className="text-center">
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white underline font-semibold"
                                >
                                    লগআউট করুন
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
