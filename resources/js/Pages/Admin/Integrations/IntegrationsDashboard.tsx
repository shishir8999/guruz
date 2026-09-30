import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Plug, CheckCircle2, Activity, Shield, Slack, Zap, Loader2, Bot } from 'lucide-react';
import Swal from 'sweetalert2';

interface IntegrationsProps {
    integrations: Record<string, string>;
}

// ✅ IntegrationCard MUST be outside the main component to prevent re-mounting on every keystroke
interface IntegrationCardProps {
    title: string;
    icon: React.ElementType;
    connected: boolean;
    children: React.ReactNode;
    onSave: (e: React.FormEvent) => void;
    keyName: string;
    description: string;
    processing: boolean;
    savingKey: string | null;
}

function IntegrationCard({ title, icon: Icon, connected, children, onSave, keyName, description, processing, savingKey }: IntegrationCardProps) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${connected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'} dark:bg-slate-800`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-base">{title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                    </div>
                </div>
                <div>
                    {connected ? (
                        <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
                        </span>
                    ) : (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                            Inactive
                        </span>
                    )}
                </div>
            </div>

            <form onSubmit={onSave} className="space-y-4">
                {children}

                <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="submit"
                        disabled={processing && savingKey === keyName}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition"
                    >
                        {processing && savingKey === keyName ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Save Settings
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function IntegrationsDashboard({ integrations }: IntegrationsProps) {
    const { data, setData, post, processing } = useForm({
        fb_pixel_id:          integrations?.fb_pixel_id          || '',
        fb_capi_token:        integrations?.fb_capi_token        || '',
        gtm_id:               integrations?.gtm_id               || '',
        ga4_id:               integrations?.ga4_id               || '',
        tiktok_pixel_id:      integrations?.tiktok_pixel_id      || '',
        recaptcha_site_key:   integrations?.recaptcha_site_key   || '',
        recaptcha_secret_key: integrations?.recaptcha_secret_key || '',
        slack_webhook_url:    integrations?.slack_webhook_url    || '',
        zapier_webhook_url:   integrations?.zapier_webhook_url   || '',
        gemini_api_key:       integrations?.gemini_api_key       || '',
    });

    const [savingKey, setSavingKey] = useState<string | null>(null);

    const submit = (e: React.FormEvent, key: string) => {
        e.preventDefault();
        setSavingKey(key);
        post('/admin/integrations', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'Saved!',
                    text: 'Integration settings updated successfully.',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    timer: 3000,
                    showConfirmButton: false
                });
            },
            onFinish: () => setSavingKey(null)
        });
    };

    const isConnected = (keys: string[]) => keys.every(k => data[k as keyof typeof data] && (data[k as keyof typeof data] as string).trim() !== '');

    return (
        <>
            <Head title="Third-Party Integrations" />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white">Trackers & Integrations</h1>
                    <p className="text-sm text-slate-500 mt-1">Connect third-party analytics, marketing pixels, and webhooks.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Meta / Facebook Pixel */}
                <IntegrationCard
                    title="Meta (Facebook) Pixel"
                    icon={Activity}
                    connected={isConnected(['fb_pixel_id'])}
                    keyName="fb_pixel"
                    description="Track page views, add to carts, and purchases."
                    onSave={(e) => submit(e, 'fb_pixel')}
                    processing={processing}
                    savingKey={savingKey}
                >
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pixel ID</label>
                        <input
                            type="text"
                            placeholder="e.g. 123456789012345"
                            value={data.fb_pixel_id}
                            onChange={e => setData('fb_pixel_id', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Conversions API Token (Optional)</label>
                        <input
                            type="text"
                            placeholder="EAAGm0PX4ZCQ..."
                            value={data.fb_capi_token}
                            onChange={e => setData('fb_capi_token', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                        />
                    </div>
                </IntegrationCard>

                {/* Google Analytics 4 */}
                <IntegrationCard
                    title="Google Analytics 4"
                    icon={Activity}
                    connected={isConnected(['ga4_id'])}
                    keyName="ga4"
                    description="Measure website traffic and engagement."
                    onSave={(e) => submit(e, 'ga4')}
                    processing={processing}
                    savingKey={savingKey}
                >
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Measurement ID</label>
                        <input
                            type="text"
                            placeholder="e.g. G-XXXXXXXXXX"
                            value={data.ga4_id}
                            onChange={e => setData('ga4_id', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                        />
                    </div>
                </IntegrationCard>

                {/* Google Tag Manager */}
                <IntegrationCard
                    title="Google Tag Manager"
                    icon={Activity}
                    connected={isConnected(['gtm_id'])}
                    keyName="gtm"
                    description="Manage all your tracking tags in one place."
                    onSave={(e) => submit(e, 'gtm')}
                    processing={processing}
                    savingKey={savingKey}
                >
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">GTM Container ID</label>
                        <input
                            type="text"
                            placeholder="e.g. GTM-XXXXXXX"
                            value={data.gtm_id}
                            onChange={e => setData('gtm_id', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                        />
                    </div>
                </IntegrationCard>

                {/* TikTok Pixel */}
                <IntegrationCard
                    title="TikTok Pixel"
                    icon={Activity}
                    connected={isConnected(['tiktok_pixel_id'])}
                    keyName="tiktok_pixel"
                    description="Track TikTok ad conversions."
                    onSave={(e) => submit(e, 'tiktok_pixel')}
                    processing={processing}
                    savingKey={savingKey}
                >
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">TikTok Pixel ID</label>
                        <input
                            type="text"
                            placeholder="e.g. CXXXXXXXXXXXXXXX"
                            value={data.tiktok_pixel_id}
                            onChange={e => setData('tiktok_pixel_id', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                        />
                    </div>
                </IntegrationCard>

                {/* Google reCAPTCHA */}
                <IntegrationCard
                    title="Google reCAPTCHA (v3)"
                    icon={Shield}
                    connected={isConnected(['recaptcha_site_key', 'recaptcha_secret_key'])}
                    keyName="recaptcha"
                    description="Protect your store from spam and abuse."
                    onSave={(e) => submit(e, 'recaptcha')}
                    processing={processing}
                    savingKey={savingKey}
                >
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Site Key</label>
                        <input
                            type="text"
                            value={data.recaptcha_site_key}
                            onChange={e => setData('recaptcha_site_key', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Secret Key</label>
                        <input
                            type="password"
                            value={data.recaptcha_secret_key}
                            onChange={e => setData('recaptcha_secret_key', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                        />
                    </div>
                </IntegrationCard>

                {/* Slack Webhook */}
                <IntegrationCard
                    title="Slack Notifications"
                    icon={Slack}
                    connected={isConnected(['slack_webhook_url'])}
                    keyName="slack"
                    description="Get order & system alerts directly in Slack."
                    onSave={(e) => submit(e, 'slack')}
                    processing={processing}
                    savingKey={savingKey}
                >
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Incoming Webhook URL</label>
                        <input
                            type="text"
                            placeholder="https://hooks.slack.com/services/..."
                            value={data.slack_webhook_url}
                            onChange={e => setData('slack_webhook_url', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-[11px]"
                        />
                    </div>
                </IntegrationCard>

                {/* Zapier Webhook */}
                <IntegrationCard
                    title="Zapier Webhooks"
                    icon={Zap}
                    connected={isConnected(['zapier_webhook_url'])}
                    keyName="zapier"
                    description="Connect with 5000+ apps via Zapier Webhooks."
                    onSave={(e) => submit(e, 'zapier')}
                    processing={processing}
                    savingKey={savingKey}
                >
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Zapier Catch Hook URL</label>
                        <input
                            type="text"
                            placeholder="https://hooks.zapier.com/hooks/catch/..."
                            value={data.zapier_webhook_url}
                            onChange={e => setData('zapier_webhook_url', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-[11px]"
                        />
                    </div>
                </IntegrationCard>

                {/* Gemini API Key */}
                <IntegrationCard
                    title="Google Gemini AI"
                    icon={Bot}
                    connected={isConnected(['gemini_api_key'])}
                    keyName="gemini"
                    description="Enable AI features for product description generation."
                    onSave={(e) => submit(e, 'gemini')}
                    processing={processing}
                    savingKey={savingKey}
                >
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Gemini API Key</label>
                        <input
                            type="text"
                            placeholder="AIzaSy..."
                            value={data.gemini_api_key}
                            onChange={e => setData('gemini_api_key', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-[11px]"
                        />
                    </div>
                </IntegrationCard>

            </div>
        </>
    );
}
