import React from 'react';
import { Head } from '@inertiajs/react';
import { Header } from '@/Components/Header';
import { Footer } from '@/Components/Footer';

interface CmsPageProps {
    page: {
        id: number;
        title: string;
        title_bn?: string;
        slug: string;
        content: string;
        content_bn?: string;
        subtitle_en?: string;
        subtitle_bn?: string;
        meta_title?: string;
        meta_description?: string;
        featured_image?: string;
        status: string;
        created_at: string;
        updated_at: string;
    }
}

export default function CmsPage({ page }: CmsPageProps) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Head title={page.meta_title || page.title}>
                {page.meta_description && <meta name="description" content={page.meta_description} />}
            </Head>

            <Header />

            <main className="flex-grow">
                {/* Banner Section */}
                {page.featured_image ? (
                    <div className="relative w-full h-[300px] md:h-[400px]">
                        <img 
                            src={page.featured_image.startsWith('http') ? page.featured_image : `/storage/${page.featured_image}`} 
                            alt={page.title} 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-4">
                            <h1 className="text-4xl md:text-5xl font-bold text-white text-center px-4">
                                {page.title}
                            </h1>
                            {page.subtitle_en && (
                                <p className="text-lg md:text-xl text-white/90 text-center px-4 max-w-2xl font-medium">
                                    {page.subtitle_en}
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-900 py-16 md:py-24">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-4">
                            <h1 className="text-3xl md:text-5xl font-bold text-white">
                                {page.title}
                            </h1>
                            {page.subtitle_en && (
                                <p className="text-lg md:text-xl text-white/80 font-medium">
                                    {page.subtitle_en}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Content Section */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <div 
                        className="prose prose-slate prose-lg max-w-none bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-slate-200"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}
