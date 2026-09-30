import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Upload, Download } from 'lucide-react';
import Swal from 'sweetalert2';

interface Shop {
    id: number;
    name: string;
    slug: string;
}

export default function ImportProductsCsv({ shops }: { shops: Shop[] }) {
    const { data, setData, post, processing, reset } = useForm({
        csv_file: null as File | null,
        default_shop_id: shops.length > 0 ? shops[0].id : '',
    });

    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

    const handleDownloadTemplate = () => {
        const headers = ["name_en", "price", "shop", "category", "brand", "unit", "status"];
        const sampleRows = [
            ["UGREEN USB 3.0 Hub", "1150", "Guruz Store", "electronics", "ugreen", "pcs", "published"],
            ["Logitech Mouse", "450", "Guruz Store", "electronics", "logitech", "pcs", "published"],
        ];

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...sampleRows.map(e => e.join(","))].join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "products_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Downloaded!',
            text: 'Sample CSV template downloaded successfully.',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('csv_file', e.target.files[0]);
            setSelectedFileName(e.target.files[0].name);
        }
    };

    const handleUpload = () => {
        if (!data.csv_file) {
            Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Please choose a CSV file first.', showConfirmButton: false, timer: 3000, timerProgressBar: true });
            return;
        }

        post('/admin/products/import', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset('csv_file');
                setSelectedFileName(null);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Saved!',
                    text: 'Successfully imported products.',
                    showConfirmButton: false,
                    timer: 4000,
                    timerProgressBar: true
                });
            },
            onError: (err) => {
                Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Import Failed', text: Object.values(err)[0] as string, showConfirmButton: false, timer: 3000, timerProgressBar: true });
            }
        });
    };

    return (
        <>
            <Head title="Import product by CSV — Admin Panel" />

            <div className="space-y-6">

                {/* Banner Header Card matching screenshot #4 */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-2xl p-6 shadow-md">
                    <h1 className="text-2xl font-black tracking-tight">Import product by CSV</h1>
                    <p className="text-xs font-semibold text-purple-100 opacity-90 mt-1">
                        Bulk upload products from a spreadsheet
                    </p>
                </div>

                {/* Main Card Container matching screenshot #4 */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
                    
                    {/* Dashed Upload Dropzone */}
                    <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-purple-400 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-950/50">
                        <Upload className="w-10 h-10 text-slate-400 mb-2" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            {selectedFileName ? selectedFileName : 'Upload from computer'}
                        </span>
                        <span className="text-xs text-slate-400 font-medium mt-1">
                            Formats: CSV, XLSX, XLS - Max : 2MB
                        </span>
                        <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileChange} className="hidden" />
                    </label>

                    {/* Default Shop Selector */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                            Default Shop (optional):
                        </label>
                        <select
                            value={data.default_shop_id}
                            onChange={e => setData('default_shop_id', e.target.value)}
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[200px]"
                        >
                            {shops.length === 0 && <option value="">No shops available</option>}
                            {shops.map(shop => (
                                <option key={shop.id} value={shop.id}>{shop.name}</option>
                            ))}
                        </select>
                        <span className="text-[11px] text-slate-400 font-mono">
                            CSV-এ shop কলামে shop name/slug/UUID দিলে এটা লাগবে না
                        </span>
                    </div>

                    {/* Action Buttons matching green buttons in screenshot #4 */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={handleDownloadTemplate}
                            className="border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer"
                        >
                            <Download className="w-4 h-4" /> Download Template
                        </button>

                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={processing}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                        >
                            <Upload className="w-4 h-4" /> {processing ? 'Uploading...' : 'Upload File'}
                        </button>
                    </div>

                    {/* Guidance Bullet Points in Bengali matching screenshot #4 */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                        <p>• Required: <code className="font-mono text-purple-600 font-bold">name_en</code>, <code className="font-mono text-purple-600 font-bold">price</code></p>
                        <p>• shop / category / brand / unit — name, slug অথবা UUID যেকোনোটি</p>
                        <p>• status: <code className="font-mono">published</code> / <code className="font-mono">draft</code> / <code className="font-mono">pending</code></p>
                        <p>• Row-এ shop না থাকলে উপরের Default Shop ব্যবহার হবে</p>
                    </div>

                </div>

            </div>
        
</>
    );
}
