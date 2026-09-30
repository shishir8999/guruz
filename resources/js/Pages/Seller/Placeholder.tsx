import React from 'react';
import { Construction } from 'lucide-react';

export default function Placeholder({ title }: { title: string }) {
    return (
        <>

            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl shadow-sm border border-slate-100 p-8">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <Construction className="w-10 h-10 text-indigo-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">{title}</h1>
                <p className="text-slate-500 text-center max-w-md">
                    This module is currently under development. Please check back later.
                </p>
            </div>
        
</>
    );
}
