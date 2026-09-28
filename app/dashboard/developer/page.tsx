// app/dashboard/developer/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Code, Key, Plus, Copy, CheckCircle, ShieldCheck, AlertTriangle, Loader2, Eye, EyeOff } from 'lucide-react';

interface APIKey {
    id: string;
    name: string;
    key: string;
    is_active: boolean;
    created_at: string;
    show?: boolean; // For temporary reveal
}

export default function DeveloperPage() {
    const [keys, setKeys] = useState<APIKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [newKeyModal, setNewKeyModal] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [generating, setGenerating] = useState(false);
    const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<APIKey | null>(null);

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            const res = await fetch('/api/developer/keys');
            const data = await res.json();
            if (res.ok) setKeys(data.keys || []);
        } catch (err) {
            console.error('Failed to fetch keys:', err);
        } finally {
            setLoading(false);
        }
    };

    const generateNewKey = async () => {
        if (!newKeyName.trim()) return;
        setGenerating(true);
        try {
            const res = await fetch('/api/developer/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newKeyName }),
            });
            const data = await res.json();

            if (res.ok) {
                setNewlyGeneratedKey(data.key); // Show ONLY ONCE
                setKeys([data.key, ...keys]);
                setNewKeyName('');
                setNewKeyModal(false);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (err) {
            console.error('Error generating key:', err);
            alert('Failed to generate API key');
        } finally {
            setGenerating(false);
        }
    };

    const revokeKey = async (id: string) => {
        if (!confirm('Are you sure you want to revoke this key? This cannot be undone.')) return;
        try {
            const res = await fetch(`/api/developer/keys/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setKeys(keys.map(k => k.id === id ? { ...k, is_active: false } : k));
            }
        } catch (err) {
            console.error('Error revoking key:', err);
        }
    };

    const copyToClipboard = (id: string, key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const toggleVisibility = (id: string) => {
        setKeys(keys.map(k => k.id === id ? { ...k, show: !k.show } : k));
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-10 flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#C6A15B]" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-display text-[#3A2418] italic flex items-center gap-3">
                    <Code className="w-8 h-8 text-[#C6A15B]" /> Developer Portal
                </h1>
                <p className="text-[#806B58] mt-2">Manage real API keys and build on top of VEQ.</p>
            </div>

            <div className="bg-[#3A2418] text-[#F4EDE1] p-6 rounded-2xl mb-8 font-mono text-sm overflow-x-auto shadow-lg">
                <p className="text-[#C6A15B] mb-2">// Example: Fetch Knowledge Handover Score</p>
                <p>GET /api/v1/knowledge-score</p>
                <p className="text-gray-400 mt-2">Headers: &#123;</p>
                <p className="pl-4">"Authorization": "Bearer YOUR_REAL_API_KEY"</p>
                <p className="text-gray-400">&#125;</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E9DED0]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-display text-[#3A2418] italic flex items-center gap-2">
                        <Key className="w-5 h-5" /> API Keys
                    </h2>
                    <button
                        onClick={() => setNewKeyModal(true)}
                        className="bg-[#3A2418] text-[#F4EDE1] px-4 py-2 rounded-xl hover:bg-[#4A2F20] transition flex items-center gap-2 text-sm font-semibold"
                    >
                        <Plus className="w-4 h-4" /> Generate New Key
                    </button>
                </div>

                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                        <strong>Security Notice:</strong> Real API keys are shown <strong>only once</strong> when generated.
                        After that, they are permanently masked (••••) for security.
                    </p>
                </div>

                {/* ✅ YE GREEN BOX SIRF TAB DIKHEGA JAB NAYI KEY GENERATE HOGI (ONLY ONCE) */}
                {newlyGeneratedKey && (
                    <div className="mb-6 p-6 bg-green-50 border-2 border-green-300 rounded-xl animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <h3 className="font-semibold text-green-800">API Key Generated Successfully!</h3>
                        </div>
                        <p className="text-sm text-green-700 mb-3"><strong>{newlyGeneratedKey.name}</strong></p>
                        <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-green-200">
                            <code className="text-sm font-mono text-green-900 flex-1 break-all">{newlyGeneratedKey.key}</code>
                            <button onClick={() => copyToClipboard(newlyGeneratedKey.id, newlyGeneratedKey.key)} className="text-green-600 hover:text-green-700 p-2">
                                {copiedId === newlyGeneratedKey.id ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                        <p className="text-xs text-green-600 mt-2">⚠️ Copy this key now! You will not be able to see it again.</p>
                    </div>
                )}

                <div className="space-y-4">
                    {keys.length === 0 ? (
                        <div className="text-center py-8 text-[#806B58]">
                            <Key className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No API keys yet. Generate your first real key to get started!</p>
                        </div>
                    ) : (
                        keys.map((k) => (
                            <div key={k.id} className="flex items-center justify-between p-4 bg-[#F4EDE1]/30 rounded-xl border border-[#E9DED0]">
                                <div className="flex items-center gap-3 flex-1">
                                    {k.is_active ? <ShieldCheck className="w-5 h-5 text-green-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
                                    <div className="flex-1">
                                        <p className="font-medium text-[#3A2418]">{k.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <code className="text-xs font-mono text-[#806B58]">
                                                {k.show ? k.key : '••••••••••••••••••••••••••••••••'}
                                            </code>
                                            {!k.show && k.is_active && (
                                                <button onClick={() => toggleVisibility(k.id)} className="text-[#806B58] hover:text-[#3A2418] transition" title="Reveal temporarily">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            )}
                                            {k.show && (
                                                <button onClick={() => toggleVisibility(k.id)} className="text-[#806B58] hover:text-[#3A2418] transition" title="Hide">
                                                    <EyeOff className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-[#806B58] mt-1">Created: {new Date(k.created_at).toLocaleDateString()}</p>
                                        {!k.is_active && <p className="text-xs text-red-600 mt-1 font-medium">Revoked</p>}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {k.is_active && (
                                        <>
                                            <button onClick={() => copyToClipboard(k.id, k.key)} className="text-[#806B58] hover:text-[#3A2418] transition p-2 hover:bg-white rounded-lg" title="Copy Key">
                                                {copiedId === k.id ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                                            </button>
                                            <button onClick={() => revokeKey(k.id)} className="text-red-600 hover:text-red-700 transition p-2 hover:bg-red-50 rounded-lg" title="Revoke Key">
                                                <AlertTriangle className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Generate Key Modal */}
            {newKeyModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                    <div className="bg-[#F4EDE1] rounded-2xl border border-[#E9DED0] p-8 max-w-md w-full shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-[#C6A15B]/20 rounded-xl"><Key className="w-6 h-6 text-[#3A2418]" /></div>
                            <h3 className="font-display text-2xl text-[#3A2418] italic">Generate New API Key</h3>
                        </div>

                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <AlertTriangle className="w-5 h-5 text-red-600 mb-2" />
                            <p className="text-sm text-red-800 font-medium">⚠️ IMPORTANT: You will see this key <strong>ONLY ONCE</strong>. Make sure to copy it immediately!</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-mono text-[#806B58] mb-2">Key Name</label>
                                <input
                                    type="text"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    placeholder="e.g., Production HR Integration"
                                    className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-white focus:outline-none focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 text-[#3A2418]"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => { setNewKeyModal(false); setNewKeyName(''); }} className="flex-1 py-3 border border-[#E9DED0] rounded-xl text-[#3A2418] hover:bg-[#3A2418]/5 transition-colors font-mono text-sm font-semibold">Cancel</button>
                                <button onClick={generateNewKey} disabled={generating || !newKeyName.trim()} className="flex-1 py-3 bg-[#3A2418] text-[#F4EDE1] rounded-xl hover:bg-[#4A2F20] transition-colors font-mono text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    {generating ? 'Generating...' : 'Generate Key'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}