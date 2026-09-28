// app/dashboard/webhooks/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Webhook, Plus, Trash2, Zap, CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface WebhookItem {
    id: string;
    url: string;
    events: string[];
    is_active: boolean;
    created_at: string;
}

export default function WebhooksPage() {
    const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
    const [newUrl, setNewUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        fetchWebhooks();
    }, []);

    const fetchWebhooks = async () => {
        try {
            const res = await fetch('/api/webhooks');
            const data = await res.json();
            if (res.ok) setWebhooks(data.webhooks || []);
            else setErrorMsg(data.error || 'Failed to load webhooks');
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddWebhook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUrl.trim()) return;

        setSaving(true);
        setErrorMsg('');

        try {
            const res = await fetch('/api/webhooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: newUrl }),
            });
            const data = await res.json();

            if (res.ok) {
                setNewUrl('');
                await fetchWebhooks();
            } else {
                setErrorMsg(data.error || 'Failed to add webhook');
            }
        } catch (err) {
            setErrorMsg('Something went wrong. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/webhooks/${id}`, { method: 'DELETE' });
            if (res.ok) setWebhooks((prev) => prev.filter((w) => w.id !== id));
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading webhooks...</div>;

    return (
        <div className="max-w-5xl mx-auto px-6 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Webhook className="w-8 h-8 text-purple-600" />
                    Custom Webhooks
                </h1>
                <p className="text-gray-600 mt-2">
                    Connect VEQ to Zapier, Discord, Slack, or any custom API. Get real-time alerts when AI detects risks.
                </p>
            </div>

            {errorMsg && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {errorMsg}
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-purple-600" /> Add New Webhook
                </h2>
                <form onSubmit={handleAddWebhook} className="flex gap-4">
                    <input
                        type="url"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="https://hooks.zapier.com/hooks/catch/12345/abcde..."
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        required
                    />
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2 font-medium"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Webhook'}
                    </button>
                </form>
            </div>

            <div className="space-y-4">
                {webhooks.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No webhooks configured yet.</p>
                        <p className="text-sm text-gray-400 mt-1">Add a URL above to start receiving real-time alerts.</p>
                    </div>
                ) : (
                    webhooks.map((wh) => (
                        <div key={wh.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <Zap className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="font-mono text-sm text-gray-800 break-all max-w-md">{wh.url}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        {wh.is_active ? (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Active
                                            </span>
                                        ) : (
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                                <Circle className="w-3 h-3" /> Inactive
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-500">
                                            Events: {wh.events.join(', ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(wh.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}