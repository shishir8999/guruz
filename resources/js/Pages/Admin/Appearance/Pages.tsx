import React, { useState, useRef, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { File, Plus, Edit2, Trash2, X, Loader2, Image as ImageIcon, Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Code, Eye, Heading1, Heading2, Heading3, Quote, RotateCcw } from 'lucide-react';
import Swal from 'sweetalert2';

interface ManualEditorProps {
    value: string;
    onChange: (val: string) => void;
}

function ManualRichTextEditor({ value, onChange }: ManualEditorProps) {
    const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && activeTab === 'visual') {
            if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value || '';
            }
        }
    }, [value, activeTab]);

    const execCmd = (command: string, arg: string | undefined = undefined) => {
        document.execCommand(command, false, arg);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const handleVisualInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const addLink = () => {
        const url = prompt('Enter URL link:');
        if (url) {
            execCmd('createLink', url);
        }
    };

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-xs">
            {/* Editor Mode Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('visual')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                            activeTab === 'visual'
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                    >
                        <Eye className="w-3.5 h-3.5" /> Visual Editor
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('code')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                            activeTab === 'code'
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                    >
                        <Code className="w-3.5 h-3.5" /> HTML / Code Editor
                    </button>
                </div>

                <span className="text-[10px] font-semibold text-slate-400">
                    {activeTab === 'visual' ? 'Rich Formatting Enabled' : 'Raw HTML & Manual Input'}
                </span>
            </div>

            {/* Toolbar for Visual Mode */}
            {activeTab === 'visual' && (
                <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-100/70 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    <button
                        type="button"
                        onClick={() => execCmd('bold')}
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        title="Bold"
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCmd('italic')}
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        title="Italic"
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCmd('underline')}
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        title="Underline"
                    >
                        <Underline className="w-4 h-4" />
                    </button>

                    <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-1" />

                    <button
                        type="button"
                        onClick={() => execCmd('formatBlock', '<h1>')}
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        title="Heading 1"
                    >
                        <Heading1 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCmd('formatBlock', '<h2>')}
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        title="Heading 2"
                    >
                        <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCmd('formatBlock', '<h3>')}
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        title="Heading 3"
                    >
                        <Heading3 className="w-4 h-4" />
                    </button>

                    <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-1" />

                    <button
                        type="button"
                        onClick={() => execCmd('insertUnorderedList')}
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        title="Bullet List"
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCmd('insertOrderedList')}
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        title="Numbered List"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCmd('formatBlock', '<blockquote>')}
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        title="Quote"
                    >
                        <Quote className="w-4 h-4" />
                    </button>

                    <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-1" />

                    <button
                        type="button"
                        onClick={addLink}
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        title="Add Link"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCmd('removeFormat')}
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        title="Clear Formatting"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Content Area */}
            {activeTab === 'visual' ? (
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleVisualInput}
                    className="min-h-[300px] p-4 text-sm font-sans focus:outline-none dark:text-white prose dark:prose-invert max-w-none"
                    style={{ minHeight: '300px' }}
                />
            ) : (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={12}
                    placeholder="Enter manual text or HTML code here..."
                    className="w-full p-4 font-mono text-xs bg-slate-900 text-slate-100 focus:outline-none leading-relaxed border-none resize-y min-h-[300px]"
                />
            )}
        </div>
    );
}

export default function CmsPages({ pages = [] }: { pages: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        slug: '',
        content: '',
        meta_title: '',
        meta_description: '',
        is_published: true,
        banner_image: null as File | null,
        _method: 'POST'
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const openModal = (page: any = null) => {
        if (page) {
            setEditingId(page.id);
            setData({
                title: page.title || '',
                slug: page.slug || '',
                content: page.content || '',
                meta_title: page.seo_title || page.meta_title || '',
                meta_description: page.meta_description || '',
                is_published: page.status === 'Publish' || page.status === 'Published',
                banner_image: null,
                _method: 'PUT'
            });
            setImagePreview(page.featured_image || page.banner_image || null);
        } else {
            setEditingId(null);
            reset();
            setData('_method', 'POST');
            setImagePreview(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setEditingId(null);
        setImagePreview(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('banner_image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload = {
            ...data,
            status: data.is_published ? 'publish' : 'draft',
            featured_image: data.banner_image
        };

        if (editingId) {
            router.post(`/admin/appearance/pages/${editingId}`, {
                ...payload,
                _method: 'PUT'
            }, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'পেজের কন্টেন্ট সফলভাবে সেভ হয়েছে!',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            });
        } else {
            router.post('/admin/appearance/pages', payload, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'নতুন পেজ সফলভাবে তৈরি হয়েছে!',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'পেজ মুছে ফেলতে চান?',
            text: 'এই অ্যাকশনটি বাতিল করা যাবে না।',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
            cancelButtonText: 'বাতিল'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/appearance/pages/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'পেজ মুছে ফেলা হয়েছে!',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                        });
                    }
                });
            }
        });
    };

    return (
        <>
            <Head title="Custom CMS Pages — Admin" />
            
            <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded">
                                Appearance
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">CMS Page Builder</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Custom Pages</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Create and customize legal pages, career, company policies, and static content.
                        </p>
                    </div>

                    <button 
                        type="button"
                        onClick={() => openModal()}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-xs cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Create New Page
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="py-3.5 px-4">Title</th>
                                    <th className="py-3.5 px-4">URL Slug</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4">Last Updated</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                                {pages.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center text-slate-400">
                                            কোনো পেজ পাওয়া যায়নি।
                                        </td>
                                    </tr>
                                ) : (
                                    pages.map(page => (
                                        <tr key={page.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                                            <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                <File className="w-4 h-4 text-purple-500 shrink-0" />
                                                {page.title}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500 font-mono">/{page.slug}</td>
                                            <td className="py-3.5 px-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                    page.status === 'Publish' || page.status === 'Published'
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' 
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                                                }`}>
                                                    {page.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{page.last_updated}</td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        type="button"
                                                        onClick={() => openModal(page)}
                                                        className="text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 p-2 rounded-lg transition cursor-pointer"
                                                        title="Edit Page"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleDelete(page.id)}
                                                        className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-2 rounded-lg transition cursor-pointer"
                                                        title="Delete Page"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create / Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <File className="w-4 h-4 text-purple-600" />
                                    {editingId ? 'Edit CMS Page' : 'Create New CMS Page'}
                                </h2>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                                <form id="cmsForm" onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                Page Title <span className="text-rose-500">*</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                value={data.title}
                                                onChange={e => {
                                                    setData('title', e.target.value);
                                                    if (!editingId) setData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                                                }}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-purple-500 dark:text-white"
                                                required
                                            />
                                            {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                URL Slug <span className="text-rose-500">*</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                value={data.slug}
                                                onChange={e => setData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold font-mono focus:ring-2 focus:ring-purple-500 dark:text-white"
                                                required
                                            />
                                            {errors.slug && <p className="text-rose-500 text-xs mt-1">{errors.slug}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Banner Image</label>
                                        <div className="flex items-center gap-4">
                                            {imagePreview ? (
                                                <div className="relative w-36 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs">
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => { setImagePreview(null); setData('banner_image', null); }} 
                                                        className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1 cursor-pointer"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="w-36 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                                    <ImageIcon className="text-slate-400 mb-1" size={20} />
                                                    <span className="text-xs font-semibold text-slate-500">Upload Image</span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    {/* Manual Content Text / Visual Editor */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            Page Content (Manual Text & HTML Editor)
                                        </label>
                                        <ManualRichTextEditor 
                                            value={data.content} 
                                            onChange={(val) => setData('content', val)} 
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Meta Title (SEO)</label>
                                            <input 
                                                type="text" 
                                                value={data.meta_title}
                                                onChange={e => setData('meta_title', e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-purple-500 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Meta Description (SEO)</label>
                                            <textarea 
                                                value={data.meta_description}
                                                onChange={e => setData('meta_description', e.target.value)}
                                                rows={2}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-purple-500 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-2">
                                        <input 
                                            type="checkbox" 
                                            id="is_published"
                                            checked={data.is_published}
                                            onChange={e => setData('is_published', e.target.checked)}
                                            className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                        />
                                        <label htmlFor="is_published" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                                            Publish this page immediately
                                        </label>
                                    </div>
                                </form>
                            </div>
                            
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3 shrink-0">
                                <button 
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    form="cmsForm"
                                    disabled={processing}
                                    className="px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                                >
                                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    {editingId ? 'Save Changes' : 'Create Page'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
