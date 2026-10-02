import React, { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { Camera, Settings, Store, Globe, BellRing, Smartphone, Check, X, Box, CheckCircle2, Clock } from 'lucide-react';

export default function MyShop({ shop, kycStatus, kycRejectionReason, myProducts = [], allProducts = [] }: any) {
    const [coverImage, setCoverImage] = useState(shop?.banner_url || shop?.cover_url || 'https://via.placeholder.com/1200x300?text=Shop+Cover+Photo');
    const [logoImage, setLogoImage] = useState(shop?.logo_url || '');
    const [shopName, setShopName] = useState(shop?.name || 'My Shop');
    const [shopDescription, setShopDescription] = useState(shop?.description || 'Welcome to my shop! We sell the best products.');
    const [shopPhone, setShopPhone] = useState(shop?.phone || '+8801900000000');
    
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');

    const displayedProducts = activeTab === 'all' ? allProducts : myProducts;

    const coverInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // Upload & save shop images permanently
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Immediate local preview
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    if (type === 'cover') setCoverImage(event.target.result as string);
                    if (type === 'logo') setLogoImage(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);

            // Upload permanently to backend
            const formData = new FormData();
            formData.append(type, file);
            router.post('/seller/settings', formData, {
                forceFormData: true,
                preserveScroll: true,
            });
        }
    };

    const handleSaveShopDetails = () => {
        setIsSettingsOpen(false);
        const formData = new FormData();
        formData.append('name', shopName);
        formData.append('phone', shopPhone);
        formData.append('description', shopDescription);

        router.post('/seller/settings', formData, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <>

            <Head title={shopName || shop?.name || "My Shop"} />
            
            <div className="max-w-6xl mx-auto space-y-6 mt-4">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-slate-800">{shopName || shop?.name || 'My Shop'}</h1>
                    
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm">
                            <Smartphone className="w-4 h-4" />
                            See Mobile View
                        </button>
                        <button 
                            onClick={() => setIsSettingsOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition shadow-sm"
                        >
                            <Settings className="w-4 h-4" />
                            Shop Settings
                        </button>
                    </div>
                </div>

                {/* Verification Alert */}
                {kycStatus === 'Approved' ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                        <div className="text-emerald-500 flex-shrink-0"><CheckCircle2 className="w-5 h-5" /></div>
                        <div>
                            <h3 className="text-emerald-700 font-bold">Shop Verified</h3>
                            <p className="text-emerald-600/90 text-sm mt-0.5">
                                আপনার শপ ও কেওয়াইসি ভেরিফিকেশন সফলভাবে অনুমোদিত হয়েছে। আপনার শপ এখন সম্পূর্ণ ভেরিফাইড।
                            </p>
                        </div>
                    </div>
                ) : kycStatus === 'Pending' ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                        <div className="text-amber-500 flex-shrink-0"><Clock className="w-5 h-5" /></div>
                        <div>
                            <h3 className="text-amber-700 font-bold">Verification Pending</h3>
                            <p className="text-amber-600/90 text-sm mt-0.5">
                                আপনার জাতীয় পরিচয়পত্র (NID) ও কেওয়াইসি ডকুমেন্ট রিভিউধীন রয়েছে। অ্যাডমিন টিম অনুমোদন দিলে আপনার শপ ভেরিফাইড হয়ে যাবে।
                            </p>
                        </div>
                    </div>
                ) : kycStatus === 'Rejected' ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                        <div className="text-red-500 flex-shrink-0"><BellRing className="w-5 h-5" /></div>
                        <div>
                            <h3 className="text-red-700 font-bold">Verification Rejected</h3>
                            <p className="text-red-600/90 text-sm mt-0.5">
                                {kycRejectionReason || "আপনার ভেরিফিকেশন বাতিল হয়েছে। বিস্তারিত তথ্যের জন্য প্ল্যাটফর্ম সাপোর্টে যোগাযোগ করুন।"}
                            </p>
                        </div>
                    </div>
                ) : null}

                {/* Shop Profile Banner & Info */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Cover Photo Area */}
                    <div className="relative w-full h-48 sm:h-64 bg-slate-100 group">
                        <img 
                            src={coverImage} 
                            alt="Cover" 
                            className="w-full h-full object-cover" 
                        />
                        {/* Edit Cover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                                onClick={() => coverInputRef.current?.click()}
                                className="bg-white/90 text-slate-800 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-white transition"
                            >
                                <Camera className="w-4 h-4" /> Edit Cover Photo
                            </button>
                            <input 
                                type="file" 
                                className="hidden" 
                                ref={coverInputRef} 
                                accept="image/*" 
                                onChange={(e) => handleImageUpload(e, 'cover')}
                            />
                        </div>
                    </div>

                    {/* Profile Details Area */}
                    <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-12 sm:-mt-16 z-10 text-center sm:text-left">
                            
                            {/* Logo / Avatar */}
                            <div className="relative group">
                                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-slate-50 flex items-center justify-center overflow-hidden shadow-md">
                                    {logoImage ? (
                                        <img src={logoImage} alt="Shop Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <Store className="w-12 h-12 text-slate-300" />
                                    )}
                                </div>
                                {/* Edit Logo Overlay */}
                                <button 
                                    onClick={() => logoInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                >
                                    <Camera className="w-6 h-6" />
                                </button>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    ref={logoInputRef} 
                                    accept="image/*" 
                                    onChange={(e) => handleImageUpload(e, 'logo')}
                                />
                            </div>

                            {/* Details & Badges */}
                            <div className="pb-2">
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                                    <h2 className="text-2xl font-black text-slate-800">{shopName}</h2>
                                    {shop?.status === 'active' || shop?.is_approved ? (
                                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active Shop
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                                            {shop?.status === 'pending' ? 'Pending Approval' : 'InActive'}
                                        </span>
                                    )}
                                    {kycStatus === 'Approved' ? (
                                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified
                                        </span>
                                    ) : kycStatus === 'Pending' ? (
                                        <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Verification Pending
                                        </span>
                                    ) : kycStatus === 'Rejected' ? (
                                        <span className="px-2.5 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-200">
                                            Verification Rejected
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">
                                            Unverified
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-center sm:justify-start gap-4 text-sm font-medium text-slate-500">
                                    <span><strong className="text-slate-800">{shop?.followers_count || 0}</strong> Followers</span>
                                    <span><strong className="text-slate-800">{(Number(shop?.rating) || 5.0).toFixed(1)}</strong> / 5.0 Rating</span>
                                </div>
                            </div>
                        </div>

                        {/* Live Site Link */}
                        <div className="pb-2 flex justify-center sm:justify-end w-full sm:w-auto">
                            <a 
                                href={`/shops/${shop?.slug || shop?.id}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 hover:underline transition"
                            >
                                <Globe className="w-4 h-4" /> See live site
                            </a>
                        </div>
                    </div>
                </div>

                {/* Products Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
                    <div className="flex items-center gap-6 border-b border-slate-100 px-6">
                        <button 
                            onClick={() => setActiveTab('all')}
                            className={`py-4 font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${activeTab === 'all' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                        >
                            All Products
                            <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${activeTab === 'all' ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-slate-100 text-slate-600'}`}>
                                {allProducts.length}
                            </span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('my')}
                            className={`py-4 font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${activeTab === 'my' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                        >
                            <span>{shopName || shop?.name || 'My Shop'}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${activeTab === 'my' ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-slate-100 text-slate-600'}`}>
                                {myProducts.length}
                            </span>
                        </button>
                    </div>

                    <div className="p-6">
                        {displayedProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {displayedProducts.map((product: any) => (
                                    <div key={product.id} className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs hover:shadow-md transition flex flex-col justify-between group">
                                        <div>
                                            <div className="w-full h-36 bg-slate-100 rounded-lg overflow-hidden mb-3 relative">
                                                {product.primary_image_url ? (
                                                    <img src={product.primary_image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <Box className="w-8 h-8" />
                                                    </div>
                                                )}
                                                {product.category && (
                                                    <span className="absolute top-2 left-2 bg-slate-900/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                                                        {product.category.name}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="font-bold text-slate-800 text-sm line-clamp-2 mb-1 group-hover:text-emerald-600" title={product.name}>
                                                {product.name}
                                            </h4>
                                            <p className="text-xs text-slate-500 font-mono mb-2">SKU: {product.sku || 'N/A'}</p>
                                        </div>

                                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-2">
                                            <div>
                                                <span className="text-emerald-600 font-extrabold text-sm">৳{Number(product.sale_price || product.price || 0).toLocaleString()}</span>
                                                {product.sale_price && product.price > product.sale_price && (
                                                    <span className="text-slate-400 text-xs line-through ml-1.5">৳{Number(product.price).toLocaleString()}</span>
                                                )}
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                                Stock: {product.stock_quantity ?? 0}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-80 text-center px-4">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                    <Box className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">
                                    {activeTab === 'all' ? 'No Products Available' : 'No Products Choosen'}
                                </h3>
                                <p className="text-slate-500 text-sm max-w-md mb-6">
                                    {activeTab === 'all' 
                                        ? 'There are currently no products listed in the store directory.' 
                                        : 'Increase the chances of more Sales and grow your business by custom product listing to highlight products on your store.'}
                                </p>
                                <a 
                                    href="/seller/product/create" 
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold transition shadow-sm shadow-emerald-200 inline-flex items-center gap-2"
                                >
                                    + Add New Product
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Shop Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-full">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-emerald-500" />
                                Edit Shop Details
                            </h2>
                            <button 
                                onClick={() => setIsSettingsOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Shop Name</label>
                                <input 
                                    type="text" 
                                    value={shopName}
                                    onChange={(e) => setShopName(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                />
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                                <input 
                                    type="text" 
                                    value={shopPhone}
                                    onChange={(e) => setShopPhone(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">About Shop</label>
                                <textarea 
                                    rows={4}
                                    value={shopDescription}
                                    onChange={(e) => setShopDescription(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none"
                                ></textarea>
                            </div>
                        </div>

                        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button 
                                onClick={() => setIsSettingsOpen(false)}
                                className="px-5 py-2 font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveShopDetails}
                                className="px-5 py-2 font-bold text-white bg-emerald-500 border border-emerald-500 rounded-lg hover:bg-emerald-600 transition flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}
