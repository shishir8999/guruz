import React from 'react';
import { useForm, Head } from '@inertiajs/react';

interface Slide {
    id: number;
    title_en: string;
    image_url: string;
    cta_url?: string;
}

interface Marquee {
    id: number;
    text_en: string;
}

export default function Cms({ slides, marquees }: { slides: Slide[]; marquees: Marquee[] }) {
    const slideForm = useForm({
        title_en: '',
        image_url: '',
        cta_url: '',
    });

    const marqueeForm = useForm({
        text_en: '',
    });

    const handleSlideSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        slideForm.post(route('admin.cms.slides.store'), {
            onSuccess: () => slideForm.reset()
        });
    };

    const handleMarqueeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        marqueeForm.post(route('admin.cms.marquees.store'), {
            onSuccess: () => marqueeForm.reset()
        });
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
            <Head title="CMS Manager - Admin" />

            <h1 className="text-3xl font-bold text-emerald-400 mb-8">CMS & Carousel Manager</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Hero Slides */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6">
                    <h2 className="text-xl font-bold text-slate-200">Homepage Hero Carousel</h2>

                    <form onSubmit={handleSlideSubmit} className="space-y-4">
                        <input 
                            type="text"
                            placeholder="Slide Title (English)"
                            value={slideForm.data.title_en}
                            onChange={e => slideForm.setData('title_en', e.target.value)}
                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded text-white"
                            required
                        />
                        <input 
                            type="url"
                            placeholder="Image URL"
                            value={slideForm.data.image_url}
                            onChange={e => slideForm.setData('image_url', e.target.value)}
                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded text-white"
                            required
                        />
                        <input 
                            type="text"
                            placeholder="Target URL / Link"
                            value={slideForm.data.cta_url}
                            onChange={e => slideForm.setData('cta_url', e.target.value)}
                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded text-white"
                        />
                        <button type="submit" className="py-3 px-6 bg-emerald-600 font-bold rounded hover:bg-emerald-500">
                            Add Hero Slide
                        </button>
                    </form>

                    <div className="space-y-3 pt-4 border-t border-slate-700">
                        {slides.map(slide => (
                            <div key={slide.id} className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-700">
                                <div>
                                    <h4 className="font-semibold">{slide.title_en}</h4>
                                    <span className="text-xs text-slate-400 truncate block max-w-xs">{slide.image_url}</span>
                                </div>
                                <button className="text-red-400 text-xs hover:underline">Delete</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notice Marquee */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6">
                    <h2 className="text-xl font-bold text-slate-200">Header Announcement Marquee</h2>

                    <form onSubmit={handleMarqueeSubmit} className="space-y-4">
                        <textarea 
                            placeholder="Announcement text (e.g. Free shipping on orders over ৳2000!)..."
                            value={marqueeForm.data.text_en}
                            onChange={e => marqueeForm.setData('text_en', e.target.value)}
                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded text-white h-24"
                            required
                        />
                        <button type="submit" className="py-3 px-6 bg-emerald-600 font-bold rounded hover:bg-emerald-500">
                            Add Announcement
                        </button>
                    </form>

                    <div className="space-y-3 pt-4 border-t border-slate-700">
                        {marquees.map(marquee => (
                            <div key={marquee.id} className="bg-slate-900 p-3 rounded border border-slate-700">
                                <p className="text-sm">{marquee.text_en}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
