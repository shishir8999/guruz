import React, { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, Users, UserCheck, Shield, CreditCard, Wallet,
    ShoppingBag, Store, Truck, FileText, Mail, MessageSquare, Headphones,
    BarChart3, TrendingUp, Search, Palette, Globe, Lock, Key, Settings,
    Wrench, Plug, Megaphone, Folder, KeyRound, User, ChevronDown,
    LogOut, ExternalLink, RefreshCw, Bell, Activity, Database, Menu, X, Edit
} from 'lucide-react';
import FlashMessages from '../Components/FlashMessages';

interface MenuSubItem {
    label: string;
    href: string;
    external?: boolean;
    badge?: string;
}

interface MenuItem {
    id: string;
    title: string;
    icon: any;
    color: string;
    bgColor: string;
    badge?: string;
    subItems?: MenuSubItem[];
    href?: string;
}

interface MenuGroup {
    category: string;
    items: MenuItem[];
}

export default function AdminLayout({ children, title = 'Dashboard' }: { children: React.ReactNode; title?: string }) {
    const { props, url } = usePage<any>();
    
    const adminCounts = props.adminCounts || {};

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    
    // Single Accordion State
    const [openMenuId, setOpenMenuId] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('admin_open_menu_id');
            if (saved) return saved;
        }
        return null;
    });

    // Sync to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (openMenuId) {
                localStorage.setItem('admin_open_menu_id', openMenuId);
            } else {
                localStorage.removeItem('admin_open_menu_id');
            }
        }
    }, [openMenuId]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 1280) {
            setIsSidebarOpen(false);
        }
    }, []);

    const isPageActive = (targetHref: string) => {
        const cleanTarget = targetHref.split('?')[0];
        const cleanUrl = (url || '').split('?')[0];
        return cleanUrl === cleanTarget || cleanUrl.startsWith(cleanTarget + '/');
    };

    // Helper for instant 0ms badge counts from props or localStorage
    const getCachedCount = (key: string, propVal: any): number => {
        if (typeof propVal === 'number' && propVal >= 0) return propVal;
        if (typeof window !== 'undefined') {
            try {
                const saved = JSON.parse(localStorage.getItem('admin_sidebar_counts') || '{}');
                if (typeof saved[key] === 'number') return saved[key];
            } catch (e) {}
        }
        return 0;
    };

    const saveCountsToStorage = (countsObj: Record<string, any>) => {
        if (typeof window !== 'undefined') {
            try {
                const prev = JSON.parse(localStorage.getItem('admin_sidebar_counts') || '{}');
                localStorage.setItem('admin_sidebar_counts', JSON.stringify({ ...prev, ...countsObj }));
            } catch (e) {}
        }
    };

    // Live Badges State - Instant 0ms render
    const [liveUnreadCount, setLiveUnreadCount] = useState<number>(() => getCachedCount('unread_messages', adminCounts.unread_messages));
    const [livePendingOrders, setLivePendingOrders] = useState<number>(() => getCachedCount('pending_orders', adminCounts.pending_orders));
    const [livePendingReviews, setLivePendingReviews] = useState<number>(() => getCachedCount('pending_reviews', adminCounts.pending_reviews));
    const [livePendingWarranty, setLivePendingWarranty] = useState<number>(() => getCachedCount('pending_warranty_claims', adminCounts.pending_warranty_claims));
    const [livePendingCatRequests, setLivePendingCatRequests] = useState<number>(() => getCachedCount('pending_category_requests', adminCounts.pending_category_requests));
    const [livePendingPickup, setLivePendingPickup] = useState<number>(() => getCachedCount('pending_pickup_requests', adminCounts.pending_pickup_requests));
    const [livePendingPayments, setLivePendingPayments] = useState<number>(() => getCachedCount('pending_payments', adminCounts.pending_payments));
    const [livePendingPayouts, setLivePendingPayouts] = useState<number>(() => getCachedCount('pending_payouts', adminCounts.pending_payouts));
    const [livePendingVendors, setLivePendingVendors] = useState<number>(() => getCachedCount('pending_vendors', adminCounts.pending_vendors));
    const [livePendingVendorKyc, setLivePendingVendorKyc] = useState<number>(() => getCachedCount('pending_vendor_kyc', adminCounts.pending_vendor_kyc));
    const [liveNewUsers, setLiveNewUsers] = useState<number>(() => getCachedCount('new_users_today', adminCounts.new_users_today));
    const [livePendingSupportTickets, setLivePendingSupportTickets] = useState<number>(() => getCachedCount('pending_support_tickets', adminCounts.pending_support_tickets));
    const [livePendingEmails, setLivePendingEmails] = useState<number>(() => getCachedCount('pending_emails', adminCounts.pending_emails));
    const [livePendingSms, setLivePendingSms] = useState<number>(() => getCachedCount('pending_sms', adminCounts.pending_sms));

    useEffect(() => {
        if (typeof adminCounts.unread_messages === 'number') setLiveUnreadCount(adminCounts.unread_messages);
        if (typeof adminCounts.pending_orders === 'number') setLivePendingOrders(adminCounts.pending_orders);
        if (typeof adminCounts.pending_reviews === 'number') setLivePendingReviews(adminCounts.pending_reviews);
        if (typeof adminCounts.pending_warranty_claims === 'number') setLivePendingWarranty(adminCounts.pending_warranty_claims);
        if (typeof adminCounts.pending_category_requests === 'number') setLivePendingCatRequests(adminCounts.pending_category_requests);
        if (typeof adminCounts.pending_pickup_requests === 'number') setLivePendingPickup(adminCounts.pending_pickup_requests);
        if (typeof adminCounts.pending_payments === 'number') setLivePendingPayments(adminCounts.pending_payments);
        if (typeof adminCounts.pending_payouts === 'number') setLivePendingPayouts(adminCounts.pending_payouts);
        if (typeof adminCounts.pending_vendors === 'number') setLivePendingVendors(adminCounts.pending_vendors);
        if (typeof adminCounts.pending_vendor_kyc === 'number') setLivePendingVendorKyc(adminCounts.pending_vendor_kyc);
        if (typeof adminCounts.new_users_today === 'number') setLiveNewUsers(adminCounts.new_users_today);
        if (typeof adminCounts.pending_support_tickets === 'number') setLivePendingSupportTickets(adminCounts.pending_support_tickets);
        if (typeof adminCounts.pending_emails === 'number') setLivePendingEmails(adminCounts.pending_emails);
        if (typeof adminCounts.pending_sms === 'number') setLivePendingSms(adminCounts.pending_sms);

        saveCountsToStorage(adminCounts);
    }, [adminCounts]);

    // Live Poller: Fetch unread client messages & pending admin requests immediately on mount & every 5 seconds
    useEffect(() => {
        const checkUnread = () => {
            fetch('/api/admin/live-unread-messages')
                .then(res => res.json())
                .then(data => {
                    if (data) {
                        if (typeof data.unread_count === 'number') setLiveUnreadCount(data.unread_count);
                        if (typeof data.pending_orders === 'number') setLivePendingOrders(data.pending_orders);
                        if (typeof data.pending_reviews === 'number') setLivePendingReviews(data.pending_reviews);
                        if (typeof data.pending_warranty_claims === 'number') setLivePendingWarranty(data.pending_warranty_claims);
                        if (typeof data.pending_category_requests === 'number') setLivePendingCatRequests(data.pending_category_requests);
                        if (typeof data.pending_pickup_requests === 'number') setLivePendingPickup(data.pending_pickup_requests);
                        if (typeof data.pending_payments === 'number') setLivePendingPayments(data.pending_payments);
                        if (typeof data.pending_payouts === 'number') setLivePendingPayouts(data.pending_payouts);
                        if (typeof data.pending_vendors === 'number') setLivePendingVendors(data.pending_vendors);
                        if (typeof data.pending_vendor_kyc === 'number') setLivePendingVendorKyc(data.pending_vendor_kyc);
                        if (typeof data.new_users_today === 'number') setLiveNewUsers(data.new_users_today);
                        if (typeof data.pending_support_tickets === 'number') setLivePendingSupportTickets(data.pending_support_tickets);
                        if (typeof data.pending_emails === 'number') setLivePendingEmails(data.pending_emails);
                        if (typeof data.pending_sms === 'number') setLivePendingSms(data.pending_sms);

                        saveCountsToStorage(data);
                    }
                })
                .catch(() => {});
        };

        checkUnread(); // Run immediately on mount without delay!
        const interval = setInterval(checkUnread, 5000);
        return () => clearInterval(interval);
    }, []);

    const toggleMenu = (id: string) => {
        setOpenMenuId(prev => prev === id ? null : id);
    };

    const menuGroups: MenuGroup[] = [
        {
            category: 'OVERVIEW',
            items: [
                {
                    id: 'dashboard',
                    title: 'Dashboard',
                    icon: LayoutDashboard,
                    color: 'text-indigo-600',
                    bgColor: 'bg-indigo-100',
                    href: '/admin',
                },
                {
                    id: 'live_messages',
                    title: 'Live Messenger 💬',
                    icon: MessageSquare,
                    color: 'text-emerald-600',
                    bgColor: 'bg-emerald-100',
                    badge: (!isPageActive('/admin/messages') && liveUnreadCount > 0) ? liveUnreadCount.toString() : undefined,
                    href: '/admin/messages',
                },
            ],
        },
        {
            category: 'MANAGEMENT',
            items: [
                {
                    id: 'user_mgmt',
                    title: 'User Management',
                    icon: Users,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-100',
                    subItems: [
                        { label: 'Customer Management', href: '/admin/customers', badge: (!isPageActive('/admin/customers') && liveNewUsers > 0) ? liveNewUsers.toString() : undefined },
                        { label: '👑 VIP Loyalty Tiers', href: '/admin/customers/loyalty' },
                        { label: 'Super Admins', href: '/admin/super-admins' },
                        { label: 'Bulk Import / Export', href: '/admin/users/import-export' },
                        { label: 'User Notifications', href: '/admin/users/notifications' },
                        { label: 'Send Custom Offer', href: '/admin/offers/create' },
                        { label: '🎂 Birthday Wishes', href: '/admin/users/birthdays' },
                    ],
                },
                {
                    id: 'staff_mgmt',
                    title: 'Staff Management',
                    icon: UserCheck,
                    color: 'text-teal-600',
                    bgColor: 'bg-teal-100',
                    subItems: [
                        { label: 'Staff List', href: '/admin/staff' },
                        { label: 'Attendance', href: '/admin/staff/attendance' },
                        { label: 'Salary', href: '/admin/staff/salary' },
                        { label: 'Leave Management', href: '/admin/staff/leaves' },
                    ],
                },
                {
                    id: 'roles_permissions',
                    title: 'Role & Permission',
                    icon: Shield,
                    color: 'text-amber-600',
                    bgColor: 'bg-amber-100',
                    subItems: [
                        { label: 'Roles & Permissions', href: '/admin/roles/list' },
                        { label: 'Staff Permissions', href: '/admin/roles/staff-permissions' },
                    ],
                },
            ],
        },
        {
            category: 'FINANCE',
            items: [
                {
                    id: 'billing_payments',
                    title: 'Billing & Payments',
                    icon: CreditCard,
                    color: 'text-rose-600',
                    bgColor: 'bg-rose-100',
                    subItems: [
                        { label: 'Payment History', href: '/admin/finance/payments', badge: (!isPageActive('/admin/finance/payments') && livePendingPayments > 0) ? livePendingPayments.toString() : undefined },
                        { label: 'Invoices', href: '/admin/finance/invoices' },
                        { label: 'Refund Requests', href: '/admin/finance/refunds', badge: (!isPageActive('/admin/finance/refunds') && livePendingPayments > 0) ? livePendingPayments.toString() : undefined },
                        { label: 'Transaction Log', href: '/admin/transactions' },
                        { label: 'Billing Plans', href: '/admin/finance/billing-plans' },
                    ],
                },
                {
                    id: 'payment_gateway',
                    title: 'Payment Gateway',
                    icon: Wallet,
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-100',
                    subItems: [
                        { label: 'Gateway Settings', href: '/admin/finance/gateway-settings' },
                    ],
                },
            ],
        },
        {
            category: 'COMMERCE',
            items: [
                {
                    id: 'ecommerce',
                    title: 'E-Commerce',
                    icon: ShoppingBag,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-100',
                    subItems: [
                        { label: 'Add Product', href: '/admin/products/create' },
                        { label: 'Product List', href: '/admin/products' },
                        { label: 'Unit', href: '/admin/units' },
                        { label: 'Attributes', href: '/admin/attributes' },
                        { label: 'Brand', href: '/admin/brands' },
                        { label: 'Import product by CSV', href: '/admin/products/import' },
                        { label: 'Reviews & Q&A', href: '/admin/reviews', badge: livePendingReviews > 0 ? livePendingReviews.toString() : undefined },
                        { label: 'Categories', href: '/admin/categories' },
                        { label: 'Category Requests', href: '/admin/category-requests', badge: (!isPageActive('/admin/category-requests') && livePendingCatRequests > 0) ? livePendingCatRequests.toString() : undefined },
                        { label: 'Orders', href: '/admin/orders', badge: (!isPageActive('/admin/orders') && livePendingOrders > 0) ? livePendingOrders.toString() : undefined },
                        { label: '🛡️ Warranty Claims', href: '/admin/warranty-claims', badge: (!isPageActive('/admin/warranty-claims') && livePendingWarranty > 0) ? livePendingWarranty.toString() : undefined },
                        { label: 'Flash Sales', href: '/admin/flash-sales' },
                    ],
                },
                {
                    id: 'vendors_mgmt',
                    title: 'Vendors Management',
                    icon: Store,
                    color: 'text-emerald-600',
                    bgColor: 'bg-emerald-100',
                    badge: (!isPageActive('/admin/shops') && livePendingVendors > 0) ? livePendingVendors.toString() : undefined,
                    subItems: [
                        { label: 'Vendor Approvals', href: '/admin/shops?status=pending', badge: (!isPageActive('/admin/shops') && livePendingVendors > 0) ? livePendingVendors.toString() : undefined },
                        { label: '🛡️ Vendor KYC / Documents', href: '/admin/vendor-kyc', badge: (!isPageActive('/admin/vendor-kyc') && livePendingVendorKyc > 0) ? livePendingVendorKyc.toString() : undefined },
                        { label: 'All Shops / Vendors', href: '/admin/shops' },
                        { label: 'Commission Settings', href: '/admin/commission-settings' },
                        { label: 'Seller Wallets', href: '/admin/seller-wallets' },
                        { label: 'Payout Requests', href: '/admin/payout-requests', badge: (!isPageActive('/admin/payout-requests') && livePendingPayouts > 0) ? livePendingPayouts.toString() : undefined },
                        { label: 'Customer Wallet', href: '/admin/customer-wallet' },
                        { label: 'VIP Loyalty Tiers', href: '/admin/customers/loyalty' },
                        { label: 'Vendor Badges', href: '/admin/vendor-badges' },
                        { label: 'Landing Page CMS', href: '/admin/appearance/vendor-landing-page' },
                        { label: '🎫 Vendor Support Tickets', href: '/admin/vendor-tickets', badge: (!isPageActive('/admin/vendor-tickets') && livePendingSupportTickets > 0) ? livePendingSupportTickets.toString() : undefined },
                        { label: 'Open Vendor Dashboard', href: '/seller', external: true },
                    ],
                },
                {
                    id: 'courier_mgmt',
                    title: 'Courier Management',
                    icon: Truck,
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-100',
                    subItems: [
                        { label: '🔑 Master Courier APIs', href: '/admin/courier-api' },
                        { label: 'Pickup Requests', href: '/admin/pickup-requests', badge: (!isPageActive('/admin/pickup-requests') && livePendingPickup > 0) ? livePendingPickup.toString() : undefined },
                        { label: 'Couriers', href: '/admin/couriers' },
                        { label: 'Delivery Charges', href: '/admin/delivery-charges' },
                        { label: 'API Sync Logs', href: '/admin/courier-logs' },
                        { label: 'Returns & Exchanges', href: '/admin/returns', badge: (!isPageActive('/admin/returns') && livePendingPickup > 0) ? livePendingPickup.toString() : undefined },
                    ],
                },
            ],
        },
        {
            category: 'COMMUNICATION',
            items: [
                {
                    id: 'email_mgmt',
                    title: 'Email Management',
                    icon: Mail,
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-100',
                    subItems: [
                        { label: 'SMTP Settings', href: '/admin/emails/smtp' },
                        { label: 'Templates', href: '/admin/emails/templates' },
                        { label: 'Bulk Email', href: '/admin/emails/bulk' },
                    ],
                },
                {
                    id: 'sms_mgmt',
                    title: 'SMS Management',
                    icon: MessageSquare,
                    color: 'text-cyan-600',
                    bgColor: 'bg-cyan-100',
                    subItems: [
                        { label: 'SMS Gateway', href: '/admin/sms/gateway' },
                        { label: 'SMS Templates', href: '/admin/sms/templates' },
                        { label: 'WhatsApp Marketing', href: '/admin/sms/whatsapp' },
                    ],
                },
                {
                    id: 'support_widget',
                    title: 'Support & Social Proof',
                    icon: Headphones,
                    color: 'text-emerald-600',
                    bgColor: 'bg-emerald-100',
                    subItems: [
                        { label: 'Floating Support Widget', href: '/admin/support/floating-widget?tab=support_widget' },
                        { label: '🛍️ Social Proof & Live Visitors', href: '/admin/support/floating-widget?tab=social_proof' },
                        { label: '🎫 Vendor Support Tickets', href: '/admin/vendor-tickets', badge: (!isPageActive('/admin/vendor-tickets') && livePendingSupportTickets > 0) ? livePendingSupportTickets.toString() : undefined },
                    ],
                },
            ],
        },
        {
            category: 'INSIGHTS',
            items: [
                {
                    id: 'reports',
                    title: 'Reports',
                    icon: BarChart3,
                    color: 'text-amber-600',
                    bgColor: 'bg-amber-100',
                    subItems: [
                        { label: 'Reports', href: '/admin/reports/all' },
                    ],
                },
                {
                    id: 'analytics',
                    title: 'Analytics',
                    icon: TrendingUp,
                    color: 'text-pink-600',
                    bgColor: 'bg-pink-100',
                    subItems: [
                        { label: 'Visitor Analytics', href: '/admin/analytics/visitor' },
                    ],
                },
                {
                    id: 'seo_mgmt',
                    title: 'SEO Management',
                    icon: Search,
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-100',
                    subItems: [
                        { label: 'SEO Tools', href: '/admin/seo/tools' },
                    ],
                },
            ],
        },
        {
            category: 'CUSTOMIZATION',
            items: [
                {
                    id: 'appearance',
                    title: 'Appearance',
                    icon: Palette,
                    color: 'text-indigo-600',
                    bgColor: 'bg-indigo-100',
                    subItems: [
                        { label: 'Site Settings', href: '/admin/settings' },
                        { id: 'themes_effects', label: 'Themes & Effects', href: '/admin/appearance/themes-effects' },
                        { id: 'theme_colors', label: 'Theme Colors', href: '/admin/appearance/theme-colors' },
                        { id: 'hero_slider', label: 'Hero Slider', href: '/admin/appearance/hero-slider' },
                        { id: 'top_banner', label: 'Top Banner', href: '/admin/top-banner' },
                        { id: 'guruz_special', label: '🌟 Guruz স্পেশাল অফার', href: '/admin/guruz-special' },
                        { id: 'feature_badges', label: 'Feature Badges', href: '/admin/appearance/feature-badges' },
                        { id: 'notice_marquee', label: 'Notice Marquee', href: '/admin/appearance/notice-marquee' },
                        { id: 'cms_pages', label: 'Footer & Info Pages', href: '/admin/appearance/pages' },
                        { id: 'vendor_landing_page', label: 'Vendor Landing Page', href: '/admin/appearance/vendor-landing-page' },
                        { id: 'footer_builder', label: 'Footer Builder', href: '/admin/appearance/footer-builder' },
                    ],
                },
                {
                    id: 'blogs',
                    title: 'Blogs',
                    icon: Edit,
                    color: 'text-teal-600',
                    bgColor: 'bg-teal-100',
                    subItems: [
                        { label: 'Blog Posts', href: '/admin/blogs/posts' },
                        { label: 'Blog Categories', href: '/admin/blogs/categories' },
                        { label: 'Blog Tags', href: '/admin/blogs/tags' },
                        { label: 'Blog Comments', href: '/admin/blogs/comments' },
                    ],
                },
                {
                    id: 'localization',
                    title: 'Localization',
                    icon: Globe,
                    color: 'text-emerald-600',
                    bgColor: 'bg-emerald-100',
                    subItems: [
                        { label: 'Languages', href: '/admin/localization/languages' },
                    ],
                },
            ],
        },
        {
            category: 'SYSTEM',
            items: [
                {
                    id: 'security',
                    title: 'Security',
                    icon: Lock,
                    color: 'text-red-600',
                    bgColor: 'bg-red-100',
                    subItems: [
                        { label: 'Security Settings', href: '/admin/security/settings' },
                        { label: 'Two-Factor Auth (2FA)', href: '/admin/security/2fa' },
                        { label: 'Active Sessions', href: '/admin/security/sessions' },
                        { label: 'IP Whitelist / Blacklist', href: '/admin/security/ip-list' },
                        { label: 'Webhook Management', href: '/admin/security/webhooks' },
                        { label: 'Audit Logs', href: '/admin/security/audit-logs' },
                    ],
                },
                {
                    id: 'api_mgmt',
                    title: 'API Management',
                    icon: Key,
                    color: 'text-sky-600',
                    bgColor: 'bg-sky-100',
                    subItems: [
                        { label: 'API Keys', href: '/admin/api/keys' },
                    ],
                },
                {
                    id: 'system_settings',
                    title: 'System Settings',
                    icon: Settings,
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-100',
                    subItems: [
                        { label: 'System Config', href: '/admin/system/config' },
                        { label: 'Backups', href: '/admin/system/backups' },
                        { label: 'Feature Limits', href: '/admin/system/feature-limits' },
                    ],
                },

                {
                    id: 'integrations',
                    title: 'Integrations',
                    icon: Plug,
                    color: 'text-teal-600',
                    bgColor: 'bg-teal-100',
                    subItems: [
                        { label: 'Integrations', href: '/admin/integrations' },
                    ],
                },
            ],
        },
        {
            category: 'GROWTH',
            items: [
                {
                    id: 'marketing',
                    title: 'Marketing',
                    icon: Megaphone,
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-100',
                    subItems: [
                        { label: 'Coupons', href: '/admin/marketing/coupons' },
                        { label: '🌟 Guruz স্পেশাল অফার', href: '/admin/guruz-special' },
                        { label: 'Campaigns', href: '/admin/marketing/campaigns' },
                        { label: 'Birthday Wish', href: '/admin/marketing/birthday-wish' },
                        { label: 'Seller Notices', href: '/admin/marketing/seller-notices' },
                        { label: 'Notifications', href: '/admin/marketing/notifications' },
                    ],
                },
            ],
        },
        {
            category: 'UTILITIES',
            items: [
                {
                    id: 'file_manager',
                    title: 'File Manager',
                    icon: Folder,
                    color: 'text-pink-600',
                    bgColor: 'bg-pink-100',
                    subItems: [
                        { label: 'Media Library', href: '/admin/media' },
                    ],
                },
                {
                    id: 'admin_profile',
                    title: 'Admin Profile',
                    icon: User,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-100',
                    subItems: [
                        { label: 'My Profile', href: '/admin/profile/me' },
                    ],
                },
            ],
        },
    ];

    const isSubActive = (subHref: string) => {
        if (subHref.includes('?')) return url === subHref;
        const currentPath = url.split('?')[0];
        if (currentPath === subHref || currentPath.startsWith(subHref + '/')) {
            const exactMatch = menuGroups.some(g => g.items.some(i => i.subItems?.some(s => s.href === url && s.href !== subHref)));
            return !exactMatch;
        }
        return false;
    };

    useEffect(() => {
        const currentPath = url.split('?')[0];
        let foundActiveId = null;

        menuGroups.forEach(group => {
            group.items.forEach(item => {
                if (item.subItems) {
                    const isActive = item.subItems.some(sub => {
                        const subPath = sub.href.split('?')[0];
                        return currentPath === subPath || currentPath.startsWith(subPath + '/');
                    });
                    
                    if (isActive) {
                        foundActiveId = item.id;
                    }
                }
            });
        });

        // Only override if we found an active menu that differs from current state
        if (foundActiveId && foundActiveId !== openMenuId) {
            setOpenMenuId(foundActiveId);
        }
    }, [url]);

    const allSearchableItems = React.useMemo(() => {
        let items: { label: string; href: string; parent: string }[] = [];
        menuGroups.forEach(group => {
            group.items.forEach(item => {
                if (item.subItems) {
                    item.subItems.forEach(sub => {
                        if (!sub.external) {
                            items.push({ label: sub.label, href: sub.href, parent: item.title });
                        }
                    });
                } else if (item.href) {
                    items.push({ label: item.title, href: item.href, parent: group.category });
                }
            });
        });
        return items;
    }, []);

    const searchResults = allSearchableItems.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.parent.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8); // limit to 8 results

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="h-screen bg-[#f4f7fe] dark:bg-slate-950 font-sans flex flex-col text-slate-800 dark:text-slate-100 overflow-hidden">
            <FlashMessages />
            
            {/* === TOP NAVY BLUE HEADER BAR MATCHING SCREENSHOT === */}
            <header className="bg-[#0f172a] text-white h-14 px-4 flex items-center justify-between shadow-md border-b border-slate-800 shrink-0 z-[60]">
                <div className="flex items-center gap-3">
                    {/* Sidebar Toggle Button */}
                    <button 
                        className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    {/* Left Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        {props.siteSettings?.site_logo ? (
                            <img 
                                src={props.siteSettings.site_logo} 
                                alt={props.siteSettings?.site_title || 'Logo'} 
                                className="max-h-8 max-w-[150px] object-contain" 
                            />
                        ) : (
                            <>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-black text-white text-base shadow">
                                    g
                                </div>
                                <span className="font-black text-xl tracking-tight text-white hidden sm:block">
                                    {props.siteSettings?.site_title || 'guruz'}
                                </span>
                            </>
                        )}
                    </Link>
                </div>

                {/* Middle Search Input Bar */}
                <div className="w-96 max-w-md hidden xl:block relative z-50">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search menus, settings, features..."
                            className="w-full bg-[#1e293b] border border-slate-700/80 rounded-lg pl-9 pr-12 py-1.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 shadow-inner"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
                        <span className="absolute right-2.5 top-1.5 bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono px-1.5 py-0.5 rounded">
                            ⌘K
                        </span>
                    </div>

                    {/* Search Results Dropdown */}
                    {isSearchFocused && searchQuery && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                            {searchResults.length > 0 ? (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {searchResults.map((result, idx) => (
                                        <Link 
                                            key={idx} 
                                            href={result.href}
                                            onClick={() => {
                                                setSearchQuery('');
                                                setIsSearchFocused(false);
                                            }}
                                            className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                                        >
                                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                                                {result.label}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                in {result.parent}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-sm text-slate-500 text-center">
                                    No results found for "{searchQuery}"
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1.5 sm:gap-3 text-xs font-bold shrink-0">
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 sm:gap-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 sm:px-3 py-1.5 rounded-lg border border-slate-700 transition"
                        title="View Site"
                    >
                        <ExternalLink className="w-3.5 h-3.5" /> <span className="hidden sm:inline">View Site</span>
                    </a>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1 sm:gap-1.5 bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 px-2 sm:px-3 py-1.5 rounded-lg border border-slate-700 hover:border-red-800 transition"
                        title="Logout"
                    >
                        <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </header>

            {/* === MAIN CONTENT BODY WITH SAAS SIDEBAR === */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 xl:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* LEFT ADMIN DASHBOARD SIDEBAR */}
                <aside className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col shadow-xl xl:shadow-sm overflow-y-auto overflow-x-hidden h-full custom-scrollbar transform transition-all duration-300 xl:relative ${
                    isSidebarOpen ? 'translate-x-0 w-72 border-r' : '-translate-x-full w-72 xl:translate-x-0 xl:w-0 xl:border-none'
                }`}>
                    
                    {/* Mobile Header with Close Button */}
                    <div className="flex items-center justify-between p-4 xl:hidden border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            {props.siteSettings?.site_logo ? (
                                <img src={props.siteSettings.site_logo} alt={props.siteSettings?.site_title || 'Logo'} className="max-h-7 object-contain" />
                            ) : (
                                <>
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-black text-white text-xs">g</div>
                                    <span className="font-black text-lg tracking-tight text-slate-800 dark:text-white">{props.siteSettings?.site_title || 'guruz admin'}</span>
                                </>
                            )}
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg bg-slate-100 dark:bg-slate-800">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    {/* Gradient ADMIN DASHBOARD Console Header Card */}
                    <div className="p-3">
                        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-xl p-3.5 shadow-md flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-purple-100">
                                    ADMIN DASHBOARD
                                </span>
                                <h2 className="text-base font-black tracking-tight mt-1">Console</h2>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                                <LayoutDashboard className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Navigation Menu Accordion List matching screenshot */}
                    <nav className="p-3 space-y-4">
                        {menuGroups.map(group => (
                            <div key={group.category} className="space-y-1">
                                <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-wider px-2 uppercase">
                                    {group.category}
                                </div>

                                {group.items.map(item => {
                                    const IconComp = item.icon;
                                    const isOpen = openMenuId === item.id;

                                    // Sum badges of all sub-items
                                    const subItemBadgeSum = item.subItems?.reduce((acc, sub) => {
                                        const num = sub.badge ? parseInt(sub.badge, 10) : 0;
                                        return acc + (isNaN(num) ? 0 : num);
                                    }, 0) || 0;

                                    const displayBadge = (subItemBadgeSum > 0 ? subItemBadgeSum.toString() : undefined) || item.badge;

                                    return (
                                        <div key={item.id} className="space-y-0.5">
                                            {item.subItems ? (
                                                <button
                                                    onClick={() => toggleMenu(item.id)}
                                                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition ${
                                                        isOpen
                                                            ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400'
                                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                                                        <div className={`w-7 h-7 rounded-lg ${item.bgColor} flex items-center justify-center shrink-0`}>
                                                            <IconComp className={`w-4 h-4 ${item.color}`} />
                                                        </div>
                                                        <span className="truncate">{item.title}</span>
                                                        {displayBadge && (
                                                            <span className="ml-auto bg-rose-500 text-white rounded-full px-2 py-0.5 text-[10px] font-black shrink-0 shadow-sm flex items-center justify-center min-w-[20px]">
                                                                {displayBadge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`} />
                                                </button>
                                            ) : (
                                                <Link
                                                    href={item.href || '#'}
                                                    onClick={() => {
                                                        if (typeof window !== 'undefined' && window.innerWidth < 1280) {
                                                            setIsSidebarOpen(false);
                                                        }
                                                    }}
                                                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold transition ${
                                                        (item.href && isPageActive(item.href))
                                                            ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400'
                                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'
                                                    }`}
                                                >
                                                    <div className={`w-7 h-7 rounded-lg ${item.bgColor} flex items-center justify-center shrink-0`}>
                                                        <IconComp className={`w-4 h-4 ${item.color}`} />
                                                    </div>
                                                    <span className="flex-1 truncate min-w-0">{item.title}</span>
                                                    {item.badge && (
                                                        <span className="bg-rose-500 text-white rounded-full px-2 py-0.5 text-[10px] font-black shrink-0 shadow-sm animate-pulse flex items-center justify-center min-w-[20px]">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            )}

                                            {/* Sub-items Collapsible Accordion */}
                                            {item.subItems && isOpen && (
                                                <div className="pl-11 pr-2 py-1 space-y-1 animate-in fade-in duration-150 border-l-2 border-indigo-200 dark:border-slate-700 ml-5 my-1">
                                                    {item.subItems.map(sub => (
                                                        sub.external ? (
                                                            <a
                                                                key={sub.label}
                                                                href={sub.href}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="py-1.5 px-3 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-between"
                                                            >
                                                                <span className="truncate min-w-0 flex-1">{sub.label}</span>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 opacity-50 shrink-0 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                                            </a>
                                                        ) : (
                                                            <Link
                                                                key={sub.label}
                                                                href={sub.href}
                                                                onClick={() => {
                                                                    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
                                                                        setIsSidebarOpen(false);
                                                                    }
                                                                }}
                                                                className={`flex items-center justify-between py-1.5 px-3 rounded-lg text-[11px] font-semibold transition-all ${
                                                                    isSubActive(sub.href)
                                                                        ? 'bg-indigo-600 text-white shadow-sm font-bold'
                                                                        : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/80 dark:hover:bg-slate-800'
                                                                }`}
                                                            >
                                                                <span className="truncate min-w-0 flex-1">{sub.label}</span>
                                                                {sub.badge && (
                                                                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold shrink-0 ml-2 ${isSubActive(sub.href) ? 'bg-white text-indigo-600 font-bold' : 'bg-rose-500 text-white font-bold'}`}>
                                                                        {sub.badge}
                                                                    </span>
                                                                )}
                                                            </Link>
                                                        )
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>

                </aside>

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar min-w-0 max-w-full overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
