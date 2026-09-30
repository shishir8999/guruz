import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Package, Filter, LayoutGrid, List } from 'lucide-react';
import Swal from 'sweetalert2';

interface Product {
    id: number; name: string; slug: string; price: number; sale_price: number | null;
    stock_quantity: number; is_active: boolean; rating: number; sku: string | null;
    primary_image_url: string | null; category: { name: string } | null;
    created_at: string;
}

interface Category { id: number; name: string; }

export default function SellerProductsIndex({
    products, stats, categories, filters
}: {
    products: { data: Product[]; current_page: number; last_page: number; total: number };
    stats?: { total_products: number; active_listings: number; out_of_stock: number };
    categories: Category[];
    filters: any;
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/seller/products', { search, status: statusFilter }, { preserveState: true });
    };

    const handleStatusFilterChange = (newStatus: string) => {
        setStatusFilter(newStatus);
        router.get('/seller/products', { search, status: newStatus }, { preserveState: true });
    };

    const handleToggleStatus = (id: number, currentActive: boolean) => {
        router.put(`/seller/products/${id}`, { is_active: !currentActive }, { preserveScroll: true });
    };

    const handleDelete = (id: number, name: string) => {
        Swal.fire({
            title: 'Delete Product?',
            text: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel',
        }).then(result => {
            if (result.isConfirmed) {
                router.delete(`/seller/products/${id}`, { preserveScroll: true });
            }
        });
    };

    const getImageSrc = (url: string | null) => {
        if (!url) return 'https://via.placeholder.com/150?text=No+Image';
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/storage/')) return url;
        return '/storage/' + url;
    };

    const totalCount = stats?.total_products ?? products.total ?? products.data.length;
    const activeCount = stats?.active_listings ?? products.data.filter(p => p.is_active).length;
    const outOfStockCount = stats?.out_of_stock ?? products.data.filter(p => p.stock_quantity <= 0).length;

    return (
        <>
            <Head title="Products" />

            <div className="max-w-7xl mx-auto pb-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-bold text-2xl text-slate-800">Products</h1>
                        <p className="text-slate-500 text-sm mt-1">Manage your store's inventory and listings.</p>
                    </div>
                    <Link
                        href="/seller/products/create"
                        className="flex items-center gap-2 bg-[#4f46e5] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#4338ca] transition shadow-sm w-max"
                    >
                        <Plus size={18} />
                        Add Product
                    </Link>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div 
                        onClick={() => handleStatusFilterChange('all')}
                        className={`bg-white rounded-2xl p-6 border transition cursor-pointer flex items-center gap-5 ${statusFilter === 'all' ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md' : 'border-slate-200 shadow-sm hover:border-slate-300'}`}
                    >
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-indigo-50 text-indigo-600">
                            <Package size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Products</p>
                            <p className="text-3xl font-black text-slate-800">{totalCount}</p>
                        </div>
                    </div>

                    <div 
                        onClick={() => handleStatusFilterChange('active')}
                        className={`bg-white rounded-2xl p-6 border transition cursor-pointer flex items-center gap-5 ${statusFilter === 'active' ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' : 'border-slate-200 shadow-sm hover:border-slate-300'}`}
                    >
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-600">
                            <Eye size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Listings</p>
                            <p className="text-3xl font-black text-slate-800">{activeCount}</p>
                        </div>
                    </div>

                    <div 
                        onClick={() => handleStatusFilterChange('out_of_stock')}
                        className={`bg-white rounded-2xl p-6 border transition cursor-pointer flex items-center gap-5 ${statusFilter === 'out_of_stock' ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-md' : 'border-slate-200 shadow-sm hover:border-slate-300'}`}
                    >
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-rose-50 text-rose-600">
                            <EyeOff size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Out of Stock</p>
                            <p className="text-3xl font-black text-slate-800">{outOfStockCount}</p>
                        </div>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <form onSubmit={handleSearch} className="flex-1 w-full max-w-md relative">
                        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch(e)}
                            placeholder="Search products by name..."
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs text-slate-700 placeholder:text-slate-400"
                        />
                    </form>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-slate-400" />
                            <select 
                                value={statusFilter}
                                onChange={e => handleStatusFilterChange(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active Only</option>
                                <option value="draft">Draft Only</option>
                                <option value="out_of_stock">Out of Stock</option>
                            </select>
                        </div>
                        
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 ml-auto md:ml-0">
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <LayoutGrid size={16} />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition cursor-pointer ${viewMode === 'list' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <List size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products List/Grid */}
                {products.data.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Package size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">No products found</h3>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">You haven't added any products yet, or none match your search criteria.</p>
                        <Link href="/seller/products/create" className="inline-flex items-center gap-2 bg-[#4f46e5] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#4338ca] transition shadow-md shadow-indigo-200">
                            <Plus size={18} /> Add Your First Product
                        </Link>
                    </div>
                ) : viewMode === 'list' ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase text-[11px] font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Product</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Price</th>
                                        <th className="px-6 py-4">Stock</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {products.data.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                                        <img 
                                                            src={getImageSrc(product.primary_image_url)} 
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                            onError={e => e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image'}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 line-clamp-1">{product.name}</p>
                                                        <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {product.sku || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-medium text-xs">
                                                {product.category?.name || 'Uncategorized'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-black text-slate-800 text-sm">৳{Number(product.sale_price || product.price).toLocaleString()}</div>
                                                {product.sale_price && product.price > product.sale_price && (
                                                    <div className="text-xs text-slate-400 line-through">৳{Number(product.price).toLocaleString()}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {product.stock_quantity > 10 ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                        {product.stock_quantity} in stock
                                                    </span>
                                                ) : product.stock_quantity > 0 ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                        Low Stock ({product.stock_quantity})
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
                                                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                                        Out of Stock
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(product.id, product.is_active)}
                                                    title="Click to toggle status (Active / Draft)"
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition cursor-pointer shadow-2xs border ${
                                                        product.is_active
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 hover:scale-105'
                                                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200 hover:scale-105'
                                                    }`}
                                                >
                                                    {product.is_active ? <Eye size={14} className="text-emerald-600" /> : <EyeOff size={14} className="text-slate-400" />}
                                                    {product.is_active ? 'Active' : 'Draft'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link 
                                                        href={`/seller/products/${product.id}/edit`}
                                                        className="p-2 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600 rounded-xl transition cursor-pointer border border-slate-200 hover:border-indigo-600 shadow-2xs" 
                                                        title="Edit Product"
                                                    >
                                                        <Edit2 size={15} />
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(product.id, product.name)}
                                                        className="p-2 bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-600 rounded-xl transition cursor-pointer border border-slate-200 hover:border-rose-600 shadow-2xs" 
                                                        title="Delete Product"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.data.map(product => (
                            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition flex flex-col justify-between">
                                <div>
                                    <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                        <img 
                                            src={getImageSrc(product.primary_image_url)} 
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                            onError={e => e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image'}
                                        />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <Link 
                                                href={`/seller/products/${product.id}/edit`}
                                                className="p-2.5 bg-white text-slate-700 hover:text-indigo-600 rounded-full transition shadow-md cursor-pointer"
                                            >
                                                <Edit2 size={18} />
                                            </Link>
                                            <button 
                                                onClick={() => handleDelete(product.id, product.name)}
                                                className="p-2.5 bg-white text-slate-700 hover:text-rose-600 rounded-full transition shadow-md cursor-pointer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleToggleStatus(product.id, product.is_active)}
                                            className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-xs cursor-pointer ${
                                                product.is_active ? 'bg-emerald-600/90 text-white' : 'bg-slate-800/80 text-white'
                                            }`}
                                        >
                                            {product.is_active ? 'Active' : 'Draft'}
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-xs text-slate-400 font-medium mb-1">{product.category?.name || 'Uncategorized'}</p>
                                        <h3 className="font-bold text-slate-800 line-clamp-1 mb-2 group-hover:text-indigo-600 transition">{product.name}</h3>
                                        <div className="flex items-center justify-between">
                                            <div className="font-black text-indigo-600">৳{Number(product.sale_price || product.price).toLocaleString()}</div>
                                            <div className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{product.stock_quantity} in stock</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
