import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Truck, MapPin, Package, CheckCircle, Clock, Search } from 'lucide-react';
import Swal from 'sweetalert2';

export default function TrackOrder() {
    const [orderNumber, setOrderNumber] = useState('');
    const [trackingData, setTrackingData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderNumber.trim()) return;

        setLoading(true);
        // Simulate API call for now (replace with actual axios call later if needed, or pass via props)
        setTimeout(() => {
            setTrackingData({
                order_number: orderNumber,
                status: 'shipped',
                estimated_delivery: 'Oct 15, 2026',
                carrier: 'Pathao Courier',
                tracking_id: 'TRK-982374982',
                steps: [
                    { id: 1, title: 'Order Placed', description: 'We have received your order.', date: 'Oct 10, 2026, 10:00 AM', completed: true, icon: Clock },
                    { id: 2, title: 'Processing', description: 'Your order is being prepared.', date: 'Oct 11, 2026, 02:30 PM', completed: true, icon: Package },
                    { id: 3, title: 'Shipped', description: 'Your order has been handed over to the courier.', date: 'Oct 12, 2026, 09:15 AM', completed: true, icon: Truck },
                    { id: 4, title: 'Out for Delivery', description: 'The rider is on the way to your address.', date: '', completed: false, icon: MapPin },
                    { id: 5, title: 'Delivered', description: 'Your order has been delivered.', date: '', completed: false, icon: CheckCircle },
                ]
            });
            setLoading(false);
        }, 800);
    };

    return (
        <>
            <Head title="Track Order" />
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 min-h-[500px]">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Truck size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Track Your Order</h1>
                        <p className="text-slate-500">Enter your order number below to get real-time tracking updates.</p>
                    </div>

                    <form onSubmit={handleTrack} className="flex gap-3 mb-10">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="text-slate-400" size={20} />
                            </div>
                            <input 
                                type="text" 
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                placeholder="e.g. GZ-VNUBEQIU" 
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-slate-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-800 transition disabled:opacity-70"
                        >
                            {loading ? 'Tracking...' : 'Track'}
                        </button>
                    </form>

                    {trackingData && (
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-8 pb-6 border-b border-slate-200">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Order Number</p>
                                    <h3 className="text-lg font-bold text-slate-800">{trackingData.order_number}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-500 mb-1">Estimated Delivery</p>
                                    <h3 className="text-lg font-bold text-emerald-600">{trackingData.estimated_delivery}</h3>
                                </div>
                            </div>

                            <div className="relative">
                                {/* Vertical Line */}
                                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200"></div>

                                <div className="space-y-8 relative">
                                    {trackingData.steps.map((step: any, index: number) => {
                                        const Icon = step.icon;
                                        return (
                                            <div key={step.id} className={`flex gap-6 relative z-10 ${step.completed ? 'opacity-100' : 'opacity-40'}`}>
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-white ${step.completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                    <Icon size={20} />
                                                </div>
                                                <div className="pt-2">
                                                    <h4 className={`text-base font-bold ${step.completed ? 'text-slate-800' : 'text-slate-500'}`}>{step.title}</h4>
                                                    <p className="text-sm text-slate-500 mt-1">{step.description}</p>
                                                    {step.date && <p className="text-xs font-semibold text-slate-400 mt-2">{step.date}</p>}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
