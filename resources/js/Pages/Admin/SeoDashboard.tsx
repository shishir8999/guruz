import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Search, Globe, Link as LinkIcon, AlertTriangle, FileCode2, Save, ExternalLink } from 'lucide-react';
import Swal from 'sweetalert2';

export default function SeoDashboard({ globalSettings, products, redirects, logs404, sitemapStatus }: any) {
    const [activeTab, setActiveTab] = useState('global');
    
    // Sitemap Generator Form
    const { post: generateSitemap, processing: generatingSitemap } = useForm();
    const [sitemapSuccess, setSitemapSuccess] = useState('');

    // Global Settings Form
    const { data, setData, post, processing } = useForm({
        meta_title: globalSettings?.meta_title || '',
        meta_description: globalSettings?.meta_description || '',
        pixel_id: globalSettings?.pixel_id || '',
        gtm_id: globalSettings?.gtm_id || '',
        robots_txt: globalSettings?.robots_txt || '',
        schema_enabled: globalSettings?.schema_enabled ?? true,
    });

    const handleSaveGlobal = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/seo/tools/global', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'Saved!',
                    text: 'Global SEO Settings updated successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        });
    };

    const handleGenerateSitemap = (e: React.FormEvent) => {
        e.preventDefault();
        generateSitemap('/admin/seo/sitemap/generate', {
            preserveScroll: true,
            onSuccess: () => {
                setSitemapSuccess('Sitemap generated successfully! Included 452 URLs.');
                setTimeout(() => setSitemapSuccess(''), 5000);
            }
        });
    };

    return (
        <>

            <Head title="SEO Management — Admin" />
            
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Advanced SEO Management</h1>
                        <p className="text-xs font-semibold text-purple-100 opacity-90 mt-1">Optimize your store for search engines</p>
                    </div>
                    <Search className="w-8 h-8 opacity-50" />
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-white border border-slate-200 p-1 rounded-xl shadow-xs overflow-x-auto">
                    {[
                        { id: 'global', name: 'Global Settings', icon: Globe },
                        { id: 'products', name: 'Product SEO', icon: FileCode2 },
                        { id: 'redirects', name: '301 Redirects', icon: LinkIcon },
                        { id: '404logs', name: '404 Logs', icon: AlertTriangle },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <tab.icon className="w-4 h-4" /> {tab.name}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                    
                    {/* GLOBAL SETTINGS (Includes Sitemap & Schema toggle) */}
                    {activeTab === 'global' && (
                        <div className="p-6 space-y-8">
                            <form onSubmit={handleSaveGlobal} className="space-y-8">
                                <div>
                                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                                        <h3 className="font-bold text-slate-800">Global Meta & Tracking</h3>
                                        <button disabled={processing} type="submit" className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 text-sm">
                                            <Save className="w-4 h-4" /> {processing ? 'Saving...' : 'Save Settings'}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Site Meta Title</label>
                                            <input type="text" value={data.meta_title} onChange={e => setData('meta_title', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Site Meta Description</label>
                                            <input type="text" value={data.meta_description} onChange={e => setData('meta_description', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Facebook Pixel ID</label>
                                            <input type="text" value={data.pixel_id} onChange={e => setData('pixel_id', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Google Tag Manager ID</label>
                                            <input type="text" value={data.gtm_id} onChange={e => setData('gtm_id', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Robots.txt & Schema</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Robots.txt Content</label>
                                            <textarea rows={4} value={data.robots_txt} onChange={e => setData('robots_txt', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-mono text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"></textarea>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input type="checkbox" checked={data.schema_enabled} onChange={e => setData('schema_enabled', e.target.checked)} className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 border-slate-300" />
                                                <div>
                                                    <p className="font-bold text-slate-700">Enable Automated JSON-LD Schema</p>
                                                    <p className="text-xs text-slate-500">Automatically generates Product Rich Snippets for Google Search</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </form>

                            <div>
                                <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Sitemap Management</h3>
                                <div className="flex flex-col md:flex-row md:items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-700 mb-1">Generate `sitemap.xml`</p>
                                        <p className="text-xs text-slate-500">Last Generated: {sitemapStatus.last_generated} ({sitemapStatus.total_urls} URLs, {sitemapStatus.file_size})</p>
                                        {sitemapSuccess && <p className="text-xs font-bold text-emerald-600 mt-2">{sitemapSuccess}</p>}
                                    </div>
                                    <div className="flex gap-2">
                                        <a href="/sitemap.xml" target="_blank" className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 text-sm">
                                            View XML <ExternalLink className="w-4 h-4" />
                                        </a>
                                        <form onSubmit={handleGenerateSitemap}>
                                            <button disabled={generatingSitemap} type="submit" className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 text-sm">
                                                {generatingSitemap ? 'Generating...' : 'Generate Sitemap'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Sitemap Management</h3>
                                <div className="flex flex-col md:flex-row md:items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-700 mb-1">Generate `sitemap.xml`</p>
                                        <p className="text-xs text-slate-500">Last Generated: {sitemapStatus?.last_generated} ({sitemapStatus?.total_urls} URLs, {sitemapStatus?.file_size})</p>
                                        {sitemapSuccess && <p className="text-xs font-bold text-emerald-600 mt-2">{sitemapSuccess}</p>}
                                    </div>
                                    <div className="flex gap-2">
                                        <a href="/sitemap.xml" target="_blank" className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 text-sm">
                                            View XML <ExternalLink className="w-4 h-4" />
                                        </a>
                                        <form onSubmit={handleGenerateSitemap}>
                                            <button disabled={generatingSitemap} type="submit" className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 text-sm">
                                                {generatingSitemap ? 'Generating...' : 'Generate Sitemap'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PRODUCT SEO */}
                    {activeTab === 'products' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                                    <tr>
                                        <th className="py-3 px-4">Product Name</th>
                                        <th className="py-3 px-4 w-1/3">Meta Title</th>
                                        <th className="py-3 px-4 w-1/3">Meta Description</th>
                                        <th className="py-3 px-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {products.map((p: any) => (
                                        <tr key={p.id} className="hover:bg-slate-50">
                                            <td className="py-3 px-4 font-bold text-slate-800">{p.name}</td>
                                            <td className="py-3 px-4"><input type="text" defaultValue={p.meta_title} className="w-full bg-white border border-slate-200 rounded text-xs px-2 py-1" /></td>
                                            <td className="py-3 px-4"><input type="text" defaultValue={p.meta_description} className="w-full bg-white border border-slate-200 rounded text-xs px-2 py-1" /></td>
                                            <td className="py-3 px-4 text-right">
                                                <button className="text-purple-600 hover:text-purple-800 font-bold">Save</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* 301 REDIRECTS */}
                    {activeTab === 'redirects' && (
                        <div className="overflow-x-auto">
                            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                                <p className="text-xs font-semibold text-slate-600">Map old URLs to new URLs to preserve SEO ranking.</p>
                                <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs">Add Redirect</button>
                            </div>
                            <table className="w-full text-left text-xs">
                                <thead className="bg-white text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                                    <tr>
                                        <th className="py-3 px-4">Source URL (Old)</th>
                                        <th className="py-3 px-4">Destination URL (New)</th>
                                        <th className="py-3 px-4">Type</th>
                                        <th className="py-3 px-4 text-right">Hits</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {redirects.map((r: any) => (
                                        <tr key={r.id} className="hover:bg-slate-50">
                                            <td className="py-3 px-4 font-mono text-rose-600">{r.source_url}</td>
                                            <td className="py-3 px-4 font-mono text-emerald-600">{r.destination_url}</td>
                                            <td className="py-3 px-4 font-bold text-slate-600">{r.status}</td>
                                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-500">{r.hits}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* 404 LOGS */}
                    {activeTab === '404logs' && (
                        <div className="overflow-x-auto">
                            <div className="p-4 border-b border-slate-200 bg-rose-50 flex justify-between items-center text-rose-800 text-xs font-semibold">
                                <p>Monitor broken links that users are trying to visit. Create redirects for high-hit 404s.</p>
                            </div>
                            <table className="w-full text-left text-xs">
                                <thead className="bg-white text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                                    <tr>
                                        <th className="py-3 px-4">URL Attempted</th>
                                        <th className="py-3 px-4">Hits</th>
                                        <th className="py-3 px-4">Last Hit</th>
                                        <th className="py-3 px-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {logs404.map((log: any) => (
                                        <tr key={log.id} className="hover:bg-slate-50">
                                            <td className="py-3 px-4 font-mono text-slate-800">{log.url_attempted}</td>
                                            <td className="py-3 px-4 font-mono font-bold text-rose-600">{log.hits}</td>
                                            <td className="py-3 px-4 text-slate-500">{log.last_hit}</td>
                                            <td className="py-3 px-4 text-right">
                                                <button className="text-purple-600 hover:text-purple-800 font-bold">Create Redirect</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </div>
        
</>
    );
}
