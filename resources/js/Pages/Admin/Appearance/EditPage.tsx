import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { Editor } from '@tinymce/tinymce-react';

interface EditCmsPageProps {
    page: {
        id: number;
        title: string;
        slug: string;
        content: string;
        meta_title: string;
        meta_description: string;
        is_published: boolean;
        banner_image: string | null;
    };
}

export default function EditCmsPage({ page }: EditCmsPageProps) {
    const { data, setData, post, processing, errors } = useForm({
        title: page.title,
        slug: page.slug,
        content: page.content || '',
        meta_title: page.meta_title || '',
        meta_description: page.meta_description || '',
        is_published: page.is_published,
        banner_image: null as File | null,
        _method: 'PUT'
    });

    const [imagePreview, setImagePreview] = useState<string | null>(page.banner_image || null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('banner_image', file);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post(route('appearance.pages.update', page.id), {
            onSuccess: () => {
                Swal.fire({
                    title: 'Saved!',
                    text: 'Page content has been updated successfully.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };

    return (
        <>

            <Head title={`Edit ${page.title}`} />
            
            <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Edit {page.title}</h1>
                        <p className="text-slate-500 text-sm mt-1">Update the content, SEO, and banner for this page.</p>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={processing}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">General Information</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Page Title <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        required
                                        value={data.title}
                                        onChange={e => {
                                            setData('title', e.target.value);
                                        }}
                                        className="w-full rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">URL Slug <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        required
                                        value={data.slug}
                                        onChange={e => setData('slug', e.target.value)}
                                        className="w-full rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                    {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Page Content</label>
                                <div className="border border-slate-300 rounded-lg overflow-hidden">
                                    <Editor
                                        apiKey="your-tinymce-api-key"
                                        value={data.content}
                                        onEditorChange={(content) => setData('content', content)}
                                        init={{
                                            height: 500,
                                            menubar: false,
                                            plugins: [
                                                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                            ],
                                            toolbar: 'undo redo | blocks | ' +
                                                'bold italic forecolor | alignleft aligncenter ' +
                                                'alignright alignjustify | bullist numlist outdent indent | ' +
                                                'removeformat | help',
                                            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                                        }}
                                    />
                                </div>
                                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Banner Image</label>
                                <div className="flex items-center gap-6">
                                    {imagePreview ? (
                                        <div className="relative w-48 h-24 rounded-lg overflow-hidden border border-slate-200">
                                            <img src={imagePreview.startsWith('data:') || imagePreview.startsWith('http') ? imagePreview : `/storage/${imagePreview}`} alt="Banner" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-48 h-24 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                                            <ImageIcon size={24} className="mb-1" />
                                            <span className="text-xs">No banner image</span>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="block w-full text-sm text-slate-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-emerald-50 file:text-emerald-700
                                                hover:file:bg-emerald-100 transition
                                            "
                                        />
                                        <p className="text-xs text-slate-500 mt-2">Recommended size: 1920x400px. Max size: 2MB.</p>
                                    </div>
                                </div>
                                {errors.banner_image && <p className="text-red-500 text-xs mt-1">{errors.banner_image}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">SEO Optimization</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta Title</label>
                                    <input 
                                        type="text" 
                                        value={data.meta_title}
                                        onChange={e => setData('meta_title', e.target.value)}
                                        className="w-full rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                                        placeholder="Optional: Custom SEO Title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
                                    <textarea 
                                        value={data.meta_description}
                                        onChange={e => setData('meta_description', e.target.value)}
                                        rows={3}
                                        className="w-full rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                                        placeholder="Brief description for search engines..."
                                    />
                                </div>
                                <div className="flex items-center pt-2">
                                    <input 
                                        type="checkbox" 
                                        id="is_published"
                                        checked={data.is_published}
                                        onChange={e => setData('is_published', e.target.checked)}
                                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-5 h-5"
                                    />
                                    <label htmlFor="is_published" className="ml-3 text-sm font-medium text-slate-700">Publish this page publicly</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        
</>
    );
}
