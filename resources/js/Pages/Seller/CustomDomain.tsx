import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    Globe, CheckCircle2, AlertCircle, Clock, Copy, Check, 
    ShieldCheck, ExternalLink, HelpCircle, Server, RefreshCw, Save
} from 'lucide-react';
import Swal from 'sweetalert2';

interface DnsRecord {
    type: string;
    name: string;
    value: string;
    ttl: string;
    purpose: string;
}

interface CustomDomainProps {
    shop: {
        id: number;
        name: string;
        slug: string;
        custom_domain?: string | null;
        custom_domain_status?: string | null;
        custom_domain_dns_verified?: boolean;
    };
    dnsRecords: {
        a_record: DnsRecord;
        cname_record: DnsRecord;
        txt_verification: DnsRecord;
    };
    nameservers: {
        ns1: string;
        ns2: string;
        ns3: string;
    };
}

export default function CustomDomain({ shop, dnsRecords, nameservers }: CustomDomainProps) {
    const { data, setData, post, processing, errors } = useForm({
        custom_domain: shop.custom_domain || '',
    });

    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const handleCopy = (text: string, key: string, label: string) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(null), 2500);

            Swal.fire({
                title: 'কপি করা হয়েছে!',
                text: `${label}: "${text}" ক্লিপবোর্ডে কপি হয়েছে।`,
                icon: 'success',
                toast: true,
                position: 'top-end',
                timer: 2500,
                showConfirmButton: false,
                timerProgressBar: true,
            });
        }
    };

    const handleSaveDomain = (e: React.FormEvent) => {
        e.preventDefault();
        post('/seller/custom-domain', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'আপডেট সম্পন্ন!',
                    text: 'কাস্টম ডোমেইন তথ্য সংরক্ষণ করা হয়েছে।',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    timer: 3000,
                    showConfirmButton: false,
                });
            }
        });
    };

    const handleVerifyDns = () => {
        post('/seller/custom-domain/verify', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'ডিএনএস ভেরিফাইড!',
                    text: 'আপনার কাস্টম ডোমেইন সফলভাবে ভেরিফাই ও অ্যাক্টিভ করা হয়েছে।',
                    icon: 'success',
                    confirmButtonColor: '#16a34a',
                });
            }
        });
    };

    const isVerified = shop.custom_domain_dns_verified || shop.custom_domain_status === 'Active & Verified';
    const hasDomain = Boolean(shop.custom_domain && shop.custom_domain.trim().length > 0);

    return (
        <>
            <Head title="Custom Domain & DNS Setup — Seller Panel" />

            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* ─── HEADER BANNER ─── */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
                                    Domain Branding
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2 text-white">
                                <Globe className="w-6 h-6 text-indigo-400 shrink-0" />
                                কাস্টম ডোমেইন ও ডিএনএস সেটআপ (Custom Domain)
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                                আপনার শপের জন্য নিজস্ব ডোমেইন নাম (যেমন: <code className="bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded font-mono text-xs">yourbrand.com</code>) পয়েন্ট করুন। নিচে দেওয়া রেকর্ডসমূহ আপনার ডোমেইন প্রোভাইডারে কপি করে বসান।
                            </p>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0 bg-slate-800/80 border border-slate-700/60 p-3 rounded-xl flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full animate-pulse ${isVerified ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]' : hasDomain ? 'bg-amber-400 shadow-[0_0_12px_#fbbf24]' : 'bg-rose-500'}`}></div>
                            <div>
                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">ডোমেইন স্ট্যাটাস</div>
                                <div className={`text-xs font-black ${isVerified ? 'text-emerald-400' : hasDomain ? 'text-amber-400' : 'text-slate-400'}`}>
                                    {isVerified ? '🟢 Active & Verified' : hasDomain ? '🟡 DNS Verification Pending' : '🔴 Not Configured'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── DOMAIN INPUT CARD ─── */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                            <Server className="w-5 h-5 text-indigo-600" />
                            ১. কাস্টম ডোমেইন যুক্ত করুন
                        </h2>
                        {hasDomain && (
                            <a 
                                href={`https://${shop.custom_domain}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition"
                            >
                                <span>https://{shop.custom_domain} ভিজিট করুন</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </div>

                    <form onSubmit={handleSaveDomain} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                ডোমেইন নেম (Domain Name)
                            </label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs select-none">
                                        https://
                                    </span>
                                    <input 
                                        type="text"
                                        value={data.custom_domain}
                                        onChange={e => setData('custom_domain', e.target.value)}
                                        placeholder="yourbrand.com বা shop.yourbrand.com"
                                        className="w-full pl-18 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none font-mono"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 shrink-0"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'সংরক্ষণ হচ্ছে...' : 'ডোমেইন সেভ করুন'}
                                </button>
                            </div>
                            {errors.custom_domain && (
                                <p className="text-xs text-rose-600 font-bold mt-1.5">{errors.custom_domain}</p>
                            )}
                            <p className="text-xs text-slate-500 mt-1.5">
                                উদাহরণ: <code className="font-mono text-slate-700 font-bold">fashionstore.com</code> বা <code className="font-mono text-slate-700 font-bold">shop.fashionstore.com</code> (http:// বা https:// ছাড়া লিখুন)
                            </p>
                        </div>
                    </form>

                    {hasDomain && !isVerified && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 text-amber-900">
                                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                                <div className="text-xs font-semibold">
                                    রেকর্ড পরিবর্তন করার পর ডিএনএস আপডেট হতে সাধারণত ১৫-৩০ মিনিট সময় লাগতে পারে। রেকর্ডস বসানো হয়ে গেলে নিচে চাপুন:
                                </div>
                            </div>
                            <button
                                onClick={handleVerifyDns}
                                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold px-4 py-2 rounded-lg shadow-2xs flex items-center gap-1.5 shrink-0 transition active:scale-95"
                            >
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ডিএনএস ভেরিফাই করুন
                            </button>
                        </div>
                    )}
                </div>

                {/* ─── DNS RECORDS COPY TABLE ─── */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                                <Copy className="w-5 h-5 text-emerald-600" />
                                ২. প্রয়োজনীয ডিএনএস রেকর্ডস (One-Click Copy DNS Records)
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                আপনার ডোমেইন কন্ট্রোল প্যানেলের (cPanel / Cloudflare / Namecheap / GoDaddy) DNS Management সেকশনে নিচের রেকর্ডগুলো যুক্ত করুন।
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-100/80 text-slate-700 text-xs uppercase font-extrabold border-b border-slate-200">
                                    <th className="py-3 px-4">রেকর্ড টাইপ (Type)</th>
                                    <th className="py-3 px-4">হোস্ট / নেম (Host / Name)</th>
                                    <th className="py-3 px-4">ভ্যালু / পয়েন্ট (Value / Target)</th>
                                    <th className="py-3 px-4">TTL</th>
                                    <th className="py-3 px-4 text-right">অ্যাকশন (Copy)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-xs font-semibold">
                                {/* A Record */}
                                <tr className="hover:bg-slate-50/80 transition">
                                    <td className="py-3.5 px-4 font-bold text-purple-700">
                                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-mono text-xs">
                                            {dnsRecords.a_record.type}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900">
                                        {dnsRecords.a_record.name}
                                    </td>
                                    <td className="py-3.5 px-4 font-mono text-slate-800 bg-slate-50 rounded">
                                        {dnsRecords.a_record.value}
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-500">
                                        {dnsRecords.a_record.ttl}
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <button
                                            onClick={() => handleCopy(dnsRecords.a_record.value, 'a_record', 'A Record IP')}
                                            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs active:scale-95"
                                        >
                                            {copiedKey === 'a_record' ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span>কপি হয়েছে</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5" />
                                                    <span>কপি</span>
                                                </>
                                            )}
                                        </button>
                                    </td>
                                </tr>

                                {/* CNAME Record */}
                                <tr className="hover:bg-slate-50/80 transition">
                                    <td className="py-3.5 px-4 font-bold text-blue-700">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono text-xs">
                                            {dnsRecords.cname_record.type}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900">
                                        {dnsRecords.cname_record.name}
                                    </td>
                                    <td className="py-3.5 px-4 font-mono text-slate-800 bg-slate-50 rounded">
                                        {dnsRecords.cname_record.value}
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-500">
                                        {dnsRecords.cname_record.ttl}
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <button
                                            onClick={() => handleCopy(dnsRecords.cname_record.value, 'cname_record', 'CNAME Record Value')}
                                            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs active:scale-95"
                                        >
                                            {copiedKey === 'cname_record' ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span>কপি হয়েছে</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5" />
                                                    <span>কপি</span>
                                                </>
                                            )}
                                        </button>
                                    </td>
                                </tr>

                                {/* TXT Verification Record */}
                                <tr className="hover:bg-slate-50/80 transition">
                                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono text-xs">
                                            {dnsRecords.txt_verification.type}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900">
                                        {dnsRecords.txt_verification.name}
                                    </td>
                                    <td className="py-3.5 px-4 font-mono text-slate-800 bg-slate-50 rounded break-all">
                                        {dnsRecords.txt_verification.value}
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-500">
                                        {dnsRecords.txt_verification.ttl}
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <button
                                            onClick={() => handleCopy(dnsRecords.txt_verification.value, 'txt_verification', 'TXT Token')}
                                            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs active:scale-95"
                                        >
                                            {copiedKey === 'txt_verification' ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span>কপি হয়েছে</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5" />
                                                    <span>কপি</span>
                                                </>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ─── NAMESERVERS SECTION ─── */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                        <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                            <Server className="w-5 h-5 text-amber-600" />
                            ৩. নেমসার্ভার তথ্য (Guruz BD NameServers)
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            যদি আপনি সরাসরি নেমসার্ভার পয়েন্ট করতে চান, তবে আপনার ডোমেইন রেজিস্ট্রারে নিচের নেমসার্ভারগুলো সেট করুন।
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* NS1 */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                                <div className="text-[10px] uppercase font-extrabold text-slate-400">Primary NS 1</div>
                                <div className="font-mono text-xs font-extrabold text-slate-900 mt-0.5">{nameservers.ns1}</div>
                            </div>
                            <button
                                onClick={() => handleCopy(nameservers.ns1, 'ns1', 'NS1')}
                                className="bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 p-2 rounded-lg transition active:scale-95"
                            >
                                {copiedKey === 'ns1' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* NS2 */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                                <div className="text-[10px] uppercase font-extrabold text-slate-400">Secondary NS 2</div>
                                <div className="font-mono text-xs font-extrabold text-slate-900 mt-0.5">{nameservers.ns2}</div>
                            </div>
                            <button
                                onClick={() => handleCopy(nameservers.ns2, 'ns2', 'NS2')}
                                className="bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 p-2 rounded-lg transition active:scale-95"
                            >
                                {copiedKey === 'ns2' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* NS3 */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                                <div className="text-[10px] uppercase font-extrabold text-slate-400">Backup NS 3</div>
                                <div className="font-mono text-xs font-extrabold text-slate-900 mt-0.5">{nameservers.ns3}</div>
                            </div>
                            <button
                                onClick={() => handleCopy(nameservers.ns3, 'ns3', 'NS3')}
                                className="bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 p-2 rounded-lg transition active:scale-95"
                            >
                                {copiedKey === 'ns3' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ─── SETUP GUIDE CARDS ─── */}
                <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                        <HelpCircle className="w-4 h-4 text-emerald-400" />
                        সহজ ডোমেইন কানেকশন নির্দেশিকা (Domain Connect Guide)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                        <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700/60 space-y-1.5">
                            <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center font-black text-xs">1</div>
                            <h4 className="font-bold text-slate-200">ডোমেইন টাইপ করুন</h4>
                            <p className="text-slate-400 leading-relaxed text-[11px]">
                                আপনার কেনা ডোমেইন নামটির টেক্সট ইনপুট বক্সে লিখে "ডোমেইন সেভ করুন" বাটনে ক্লিক করুন।
                            </p>
                        </div>

                        <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700/60 space-y-1.5">
                            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-black text-xs">2</div>
                            <h4 className="font-bold text-slate-200">রেকর্ড কপি করুন</h4>
                            <p className="text-slate-400 leading-relaxed text-[11px]">
                                টেবিলের "A Record" এর IP এবং "CNAME Record" এর ভ্যালু পাশে দেওয়া "কপি" বাটনে চাপ দিয়ে কপি করুন।
                            </p>
                        </div>

                        <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700/60 space-y-1.5">
                            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xs">3</div>
                            <h4 className="font-bold text-slate-200">DNS এ পেস্ট করুন</h4>
                            <p className="text-slate-400 leading-relaxed text-[11px]">
                                আপনার ডোমেন প্রোভাইডার (Cloudflare/Namecheap/cPanel) এর DNS Management পেজে গিয়ে রেকর্ড যুক্ত করুন।
                            </p>
                        </div>

                        <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700/60 space-y-1.5">
                            <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-xs">4</div>
                            <h4 className="font-bold text-slate-200">ভেরিফাই করুন</h4>
                            <p className="text-slate-400 leading-relaxed text-[11px]">
                                কিছু সময় পর "ডিএনএস ভেরিফাই করুন" বাটনে চাপুন। ভেরিফাইড হলেই আপনার নিজস্ব ব্র্যান্ড ডোমেইন চালু হয়ে যাবে!
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

CustomDomain.layout = (page: any) => <SellerLayout children={page} />;
